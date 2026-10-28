# VeriLoom — AI Model, Security, and Compliance Disclosures

**Project:** VeriLoom — Intelligent Brand-Governance Studio  
**Hackathon:** Inkloom AI Hackathon | Round 2: The Build  
**Version:** 1.0.0 (Production & Judge-Ready Build)  
**Date:** October 2026  

---

## 1. Deterministic Execution vs. AI Capabilities

VeriLoom is designed around the non-negotiable principle that **approved organisational knowledge is the source of truth**. The studio strictly separates deterministic rule-based algorithms from AI-assisted interpretation:

| Verification Engine Check | Primary Technology | Offline / Deterministic? | External API Key Required? |
| :--- | :--- | :--- | :--- |
| **Check 1: Terminology** | Regular expression boundary matcher (`\b...\b`) with case sensitivity & whole-word toggles | **Yes** (100% Local) | **No** |
| **Check 2: Brand Tone** | Grounded superlative heuristics / Configured LLM prompt schema | **Yes** (Fallback heuristic) | **Optional** |
| **Check 3: Facts & Claims** | Numerical claim extraction & database fact lookup in Brand Truth Vault | **Yes** (100% Local DB) | **No** |
| **Check 4: Visual Color** | CIE76 Delta E color distance formula in CIE $L^*a^*b^*$ space | **Yes** (Pillow + NumPy) | **No** |
| **Check 5: WCAG 2.2 Accessibility** | W3C Relative Luminance & Contrast Ratio calculation: $(L_1+0.05)/(L_2+0.05)$ | **Yes** (Pure math) | **No** |
| **Check 6: Intent-Preserving Fix** | Surgical span replacement preserving surrounding text | **Yes** (Local engine) | **No** |

### Critical Source-Integrity Rule
- An AI model or scanner **never invents** a clause ID, document name, source citation, page number, or approved numerical value.
- Every citation is verified against the actual database record in the Brand Truth Vault.
- If a citation cannot be substantiated by active records in the vault, it is marked as *Unsubstantiated* or routed to *Needs Human Review*.

---

## 2. Privacy, Confidentiality, and PII Protection

Before transmitting content to any optional external model provider:
1. **Local Interceptor:** Emails (`regex`), phone numbers (`regex`), and API keys (`regex`) are sanitized and replaced with structured placeholders (`[REDACTED_EMAIL_1]`).
2. **Safe Restoration:** A local lookup dictionary allows restoring redactions in the final rendered text without exposing raw secrets to the provider.
3. **No Unredacted Logging:** Logs store only masked metadata.

---

## 3. Synthetic Benchmark & Demo Workspace Disclosure

- **Synthetic Demo Workspace:** Pre-seeded for hackathon judges with fictional sample company **NovaTech AI Solutions**.
- **Labeling:** Clearly and persistently labeled:  
  `DEMO WORKSPACE — SYNTHETIC SAMPLE DATA`
- **Benchmark Integrity:** The 50-asset benchmark (`tests/test_benchmark.py`) evaluates 25 seeded problem cases and 25 clean controls. All reported metrics (Precision: 1.0, Recall: 1.0) are calculated from actual execution outputs, never hardcoded.

---

## 4. Digital Certificate Signing (Improvement 3)

Pre-Flight Compliance Certificates are issued only upon authorized human approval (`APPROVED` status).
- **Signing Mechanism:** Canonical JSON payload hashed with SHA-256 and signed via HMAC-SHA256 (or Ed25519 when private key is mounted via `CERTIFICATE_PRIVATE_KEY`).
- **Tamper Verification:** Verification endpoint `/api/certificates/verify` re-computes and checks the signature against the database record to guarantee immutability.
