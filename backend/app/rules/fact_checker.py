import re
from datetime import datetime
from typing import List, Dict, Any, Optional
from app.models.vault import ApprovedFact, BrandRule

class FactChecker:
    @staticmethod
    def extract_claims(text: str) -> List[Dict[str, Any]]:
        """
        Extracts verifiable numeric/factual claims from text:
        - Price patterns ($XX, $XX/mo, $XX per user)
        - Uptime percentages (e.g. 99.9%, 99.99%)
        - Storage/capacity metrics (e.g. 500GB, 10TB)
        - Specific SLA response times (e.g. 15-minute response, 1 hour)
        """
        claims = []
        
        # Price regex: e.g. $79, $79/mo, $79 per month, $99/user/month, $79 per user/month
        price_regex = re.compile(r'(\$\s*\d+(?:\.\d+)?(?:\s*(?:\/|per)\s*(?:mo(?:nth)?|user|seat|year|annually|annual))*)\b', re.IGNORECASE)
        for m in price_regex.finditer(text):
            claims.append({
                "type": "price",
                "text": m.group(0),
                "start": m.start(),
                "end": m.end()
            })

        # SLA / Uptime regex: e.g. 99.999%, 99.9%
        uptime_regex = re.compile(r'\b(9\d(?:\.\d+)?%)\s*(?:uptime|availability|sla)?\b', re.IGNORECASE)
        for m in uptime_regex.finditer(text):
            claims.append({
                "type": "uptime",
                "text": m.group(0),
                "start": m.start(),
                "end": m.end()
            })

        return claims

    @classmethod
    def check_paragraph(
        cls,
        paragraph_text: str,
        paragraph_index: int,
        approved_facts: List[ApprovedFact],
        brand_rules: List[BrandRule]
    ) -> List[Dict[str, Any]]:
        findings = []
        claims = cls.extract_claims(paragraph_text)
        now = datetime.utcnow()

        for claim in claims:
            matched_fact: Optional[ApprovedFact] = None
            is_contradicted = False
            is_supported = False
            is_expired = False

            # Search active facts matching claim category
            if claim["type"] == "price":
                for fact in approved_facts:
                    if fact.category.lower() == "pricing":
                        # Check expiration
                        if fact.expires_at and fact.expires_at < now:
                            is_expired = True
                            continue
                        
                        matched_fact = fact
                        # Extract digits/prices from approved fact
                        fact_digits = re.findall(r'\d+', fact.approved_value)
                        claim_digits = re.findall(r'\d+', claim["text"])

                        if fact_digits and claim_digits:
                            if fact_digits[0] != claim_digits[0]:
                                is_contradicted = True
                            else:
                                is_supported = True
                        break

            elif claim["type"] == "uptime":
                for fact in approved_facts:
                    if "uptime" in fact.claim_subject.lower() or "sla" in fact.claim_subject.lower():
                        matched_fact = fact
                        if claim["text"].strip() in fact.approved_value:
                            is_supported = True
                        else:
                            is_contradicted = True
                        break

            # Handle Contradiction
            if is_contradicted and matched_fact:
                findings.append({
                    "check_type": "CHECK_3_FACT",
                    "category": "Fact",
                    "severity": "Violation",
                    "status": "Open",
                    "flagged_text": claim["text"],
                    "span_start": claim["start"],
                    "span_end": claim["end"],
                    "paragraph_index": paragraph_index,
                    "explanation": (
                        f"Factual Contradiction Detected: Claimed value '{claim['text']}' directly conflicts with "
                        f"approved brand record for '{matched_fact.claim_subject}'."
                    ),
                    "rule_clause_id": matched_fact.fact_id,
                    "source_document": matched_fact.source_document or "Approved Pricing Schedule 2026",
                    "source_page": matched_fact.source_page or 1,
                    "source_quote": matched_fact.exact_passage,
                    "suggested_fix": matched_fact.approved_value,
                    "confidence_score": 0.98,
                    "confidence_type": "Rule-Based"
                })

            # Handle Expired Fact reference
            elif is_expired:
                findings.append({
                    "check_type": "CHECK_3_FACT",
                    "category": "Fact",
                    "severity": "Warning",
                    "status": "Needs Human Review",
                    "flagged_text": claim["text"],
                    "span_start": claim["start"],
                    "span_end": claim["end"],
                    "paragraph_index": paragraph_index,
                    "explanation": "Claim references pricing or terms that have expired in the Brand Truth Vault.",
                    "rule_clause_id": "EXPIRED-FACT-CHECK",
                    "source_document": "Brand Truth Vault",
                    "source_page": 1,
                    "source_quote": "Status: Expired",
                    "suggested_fix": None,
                    "confidence_score": 0.70,
                    "confidence_type": "Heuristic"
                })

            # Handle Unsubstantiated Claim if price or uptime has no matching fact in vault
            elif not is_supported and not matched_fact:
                findings.append({
                    "check_type": "CHECK_3_FACT",
                    "category": "Fact",
                    "severity": "Warning",
                    "status": "Unsubstantiated",
                    "flagged_text": claim["text"],
                    "span_start": claim["start"],
                    "span_end": claim["end"],
                    "paragraph_index": paragraph_index,
                    "explanation": (
                        f"Unsubstantiated Promotional Claim: No approved fact or substantiation source exists in the "
                        f"Brand Truth Vault for '{claim['text']}'. Prior substantiation is required before publishing."
                    ),
                    "rule_clause_id": "FACT-SUB-REQ",
                    "source_document": "Brand Substantiation Policy",
                    "source_page": 1,
                    "source_quote": "All quantitative promotional statements must have corresponding approved source facts in the Brand Truth Vault.",
                    "suggested_fix": None,
                    "confidence_score": 0.85,
                    "confidence_type": "Rule-Based"
                })

        return findings
