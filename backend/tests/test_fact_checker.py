import pytest
import datetime
from app.models.vault import ApprovedFact, BrandRule
from app.rules.fact_checker import FactChecker

def test_fact_price_contradiction():
    fact = ApprovedFact(
        fact_id="FACT-PRICE-01",
        claim_subject="NovaCloud Enterprise Base Plan",
        approved_value="$99 per user/month billed annually",
        category="Pricing",
        exact_passage="Standard pricing is $99 per user/month.",
        status="Active"
    )

    draft_text = "Deploy NovaCloud Enterprise today for only $79 per user/month."
    findings = FactChecker.check_paragraph(draft_text, 0, [fact], [])
    assert len(findings) == 1
    assert findings[0]["check_type"] == "CHECK_3_FACT"
    assert findings[0]["severity"] == "Violation"
    assert "$79 per user/month" in findings[0]["flagged_text"]
    assert findings[0]["rule_clause_id"] == "FACT-PRICE-01"
    assert "$99" in findings[0]["suggested_fix"]

def test_expired_fact_handling():
    past_date = datetime.datetime.utcnow() - datetime.timedelta(days=30)
    fact = ApprovedFact(
        fact_id="FACT-PRICE-OLD",
        claim_subject="Legacy Pricing Tier",
        approved_value="$69 per user/month",
        category="Pricing",
        exact_passage="Promotional trial rate.",
        status="Active",
        expires_at=past_date
    )

    draft_text = "Sign up now for $69 per user/month."
    findings = FactChecker.check_paragraph(draft_text, 0, [fact], [])
    assert len(findings) == 1
    assert findings[0]["status"] == "Needs Human Review"
    assert "expired" in findings[0]["explanation"].lower()

def test_unsubstantiated_promotional_claim():
    # When claim has no approved backing fact in Vault
    draft_text = "Experience 99.999% uptime with instant failover."
    findings = FactChecker.check_paragraph(draft_text, 0, [], [])
    assert len(findings) == 1
    assert findings[0]["status"] == "Unsubstantiated"
    assert "99.999%" in findings[0]["flagged_text"]
