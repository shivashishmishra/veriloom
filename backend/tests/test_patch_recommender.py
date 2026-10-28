import pytest
from app.models.submission import Finding
from app.analytics.patch_recommender import GuidelinePatchRecommender

class MockDB:
    def query(self, *args, **kwargs):
        class MockQuery:
            def filter(self, *a, **k):
                return self
            def first(self):
                return None
        return MockQuery()

def test_patch_recommender_threshold_triggered():
    """
    When override rate >= 40% with sample size >= 2,
    GuidelinePatchRecommender detects friction and drafts an amendment.
    """
    findings = [
        Finding(
            id=1,
            rule_clause_id="PR-101",
            status="Overridden",
            override_reason="Legacy partner quote grandfathered in 2025"
        ),
        Finding(
            id=2,
            rule_clause_id="PR-101",
            status="Overridden",
            override_reason="Authorized pilot tier"
        ),
        Finding(
            id=3,
            rule_clause_id="PR-101",
            status="Open"
        ),
    ]
    db = MockDB()
    alerts = GuidelinePatchRecommender.detect_friction_rules(db, organization_id=1, all_findings=findings)
    assert len(alerts) == 1
    alert = alerts[0]
    assert alert["rule_id"] == "PR-101"
    assert alert["total_findings"] == 3
    assert alert["overrides_count"] == 2
    assert alert["override_rate"] == 0.67
    assert alert["sample_size_adequate"] is True
    assert "Legacy partner quote" in alert["reviewer_comments"][0]

def test_patch_recommender_insufficient_sample_size():
    """
    A single override (< 2 findings) must NOT trigger a guideline alert.
    """
    findings = [
        Finding(
            id=1,
            rule_clause_id="TN-202",
            status="Overridden",
            override_reason="Casual blog tone allowed for internal staff spotlight"
        )
    ]
    db = MockDB()
    alerts = GuidelinePatchRecommender.detect_friction_rules(db, organization_id=1, all_findings=findings)
    assert len(alerts) == 0

def test_patch_recommender_low_override_rate():
    """
    Override rate below 40% must NOT trigger an alert.
    """
    findings = [
        Finding(id=1, rule_clause_id="TM-303", status="Overridden", override_reason="Special industry term"),
        Finding(id=2, rule_clause_id="TM-303", status="Resolved"),
        Finding(id=3, rule_clause_id="TM-303", status="Resolved"),
        Finding(id=4, rule_clause_id="TM-303", status="Resolved"),
    ] # 1 / 4 = 25% < 40%
    db = MockDB()
    alerts = GuidelinePatchRecommender.detect_friction_rules(db, organization_id=1, all_findings=findings)
    assert len(alerts) == 0
