from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.submission import Finding
from app.models.vault import BrandRule
from app.models.user import User
from app.workflow.audit import log_audit_event

class GuidelinePatchRecommender:
    MIN_SAMPLE_SIZE = 2 # Minimum findings required to flag statistical friction
    OVERRIDE_THRESHOLD = 0.40 # 40% override rate

    @classmethod
    def detect_friction_rules(
        cls,
        db: Session,
        organization_id: int,
        all_findings: List[Finding]
    ) -> List[Dict[str, Any]]:
        rule_stats: Dict[str, Dict[str, Any]] = {}

        for f in all_findings:
            r_id = f.rule_clause_id
            if not r_id:
                continue

            if r_id not in rule_stats:
                rule_stats[r_id] = {
                    "total": 0,
                    "overrides": 0,
                    "comments": []
                }

            rule_stats[r_id]["total"] += 1
            if f.status == "Overridden":
                rule_stats[r_id]["overrides"] += 1
                if f.override_reason and f.override_reason not in rule_stats[r_id]["comments"]:
                    rule_stats[r_id]["comments"].append(f.override_reason)

        alerts = []
        for r_id, stats in rule_stats.items():
            tot = stats["total"]
            ovr = stats["overrides"]
            rate = ovr / tot if tot > 0 else 0.0

            if tot >= cls.MIN_SAMPLE_SIZE and rate >= cls.OVERRIDE_THRESHOLD:
                # Retrieve rule details
                rule = db.query(BrandRule).filter(
                    BrandRule.rule_id == r_id,
                    BrandRule.organization_id == organization_id
                ).first()

                title = rule.title if rule else f"Rule {r_id}"
                orig_text = rule.exact_rule_text if rule else "Original guideline text"
                category = rule.category if rule else "Brand Standard"

                # Generate patch wording recommendation
                suggested_patch, rationale = cls.generate_patch_proposal(r_id, orig_text, stats["comments"])

                alerts.append({
                    "rule_id": r_id,
                    "rule_title": title,
                    "original_text": orig_text,
                    "category": category,
                    "total_findings": tot,
                    "overrides_count": ovr,
                    "override_rate": round(rate, 2),
                    "reviewer_comments": stats["comments"],
                    "suggested_patch_wording": suggested_patch,
                    "patch_rationale": rationale,
                    "sample_size_adequate": True
                })

        return alerts

    @staticmethod
    def generate_patch_proposal(rule_id: str, original_text: str, reviewer_comments: List[str]) -> (str, str):
        """
        Synthesizes reviewer override reasons to produce a clearer, disambiguated guideline patch.
        """
        reasons_text = "; ".join(reviewer_comments) if reviewer_comments else "Reviewers frequently override this rule in legitimate business contexts."
        
        if "market-leading" in original_text.lower() or "term" in rule_id.lower():
            patch = (
                "Avoid unverified superlatives such as 'market-leading' in consumer press releases; "
                "however, certified third-party industry rankings (e.g. Gartner Magic Quadrant leader, Forrester Wave) "
                "may be cited when accompanied by formal citation and publication year."
            )
            rationale = f"Override rate exceeds 40%. Reviewers noted: '{reasons_text}'. The proposed amendment clarifies third-party accreditation exemptions while continuing to bar unsubstantiated marketing puffery."
        elif "price" in rule_id.lower() or "pricing" in original_text.lower():
            patch = (
                "Promotional material must state base subscription tiers ($99/user/month billed annually). "
                "Legacy customer renewal discounts or promotional partner pricing may be published only when explicitly labeled as 'Promotional Limited-Time Renewal Rate'."
            )
            rationale = f"Reviewers noted: '{reasons_text}'. The proposed patch distinguishes new customer list pricing from grandfathered contract quotes."
        else:
            patch = (
                f"{original_text.rstrip('.')} — Except in documented executive disclosures and audited compliance collateral with explicit legal sign-off."
            )
            rationale = f"40%+ override frequency indicates rule overbreadth. Reviewer feedback: '{reasons_text}'."

        return patch, rationale

    @staticmethod
    def apply_patch(
        db: Session,
        rule_id: str,
        organization_id: int,
        new_rule_text: str,
        acting_user: User,
        reason: str
    ) -> BrandRule:
        rule = db.query(BrandRule).filter(
            BrandRule.rule_id == rule_id,
            BrandRule.organization_id == organization_id
        ).first()

        if not rule:
            raise ValueError(f"Rule {rule_id} not found.")

        old_text = rule.exact_rule_text
        rule.exact_rule_text = new_rule_text
        rule.version += 1
        rule.created_by = acting_user.full_name

        db.commit()
        db.refresh(rule)

        log_audit_event(
            db=db,
            organization_id=organization_id,
            user_id=acting_user.id,
            action_type="RULE_PATCHED",
            rule_id=rule_id,
            outcome="PATCH_ACCEPTED",
            reason=reason,
            details={"previous_version": rule.version - 1, "old_text": old_text, "new_text": new_rule_text}
        )

        return rule
