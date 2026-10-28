import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from app.database import Base

class ContentSubmission(Base):
    __tablename__ = "content_submissions"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    content_type = Column(String(100), default="Product Announcement") # "Product Announcement", "Landing Page Copy", "Social Post", "Whitepaper", "Email Campaign"
    current_status = Column(String(50), default="DRAFT") # "DRAFT", "SCANNED", "CHANGES_REQUESTED", "PENDING_REVIEW", "APPROVED", "REJECTED"
    assigned_reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    organization = relationship("Organization", back_populates="submissions")
    creator = relationship("User", foreign_keys=[creator_id], back_populates="submissions")
    assigned_reviewer = relationship("User", foreign_keys=[assigned_reviewer_id])
    revisions = relationship("ContentRevision", back_populates="submission", cascade="all, delete-orphan", order_by="ContentRevision.revision_number")
    comments = relationship("SubmissionComment", back_populates="submission", cascade="all, delete-orphan")
    certificate = relationship("ComplianceCertificate", back_populates="submission", uselist=False)

class ContentRevision(Base):
    __tablename__ = "content_revisions"

    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("content_submissions.id"), nullable=False)
    revision_number = Column(Integer, default=1)
    raw_content = Column(Text, nullable=False)
    file_sha256 = Column(String(64), nullable=True)
    paragraph_hashes = Column(Text, nullable=True) # JSON dictionary: {"0": "hash...", "1": "hash..."}
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    submission = relationship("ContentSubmission", back_populates="revisions")
    findings = relationship("Finding", back_populates="revision", cascade="all, delete-orphan")

class Finding(Base):
    __tablename__ = "findings"

    id = Column(Integer, primary_key=True, index=True)
    revision_id = Column(Integer, ForeignKey("content_revisions.id"), nullable=False)
    check_type = Column(String(50), nullable=False) # "CHECK_1_TERMINOLOGY", "CHECK_2_TONE", "CHECK_3_FACT", "CHECK_4_COLOR", "CHECK_5_ACCESSIBILITY", "CHECK_6_FIX"
    category = Column(String(100), nullable=False) # "Terminology", "Tone", "Fact", "Visual", "Accessibility"
    severity = Column(String(50), default="Violation") # "Violation", "Warning", "Info"
    status = Column(String(50), default="Open") # "Open", "Resolved", "Overridden", "Needs Human Review", "Unsubstantiated"
    flagged_text = Column(Text, nullable=False)
    span_start = Column(Integer, default=0)
    span_end = Column(Integer, default=0)
    paragraph_index = Column(Integer, default=0)
    explanation = Column(Text, nullable=False)
    rule_clause_id = Column(String(100), nullable=True) # e.g. "PR-101", "TERM-01"
    source_document = Column(String(255), nullable=True)
    source_page = Column(Integer, nullable=True)
    source_quote = Column(Text, nullable=True)
    suggested_fix = Column(Text, nullable=True)
    confidence_score = Column(Float, default=1.0)
    confidence_type = Column(String(50), default="Rule-Based") # "Calibrated", "Rule-Based", "Heuristic"
    override_reason = Column(Text, nullable=True)
    overridden_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    overridden_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    revision = relationship("ContentRevision", back_populates="findings")
    overridden_by = relationship("User", foreign_keys=[overridden_by_id])

class SubmissionComment(Base):
    __tablename__ = "submission_comments"

    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("content_submissions.id"), nullable=False)
    revision_id = Column(Integer, ForeignKey("content_revisions.id"), nullable=True)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    finding_id = Column(Integer, ForeignKey("findings.id"), nullable=True)
    comment_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    submission = relationship("ContentSubmission", back_populates="comments")
    author = relationship("User", back_populates="comments")
    finding = relationship("Finding")
