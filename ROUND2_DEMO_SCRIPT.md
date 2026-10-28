# VeriLoom — Round 2 Judge Demonstration Script (3–5 Minutes)

**Project:** VeriLoom — Intelligent Brand-Governance Studio  
**Live Site:** [https://shivashishmishra.github.io/veriloom/](https://shivashishmishra.github.io/veriloom/)  
**GitHub Repository:** [https://github.com/shivashishmishra/veriloom](https://github.com/shivashishmishra/veriloom)  

---

## Pre-Demo Context for Evaluators
- **Persona:** You are evaluating **VeriLoom**, an enterprise pre-publication governance studio.
- **Demo Workspace:** Configured with synthetic demo company **NovaTech AI Solutions**.
- **1-Click Judge Quick-Login:** The top-right header contains instantaneous role switchers for `✍️ Creator`, `🔍 Reviewer`, and `🛡️ Brand Admin`.

---

## Step-by-Step Demonstration Walkthrough

### Part 1: Brand Truth Vault Configuration (0:00 – 1:00)
1. **Log in as Brand Admin:**
   - In the top bar, click `🛡️ Brand Admin` (Dr. Elena Vance).
2. **Navigate to Brand Truth Vault:**
   - Click **Brand Truth Vault** in the left sidebar.
   - **Inspect Rules Tab:** See `PR-101` (Enterprise Pricing: $99/user/month), `TN-202` (Objective Brand Tone), and `TM-303` (Banned Terminology).
   - **Inspect Facts Tab:** Notice approved pricing schedules, SLA guarantees (99.9% uptime), and effective/expiration dates.
   - **Inspect Terminology Tab:** See banned buzzwords ("synergy" $\rightarrow$ "coordinated execution", "cheap" $\rightarrow$ "cost-effective").
   - **Inspect Palettes Tab:** View Primary Enterprise Navy (`#1E3A8A`) and Signal Teal (`#0D9488`) with configured Delta E tolerances ($\Delta E \le 4.5$).

### Part 2: Review Studio & The 6-Check Hybrid Inspector (1:00 – 2:30)
3. **Switch to Creator:**
   - In the top bar, click `✍️ Creator` (Alex Chen).
4. **Open Review Studio:**
   - Click **Review Studio** in the left sidebar.
   - Select the pre-seeded submission: **"NovaCloud Q4 Enterprise Launch Announcement"**.
   - Review the draft text:
     > *"We are thrilled to announce NovaCloud Enterprise! For only $79 per user/month, companies can leverage unprecedented synergy across distributed teams. Our game-changer platform provides a cheap way to ensure 100% cloud reliability."*
5. **Run Verification Scan:**
   - Click **"Run Verification Scan"**.
   - Notice the **4 Findings Detected**:
     - 🔴 **Check 3 (Fact/Pricing):** Outdated price `$79 per user/month` contradicts Vault rule `PR-101` (approved rate is `$99 per user/month`).
     - 🔴 **Check 1 (Terminology):** Banned buzzword `"synergy"` cited under rule `TM-303`. Suggested fix: `"coordinated execution"`.
     - 🟡 **Check 2 (Tone):** Hyperbolic phrase `"game-changer"` cited under rule `TN-202`. Suggested fix: `"significant advancement"`.
     - 🔴 **Check 1 (Terminology):** Negative perception term `"cheap"` cited under rule `TM-303`. Suggested fix: `"cost-effective"`.
6. **Apply Surgical Intent-Preserving Fixes:**
   - On finding #101 (`$79 per user/month`), click **"Apply Suggested Fix"**.
   - Notice that **only** the flagged span changes to `$99 per user/month`—the rest of the sentence is preserved.
   - Click **"Apply Suggested Fix"** on `"synergy"` $\rightarrow$ changes to `"coordinated execution"`.
7. **Improvement 1: Visual Version Diff:**
   - Click the **"Compare Revisions (Diff)"** tab at the top of the editor.
   - Notice side-by-side green additions (`$99 per user/month`, `coordinated execution`) and red deletions (`$79`, `synergy`).
   - Notice the **SHA-256 Delta Stats badge**: paragraph hashes verified, unchanged paragraphs reused.
8. **Submit for Review:**
   - Click **"Submit for Review"** at the top right.

### Part 3: Human Review, Overrides & Improvement 2 (2:30 – 3:45)
9. **Switch to Reviewer:**
   - In the top bar, click `🔍 Reviewer` (Morgan Rivera).
10. **Navigate to Approvals:**
    - Click **Approvals** in the sidebar.
    - Click on the submission to open the review card.
    - If a remaining warning requires an override (e.g. Tone warning on `"game-changer"`), click **"Override Finding"**.
    - Type mandatory reason: `"Executive approval granted for launch announcement hook."`
    - Click **"Confirm Override"** $\rightarrow$ status changes to *Overridden* with reviewer identity logged to audit trail.
11. **Approve Submission:**
    - Click **"Approve Content"** $\rightarrow$ status transitions to **`APPROVED`**.
12. **Improvement 2: Guideline-Patch Recommender:**
    - Click **Governance Insights** in the sidebar.
    - Notice the **"Statistical Friction Alert"** on Rule `PR-101` (override rate exceeded 40% on pricing questions).
    - Click **"Review Recommended Patch"**.
    - Notice that the recommender synthesized reviewer comments and drafted an amendment clarifying annual vs. monthly billing commitments.
    - Switch to `🛡️ Brand Admin` and click **"Approve & Apply Patch"** $\rightarrow$ Rule version increments in the Brand Truth Vault.

### Part 4: Improvement 3 & Verification Certificate (3:45 – 5:00)
13. **Generate Compliance Certificate:**
    - Go back to the approved submission in **Approvals** or **Review Studio**.
    - Click **"View Compliance Certificate"**.
    - A cryptographic certificate modal displays:
      - Unique Code (e.g., `CERT-VL-2026-B81A4F`)
      - Document SHA-256 Content Hash
      - HMAC-SHA256 Digital Signature
      - Approver: Morgan Rivera / Dr. Elena Vance
      - Timestamp and resolved finding breakdown
14. **Download & Verify:**
    - Click **"Download PDF Certificate"** to obtain the official pre-flight certificate.
    - Click **"Verify Digital Signature"** $\rightarrow$ confirm green badge: *"Cryptographically Verified — Signature Authentic & Uncompromised."*
15. **Visual Auditor Bonus (WCAG & Delta E):**
    - Click **Visual Auditor** in the sidebar.
    - Enter `#FFFFFF` (text) on `#1E3A8A` (brand navy) $\rightarrow$ calculates contrast ratio: **9.81:1 (Passes WCAG 2.2 AA & AAA)**.
    - Enter `#AAAAAA` on `#FFFFFF` $\rightarrow$ flags failure (2.32:1 < 4.5:1).
