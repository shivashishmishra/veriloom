from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.submission import ContentSubmission, ContentRevision, Finding
from app.models.vault import BrandRule, TerminologyRule
from app.models.workflow import AuditEvent
from app.analytics.patch_recommender import GuidelinePatchRecommender

class GovernanceAnalytics:
    @staticmethod
    def get_dashboard_metrics(db: Session, organization_id: int) -> Dict[str, Any]:
        # 1. Total Submissions & Status Counts
        submissions = db.query(ContentSubmission).filter(
            ContentSubmission.organization_id == organization_id
        ).all()
        
        total_sub = len(submissions)
        pending_review = sum(1 for s in submissions if s.current_status == "PENDING_REVIEW")
        approved = sum(1 for s in submissions if s.current_status == "APPROVED")
        changes_req = sum(1 for s in submissions if s.current_status == "CHANGES_REQUESTED")

        # 2. Findings Metrics
        findings_query = db.query(Finding).join(ContentRevision).join(ContentSubmission).filter(
            ContentSubmission.organization_id == organization_id
        )
        all_findings = findings_query.all()

        open_cnt = sum(1 for f in all_findings if f.status in ["Open", "Needs Human Review"])
        resolved_cnt = sum(1 for f in all_findings if f.status == "Resolved")
        overridden_cnt = sum(1 for f in all_findings if f.status == "Overridden")

        # Findings by Category
        category_counts = {}
        for f in all_findings:
            cat = f.category or "Other"
            category_counts[cat] = category_counts.get(cat, 0) + 1
        
        findings_by_category = [{"category": k, "count": v} for k, v in category_counts.items()]

        # Most Violated Rules
        rule_violation_counts = {}
        for f in all_findings:
            if f.rule_clause_id:
                rule_violation_counts[f.rule_clause_id] = rule_violation_counts.get(f.rule_clause_id, 0) + 1
        
        sorted_rules = sorted(rule_violation_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        most_violated_rules = []
        for r_id, cnt in sorted_rules:
            # Look up rule title
            rule_obj = db.query(BrandRule).filter(BrandRule.rule_id == r_id, BrandRule.organization_id == organization_id).first()
            title = rule_obj.title if rule_obj else f"Rule {r_id}"
            cat = rule_obj.category if rule_obj else "Brand Policy"
            most_violated_rules.append({
                "rule_id": r_id,
                "title": title,
                "category": cat,
                "violation_count": cnt
            })

        # 3. Guideline-Friction Analysis (Unclear Guidelines > 40% override rate)
        unclear_alerts = GuidelinePatchRecommender.detect_friction_rules(db, organization_id, all_findings)

        return {
            "total_submissions": total_sub,
            "pending_review": pending_review,
            "approved": approved,
            "changes_requested": changes_req,
            "open_findings": open_cnt,
            "resolved_findings": resolved_cnt,
            "overridden_findings": overridden_cnt,
            "findings_by_category": findings_by_category,
            "most_violated_rules": most_violated_rules,
            "unclear_guideline_alerts": unclear_alerts,
            "is_demo_workspace": True,
            "badge_label": "DEMO WORKSPACE — SYNTHETIC SAMPLE DATA"
        }
