import re
from typing import List, Dict, Any, Optional
from app.models.vault import TerminologyRule

class TerminologyChecker:
    @staticmethod
    def check_paragraph(
        paragraph_text: str,
        paragraph_index: int,
        terms: List[TerminologyRule]
    ) -> List[Dict[str, Any]]:
        findings = []
        if not paragraph_text:
            return findings

        for term in terms:
            if term.status != "Active":
                continue

            banned = term.banned_term.strip()
            if not banned:
                continue

            flags = 0 if term.case_sensitive else re.IGNORECASE
            
            # Word boundary handling: if match_whole_word is True, wrap in \b
            # If the term contains special regex chars, escape them
            escaped_term = re.escape(banned)
            if term.match_whole_word:
                # Use word boundaries, handling symbols if any
                pattern = rf'\b{escaped_term}\b'
            else:
                pattern = escaped_term

            try:
                for match in re.finditer(pattern, paragraph_text, flags):
                    start = match.start()
                    end = match.end()
                    matched_str = match.group(0)

                    explanation = (
                        f"Prohibited terminology detected: '{matched_str}'. "
                        f"{term.reason if term.reason else 'Brand guidelines discourage this terminology.'}"
                    )
                    if term.preferred_term:
                        explanation += f" Preferred alternative: '{term.preferred_term}'."

                    findings.append({
                        "check_type": "CHECK_1_TERMINOLOGY",
                        "category": "Terminology",
                        "severity": term.severity or "Violation",
                        "status": "Open",
                        "flagged_text": matched_str,
                        "span_start": start,
                        "span_end": end,
                        "paragraph_index": paragraph_index,
                        "explanation": explanation,
                        "rule_clause_id": term.term_id,
                        "source_document": "Terminology Standards",
                        "source_page": 1,
                        "source_quote": f"Banned: '{term.banned_term}' -> Preferred: '{term.preferred_term or 'None'}'",
                        "suggested_fix": term.preferred_term or "",
                        "confidence_score": 1.0,
                        "confidence_type": "Rule-Based"
                    })
            except Exception:
                continue

        return findings
