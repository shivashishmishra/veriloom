from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class FindingResponse(BaseModel):
    id: int
    revision_id: int
    check_type: str
    category: str
    severity: str
    status: str
    flagged_text: str
    span_start: int
    span_end: int
    paragraph_index: int
    explanation: str
    rule_clause_id: Optional[str] = None
    source_document: Optional[str] = None
    source_page: Optional[int] = None
    source_quote: Optional[str] = None
    suggested_fix: Optional[str] = None
    confidence_score: float
    confidence_type: str
    override_reason: Optional[str] = None
    overridden_by_id: Optional[int] = None
    overridden_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

class FindingOverrideRequest(BaseModel):
    reason: str

class FindingFixApplyRequest(BaseModel):
    edited_fix: Optional[str] = None

class ContentRevisionResponse(BaseModel):
    id: int
    submission_id: int
    revision_number: int
    raw_content: str
    file_sha256: Optional[str] = None
    created_by_id: Optional[int] = None
    created_at: datetime
    findings: List[FindingResponse] = []

    class Config:
        from_attributes = True

class SubmissionCommentCreate(BaseModel):
    comment_text: str
    finding_id: Optional[int] = None
    revision_id: Optional[int] = None

class SubmissionCommentResponse(BaseModel):
    id: int
    submission_id: int
    revision_id: Optional[int] = None
    author_id: int
    author_name: Optional[str] = None
    finding_id: Optional[int] = None
    comment_text: str
    created_at: datetime

    class Config:
        from_attributes = True

class ContentSubmissionCreate(BaseModel):
    title: str
    content_type: str = "Product Announcement"
    initial_content: str

class ContentSubmissionResponse(BaseModel):
    id: int
    organization_id: int
    creator_id: int
    creator_name: Optional[str] = None
    title: str
    content_type: str
    current_status: str
    assigned_reviewer_id: Optional[int] = None
    assigned_reviewer_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    revisions: List[ContentRevisionResponse] = []
    comments: List[SubmissionCommentResponse] = []

    class Config:
        from_attributes = True
