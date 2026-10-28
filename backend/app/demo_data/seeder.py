import json
import datetime
from sqlalchemy.orm import Session
from app.models.user import User, Organization
from app.models.vault import BrandRule, ApprovedFact, TerminologyRule, BrandColorPalette, BrandAsset
from app.models.submission import ContentSubmission, ContentRevision, Finding, SubmissionComment
from app.models.workflow import AuditEvent
from app.models.certificate import ComplianceCertificate
from app.auth.security import get_password_hash
from app.vision.delta_e import rgb_to_lab
from app.parsers.delta_hasher import DeltaHasher
from app.certificates.cert_generator import CertificateGenerator

def seed_demo_workspace(db: Session) -> Organization:
    # 1. Create or retrieve demo organization
    org = db.query(Organization).filter(Organization.name == "NovaTech AI Solutions").first()
    if org:
        user_count = db.query(User).filter(User.organization_id == org.id).count()
        if user_count >= 3:
            return org
        # If partial seed, delete and re-seed cleanly
        db.delete(org)
        db.commit()

    org = Organization(
        name="NovaTech AI Solutions",
        is_demo=True,
        created_at=datetime.datetime.utcnow()
    )
    db.add(org)
    db.commit()
    db.refresh(org)

    # 2. Create Demo Users
    creator = User(
        organization_id=org.id,
        email="creator@novatech.io",
        full_name="Alex Chen (Lead Copywriter)",
        hashed_password=get_password_hash("DemoCreator123!"),
        role="Creator",
        is_active=True
    )
    reviewer = User(
        organization_id=org.id,
        email="reviewer@novatech.io",
        full_name="Morgan Rivera (Senior Compliance Reviewer)",
        hashed_password=get_password_hash("DemoReviewer123!"),
        role="Reviewer",
        is_active=True
    )
    admin = User(
        organization_id=org.id,
        email="admin@novatech.io",
        full_name="Dr. Elena Vance (VP of Brand & Governance)",
        hashed_password=get_password_hash("DemoAdmin123!"),
        role="Brand Admin",
        is_active=True
    )
    db.add_all([creator, reviewer, admin])
    db.commit()
    db.refresh(creator)
    db.refresh(reviewer)
    db.refresh(admin)

    # 3. Seed Brand Truth Vault Rules
    rule_pr = BrandRule(
        organization_id=org.id,
        rule_id="PR-101",
        title="Official Enterprise Pricing Standard",
        category="Pricing",
        exact_rule_text="All external marketing, launch announcements, and promotional copy referencing NovaCloud Enterprise must cite the current approved rate of $99 per user/month billed annually.",
        source_document="NovaTech_Brand_Book_2026.pdf",
        source_page=18,
        severity="Violation",
        status="Active",
        version=1,
        created_by="Dr. Elena Vance"
    )
    rule_tone = BrandRule(
        organization_id=org.id,
        rule_id="TONE-01",
        title="Enterprise Voice & Balanced Claims Standard",
        category="Tone",
        exact_rule_text="Maintain balanced, substantiated language; avoid hyperbolic superlatives, colloquial slang, and absolute risk guarantees.",
        source_document="Brand Style & Voice Guide",
        source_page=4,
        severity="Warning",
        status="Active",
        version=1,
        created_by="Dr. Elena Vance"
    )
    rule_clr = BrandRule(
        organization_id=org.id,
        rule_id="CLR-01",
        title="Primary Brand Color Consistency",
        category="Color",
        exact_rule_text="Digital collateral must adhere to NovaTech Royal Blue (#1D3DD4) within a Delta E tolerance of <= 10.0.",
        source_document="NovaTech_Visual_Identity_Manual.pdf",
        source_page=8,
        severity="Violation",
        status="Active",
        version=1,
        created_by="Dr. Elena Vance"
    )
    rule_acc = BrandRule(
        organization_id=org.id,
        rule_id="ACC-01",
        title="WCAG 2.2 AA Contrast & Accessibility Compliance",
        category="Accessibility",
        exact_rule_text="Normal text must satisfy a 4.5:1 minimum contrast ratio against background surfaces; large text must satisfy 3.0:1. Visual assets must include contextual alternative text.",
        source_document="Digital Accessibility Guidelines",
        source_page=2,
        severity="Violation",
        status="Active",
        version=1,
        created_by="Dr. Elena Vance"
    )
    db.add_all([rule_pr, rule_tone, rule_clr, rule_acc])

    # 4. Seed Approved Facts
    fact_price = ApprovedFact(
        organization_id=org.id,
        fact_id="FACT-PRICE-01",
        claim_subject="NovaCloud Enterprise Base Plan",
        approved_value="$99 per user/month billed annually",
        category="Pricing",
        exact_passage="The NovaCloud Enterprise Base Plan is priced at $99 per user/month billed annually. All quotes for enterprise deployments must reflect this standard rate.",
        source_document="NovaTech_Pricing_Schedule_2026.pdf",
        source_page=3,
        status="Active",
        version=1
    )
    fact_sla = ApprovedFact(
        organization_id=org.id,
        fact_id="FACT-SLA-01",
        claim_subject="Enterprise High-Availability SLA",
        approved_value="99.9% uptime SLA with 24/7 priority support",
        category="Specs",
        exact_passage="NovaTech guarantees a 99.9% uptime SLA for all Tier-1 enterprise cloud clusters.",
        source_document="NovaTech_Architecture_Whitepaper_2026.pdf",
        source_page=12,
        status="Active",
        version=1
    )
    fact_storage = ApprovedFact(
        organization_id=org.id,
        fact_id="FACT-STORAGE-01",
        claim_subject="Enterprise Storage Allowance",
        approved_value="500GB dedicated encrypted NVMe storage per seat",
        category="Specs",
        exact_passage="Base enterprise seats include 500GB dedicated encrypted NVMe storage with automated backups.",
        source_document="NovaTech_Architecture_Whitepaper_2026.pdf",
        source_page=14,
        status="Active",
        version=1
    )
    db.add_all([fact_price, fact_sla, fact_storage])

    # 5. Seed Terminology Rules
    term_1 = TerminologyRule(
        organization_id=org.id,
        term_id="TERM-01",
        banned_term="market-leading",
        preferred_term="industry-recognized",
        reason="Unsubstantiated marketing superlative prohibited by compliance policy.",
        severity="Violation",
        status="Active"
    )
    term_2 = TerminologyRule(
        organization_id=org.id,
        term_id="TERM-02",
        banned_term="bulletproof",
        preferred_term="high-resilience",
        reason="Hyperbolic security claim.",
        severity="Violation",
        status="Active"
    )
    term_3 = TerminologyRule(
        organization_id=org.id,
        term_id="TERM-03",
        banned_term="unlimited storage",
        preferred_term="high-capacity storage",
        reason="Misleading marketing claim; contradicts SLA allocation limits.",
        severity="Violation",
        status="Active"
    )
    term_4 = TerminologyRule(
        organization_id=org.id,
        term_id="TERM-04",
        banned_term="cheap",
        preferred_term="cost-effective",
        reason="Inconsistent with enterprise brand tone.",
        severity="Warning",
        status="Active"
    )
    db.add_all([term_1, term_2, term_3, term_4])

    # 6. Seed Brand Color Palettes
    # Compute LAB values
    royal_lab = rgb_to_lab(29, 61, 212)
    navy_lab = rgb_to_lab(15, 29, 94)
    cyan_lab = rgb_to_lab(6, 182, 212)
    surf_lab = rgb_to_lab(248, 250, 252)

    pal_1 = BrandColorPalette(
        organization_id=org.id,
        color_id="CLR-ROYAL-BLUE",
        name="NovaTech Royal Blue",
        hex_code="#1D3DD4",
        rgb_r=29, rgb_g=61, rgb_b=212,
        lab_l=royal_lab[0], lab_a=royal_lab[1], lab_b=royal_lab[2],
        role="Primary",
        tolerance_delta_e=10.0
    )
    pal_2 = BrandColorPalette(
        organization_id=org.id,
        color_id="CLR-SLATE-NAVY",
        name="Deep Navy Foundation",
        hex_code="#0F1D5E",
        rgb_r=15, rgb_g=29, rgb_b=94,
        lab_l=navy_lab[0], lab_a=navy_lab[1], lab_b=navy_lab[2],
        role="Secondary",
        tolerance_delta_e=10.0
    )
    pal_3 = BrandColorPalette(
        organization_id=org.id,
        color_id="CLR-TEAL-ACCENT",
        name="NovaTech Cyan Accent",
        hex_code="#06B6D4",
        rgb_r=6, rgb_g=182, rgb_b=212,
        lab_l=cyan_lab[0], lab_a=cyan_lab[1], lab_b=cyan_lab[2],
        role="Accent",
        tolerance_delta_e=10.0
    )
    pal_4 = BrandColorPalette(
        organization_id=org.id,
        color_id="CLR-SURFACE-BG",
        name="Clean Surface Light",
        hex_code="#F8FAFC",
        rgb_r=248, rgb_g=250, rgb_b=252,
        lab_l=surf_lab[0], lab_a=surf_lab[1], lab_b=surf_lab[2],
        role="Background",
        tolerance_delta_e=10.0
    )
    db.add_all([pal_1, pal_2, pal_3, pal_4])
    db.commit()

    # 7. Seed Prepared Submissions
    # Submission 1: The Judge Demo Draft!
    sub1_title = "NovaTech Q3 Enterprise Cloud Launch Announcement"
    sub1_text = (
        "NovaTech is proud to announce our market-leading cloud governance platform, delivering game-changing results for Fortune 500 enterprises.\n\n"
        "Starting today, teams can deploy NovaCloud Enterprise for only $79 per user/month, unlocking automated compliance monitoring and 100% fail-safe security.\n\n"
        "With guaranteed 99.999% uptime and unlimited storage, organizations can scale fearlessly without compromising reliability.\n\n"
        "![NovaTech Architecture Graphic]()\n\n"
        "Contact our enterprise sales team to begin your transition to unified brand governance."
    )
    sub1_sha256 = DeltaHasher.compute_sha256(sub1_text)
    sub1_paras = [p.strip() for p in sub1_text.split("\n\n") if p.strip()]
    sub1_hashes = DeltaHasher.hash_paragraphs(sub1_paras)

    sub1 = ContentSubmission(
        organization_id=org.id,
        creator_id=creator.id,
        title=sub1_title,
        content_type="Product Announcement",
        current_status="SCANNED",
        created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=2)
    )
    db.add(sub1)
    db.commit()
    db.refresh(sub1)

    rev1 = ContentRevision(
        submission_id=sub1.id,
        revision_number=1,
        raw_content=sub1_text,
        file_sha256=sub1_sha256,
        paragraph_hashes=json.dumps(sub1_hashes),
        created_by_id=creator.id,
        created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=2)
    )
    db.add(rev1)
    db.commit()
    db.refresh(rev1)

    # Findings for Submission 1
    f1 = Finding(
        revision_id=rev1.id,
        check_type="CHECK_1_TERMINOLOGY",
        category="Terminology",
        severity="Violation",
        status="Open",
        flagged_text="market-leading",
        span_start=34,
        span_end=48,
        paragraph_index=0,
        explanation="Prohibited terminology detected: 'market-leading'. Unsubstantiated marketing superlative prohibited by compliance policy. Preferred alternative: 'industry-recognized'.",
        rule_clause_id="TERM-01",
        source_document="Terminology Standards",
        source_page=1,
        source_quote="Banned: 'market-leading' -> Preferred: 'industry-recognized'",
        suggested_fix="industry-recognized",
        confidence_score=1.0,
        confidence_type="Rule-Based"
    )
    f2 = Finding(
        revision_id=rev1.id,
        check_type="CHECK_3_FACT",
        category="Fact",
        severity="Violation",
        status="Open",
        flagged_text="$79 per user/month",
        span_start=55,
        span_end=73,
        paragraph_index=1,
        explanation="Factual Contradiction Detected: Claimed value '$79 per user/month' directly conflicts with approved brand record for 'NovaCloud Enterprise Base Plan'.",
        rule_clause_id="FACT-PRICE-01",
        source_document="NovaTech_Pricing_Schedule_2026.pdf",
        source_page=3,
        source_quote="The NovaCloud Enterprise Base Plan is priced at $99 per user/month billed annually. All quotes for enterprise deployments must reflect this standard rate.",
        suggested_fix="$99 per user/month billed annually",
        confidence_score=0.98,
        confidence_type="Rule-Based"
    )
    f3 = Finding(
        revision_id=rev1.id,
        check_type="CHECK_2_TONE",
        category="Tone",
        severity="Warning",
        status="Open",
        flagged_text="game-changing results",
        span_start=61,
        span_end=82,
        paragraph_index=0,
        explanation="Brand Voice Guideline: Hyperbolic claim detected. Enterprise tone requires grounded, defensible descriptions rather than sensational adjectives.",
        rule_clause_id="TONE-VOICE-01",
        source_document="Brand Style & Voice Guide",
        source_page=4,
        source_quote="Enterprise Voice Rule 4.1: Maintain balanced, substantiated language; avoid hyperbolic superlatives, slang, and absolute risk guarantees.",
        suggested_fix="proven measurable results",
        confidence_score=0.85,
        confidence_type="Heuristic"
    )
    f4 = Finding(
        revision_id=rev1.id,
        check_type="CHECK_2_TONE",
        category="Tone",
        severity="Warning",
        status="Open",
        flagged_text="100% fail-safe",
        span_start=115,
        span_end=129,
        paragraph_index=1,
        explanation="Brand Voice Guideline: Absolute guarantee detected. Compliance policy strictly prohibits uninsurable absolute reliability claims.",
        rule_clause_id="TONE-VOICE-01",
        source_document="Brand Style & Voice Guide",
        source_page=4,
        source_quote="Maintain balanced, substantiated language; avoid hyperbolic superlatives and absolute risk guarantees.",
        suggested_fix="enterprise-grade resilience",
        confidence_score=0.85,
        confidence_type="Heuristic"
    )
    f5 = Finding(
        revision_id=rev1.id,
        check_type="CHECK_5_ACCESSIBILITY",
        category="Accessibility",
        severity="Violation",
        status="Open",
        flagged_text="[Missing Alt Text]",
        span_start=0,
        span_end=0,
        paragraph_index=3,
        explanation="WCAG 2.2 Criterion 1.1.1 Non-text Content: Missing alternative text for visual asset 'NovaTech Architecture Graphic'. Screen readers cannot interpret this image without descriptive alt text.",
        rule_clause_id="WCAG-1.1.1-ALT",
        source_document="WCAG 2.2 Guideline 1.1.1",
        source_page=1,
        source_quote="All non-text content that is presented to the user has a text alternative that serves the equivalent purpose.",
        suggested_fix="Diagram illustrating NovaTech unified multi-cloud governance architecture",
        confidence_score=1.0,
        confidence_type="Rule-Based"
    )
    db.add_all([f1, f2, f3, f4, f5])

    # Submission 2: Approved Whitepaper Summary with Issued Compliance Certificate
    sub2_text = (
        "NovaTech Architecture Whitepaper provides technical architects with an authoritative blueprint for secure, compliant multi-cloud orchestration.\n\n"
        "The platform delivers an industry-recognized 99.9% uptime SLA with 500GB dedicated encrypted NVMe storage per seat.\n\n"
        "Deployments reflect the approved standard rate of $99 per user/month billed annually."
    )
    sub2 = ContentSubmission(
        organization_id=org.id,
        creator_id=creator.id,
        title="NovaTech Security & Architecture Whitepaper Summary",
        content_type="Whitepaper",
        current_status="APPROVED",
        assigned_reviewer_id=reviewer.id,
        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=1)
    )
    db.add(sub2)
    db.commit()
    db.refresh(sub2)

    rev2 = ContentRevision(
        submission_id=sub2.id,
        revision_number=1,
        raw_content=sub2_text,
        file_sha256=DeltaHasher.compute_sha256(sub2_text),
        paragraph_hashes=json.dumps(DeltaHasher.hash_paragraphs([p.strip() for p in sub2_text.split("\n\n") if p.strip()])),
        created_by_id=creator.id,
        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=1)
    )
    db.add(rev2)
    db.commit()
    db.refresh(rev2)

    # Issue Certificate for Submission 2
    CertificateGenerator.issue_certificate(db, sub2, reviewer)

    # Submission 3: With Overridden Findings (Creating > 40% override rate on PR-101 for Improvement 2 friction alert!)
    sub3_text = (
        "NovaTech Special Partner Brief: For qualified ecosystem partners, renewal billing applies special contracted volume rates.\n\n"
        "Deployment partners retain legacy contract pricing at $89 per user/month during Q3 transition."
    )
    sub3 = ContentSubmission(
        organization_id=org.id,
        creator_id=creator.id,
        title="NovaTech Ecosystem Partner Renewal Notice",
        content_type="Email Campaign",
        current_status="CHANGES_REQUESTED",
        assigned_reviewer_id=reviewer.id,
        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=2)
    )
    db.add(sub3)
    db.commit()
    db.refresh(sub3)

    rev3 = ContentRevision(
        submission_id=sub3.id,
        revision_number=1,
        raw_content=sub3_text,
        file_sha256=DeltaHasher.compute_sha256(sub3_text),
        created_by_id=creator.id
    )
    db.add(rev3)
    db.commit()
    db.refresh(rev3)

    f_sub3_1 = Finding(
        revision_id=rev3.id,
        check_type="CHECK_3_FACT",
        category="Fact",
        severity="Violation",
        status="Overridden",
        flagged_text="$89 per user/month",
        span_start=55,
        span_end=73,
        paragraph_index=1,
        explanation="Factual Contradiction Detected: Claimed value '$89 per user/month' conflicts with $99 list rate.",
        rule_clause_id="PR-101",
        source_document="NovaTech_Pricing_Schedule_2026.pdf",
        source_page=3,
        source_quote="The NovaCloud Enterprise Base Plan is priced at $99 per user/month billed annually.",
        suggested_fix="$99 per user/month billed annually",
        confidence_score=0.98,
        confidence_type="Rule-Based",
        override_reason="Grandfathered tier approved under Master Services Agreement Partner Schedule 4.1.",
        overridden_by_id=reviewer.id,
        overridden_at=datetime.datetime.utcnow() - datetime.timedelta(days=2)
    )
    f_sub3_2 = Finding(
        revision_id=rev3.id,
        check_type="CHECK_3_FACT",
        category="Fact",
        severity="Violation",
        status="Overridden",
        flagged_text="contracted volume rates",
        span_start=60,
        span_end=83,
        paragraph_index=0,
        explanation="Pricing Policy: Volume rate disclaimer required.",
        rule_clause_id="PR-101",
        source_document="NovaTech_Brand_Book_2026.pdf",
        source_page=18,
        source_quote="Cite approved rate of $99.",
        suggested_fix=None,
        confidence_score=0.95,
        confidence_type="Rule-Based",
        override_reason="Legitimate contract renewal notice to existing certified partners.",
        overridden_by_id=reviewer.id,
        overridden_at=datetime.datetime.utcnow() - datetime.timedelta(days=2)
    )
    db.add_all([f_sub3_1, f_sub3_2])

    # 8. Seed Audit Events
    e1 = AuditEvent(
        organization_id=org.id,
        user_id=creator.id,
        action_type="SUBMISSION_CREATED",
        submission_id=sub1.id,
        outcome="SUCCESS",
        details=json.dumps({"title": sub1.title})
    )
    e2 = AuditEvent(
        organization_id=org.id,
        user_id=creator.id,
        action_type="SCAN_EXECUTED",
        submission_id=sub1.id,
        revision_id=rev1.id,
        outcome="COMPLETED_5_FINDINGS",
        details=json.dumps({"checks_run": 6, "violations": 3, "warnings": 2})
    )
    e3 = AuditEvent(
        organization_id=org.id,
        user_id=reviewer.id,
        action_type="FINDING_OVERRIDDEN",
        submission_id=sub3.id,
        revision_id=rev3.id,
        rule_id="PR-101",
        outcome="OVERRIDDEN",
        reason="Grandfathered tier approved under Master Services Agreement Partner Schedule 4.1."
    )
    e4 = AuditEvent(
        organization_id=org.id,
        user_id=reviewer.id,
        action_type="CERTIFICATE_ISSUED",
        submission_id=sub2.id,
        outcome="SUCCESS",
        details=json.dumps({"cert_code": "CERT-VL-2026-SEED"})
    )
    db.add_all([e1, e2, e3, e4])
    db.commit()

    return org
