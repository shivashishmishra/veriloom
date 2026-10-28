import pytest
from app.models.vault import TerminologyRule
from app.rules.terminology import TerminologyChecker

def test_terminology_whole_word_matching():
    term_rule = TerminologyRule(
        term_id="TERM-01",
        banned_term="market-leading",
        preferred_term="industry-recognized",
        case_sensitive=False,
        match_whole_word=True,
        severity="Violation",
        status="Active"
    )

    text_violation = "Our market-leading cloud solution scales instantly."
    findings = TerminologyChecker.check_paragraph(text_violation, 0, [term_rule])
    assert len(findings) == 1
    assert findings[0]["flagged_text"] == "market-leading"
    assert findings[0]["suggested_fix"] == "industry-recognized"
    assert findings[0]["rule_clause_id"] == "TERM-01"

def test_terminology_does_not_flag_substring():
    term_rule = TerminologyRule(
        term_id="TERM-02",
        banned_term="lead",
        preferred_term="guide",
        case_sensitive=False,
        match_whole_word=True,
        severity="Violation",
        status="Active"
    )

    # Substring in "pleading" or "leadership" shouldn't trigger whole-word rule for "lead"
    text_clean = "The lawyer presented pleading arguments on leadership."
    findings = TerminologyChecker.check_paragraph(text_clean, 0, [term_rule])
    assert len(findings) == 0

def test_case_insensitive_handling():
    term_rule = TerminologyRule(
        term_id="TERM-03",
        banned_term="bulletproof",
        preferred_term="high-resilience",
        case_sensitive=False,
        match_whole_word=True,
        severity="Violation",
        status="Active"
    )
    findings = TerminologyChecker.check_paragraph("We offer BULLETPROOF zero-trust security.", 0, [term_rule])
    assert len(findings) == 1
    assert findings[0]["flagged_text"] == "BULLETPROOF"
