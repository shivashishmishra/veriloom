from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class CategoryMetric(BaseModel):
    category: str
    count: int

class ViolatedRuleMetric(BaseModel):
    rule_id: str
    title: str
    category: str
    violation_count: int

class UnclearGuidelineAlert(BaseModel):
    rule_id: str
    rule_title: str
    original_text: str
    category: str
    total_findings: int
    overrides_count: int
    override_rate: float
    reviewer_comments: List[str]
    suggested_patch_wording: str
    patch_rationale: str
    sample_size_adequate: bool

class DashboardStatsResponse(BaseModel):
    total_submissions: int
    pending_review: int
    approved: int
    changes_requested: int
    open_findings: int
    resolved_findings: int
    overridden_findings: int
    findings_by_category: List[CategoryMetric]
    most_violated_rules: List[ViolatedRuleMetric]
    unclear_guideline_alerts: List[UnclearGuidelineAlert]
    is_demo_workspace: bool = True
    badge_label: str = "DEMO WORKSPACE — SYNTHETIC SAMPLE DATA"

class GuidelinePatchRequest(BaseModel):
    rule_id: str
    new_rule_text: str
    reason: str
