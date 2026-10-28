from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class CertificateResponse(BaseModel):
    id: str
    certificate_code: str
    submission_id: int
    revision_id: int
    content_title: str
    source_file_sha256: str
    vault_version: str
    approver_id: int
    approver_name: str
    approver_role: str
    approval_timestamp: datetime
    issued_at: datetime
    findings_summary: Dict[str, Any]
    signature_algorithm: str
    digital_signature: str
    verification_hash: str
    is_verified: bool

    class Config:
        from_attributes = True

class VerifyCertificateResponse(BaseModel):
    is_valid: bool
    certificate_code: str
    content_title: str
    approver_name: str
    issued_at: datetime
    source_file_sha256: str
    verification_message: str
