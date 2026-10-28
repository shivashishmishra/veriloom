# VeriLoom — Automated Test Execution Report

**Project:** VeriLoom — Intelligent Brand-Governance Studio  
**Hackathon:** Inkloom AI Hackathon | Round 2: The Build  
**Execution Date:** October 2026  
**Environment:** Python 3.12.10, Pytest 8.3.4, SQLite (In-Memory / Test DB)  
**Overall Status:** **27 PASSED, 0 FAILED, 0 SKIPPED (100% Pass Rate)**  

---

## 1. Test Suite Summary

```
============================= test session starts =============================
platform win32 -- Python 3.12.10, pytest-8.3.4, pluggy-1.7.0
rootdir: C:\Users\shiva\.gemini\antigravity\scratch\veriloom\backend
configfile: pytest.ini
collected 27 items

tests/test_auth.py::test_password_hashing PASSED                         [  3%]
tests/test_auth.py::test_jwt_token_roundtrip PASSED                      [  7%]
tests/test_auth.py::test_confidential_data_masking PASSED                [ 11%]
tests/test_benchmark.py::test_synthetic_50_asset_benchmark PASSED        [ 14%]
tests/test_certificates.py::test_certificate_signature_verification PASSED [ 18%]
tests/test_certificates.py::test_unapproved_submission_cannot_receive_certificate PASSED [ 22%]
tests/test_delta_diff.py::test_delta_paragraph_comparison PASSED         [ 25%]
tests/test_fact_checker.py::test_fact_price_contradiction PASSED         [ 29%]
tests/test_fact_checker.py::test_expired_fact_handling PASSED            [ 33%]
tests/test_fact_checker.py::test_unsubstantiated_promotional_claim PASSED [ 37%]
tests/test_file_uploads_and_security.py::test_document_parser_markdown PASSED [ 40%]
tests/test_file_uploads_and_security.py::test_document_parser_html PASSED [ 44%]
tests/test_file_uploads_and_security.py::test_document_parser_text PASSED [ 48%]
tests/test_file_uploads_and_security.py::test_wcag_contrast_standards PASSED [ 51%]
tests/test_file_uploads_and_security.py::test_svg_color_extraction PASSED [ 55%]
tests/test_patch_recommender.py::test_patch_recommender_threshold_triggered PASSED [ 59%]
tests/test_patch_recommender.py::test_patch_recommender_insufficient_sample_size PASSED [ 62%]
tests/test_patch_recommender.py::test_patch_recommender_low_override_rate PASSED [ 66%]
tests/test_terminology.py::test_terminology_whole_word_matching PASSED   [ 70%]
tests/test_terminology.py::test_terminology_does_not_flag_substring PASSED [ 74%]
tests/test_terminology.py::test_case_insensitive_handling PASSED         [ 77%]
tests/test_wcag_and_color.py::test_relative_luminance PASSED             [ 81%]
tests/test_wcag_and_color.py::test_contrast_ratio_wcag PASSED            [ 85%]
tests/test_wcag_and_color.py::test_delta_e_color_distance PASSED         [ 88%]
tests/test_wcag_and_color.py::test_alt_text_verification PASSED          [ 92%]
tests/test_workflow_audit.py::test_override_reason_mandatory PASSED      [ 96%]
tests/test_workflow_audit.py::test_creator_cannot_approve_content PASSED [100%]

============================== 27 passed in 1.57s ==============================
```

---

## 2. Test Breakdown by Category

### A. Synthetic Benchmark (50 Evaluation Assets)
- **File:** `tests/test_benchmark.py`
- **Methodology:** 25 deliberately faulty assets containing banned terminology, pricing discrepancies, and hyperbolic claims + 25 verified clean controls.
- **Measured Results:**
  - True Positives: 25 / 25
  - True Negatives: 25 / 25
  - False Positives: 0 / 25
  - False Negatives: 0 / 25
  - Measured Precision: **1.0000**
  - Measured Recall: **1.0000**
  - F1 Score: **1.0000**

### B. Core Engine Checks
- **Terminology:**
  - `test_terminology_whole_word_matching`: Verifies exact word boundary detection (`\b...\b`).
  - `test_terminology_does_not_flag_substring`: Verifies that words containing substrings (e.g. "synergistic" when "synergy" is banned) are not erroneously flagged unless whole-word rule matches.
  - `test_case_insensitive_handling`: Verifies case invariance (e.g., "SYNERGY", "Synergy", "synergy").
- **Facts & Claims:**
  - `test_fact_price_contradiction`: Accurately flags `$79 per user/month` as contradicting approved `$99 per user/month`.
  - `test_expired_fact_handling`: Accurately tags claims citing expired vault records as `Needs Human Review`.
  - `test_unsubstantiated_promotional_claim`: Flags unsupported quantitative claims as `Unsubstantiated`.
- **Visual Colors & WCAG 2.2 Accessibility:**
  - `test_relative_luminance`: Verifies W3C relative luminance coefficients ($0.2126R + 0.7152G + 0.0722B$).
  - `test_contrast_ratio_wcag`: Tests 4.5:1 (normal text) and 3:1 (large text) thresholds.
  - `test_delta_e_color_distance`: Verifies Euclidean distance in CIE $L^*a^*b^*$ color space.
  - `test_alt_text_verification`: Flags missing or generic alt text ("image", "photo").

### C. Improvement 1: SHA-256 Delta Scanning
- **File:** `tests/test_delta_diff.py`
- **Results:** Correctly partitions modified vs. unchanged paragraphs; reuses cached findings on unchanged content.

### D. Improvement 2: Guideline-Patch Recommender
- **File:** `tests/test_patch_recommender.py`
- **Results:**
  - Triggers clarification patch when override rate $\ge 40\%$ with sample size $\ge 2$.
  - Rejects alerts when sample size $< 2$ or override rate $< 40\%$.

### E. Improvement 3: Compliance Certificate
- **File:** `tests/test_certificates.py`
- **Results:**
  - Verifies HMAC-SHA256 digital signature validity.
  - Asserts that unapproved submissions (`DRAFT` or `PENDING_REVIEW`) are rejected from receiving certificates (`HTTP 400`).

### F. Security, RBAC & Document Parsing
- **Files:** `tests/test_auth.py`, `tests/test_workflow_audit.py`, `tests/test_file_uploads_and_security.py`
- **Results:**
  - Creator cannot approve content (`HTTP 403`).
  - Override requires mandatory $\ge 5$ character explanation (`HTTP 400`).
  - Markdown, HTML, and TXT parsing verified.
  - SVG attribute color extraction verified.
