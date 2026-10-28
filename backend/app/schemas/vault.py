from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class BrandRuleBase(BaseModel):
    rule_id: str
    title: str
    category: str
    exact_rule_text: str
    source_document: Optional[str] = None
    source_page: Optional[int] = None
    severity: str = "Violation"
    effective_from: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    status: str = "Active"

class BrandRuleCreate(BrandRuleBase):
    pass

class BrandRuleUpdate(BaseModel):
    title: Optional[str] = None
    exact_rule_text: Optional[str] = None
    severity: Optional[str] = None
    status: Optional[str] = None
    source_document: Optional[str] = None
    source_page: Optional[int] = None

class BrandRuleResponse(BrandRuleBase):
    id: int
    organization_id: int
    version: int
    created_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ApprovedFactBase(BaseModel):
    fact_id: str
    claim_subject: str
    approved_value: str
    category: str = "Pricing"
    exact_passage: str
    source_document: Optional[str] = None
    source_page: Optional[int] = None
    effective_from: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    status: str = "Active"

class ApprovedFactCreate(ApprovedFactBase):
    pass

class ApprovedFactResponse(ApprovedFactBase):
    id: int
    organization_id: int
    version: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TerminologyRuleBase(BaseModel):
    term_id: str
    banned_term: str
    preferred_term: Optional[str] = None
    case_sensitive: bool = False
    match_whole_word: bool = True
    reason: Optional[str] = None
    severity: str = "Violation"
    status: str = "Active"

class TerminologyRuleCreate(TerminologyRuleBase):
    pass

class TerminologyRuleResponse(TerminologyRuleBase):
    id: int
    organization_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class BrandColorPaletteBase(BaseModel):
    color_id: str
    name: str
    hex_code: str
    rgb_r: int
    rgb_g: int
    rgb_b: int
    role: str = "Primary"
    tolerance_delta_e: float = 10.0
    is_active: bool = True

class BrandColorPaletteCreate(BrandColorPaletteBase):
    pass

class BrandColorPaletteResponse(BrandColorPaletteBase):
    id: int
    organization_id: int
    lab_l: Optional[float] = None
    lab_a: Optional[float] = None
    lab_b: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True

class BrandAssetResponse(BaseModel):
    id: int
    organization_id: int
    title: str
    asset_type: str
    file_path: str
    file_hash: Optional[str] = None
    extracted_colors: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
