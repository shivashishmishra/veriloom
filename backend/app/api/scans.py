import json
import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.submission import ContentSubmission, ContentRevision, Finding
from app.schemas.scan import ScanResponse, DeltaScanStats
from app.schemas.submission import FindingResponse, FindingOverrideRequest, FindingFixApplyRequest
from app.auth.dependencies import get_current_user
from app.engine.hybrid_scanner import HybridScanner
from app.rules.fix_generator import FixGenerator
from app.workflow.approval_engine import ApprovalEngine
from app.workflow.audit import log_audit_event
from app.config import settings

router = APIRouter(prefix="/scans", tags=["Verification Engine"])

@router.post("/{submission_id}", response_model=ScanResponse)
def run_scan(
    submission_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sub = db.query(ContentSubmission).filter(
        ContentSubmission.id == submission_id,
        ContentSubmission.organization_id == current_user.organization_id
    ).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found.")

    if not sub.revisions:
        raise HTTPException(status_code=400, detail="Submission has no content to scan.")

    latest_rev = sub.revisions[-1]
    prev_rev = sub.revisions[-2] if len(sub.revisions) > 1 else None

    # Run Hybrid Scanner with Delta Hashing
    scan_result = HybridScanner.scan_content(
        db=db,
        submission=sub,
        raw_text=latest_rev.raw_content,
        organization_id=current_user.organization_id,
        previous_revision=prev_rev
    )

    # Clear old findings on this revision if rescanning the exact same revision
    db.query(Finding).filter(Finding.revision_id == latest_rev.id).delete()

    created_findings = []
    for f_data in scan_result["findings"]:
        f_obj = Finding(
            revision_id=latest_rev.id,
            check_type=f_data["check_type"],
            category=f_data["category"],
            severity=f_data["severity"],
            status=f_data["status"],
            flagged_text=f_data["flagged_text"],
            span_start=f_data["span_start"],
            span_end=f_data["span_end"],
            paragraph_index=f_data["paragraph_index"],
            explanation=f_data["explanation"],
            rule_clause_id=f_data.get("rule_clause_id"),
            source_document=f_data.get("source_document"),
            source_page=f_data.get("source_page"),
            source_quote=f_data.get("source_quote"),
            suggested_fix=f_data.get("suggested_fix"),
            confidence_score=f_data.get("confidence_score", 1.0),
            confidence_type=f_data.get("confidence_type", "Rule-Based")
        )
        db.add(f_obj)
        created_findings.append(f_obj)

    if sub.current_status == "DRAFT":
        sub.current_status = "SCANNED"
    sub.updated_at = datetime.datetime.utcnow()

    db.commit()

    log_audit_event(
        db=db,
        organization_id=current_user.organization_id,
        user_id=current_user.id,
        action_type="SCAN_EXECUTED",
        submission_id=sub.id,
        revision_id=latest_rev.id,
        outcome=f"DETECTED_{len(created_findings)}_FINDINGS",
        details=scan_result["delta_stats"]
    )

    return {
        "submission_id": sub.id,
        "revision_id": latest_rev.id,
        "revision_number": latest_rev.revision_number,
        "status": sub.current_status,
        "findings": [FindingResponse.from_orm(f) for f in created_findings],
        "delta_stats": DeltaScanStats(**scan_result["delta_stats"]),
        "ai_provider_used": settings.AI_PROVIDER,
        "disclosure_notes": "Checks 1, 3, 4, 5, 6 executed deterministically with verified database sources. Tone evaluation ran using grounded heuristics."
    }

@router.post("/apply-fix/{finding_id}", response_model=ScanResponse)
def apply_fix(
    finding_id: int,
    payload: FindingFixApplyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Check 6: Intent-Preserving Fix Generator.
    Replaces only the relevant text span, preserving surrounding text and original revision.
    Creates a new revision.
    """
    finding = db.query(Finding).filter(Finding.id == finding_id).first()
    if not finding:
        raise HTTPException(status_code=404, detail="Finding not found.")

    rev = finding.revision
    sub = rev.submission
    if sub.organization_id != current_user.organization_id:
        raise HTTPException(status_code=403, detail="Unauthorized.")

    replacement = payload.edited_fix if payload.edited_fix is not None else finding.suggested_fix
    if not replacement:
        raise HTTPException(status_code=400, detail="No suggested replacement fix available for this finding.")

    # Apply replacement strictly to the flagged text
    raw_content = rev.raw_content
    # Find occurrence of flagged text in paragraph or overall
    if finding.flagged_text in raw_content:
        new_content = raw_content.replace(finding.flagged_text, replacement, 1)
    else:
        new_content, ok = FixGenerator.apply_span_fix(raw_content, finding.span_start, finding.span_end, replacement)
        if not ok:
            raise HTTPException(status_code=400, detail="Could not cleanly apply fix to content span.")

    # Create new revision (Revision N + 1)
    from app.parsers.delta_hasher import DeltaHasher
    next_rev_num = len(sub.revisions) + 1
    sha256 = DeltaHasher.compute_sha256(new_content)
    paras = [p.strip() for p in new_content.split("\n\n") if p.strip()]
    hashes = DeltaHasher.hash_paragraphs(paras)

    new_rev = ContentRevision(
        submission_id=sub.id,
        revision_number=next_rev_num,
        raw_content=new_content,
        file_sha256=sha256,
        paragraph_hashes=json.dumps(hashes),
        created_by_id=current_user.id
    )
    db.add(new_rev)
    db.commit()
    db.refresh(new_rev)

    # Mark the old finding as Resolved
    finding.status = "Resolved"
    db.commit()

    # Automatically run scan on the new revision
    scan_result = HybridScanner.scan_content(
        db=db,
        submission=sub,
        raw_text=new_rev.raw_content,
        organization_id=current_user.organization_id,
        previous_revision=rev
    )

    created_findings = []
    for f_data in scan_result["findings"]:
        f_obj = Finding(
            revision_id=new_rev.id,
            check_type=f_data["check_type"],
            category=f_data["category"],
            severity=f_data["severity"],
            status=f_data["status"],
            flagged_text=f_data["flagged_text"],
            span_start=f_data["span_start"],
            span_end=f_data["span_end"],
            paragraph_index=f_data["paragraph_index"],
            explanation=f_data["explanation"],
            rule_clause_id=f_data.get("rule_clause_id"),
            source_document=f_data.get("source_document"),
            source_page=f_data.get("source_page"),
            source_quote=f_data.get("source_quote"),
            suggested_fix=f_data.get("suggested_fix"),
            confidence_score=f_data.get("confidence_score", 1.0),
            confidence_type=f_data.get("confidence_type", "Rule-Based")
        )
        db.add(f_obj)
        created_findings.append(f_obj)

    sub.updated_at = datetime.datetime.utcnow()
    db.commit()

    log_audit_event(
        db=db,
        organization_id=current_user.organization_id,
        user_id=current_user.id,
        action_type="FIX_APPLIED",
        submission_id=sub.id,
        revision_id=new_rev.id,
        finding_id=finding.id,
        rule_id=finding.rule_clause_id,
        outcome=f"CREATED_REVISION_{next_rev_num}",
        details={"original": finding.flagged_text, "replacement": replacement}
    )

    return {
        "submission_id": sub.id,
        "revision_id": new_rev.id,
        "revision_number": new_rev.revision_number,
        "status": sub.current_status,
        "findings": [FindingResponse.from_orm(f) for f in created_findings],
        "delta_stats": DeltaScanStats(**scan_result["delta_stats"]),
        "ai_provider_used": settings.AI_PROVIDER,
        "disclosure_notes": f"Applied fix '{replacement}'. Created Revision {next_rev_num}. Re-scanned changed delta."
    }

@router.post("/override/{finding_id}", response_model=FindingResponse)
def override_finding(
    finding_id: int,
    payload: FindingOverrideRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    finding = db.query(Finding).filter(Finding.id == finding_id).first()
    if not finding:
        raise HTTPException(status_code=404, detail="Finding not found.")

    updated_finding = ApprovalEngine.override_finding(
        db=db,
        finding=finding,
        acting_user=current_user,
        reason=payload.reason
    )
    return FindingResponse.from_orm(updated_finding)
