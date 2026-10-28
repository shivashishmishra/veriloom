import time
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from app.models.vault import TerminologyRule, ApprovedFact, BrandRule, BrandColorPalette
from app.models.submission import ContentSubmission, ContentRevision, Finding
from app.parsers.document_parser import DocumentParser, ParsedParagraph
from app.parsers.delta_hasher import DeltaHasher
from app.rules.terminology import TerminologyChecker
from app.rules.tone import ToneChecker
from app.rules.fact_checker import FactChecker
from app.vision.wcag_contrast import WCAGChecker
from app.config import settings

class HybridScanner:
    @classmethod
    def scan_content(
        cls,
        db: Session,
        submission: ContentSubmission,
        raw_text: str,
        organization_id: int,
        previous_revision: Optional[ContentRevision] = None
    ) -> Dict[str, Any]:
        start_time = time.time()
        
        # 1. Fetch Organization Brand Vault Rules & Facts
        terms = db.query(TerminologyRule).filter(
            TerminologyRule.organization_id == organization_id,
            TerminologyRule.status == "Active"
        ).all()

        facts = db.query(ApprovedFact).filter(
            ApprovedFact.organization_id == organization_id,
            ApprovedFact.status == "Active"
        ).all()

        brand_rules = db.query(BrandRule).filter(
            BrandRule.organization_id == organization_id,
            BrandRule.status == "Active"
        ).all()

        # 2. Parse into Paragraphs and compute SHA-256
        doc_sha256 = DeltaHasher.compute_sha256(raw_text)
        parsed_paras: List[ParsedParagraph] = DocumentParser.parse_text(raw_text)
        para_texts = [p.text for p in parsed_paras]
        current_para_hashes = DeltaHasher.hash_paragraphs(para_texts)

        # 3. Delta Scanning Evaluation (Improvement 1)
        cached_findings = []
        unchanged_para_indices = set()
        delta_stats = {
            "total_paragraphs": len(parsed_paras),
            "unchanged_paragraphs": 0,
            "modified_paragraphs": len(parsed_paras),
            "cached_findings_reused": 0,
            "new_findings_detected": 0,
            "scan_duration_ms": 0.0,
            "sha256_hash": doc_sha256
        }

        if previous_revision and previous_revision.paragraph_hashes:
            try:
                import json
                old_hashes = json.loads(previous_revision.paragraph_hashes)
                old_paras = [p.text for p in DocumentParser.parse_text(previous_revision.raw_content)]
                comparison = DeltaHasher.compare_revisions(
                    old_paras, para_texts, old_hashes, current_para_hashes
                )

                for item in comparison["unchanged"]:
                    unchanged_para_indices.add(item["new_index"])
                    # Re-use previous findings for this unchanged paragraph
                    old_finds = [f for f in previous_revision.findings if f.paragraph_index == item["old_index"]]
                    for of in old_finds:
                        cached_findings.append({
                            "check_type": of.check_type,
                            "category": of.category,
                            "severity": of.severity,
                            "status": of.status,
                            "flagged_text": of.flagged_text,
                            "span_start": of.span_start,
                            "span_end": of.span_end,
                            "paragraph_index": item["new_index"],
                            "explanation": of.explanation,
                            "rule_clause_id": of.rule_clause_id,
                            "source_document": of.source_document,
                            "source_page": of.source_page,
                            "source_quote": of.source_quote,
                            "suggested_fix": of.suggested_fix,
                            "confidence_score": of.confidence_score,
                            "confidence_type": of.confidence_type
                        })

                delta_stats["unchanged_paragraphs"] = len(unchanged_para_indices)
                delta_stats["modified_paragraphs"] = len(parsed_paras) - len(unchanged_para_indices)
                delta_stats["cached_findings_reused"] = len(cached_findings)
            except Exception:
                pass

        # 4. Run Checks on Paragraphs that need scanning
        new_findings = []
        for p in parsed_paras:
            if p.index in unchanged_para_indices:
                continue

            # Check 1: Terminology
            term_finds = TerminologyChecker.check_paragraph(p.text, p.index, terms)
            new_findings.extend(term_finds)

            # Check 2: Brand Tone
            tone_finds = ToneChecker.check_paragraph(p.text, p.index, brand_rules)
            new_findings.extend(tone_finds)

            # Check 3: Fact & Claim Verification
            fact_finds = FactChecker.check_paragraph(p.text, p.index, facts, brand_rules)
            new_findings.extend(fact_finds)

            # Check 5: Accessibility / Alt-text checks if inline image markup present
            if "images" in p.metadata:
                for img in p.metadata["images"]:
                    alt_res = WCAGChecker.check_alt_text(img.get("alt"), img.get("url", "image"))
                    if not alt_res["passes"]:
                        new_findings.append({
                            "check_type": "CHECK_5_ACCESSIBILITY",
                            "category": "Accessibility",
                            "severity": alt_res["severity"],
                            "status": "Open",
                            "flagged_text": img.get("alt") or "[Missing Alt Text]",
                            "span_start": 0,
                            "span_end": 0,
                            "paragraph_index": p.index,
                            "explanation": alt_res["explanation"],
                            "rule_clause_id": alt_res["rule_clause_id"],
                            "source_document": "WCAG 2.2 Guideline 1.1.1",
                            "source_page": 1,
                            "source_quote": "All non-text content that is presented to the user has a text alternative that serves the equivalent purpose.",
                            "suggested_fix": alt_res.get("suggested_fix"),
                            "confidence_score": 1.0,
                            "confidence_type": "Rule-Based"
                        })

        delta_stats["new_findings_detected"] = len(new_findings)
        total_duration = round((time.time() - start_time) * 1000, 2)
        delta_stats["scan_duration_ms"] = total_duration

        all_findings = cached_findings + new_findings

        # Apply Confidence-Aware Human Escalation policy
        for f in all_findings:
            score = f.get("confidence_score", 1.0)
            if score < 0.50:
                f["status"] = "Needs Human Review"
            elif score < 0.80 and f["status"] == "Open":
                f["status"] = "Needs Human Review"

        return {
            "findings": all_findings,
            "delta_stats": delta_stats,
            "doc_sha256": doc_sha256,
            "paragraph_hashes": current_para_hashes
        }
