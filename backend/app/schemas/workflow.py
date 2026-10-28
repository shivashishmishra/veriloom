from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime

class StatusTransitionRequest(BaseModel):
    target_status: str # "CHANGES_REQUESTED", "PENDING_REVIEW", "APPROVED", "REJECTED"
    reason: Optional[str] = None
    reviewer_notes: Optional[str] = None

class AuditEventResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    user_name: Optional[str] = None
    action_type: str
    submission_id: Optional[int] = None
    revision_id: Optional[int] = None
    finding_id: Optional[int] = None
    rule_id: Optional[str] = None
    outcome: str
    reason: Optional[str] = None
    details: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True
