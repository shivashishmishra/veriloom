import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action_type = Column(String(100), nullable=False)
    submission_id = Column(Integer, nullable=True)
    revision_id = Column(Integer, nullable=True)
    finding_id = Column(Integer, nullable=True)
    rule_id = Column(String(100), nullable=True)
    outcome = Column(String(100), default="SUCCESS")
    reason = Column(Text, nullable=True)
    details = Column(Text, nullable=True) # JSON payload
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)

    user = relationship("User")
