# VeriLoom — Intelligent Brand-Governance Studio

> *"Every Claim Substantiated. Every Visual On-Brand. Every Fix Explainable."*

**Inkloom AI Hackathon | Round 2: The Build**  
**Category:** Pre-Publication Brand-Governance & Content-Verification Studio  
**Version:** 1.0.0 (Judge-Ready Full-Stack Build)

---

## 🌟 Executive Summary

**VeriLoom** solves enterprise brand compliance by systematically verifying content drafts against official brand guidelines, pricing schedules, factual claims, terminology standards, visual assets, and WCAG 2.2 accessibility **BEFORE** publication.

### The 6 Connected Stages
1. **Configure the Brand Truth Vault:** Centralized repository of approved guidelines, pricing tiers, banned terminology, and brand color swatches.
2. **Draft or Upload Content:** Multi-format document parser supporting PDF, DOCX, Markdown, and TXT drafts.
3. **Run Hybrid Verification Engine:** 6-check verification pipeline combining deterministic rule-based checks with grounded source retrieval.
4. **Review Evidence & Surgical Fixes:** Split-pane interface presenting exact source citations (Clause ID, page, quote) and intent-preserving span replacements.
5. **Obtain Authorized Human Approval:** Role-based approval workflow enforcing that AI never publishes or approves content alone.
6. **Governance Insights & Unclear-Guideline Patching:** Real-time analytics measuring reviewer override rates to detect ambiguous standards and propose clearer guideline patches.

---

## 🚀 Quick Start (Judge Demo)

### 1. Prerequisites
- **Python 3.11+** (Tested on Python 3.12)
- **Node.js 18+** & npm

### 2. Fast Launch (Full-Stack Unified Mode)
The backend automatically hosts the built production frontend at `http://127.0.0.1:8000`:

```bash
# Navigate to backend directory
cd backend

# Initialize database & seed NovaTech demo workspace
python init_db.py

# Launch FastAPI server
python run.py
```
Open your browser at **`http://127.0.0.1:8000`** to interact with the full application!

### 3. Alternative: Development Mode (Vite Hot-Reload)
If modifying frontend code with hot reload:
```bash
# Terminal 1: Backend
cd backend
python run.py

# Terminal 2: Frontend
cd frontend
npm run dev
```
Open **`http://localhost:5173`** (Vite proxies all `/api` requests to port 8000).

---

## 👥 Seeded Demo Personas (Role-Based Access)

For convenience, judges can switch roles in **1 click** using the header role bar, or sign in using these credentials:

| Role | Name | Email | Password | Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **✍️ Creator** | Alex Chen | `creator@novatech.io` | `DemoCreator123!` | Create drafts, run scans, apply surgical fixes, submit for review |
| **🔍 Reviewer** | Morgan Rivera | `reviewer@novatech.io` | `DemoReviewer123!` | Review evidence, override findings with mandatory reason, approve drafts |
| **🛡️ Brand Admin** | Dr. Elena Vance | `admin@novatech.io` | `DemoAdmin123!` | Manage Truth Vault, accept guideline patches, view audit logs |

---

## 🎯 2-Minute Judge Walkthrough Scenario

1. **Launch App:** Open `http://127.0.0.1:8000` and click the **"Guided Judge Tour"** button in the header.
2. **Brand Truth Vault (`/vault`):** Inspect `PR-101` (Official Enterprise Pricing Standard: **$99/user/month**) and `TERM-01` (Banned: *"market-leading"*, Preferred: *"industry-recognized"*).
3. **Review Studio (`/studio`):** Select the prepared draft:  
   *"NovaTech Q3 Enterprise Cloud Launch Announcement"*.
4. **Click "Run Hybrid Scan":** Watch the 6 checks execute in real time. Notice the SHA-256 Delta Scan banner showing paragraph-level analysis time.
5. **Inspect Pricing Contradiction:**
   - Click on the `$79 per user/month` violation.
   - Look at the **Approved Vault Evidence card**: It displays Clause `FACT-PRICE-01` from `NovaTech_Pricing_Schedule_2026.pdf` (p. 3).
6. **Apply Intent-Preserving Fix:** Click **"Apply Fix"**.
   - Notice the text updates from `$79` to `$99` without altering surrounding sentence structure.
   - A new version (**Revision 2**) is created automatically.
7. **Switch to Reviewer Role:** Click **"🔍 Reviewer"** in the top header.
   - Inspect the **Revision Diff** tab comparing Rev 1 to Rev 2 side-by-side.
   - Click **"Grant Final Approval"**.
8. **Pre-Flight Compliance Certificate:** Click **"View Compliance Certificate"**.
   - Inspect the official seal, tamper-resistant HMAC-SHA256 signature, and audit breakdown.
   - Click **"Verify Authenticity"** (validates cryptographic signature).
   - Click **"Download Printable PDF"** to export the formal compliance certificate.
9. **Governance Insights (`/insights`):**
   - View the **Guideline-Friction Alert** on Rule `PR-101` (flagged because override rate exceeded 40%).
   - Click **"Review & Apply Guideline Patch"**.
   - Review the proposed disambiguated wording and click **"Accept & Publish New Version"** (creates version 2 in the Truth Vault!).

---

## 🛠️ The Six-Check Verification Engine

- **Check 1: Banned & Preferred Terminology** — Case-insensitive multi-pattern matcher with whole-word boundary protection (`\b...\b`). Flags prohibited phrases and suggests approved replacements.
- **Check 2: Brand Tone & Voice** — Heuristic pattern analyzer flagging hyperbolic claims (*"game-changing"*, *"revolutionary"*), uninsurable risk promises (*"100% fail-safe"*), and colloquial slang.
- **Check 3: Grounded Fact & Claim Verification** — Verifies numerical prices, SLA percentages, and storage allowances against the Brand Truth Vault. Rejects unvalidated AI citations and distinguishes *Supported*, *Contradicted*, *Unsubstantiated*, and *Expired* claims.
- **Check 4: Visual Brand-Colour Consistency** — Extracts dominant swatches from PNG, JPG, and SVG assets. Computes **CIE76 Delta E** color distance in CIE $L^*a^*b^*$ space and flags deviations $> 10.0$.
- **Check 5: WCAG 2.2 Contrast & Accessibility** — Calculates relative luminance per W3C standards:  
  $\text{Contrast Ratio} = \frac{L_1 + 0.05}{L_2 + 0.05}$  
  Enforces 4.5:1 for normal text and 3.0:1 for large text. Audits missing or unhelpful image alt-text.
- **Check 6: Intent-Preserving Fix Generator** — Replaces only the flagged text span while preserving the creator's persuasive structure and original sentence context.

---

## ✨ Three Named Improvements (Round 1 Section 23)

### Improvement 1: SHA-256 Delta Scanning & Visual Version Diff
- Calculates SHA-256 hashes for source files and stable paragraph identifiers.
- On rescan, reuses cached findings for unchanged paragraphs when the Brand Truth Vault has not changed, dramatically cutting scan latency.
- Side-by-side visual diff viewer highlights inserted, modified, and unchanged paragraphs between successive revisions.

### Improvement 2: Interactive Guideline-Patch Recommender
- Detects rules where the reviewer override rate exceeds **40%** (minimum sample size $\ge 2$).
- Aggregates recorded reviewer override comments to propose clearer, unambiguous guideline amendments.
- Brand Admins can review, edit, and accept the patch, automatically incrementing the rule's version in the Truth Vault with full audit logging.

### Improvement 3: Pre-Flight Compliance Certificate
- Issued exclusively upon authorized human approval (`APPROVED` status).
- Generates downloadable JSON compliance certificates and high-resolution printable PDF reports.
- Employs cryptographic signatures (HMAC-SHA256 / Ed25519) and an interactive `/api/certificates/verify` verification button to guarantee tamper-resistance.

---

## 🧪 Testing & Verification Report

All 19 automated tests pass with 100% success:

```bash
cd backend
.\venv\Scripts\pytest.exe -v
```

### Test Suite Summary:
- `tests/test_auth.py` (3 tests): Bcrypt hashing, JWT token encoding/decoding, local PII and confidential info masking.
- `tests/test_benchmark.py` (1 test): 50-asset synthetic benchmark (25 seeded problems, 25 clean controls) yielding **1.0 Precision, 1.0 Recall, 1.0 F1 score**.
- `tests/test_certificates.py` (2 tests): Digital signature verification, tamper detection, prevention of certificate generation on unapproved drafts.
- `tests/test_delta_diff.py` (1 test): Paragraph SHA-256 hashing and delta comparison.
- `tests/test_fact_checker.py` (3 tests): Price contradiction detection ($79 vs $99), expired fact handling, unsubstantiated claim detection.
- `tests/test_terminology.py` (3 tests): Whole-word boundary matching, substring protection, case-insensitive handling.
- `tests/test_wcag_and_color.py` (4 tests): WCAG 2.2 relative luminance, contrast ratio thresholds, CIE76 Delta E color distance, alt-text validation.
- `tests/test_workflow_audit.py` (2 tests): Mandatory override reasons, role-based authorization enforcement.

---

## 🐳 Docker Deployment

To spin up VeriLoom with PostgreSQL and pgvector via Docker Compose:

```bash
docker compose up --build
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`
- PostgreSQL with pgvector: `localhost:5432`

---

## 📜 Disclosure
See [`DISCLOSURE.md`](./DISCLOSURE.md) for full disclosure of deterministic operations, AI provider options, synthetic data labels, and confidentiality protections.
