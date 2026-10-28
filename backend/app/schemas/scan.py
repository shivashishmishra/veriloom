from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.schemas.submission import FindingResponse

class DeltaScanStats(BaseModel):
    total_paragraphs: int = 0
    unchanged_paragraphs: int = 0
    modified_paragraphs: int = 0
    cached_findings_reused: int = 0
    new_findings_detected: int = 0
    scan_duration_ms: float = 0.0
    sha256_hash: str = ""

class ScanResponse(BaseModel):
    submission_id: int
    revision_id: int
    revision_number: int
    status: str
    findings: List[FindingResponse]
    delta_stats: Optional[DeltaScanStats] = None
    ai_provider_used: str = "none"
    disclosure_notes: str = ""
