from typing import Tuple, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User
from app.models.submission import ContentSubmission, ContentRevision, Finding
from app.workflow.audit import log_audit_event

VALID_TRANSITIONS = {
    "DRAFT": ["SCANNED", "PENDING_REVIEW", "REJECTED"],
    "SCANNED": ["PENDING_REVIEW", "CHANGES_REQUESTED", "APPROVED", "REJECTED"],
    "CHANGES_REQUESTED": ["DRAFT", "SCANNED", "PENDING_REVIEW", "REJECTED"],
    "PENDING_REVIEW": ["APPROVED", "CHANGES_REQUESTED", "REJECTED"],
    "APPROVED": [],
    "REJECTED": ["DRAFT"]
}

class ApprovalEngine:
    @staticmethod
    def transition_status(
        db: Session,
        submission: ContentSubmission,
        target_status: str,
        acting_user: User,
        reason: Optional[str] = None
    ) -> Tuple[bool, str]:
        current = submission.current_status
        allowed_next = VALID_TRANSITIONS.get(current, [])
        if target_status not in allowed_next:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status transition from '{current}' to '{target_status}'. Allowed: {', '.join(allowed_next)}"
            )

        # Enforce Role-Based Permissions
        if target_status == "APPROVED":
            if acting_user.role not in ["Reviewer", "Brand Admin"]:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only a Reviewer or Brand Admin can grant final compliance approval."
                )

            # Check that latest revision has no Open Violations
            latest_rev = submission.revisions[-1] if submission.revisions else None
            if latest_rev:
                unresolved_violations = [
                    f for f in latest_rev.findings
                    if f.status in ["Open", "Needs Human Review"] and f.severity == "Violation"
                ]
                if unresolved_violations:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Cannot approve submission while {len(unresolved_violations)} critical violation(s) remain open. They must be resolved or formally overridden with a reason."
                    )

        if target_status == "CHANGES_REQUESTED":
            if acting_user.role not in ["Reviewer", "Brand Admin"]:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only Reviewers or Brand Admins can request changes."
                )

        submission.current_status = target_status
        if target_status in ["APPROVED", "CHANGES_REQUESTED"]:
            submission.assigned_reviewer_id = acting_user.id

        db.commit()

        # Log to Audit Trail
        log_audit_event(
            db=db,
            organization_id=submission.organization_id,
            user_id=acting_user.id,
            action_type="STATUS_CHANGED",
            submission_id=submission.id,
            revision_id=submission.revisions[-1].id if submission.revisions else None,
            outcome=f"TRANSITION_TO_{target_status}",
            reason=reason
        )

        return True, f"Submission status successfully transitioned to {target_status}."

    @staticmethod
    def override_finding(
        db: Session,
        finding: Finding,
        acting_user: User,
        reason: str
    ) -> Finding:
        if acting_user.role not in ["Reviewer", "Brand Admin"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only Reviewers or Brand Admins are authorized to override compliance findings."
            )

        clean_reason = reason.strip()
        if not clean_reason or len(clean_reason) < 5:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A valid, non-empty justification reason (at least 5 characters) is mandatory to override a brand finding."
            )

        import datetime
        finding.status = "Overridden"
        finding.override_reason = clean_reason
        finding.overridden_by_id = acting_user.id
        finding.overridden_at = datetime.datetime.utcnow()

        db.commit()
        db.refresh(finding)

        # Log to Audit Trail
        log_audit_event(
            db=db,
            organization_id=acting_user.organization_id,
            user_id=acting_user.id,
            action_type="FINDING_OVERRIDDEN",
            submission_id=finding.revision.submission_id if finding.revision else None,
            revision_id=finding.revision_id,
            finding_id=finding.id,
            rule_id=finding.rule_clause_id,
            outcome="OVERRIDDEN",
            reason=clean_reason
        )

        return finding
