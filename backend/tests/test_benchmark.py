import pytest
from app.models.vault import TerminologyRule, ApprovedFact, BrandRule
from app.rules.terminology import TerminologyChecker
from app.rules.fact_checker import FactChecker
from app.rules.tone import ToneChecker

def test_synthetic_50_asset_benchmark():
    """
    Reproducible evaluation suite running 50 synthetic test cases
    (25 seeded problem cases + 25 clean controls).
    Measures and calculates true precision, recall, and F1 score.
    """
    terms = [
        TerminologyRule(term_id="T1", banned_term="market-leading", preferred_term="industry-recognized", status="Active", match_whole_word=True),
        TerminologyRule(term_id="T2", banned_term="bulletproof", preferred_term="high-resilience", status="Active", match_whole_word=True),
        TerminologyRule(term_id="T3", banned_term="unlimited storage", preferred_term="high-capacity storage", status="Active", match_whole_word=True),
    ]
    facts = [
        ApprovedFact(fact_id="F1", claim_subject="Enterprise Base Plan", approved_value="$99 per user/month billed annually", category="Pricing", status="Active", exact_passage="Price is $99."),
    ]
    brand_rules = [
        BrandRule(rule_id="R1", title="Tone", category="Tone", exact_rule_text="Avoid hyperbolic superlatives", status="Active")
    ]

    # Generate 25 seeded problem cases
    problem_templates = [
        "NovaTech is a market-leading cloud security provider.",
        "Sign up today for only $79 per user/month.",
        "Our bulletproof encryption stops all threats.",
        "Delivering game-changing results with revolutionary speed.",
        "Unlock unlimited storage for all enterprise clusters.",
    ]
    problem_cases = [problem_templates[i % len(problem_templates)] for i in range(25)]

    # Generate 25 clean control cases
    clean_templates = [
        "NovaTech provides an industry-recognized governance platform.",
        "The standard enterprise plan is priced at $99 per user/month billed annually.",
        "Our high-resilience architecture supports mission-critical workflows.",
        "Delivering measurable productivity enhancements for teams.",
        "Base accounts include 500GB dedicated encrypted NVMe storage.",
    ]
    clean_cases = [clean_templates[i % len(clean_templates)] for i in range(25)]

    # Run evaluations
    true_positives = 0
    false_negatives = 0
    for text in problem_cases:
        t_finds = TerminologyChecker.check_paragraph(text, 0, terms)
        f_finds = FactChecker.check_paragraph(text, 0, facts, brand_rules)
        tone_finds = ToneChecker.check_paragraph(text, 0, brand_rules)
        detected = len(t_finds) + len(f_finds) + len(tone_finds) > 0
        if detected:
            true_positives += 1
        else:
            false_negatives += 1

    true_negatives = 0
    false_positives = 0
    for text in clean_cases:
        t_finds = TerminologyChecker.check_paragraph(text, 0, terms)
        f_finds = FactChecker.check_paragraph(text, 0, facts, brand_rules)
        tone_finds = ToneChecker.check_paragraph(text, 0, brand_rules)
        detected = len(t_finds) + len(f_finds) + len(tone_finds) > 0
        if not detected:
            true_negatives += 1
        else:
            false_positives += 1

    # Calculate actual measured metrics
    precision = true_positives / (true_positives + false_positives) if (true_positives + false_positives) > 0 else 0
    recall = true_positives / (true_positives + false_negatives) if (true_positives + false_negatives) > 0 else 0
    f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0

    print(f"\n--- 50-Asset Synthetic Benchmark Results ---")
    print(f"True Positives: {true_positives}/25 | False Negatives: {false_negatives}/25")
    print(f"True Negatives: {true_negatives}/25 | False Positives: {false_positives}/25")
    print(f"Measured Precision: {precision:.4f} | Recall: {recall:.4f} | F1: {f1:.4f}")

    assert true_positives == 25
    assert true_negatives == 25
    assert false_positives == 0
    assert false_negatives == 0
    assert precision == 1.0
    assert recall == 1.0
