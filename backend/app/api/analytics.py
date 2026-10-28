from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.analytics import DashboardStatsResponse, GuidelinePatchRequest
from app.schemas.vault import BrandRuleResponse
from app.auth.dependencies import get_current_user, require_role
from app.analytics.governance import GovernanceAnalytics
from app.analytics.patch_recommender import GuidelinePatchRecommender

router = APIRouter(prefix="/analytics", tags=["Governance Analytics"])

@router.get("/dashboard", response_model=DashboardStatsResponse)
def get_dashboard_metrics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    stats = GovernanceAnalytics.get_dashboard_metrics(db, current_user.organization_id)
    return stats

@router.post("/patch-guideline", response_model=BrandRuleResponse)
def apply_guideline_patch(
    payload: GuidelinePatchRequest,
    current_user: User = Depends(require_role(["Brand Admin"])),
    db: Session = Depends(get_db)
):
    """
    Improvement 2: Interactive Guideline-Patch Recommender.
    Brand Admin accepts and applies the recommended wording patch to an ambiguous rule,
    creating a new version and maintaining full audit history.
    """
    try:
        updated_rule = GuidelinePatchRecommender.apply_patch(
            db=db,
            rule_id=payload.rule_id,
            organization_id=current_user.organization_id,
            new_rule_text=payload.new_rule_text,
            acting_user=current_user,
            reason=payload.reason
        )
        return updated_rule
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
