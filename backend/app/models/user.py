import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    users = relationship("User", back_populates="organization")
    rules = relationship("BrandRule", back_populates="organization")
    facts = relationship("ApprovedFact", back_populates="organization")
    terms = relationship("TerminologyRule", back_populates="organization")
    palettes = relationship("BrandColorPalette", back_populates="organization")
    submissions = relationship("ContentSubmission", back_populates="organization")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="Creator") # "Creator", "Reviewer", "Brand Admin"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    organization = relationship("Organization", back_populates="users")
    submissions = relationship("ContentSubmission", back_populates="creator", foreign_keys="ContentSubmission.creator_id")
    comments = relationship("SubmissionComment", back_populates="author")
