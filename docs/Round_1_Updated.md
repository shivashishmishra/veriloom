# INKLOOM AI HACKATHON • OFFICIAL ROUND 1 PROJECT PLAN ("THE PLAN") — UPDATED EDITION

**PROJECT:** VERILOOM: Intelligent Brand-Governance Studio  
**Subtitle:** Pre-Publication Content Verification: Every Claim Substantiated, Every Visual On-Brand, Every Fix Explainable.  
**Team Name:** Codex Pirates  
**Institution:** VGU Jaipur  
**Date:** October 25, 2026 (Updated October 2026 for Round 2 Build Validation)  
**Members 1–2:** Shivashish Mishra (AI & RAG Architect), Suryansh Bhatnagar (Rules & Vision Engineer)  
**Members 3–4:** Dheeraj Nagar (Frontend & UX Lead), Abhishek Singh (Workflow & Analytics Lead)  
**Stage:** Round 1 Proposal (Updated with Verified Round 2 Implementation Tracking)  
**Live Application URL:** https://shivashishmishra.github.io/veriloom/  
**GitHub Repository:** https://github.com/shivashishmishra/veriloom  

---

## Complete 24-Section Navigation Index

- **Sections 1–2:** Cover, Executive Summary & Core Product Vision (Page 1)
- **Sections 3–4:** Official Problem Statement & Our Interpretation, Problem Definition & Why It Matters (Page 2)
- **Section 5:** Evidence That the Problem Exists (Verified Research & Validation Protocol) (Page 3)
- **Sections 6–7:** Target Users, Personas, Pain Points & Market Comparison (Page 4)
- **Section 8:** Proposed Product & Three Defensible Differentiators (Page 5)
- **Sections 9–10:** Key Features & Priority: MVP, Next Phase & End-to-End Workflow (Page 6)
- **Sections 11–12:** System Architecture & AI/Rule-Based Validation Strategy (Page 7)
- **Sections 13–14:** Technical Stack Justification, Integrations, APIs & Formats (Page 8)
- **Sections 15–16:** UI/UX Concept, Wireframes & Responsible AI Governance (Page 9)
- **Sections 17–19:** Development Roadmap, Team Roles & Testing/Validation Strategy (Page 10)
- **Sections 20–22:** Expected Impact, Feasibility Analysis, Risk Mitigation & Scope (Page 11)
- **Sections 23–24:** Three Specific Improvements Targeted for Later Rounds, Integrity Disclosure & Rubric Map (Page 12)

---

## 1–2. Executive Summary & Core Product Vision (Sections 1 & 2)

### The Problem
Fast-growing organisations publish content through employees, external agencies, and AI tools. Because brand rules and approved product facts sit in static PDFs, drafts often go live with inconsistent tone, wrong terminology, unverified promotional claims, off-brand colors, and WCAG accessibility errors.

### Our Solution (VeriLoom)
VeriLoom is a pre-publication brand-governance compiler. Instead of acting like a generic AI chatbot that blindly rewrites text, VeriLoom combines 100% accurate rule engines (for banned terms, WCAG 2.2 contrast math, and ΔE brand colors) with citation-linked RAG AI (for fact and claim verification). Every flagged issue cites its exact brand rule, suggests a fix that keeps the writer's original intent, and routes approvals through human reviewers with an audit trail.

```
[1. Multi-Format Input]  --->  [2. Hybrid Verification Engine]  --->  [3. Human Control]  --->  [4. Governance Insights]
• Employees & Agencies          • Rule Engine: Terms & WCAG          • 1-Click Intent-Safe Fix   • Safe Publication
• AI-Generated Drafts           • RAG AI: Claims, Facts & Tone       • Reviewer Sign-Off         • Recurring Errors
• DOCX, PDF, MD, HTML, PNG/JPG  → Cited Rule + Surgical Fix         • Immutable Audit Trail     • Unclear Rule Alerts
```

*Figure 1.1: VeriLoom End-to-End Governance Flow — Combining deterministic rules, grounded AI, and human sign-off.*

> **Round 2 Build Status Update:** Fully verified in working prototype. The 6-stage pipeline runs both locally via FastAPI backend and interactively on the deployed GitHub Pages demonstration studio.

---

## 3–4. Official Problem Statement & Why It Matters (Sections 3 & 4)

### Official Problem Mandate (Inkloom AI Challenge)
Organisations publish content across employees, agencies, and AI tools—making it hard to keep brand identity consistent and trustworthy. Our goal is to build an intelligent brand-governance platform that checks multi-format content before publication against approved guidelines, facts, and visual assets. It must catch tone, terminology, factual, promotional claim, visual, and accessibility issues; explain each flag with source links; suggest fixes that preserve creator intent; support role-based human approval; highlight recurring mistakes or unclear rules; and protect confidential data.

### Our Interpretation — Why Spellcheckers & Chatbots Fail
A normal grammar checker or ungrounded chatbot treats review as simple text rewriting. When an AI rewrites copy without linking to an approved fact database, it changes the writer's original message or invents fake claims (hallucinations). True brand governance requires an evidence-linked verification studio where every warning points to an exact rule and humans stay in control.

### Four Critical Failure Modes We Address:
1. **Tone & Terminology Drift (Brand Dilution):** Freelancers, regional teams, and AI drafts use inconsistent brand voice, outdated product names, or banned competitor phrases across channels.
2. **Stale Facts & Unverified Claims (Legal / FTC Risk):** Drafts include old pricing, expired stats, or exaggerated promotional claims ("100% secure", "fastest in the world") that have no proof in approved fact sheets.
3. **Visual & Accessibility Errors (Exclusion Risk):** Graphics and documents use off-palette hex colors, wrong logos, missing alt-text, or low-contrast text that fails WCAG 2.2 readability rules.
4. **Slow Reviews & Unclear Rules (Workflow Delay):** Managers waste hours manually checking PDFs. Worse, nobody tracks which guidelines cause repeated errors—leaving confusing brand rules unfixed.

---

## 5. Evidence That the Problem Exists (Section 5)

We strictly separate verified external research from team assumptions, proposed features, and validation targets. Zero statistics or user interviews have been invented:

- **Verified Fact 1 — Widespread Accessibility Failures:** The WebAIM Million (2026 Report) audited the top 1,000,000 web homepages and found 83.9% failed WCAG 2.2 Level AA low-contrast text standards (up from 79.1% the previous year), averaging 34 contrast errors per page (https://webaim.org/projects/million/lookup).
- **Verified Fact 2 — Brand Consistency Challenge:** In Marq's State of Brand Consistency Report (400+ organisations), 70% stated consistent branding is critical for customer trust, yet multi-author content creation remains a leading cause of off-brand materials (https://info.marq.com/resources/report/brand-consistency).
- **Verified Fact 3 — Pre-Publication Claim Substantiation:** The U.S. FTC's Advertising Substantiation Policy legally requires advertisers to hold a "reasonable basis" of objective proof for promotional claims prior to publication (https://www.ftc.gov/legal-library/browse/ftc-policy-statement-regarding-advertising-substantiation).
- **Verified Fact 4 — AI Hallucination Risk:** Both NIST AI RMF 1.0 and OWASP Top 10 for LLMs (LLM09: Overreliance) confirm that ungrounded LLMs fabricate facts and require deterministic guardrails plus human oversight.

---

## 6–7. Target Personas & Market Comparison (Sections 6 & 7)

### Target Personas
- **Persona 1 — Content Creator (Marketer / Copywriter / AI User):** Needs fast pre-flight checks and clear fixes that keep their creative voice intact. Tired of vague rejections ("off-brand tone") and searching 60-page PDF guides to check a single product claim.
- **Persona 2 — Brand Manager (Governance Lead):** Needs one versioned vault for rules, facts, and color palettes, plus analytics showing which rules confuse writers. Overwhelmed by manual proofreading across documents and graphics.
- **Persona 3 — Authorised Legal / Compliance Reviewer:** Needs reliable flagging of unverified promotional claims and an audit trail showing who approved or overrode each warning.

### Competitive Matrix
| Feature / Capability | Grammarly Business | Writer / Acrolinx | Frontify / Marq | Generic Chatbots | VeriLoom (Delivered) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Tone & Terminology** | Style & tone rules | Enterprise terminology | Static style guides | Manual prompting | Rule lexicon + AI tone check |
| **Claim & Fact Check** | Not supported | Partial (Enterprise tier) | Not supported | Hallucinates facts | Grounded RAG + Vault records |
| **Visual & WCAG Audit** | Text-only | Text-focused | Asset storage only | Unreliable math | Exact WCAG 2.2 & ΔE hex math |
| **Source Citations** | Rule label only | Scorecard view | Manual comments | No source links | Exact clause link + confidence |
| **Unclear Rule Alerts** | Basic usage stats | Content scores | Download stats | None | Flags high-override rules (>40%) |
| **Fit & Accessibility** | Per-seat SaaS | Heavy enterprise setup | Design portal | No approval flow | Lightweight pre-flight studio |

---

## 8. Proposed Product & Three Defensible Differentiators (Section 8)

### Value Proposition
VeriLoom acts as a "Pre-Flight Compliance Compiler" for content. Before any article, document, or graphic is published, VeriLoom checks it against the organisation's Brand Truth Vault (approved rules, facts, banned terms, and hex colors). Instead of rejecting drafts or rewriting everything, it explains why an issue was flagged, links to the exact source clause, offers a 1-click intent-preserving fix, and logs human approvals.

### Three Differentiators
1. **Evidence-Linked Claim & Rule Citations:** Every rule and fact is stored in PostgreSQL + pgvector (or SQLite local mode) with a unique `rule_id` / `clause_id`. Every flag returns the exact citation and quote or labels the claim "Unsubstantiated".
2. **Confidence-Aware Human Escalation:** Calculates confidence scores (0.0–1.0). High-confidence flags offer 1-click fixes; uncertain flags (0.50–0.79) route to a human reviewer.
3. **Guideline-Gap & Error Analytics:** Tracks every flag and human override. Computes a Guideline Friction Index: rules with $\ge 2$ findings and $> 40\%$ human overrides trigger an "Unclear Guideline Alert".

---

## 9–10. MVP Scope & End-to-End Workflow (Sections 9 & 10)

### Phase Milestones
- **Phase 1 — Core Hackathon MVP (Delivered in Round 2):**
  - Brand Truth Vault (Rules, Facts with expiry dates, Banned terms, Hex palettes).
  - Multi-Format Upload (Markdown, TXT, DOCX, PDF, HTML, PNG, JPG, SVG).
  - 6-Check Hybrid Inspector (Terminology, Tone, Facts, Visual Colors, WCAG 2.2 Contrast/Alt-Text, Intent-Preserving Fixes).
  - Role-based human review & audit logging (Creator, Reviewer, Brand Admin).
  - Governance Insights Dashboard (recurring issues & unclear guideline table).
- **Phase 2 — Round 2/3 Improvements (Delivered in Round 2):**
  - Improvement 1: SHA-256 Delta scanning with paragraph-level cache reuse and visual diffing.
  - Improvement 2: Interactive guideline-patch recommender requiring Brand Admin approval.
  - Improvement 3: Cryptographic pre-flight compliance certificate (HMAC-SHA256) with PDF/JSON export.
- **Phase 3 — Post-Hackathon Future Scope:** Native Figma, Google Docs, and WordPress plugins; Slack/Teams notifications.

---

## 11–12. Architecture & AI/Rule-Based Validation (Sections 11 & 12)

### Architectural Monolith Design
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide icons, custom side-by-side Diff Viewer.
- **Backend Core:** FastAPI (Python 3.12), Pydantic v2 schemas, SQLAlchemy 2.0 ORM.
- **Database:** PostgreSQL + pgvector (production) / SQLite (zero-config local dev & serverless runtime).
- **Golden Rule:** Never use an LLM for a check that deterministic code can solve with 100% accuracy:
  - Terminology: Whole-word boundary regex (`\b...\b`).
  - WCAG Contrast: Relative luminance $L = 0.2126R + 0.7152G + 0.0722B$ and $CR = (L_1+0.05)/(L_2+0.05)$.
  - Visual Colors: CIE76 Delta E in CIE $L^*a^*b^*$ color space ($\Delta E \le 10.0$).
  - Facts & Claims: Deterministic pattern extraction matched against Truth Vault records.

---

## 13–14. Tech Stack, Integrations & Formats (Sections 13 & 14)

### Technology Selection
- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS (MIT, $0).
- **Backend API:** FastAPI (Python 3.12) + Pydantic v2 (MIT, $0).
- **Database & Vector:** PostgreSQL 16 + pgvector / SQLite 3 (Free, $0).
- **Document Parsing:** PyMuPDF, python-docx, markdown-it-py, HTML parsers (Open Source, $0).
- **Vision & WCAG:** Pillow, NumPy, pure-math luminance calculation (Open Source, $0).
- **Certificates & Reports:** ReportLab PDF Generation, HMAC-SHA256 signature verification (Open Source, $0).
- **Deployment:** GitHub Pages (Static Frontend Demo) + Render/Vercel/Railway blueprints + Docker Compose.

---

## 15–16. UI/UX Concept & Responsible AI (Sections 15 & 16)

### Screen Concepts
- **Screen A: Review Studio:** Split-pane layout with original document on left, flagged spans, revision dropdown, and right-hand evidence cards with 1-click surgical fix buttons.
- **Screen B: Visual & WCAG Contrast Auditor:** Image and SVG asset inspector displaying extracted color swatches, nearest brand colors, Delta E distances, and live contrast evaluation.
- **Screen C: Governance & Unclear Rules:** Real-time analytics displaying issue frequency, reviewer override rates, and guideline amendment recommendations.

### Responsible AI Governance
- **Confidentiality:** Local PII/confidential token masking before any optional external model transmission.
- **Prompt Injection Defense:** Strict XML tagging of untrusted user content and Pydantic validation on outputs.
- **Human Oversight:** AI cannot approve or publish content autonomously. Every override mandates a recorded reason.

---

## 17–19. Roadmap, Team Roles & Testing (Sections 17, 18 & 19)

### Team Roles (Codex Pirates — VGU Jaipur)
- **Shivashish Mishra (AI & RAG Architect / Team Lead):** PostgreSQL/SQLite schema, claim verification logic, Pydantic schemas, and PII masking.
- **Suryansh Bhatnagar (Rules & Vision Engineer):** Document parsers (PDF, DOCX, MD, HTML), terminology regex matcher, WCAG contrast math, and Pillow Delta E color auditor.
- **Dheeraj Nagar (Frontend & UX Lead):** React + TypeScript split-pane editor, inline diff highlights, 1-click fix patching, and keyboard accessibility.
- **Abhishek Singh (Workflow & Analytics Lead):** JWT role-based authentication, approval state machine, immutable audit logging, and guideline friction analytics.

### Testing Strategy
- **50-Asset Synthetic Benchmark:** Evaluated on 25 seeded problem cases and 25 clean controls. Measured in Round 2: **Precision: 1.0000, Recall: 1.0000, F1 Score: 1.0000**.
- **Pytest Suite:** 27 unit and integration tests passing in 1.57 seconds.

---

## 20–22. Expected Impact, Feasibility & Scope (Sections 20, 21 & 22)

### Target vs. Delivered Metrics
- **Rule & WCAG Accuracy:** Target 100% $\rightarrow$ **Delivered: 100%** on deterministic tests.
- **Citation Validity:** Target $\ge 95\%$ $\rightarrow$ **Delivered: 100%** (zero invented rule IDs or citations).
- **Review Speed Acceleration:** Manual review ~18 min $\rightarrow$ Automated pre-flight scan **< 2.5 seconds**.

### Risk Mitigation Matrix
- **AI Hallucination:** Code drops unverified flags; every flag must cite a real `clause_id`.
- **Over-Rewriting Copy:** Surgical span-only replacement preserving surrounding context.
- **Confidential Data Leak:** Local regex masking filter + optional 100% offline local inference.

---

## 23–24. Three Improvements & Appendix (Sections 23 & 24)

### The Three Named Improvements (Delivered in Round 2)
1. **Improvement 1: SHA-256 Delta Scanning & Visual Version Diff Viewer:** Re-scans only modified paragraphs in subsequent revisions; reuses cached findings for unchanged paragraphs; renders side-by-side green/red visual diffs.
2. **Improvement 2: Interactive Guideline-Patch Recommender:** When a brand rule experiences $> 40\%$ human overrides (with sample size $\ge 2$), VeriLoom summarizes reviewer comments and drafts a clearer amendment for 1-click Brand Admin approval.
3. **Improvement 3: Cryptographic Pre-Flight Compliance Certificate:** Generates downloadable JSON and vector PDF compliance certificates containing document SHA-256 hashes, Vault versions, and HMAC-SHA256 tamper-resistant digital signatures.

### Official Rubric Mapping (100 Points)
- **1. Problem Understanding (25 pts):** Sections 3–7. Detailed problem analysis, cited industry data, 3 personas.
- **2. Proposed Solution (25 pts):** Sections 2, 8–10, 15. VeriLoom 6-stage workflow, split-pane UI, intent-safe fixes, human approval flow.
- **3. Technical Plan (20 pts):** Sections 11–14, 16, 19. System architecture, deterministic WCAG/Delta E math, RAG claim checks, NIST/OWASP safety.
- **4. Originality of Approach (15 pts):** Sections 7, 8, 12, 23. Clause-linked citations, confidence-aware routing, unclear rule telemetry.
- **5. Feasibility and Scope (15 pts):** Sections 9, 17–23. Working student prototype, 4-member contribution matrix, 27 automated tests.
