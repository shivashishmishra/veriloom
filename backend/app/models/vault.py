import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from app.database import Base

class BrandRule(Base):
    __tablename__ = "brand_rules"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    rule_id = Column(String(100), index=True, nullable=False) # e.g. "PR-101", "TERM-04"
    title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False) # "Terminology", "Tone", "Fact", "Color", "Accessibility", "Legal"
    exact_rule_text = Column(Text, nullable=False)
    source_document = Column(String(255), nullable=True) # e.g. "NovaTech_Brand_Book_2026.pdf"
    source_page = Column(Integer, nullable=True)
    severity = Column(String(50), default="Violation") # "Violation", "Warning", "Info"
    effective_from = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    version = Column(Integer, default=1)
    status = Column(String(50), default="Active") # "Active", "Archived", "Deprecated"
    created_by = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    organization = relationship("Organization", back_populates="rules")

class ApprovedFact(Base):
    __tablename__ = "approved_facts"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    fact_id = Column(String(100), index=True, nullable=False) # e.g. "FACT-PRICE-01"
    claim_subject = Column(String(255), nullable=False)
    approved_value = Column(Text, nullable=False)
    category = Column(String(100), default="Pricing") # "Pricing", "Specs", "Feature", "Policy", "Date"
    exact_passage = Column(Text, nullable=False)
    source_document = Column(String(255), nullable=True)
    source_page = Column(Integer, nullable=True)
    effective_from = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    version = Column(Integer, default=1)
    status = Column(String(50), default="Active")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    organization = relationship("Organization", back_populates="facts")

class TerminologyRule(Base):
    __tablename__ = "terminology_rules"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    term_id = Column(String(100), index=True, nullable=False)
    banned_term = Column(String(255), nullable=False)
    preferred_term = Column(String(255), nullable=True)
    case_sensitive = Column(Boolean, default=False)
    match_whole_word = Column(Boolean, default=True)
    reason = Column(Text, nullable=True)
    severity = Column(String(50), default="Violation")
    status = Column(String(50), default="Active")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    organization = relationship("Organization", back_populates="terms")

class BrandColorPalette(Base):
    __tablename__ = "brand_color_palettes"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    color_id = Column(String(100), index=True, nullable=False)
    name = Column(String(255), nullable=False) # e.g. "NovaTech Royal Blue"
    hex_code = Column(String(20), nullable=False) # e.g. "#1D3DD4"
    rgb_r = Column(Integer, nullable=False)
    rgb_g = Column(Integer, nullable=False)
    rgb_b = Column(Integer, nullable=False)
    lab_l = Column(Float, nullable=True)
    lab_a = Column(Float, nullable=True)
    lab_b = Column(Float, nullable=True)
    role = Column(String(50), default="Primary") # "Primary", "Secondary", "Accent", "Background", "Text"
    tolerance_delta_e = Column(Float, default=10.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    organization = relationship("Organization", back_populates="palettes")

class BrandAsset(Base):
    __tablename__ = "brand_assets"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    title = Column(String(255), nullable=False)
    asset_type = Column(String(50), nullable=False) # "logo", "icon", "guideline_pdf", "price_sheet_csv"
    file_path = Column(String(500), nullable=False)
    file_hash = Column(String(64), nullable=True) # SHA-256
    extracted_colors = Column(Text, nullable=True) # JSON array of hex codes
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
