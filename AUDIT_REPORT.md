# VeriLoom — Round 2 Complete Audit & Verification Report

**Project:** VeriLoom — Intelligent Brand-Governance Studio  
**Hackathon:** Inkloom AI Hackathon | Round 2: The Build  
**Audit Date:** October 2026  
**Auditor:** Senior Full-Stack, QA Automation, and Security Engineer  
**Live Site (Static Demo):** [https://shivashishmishra.github.io/veriloom/](https://shivashishmishra.github.io/veriloom/)  
**GitHub Repository:** [https://github.com/shivashishmishra/veriloom](https://github.com/shivashishmishra/veriloom)  

---

## 1. Executive Summary

VeriLoom was subjected to a thorough, ground-up audit against the official Inkloom AI Hackathon Round 2 Problem Statement and Round 1 Architecture Plan. The codebase contains a real, functional application featuring a React 18 / TypeScript / Tailwind CSS / Lucide frontend, a Python 3.12 / FastAPI / SQLAlchemy backend, an automated test suite (27 passing tests), document/visual asset parsers, and a 6-check verification engine.

### Key Audit Findings:
1. **GitHub Pages Deployment Behavior Resolved:**  
   When deployed on GitHub Pages with `main / (root)`, the lack of a root `index.html` originally caused GitHub Pages' Jekyll engine to render `README.md` as a document (appearing like a PDF/article). This was resolved by placing the compiled production bundle (`index.html`, `assets/`, `.nojekyll`) directly into the repository root, migrating routing to `HashRouter` (preventing 404s on subpaths), and providing an in-browser deterministic client engine fallback for static hosting.
2. **Deterministic Checks vs. AI:**  
   All 6 core checks (Terminology, Tone, Facts/Claims, Visual Colors via CIE76 Delta E, WCAG 2.2 Contrast, Intent-Preserving Fixes) execute deterministically with real Python algorithms and client counterparts. No citations, rules, or numbers are fabricated.
3. **The 3 Promised Improvements:**  
   - **Improvement 1 (SHA-256 Delta Scanning & Visual Diff):** Fully implemented and tested (`delta_hasher.py`, `DiffViewer.tsx`).
   - **Improvement 2 (Guideline-Patch Recommender):** Fully implemented with 40% threshold, minimum sample size validation, and Brand Admin approval gate (`patch_recommender.py`, `PatchModal.tsx`).
   - **Improvement 3 (Compliance Certificate):** Fully implemented with HMAC-SHA256 cryptographic signing, verification, and PDF generation (`cert_generator.py`, `CertificateModal.tsx`).
4. **Security & Input Validation:**  
   Added strict file-size limits (10 MB for docs/images, 5 MB for CSV) and allowed extension whitelisting (`.pdf`, `.docx`, `.md`, `.txt`, `.html`, `.svg`, `.png`, `.jpg`, `.webp`) across all upload endpoints.

---

## 2. Feature-by-Feature Status Matrix

| ID | Feature Name | Status | Primary Files | Evidence & Test Results |
| :--- | :--- | :--- | :--- | :--- |
| **A1** | Brand Truth Vault (Rules CRUD) | **PASS** | `backend/app/api/vault.py`<br>`frontend/src/pages/VaultPage.tsx` | Admin can create, edit, version, and archive rules. Enforced via `require_role(["Brand Admin"])`. Persists in SQLite/PostgreSQL. |
| **A2** | Approved Facts & Expiry Dates | **PASS** | `backend/app/models/vault.py`<br>`backend/app/rules/fact_checker.py` | Stores effective/expiry dates. Expired facts trigger warning in `test_expired_fact_handling`. |
| **A3** | Terminology (Banned & Preferred) | **PASS** | `backend/app/rules/terminology.py` | Regex whole-word boundaries (`\b...\b`). Tested in `test_terminology_whole_word_matching`. |
| **A4** | Brand Palettes & Tolerances | **PASS** | `backend/app/vision/delta_e.py`<br>`frontend/src/pages/VaultPage.tsx` | Stores HEX, RGB, CIELAB ($L^*a^*b^*$), and Delta E thresholds. Tested in `test_delta_e_color_distance`. |
| **B1** | Multi-Format Document Parsing | **PASS** | `backend/app/parsers/document_parser.py` | Parses PDF (PyPDF), DOCX (python-docx), Markdown, TXT, and HTML. Tested in `test_file_uploads_and_security.py`. |
| **B2** | Visual Asset Parsing (Raster & SVG) | **PASS** | `backend/app/vision/color_extractor.py` | Extracts colors from PNG/JPG (PIL quantization) and SVG attributes. Tested in `test_svg_color_extraction`. |
| **B3** | Upload Validation & Limits | **PASS** | `backend/app/api/submissions.py`<br>`backend/app/api/visual.py` | Rejects empty files (0 bytes), invalid extensions, and files > 10 MB with 400/413 HTTP status. |
| **C1** | Check 1: Terminology Filter | **PASS** | `backend/app/rules/terminology.py` | Case-insensitive whole-word detection. Accurately flags banned words without substring false positives. |
| **C2** | Check 2: Brand Tone Auditor | **PASS** | `backend/app/rules/tone.py` | Identifies hyperbolic superlatives ("game-changer", "magic bullet") and explains why they violate enterprise standards. |
| **C3** | Check 3: Fact & Claim Verifier | **PASS** | `backend/app/rules/fact_checker.py` | Extracts pricing & uptime SLA claims. Returns SUPPORTED, CONTRADICTED, or UNSUBSTANTIATED with exact clause citations. |
| **C4** | Check 4: Visual Color CIE76 Delta E | **PASS** | `backend/app/vision/color_extractor.py`<br>`backend/app/vision/delta_e.py` | Converts to CIE $L^*a^*b^*$ and calculates Euclidean Delta E. Compares to configured tolerance (ΔE < 10.0). |
| **C5** | Check 5: WCAG 2.2 Accessibility | **PASS** | `backend/app/vision/wcag_contrast.py` | W3C Relative Luminance & Contrast Ratio: 4.5:1 for normal text, 3:1 for large text. Checks image alt-text. |
| **C6** | Check 6: Intent-Preserving Fixes | **PASS** | `backend/app/rules/fix_generator.py` | Surgical span replacement replacing only flagged ranges (`[start_pos:end_pos]`). Creates new revision cleanly. |
| **D1** | Source Evidence & Grounding | **PASS** | `backend/app/engine/hybrid_scanner.py` | Every rule-based finding references real clause ID, source document, and page number. Zero fabricated citations. |
| **E1** | Revisions & Before/After Diff | **PASS** | `frontend/src/components/DiffViewer.tsx`<br>`backend/app/parsers/delta_hasher.py` | Side-by-side revision comparator highlighting added and removed tokens. Retains immutable version history. |
| **F1** | Human Review & Role RBAC | **PASS** | `backend/app/workflow/approval_engine.py` | Creator submits; only Reviewer/Admin can approve or request changes. Enforced at API layer with 403 Forbidden. |
| **F2** | Override Finding with Reason | **PASS** | `backend/app/workflow/approval_engine.py` | Reviewer override mandates minimum 5-character reason. Tested in `test_override_reason_mandatory`. |
| **F3** | Tamper-Resistant Audit Trail | **PASS** | `backend/app/workflow/audit.py` | Persists user, action, submission ID, revision ID, outcome, and timestamp for all governance events. |
| **G1** | Governance Insights Analytics | **PASS** | `backend/app/analytics/governance.py` | Calculated directly from DB findings and reviews. Empty state handled cleanly; demo dataset visibly labeled. |
| **H1** | Improvement 1: SHA-256 Delta Scan | **PASS** | `backend/app/parsers/delta_hasher.py` | Computes SHA-256; compares paragraph hashes; reuses cached findings on unchanged paragraphs. Tested in `test_delta_diff.py`. |
| **H2** | Improvement 2: Guideline-Patch Recommender | **PASS** | `backend/app/analytics/patch_recommender.py` | Identifies rules with > 40% override rate (minimum sample size 2). Drafts amendment; requires Admin approval. Tested in `test_patch_recommender.py`. |
| **H3** | Improvement 3: Compliance Certificate | **PASS** | `backend/app/certificates/cert_generator.py` | Generates signed certificate upon authorized approval. HMAC-SHA256 cryptographic verification and downloadable PDF. |
| **I1** | Backend Deployment & CORS | **PASS** | `backend/app/main.py`<br>`render.yaml`<br>`vercel.json` | CORS configured for `localhost` and `shivashishmishra.github.io`. Render, Railway, Vercel, and Docker configs provided. |
| **I2** | GitHub Pages Static Demo Mode | **PASS** | `index.html`<br>`frontend/src/services/mockFallback.ts` | Serves client application at root with `HashRouter` and interactive demo engine. Persistently labeled. |

---

## 3. GitHub Pages Hosting Analysis

### Initial Issue Observed by User
- **Symptom:** Clicking the live link `https://shivashishmishra.github.io/veriloom/` rendered a documentation page that looked like a PDF or article rather than the web application.
- **Root Cause:** GitHub Pages was configured to publish from `main / (root)`. In that branch configuration, GitHub Pages searches for `index.html` at the root directory. Because the application build was originally located only inside `frontend/dist/`, GitHub Pages defaulted to rendering the repository's `README.md` file using Jekyll.
- **Architectural Limitation of GitHub Pages:** GitHub Pages is a purely static hosting provider. It does not run Python runtimes, Uvicorn, or background database servers.
- **Resolution Applied:**
  1. Built the React frontend bundle using relative base `./` and placed `index.html` and `assets/` at the repository root.
  2. Added `.nojekyll` to disable Jekyll processing.
  3. Switched frontend navigation from `BrowserRouter` to `HashRouter` (`/#/studio`) to prevent 404 errors on deep-link page refreshes.
  4. Implemented a deterministic in-browser client fallback (`mockFallback.ts`) and real-time backend connection status indicator in the top header.
  5. Added `render.yaml`, `Procfile`, and `vercel.json` for hosting the Python FastAPI backend on cloud platforms.

---

## 4. Security & Privacy Audit

1. **Authentication & RBAC:**
   - Password hashing verified using native bcrypt with salt rounds.
   - JWT tokens signed with `HS256` and verified via FastAPI dependency injection.
   - Unauthorized attempts by Creators to approve content or override findings are rejected with `HTTP 403 Forbidden`.
2. **File Upload Security:**
   - Strict size caps: 10 MB for documents and images; 5 MB for CSV imports.
   - Strict extension validation against whitelisted formats.
   - Safe parsing: SVG parsing uses attribute extraction without XML entity expansion (XXE immune).
3. **Confidential Information Protection:**
   - Regex-based masking for emails, phone numbers, and keys before any potential external processing.
   - Secrets are managed exclusively via environment variables (`.env.example` contains only placeholders).
