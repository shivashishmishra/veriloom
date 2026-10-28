from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.submission import ContentSubmission
from app.models.workflow import AuditEvent
from app.schemas.workflow import StatusTransitionRequest, AuditEventResponse
from app.schemas.submission import ContentSubmissionResponse
from app.auth.dependencies import get_current_user
from app.workflow.approval_engine import ApprovalEngine

router = APIRouter(prefix="/workflow", tags=["Workflow & Approvals"])

@router.post("/submissions/{submission_id}/transition", response_model=ContentSubmissionResponse)
def transition_submission_status(
    submission_id: int,
    payload: StatusTransitionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sub = db.query(ContentSubmission).filter(
        ContentSubmission.id == submission_id,
        ContentSubmission.organization_id == current_user.organization_id
    ).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found.")

    ApprovalEngine.transition_status(
        db=db,
        submission=sub,
        target_status=payload.target_status,
        acting_user=current_user,
        reason=payload.reason
    )

    resp = ContentSubmissionResponse.from_orm(sub)
    resp.creator_name = sub.creator.full_name if sub.creator else None
    resp.assigned_reviewer_name = sub.assigned_reviewer.full_name if sub.assigned_reviewer else None
    return resp

@router.get("/audit-log", response_model=List[AuditEventResponse])
def get_audit_log(
    submission_id: Optional[int] = None,
    action_type: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(AuditEvent).filter(
        AuditEvent.organization_id == current_user.organization_id
    )
    if submission_id:
        query = query.filter(AuditEvent.submission_id == submission_id)
    if action_type:
        query = query.filter(AuditEvent.action_type == action_type)

    events = query.order_by(AuditEvent.timestamp.desc()).limit(100).all()
    res = []
    for e in events:
        resp = AuditEventResponse.from_orm(e)
        resp.user_name = e.user.full_name if e.user else "System Engine"
        res.append(resp)
    return res
