import json
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.workflow import AuditEvent

def log_audit_event(
    db: Session,
    organization_id: int,
    user_id: Optional[int],
    action_type: str,
    submission_id: Optional[int] = None,
    revision_id: Optional[int] = None,
    finding_id: Optional[int] = None,
    rule_id: Optional[str] = None,
    outcome: str = "SUCCESS",
    reason: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None
) -> AuditEvent:
    event = AuditEvent(
        organization_id=organization_id,
        user_id=user_id,
        action_type=action_type,
        submission_id=submission_id,
        revision_id=revision_id,
        finding_id=finding_id,
        rule_id=rule_id,
        outcome=outcome,
        reason=reason,
        details=json.dumps(details) if details else None
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event
