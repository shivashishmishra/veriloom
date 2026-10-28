import re
from typing import List, Dict, Any, Optional
from app.models.vault import BrandRule

# Patterns that violate typical enterprise brand voice
HYPERBOLIC_PATTERNS = [
    (r'\b(game[- ]changing|revolutionary|miraculous|world[- ]beating)\b', "Hyperbolic claim detected. Enterprise tone requires grounded, defensible descriptions rather than sensational adjectives.", "innovative"),
    (r'\b(100%\s+foolproof|100%\s+fail[- ]safe|zero\s+risk|guaranteed\s+perfection)\b', "Absolute guarantee detected. Compliance policy strictly prohibits uninsurable absolute reliability claims.", "enterprise-grade resilience"),
    (r'\b(gonna|wanna|kinda|super\s+hyped|insane\s+results)\b', "Colloquial slang detected. Professional enterprise voice prefers polished, formal phrasing.", "significantly enhanced results"),
    (r'\b(destroy\s+the\s+competition|crush\s+competitors)\b', "Aggressive competitor targeting detected. Brand voice requires respectful, value-focused differentiation.", "outperform legacy alternatives"),
]

class ToneChecker:
    @staticmethod
    def check_paragraph(
        paragraph_text: str,
        paragraph_index: int,
        tone_rules: List[BrandRule],
        ai_provider: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        findings = []
        if not paragraph_text:
            return findings

        # Deterministic Heuristic Tone Check
        for pattern, explanation, replacement in HYPERBOLIC_PATTERNS:
            for match in re.finditer(pattern, paragraph_text, re.IGNORECASE):
                matched_str = match.group(0)
                findings.append({
                    "check_type": "CHECK_2_TONE",
                    "category": "Tone",
                    "severity": "Warning",
                    "status": "Open",
                    "flagged_text": matched_str,
                    "span_start": match.start(),
                    "span_end": match.end(),
                    "paragraph_index": paragraph_index,
                    "explanation": f"Brand Voice Guideline: {explanation}",
                    "rule_clause_id": "TONE-VOICE-01",
                    "source_document": "Brand Style & Voice Guide",
                    "source_page": 4,
                    "source_quote": "Enterprise Voice Rule 4.1: Maintain balanced, substantiated language; avoid hyperbolic superlatives, slang, and absolute risk guarantees.",
                    "suggested_fix": replacement,
                    "confidence_score": 0.85,
                    "confidence_type": "Heuristic"
                })

        # Match specific custom tone rules in Vault
        for rule in tone_rules:
            if rule.category.lower() == "tone" and rule.status == "Active":
                # Check for keywords in rule title or exact_rule_text
                # E.g., if rule forbids certain phrasing
                pass

        return findings
