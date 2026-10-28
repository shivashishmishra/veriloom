import datetime
import uuid
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class ComplianceCertificate(Base):
    __tablename__ = "compliance_certificates"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    submission_id = Column(Integer, ForeignKey("content_submissions.id"), unique=True, nullable=False)
    revision_id = Column(Integer, nullable=False)
    certificate_code = Column(String(100), unique=True, index=True, nullable=False)
    content_title = Column(String(255), nullable=False)
    source_file_sha256 = Column(String(64), nullable=False)
    vault_version = Column(String(50), default="1.0.0")
    approver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    approver_name = Column(String(255), nullable=False)
    approver_role = Column(String(100), nullable=False)
    approval_timestamp = Column(DateTime, nullable=False)
    issued_at = Column(DateTime, default=datetime.datetime.utcnow)
    findings_summary = Column(Text, nullable=False) # JSON: {"total": X, "resolved": Y, "overridden": Z}
    signature_algorithm = Column(String(50), default="HMAC-SHA256")
    digital_signature = Column(Text, nullable=False)
    verification_hash = Column(String(64), nullable=False)
    is_verified = Column(Boolean, default=True)

    submission = relationship("ContentSubmission", back_populates="certificate")
    approver = relationship("User")
