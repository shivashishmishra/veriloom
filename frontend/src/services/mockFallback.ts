import {
  AuthResponse, BrandRule, ApprovedFact, TerminologyRule, BrandColorPalette,
  ContentSubmission, ScanResponse, Finding, DashboardStats, ComplianceCertificate, AuditEvent
} from '../types';

export const MOCK_USERS: Record<string, AuthResponse> = {
  creator: {
    access_token: 'mock_jwt_creator_token',
    token_type: 'bearer',
    user_id: 1,
    email: 'creator@novatech.io',
    full_name: 'Alex Chen (Lead Copywriter)',
    role: 'Creator',
    organization_id: 1,
    organization_name: 'NovaTech AI Solutions',
    is_demo: true,
  },
  reviewer: {
    access_token: 'mock_jwt_reviewer_token',
    token_type: 'bearer',
    user_id: 2,
    email: 'reviewer@novatech.io',
    full_name: 'Morgan Rivera (Senior Compliance Reviewer)',
    role: 'Reviewer',
    organization_id: 1,
    organization_name: 'NovaTech AI Solutions',
    is_demo: true,
  },
  admin: {
    access_token: 'mock_jwt_admin_token',
    token_type: 'bearer',
    user_id: 3,
    email: 'admin@novatech.io',
    full_name: 'Dr. Elena Vance (VP of Brand & Governance)',
    role: 'Brand Admin',
    organization_id: 1,
    organization_name: 'NovaTech AI Solutions',
    is_demo: true,
  },
};

export const MOCK_RULES: BrandRule[] = [
  {
    id: 1,
    rule_id: 'PR-101',
    title: 'Official Enterprise Pricing Standard',
    category: 'Pricing',
    exact_rule_text: 'All external marketing, launch announcements, and promotional copy referencing NovaCloud Enterprise must cite the current approved rate of $99 per user/month billed annually.',
    source_document: 'NovaTech_Brand_Book_2026.pdf',
    source_page: 18,
    severity: 'Violation',
    status: 'Active',
    version: 1,
    created_by: 'Dr. Elena Vance',
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    rule_id: 'TN-202',
    title: 'Executive & Objective Brand Tone',
    category: 'Tone',
    exact_rule_text: 'Avoid hyperbolic, colloquial, or unsubstantiated hype phrases such as "game-changer", "magic bullet", or "100% unbreakable". Maintain an objective, authoritative enterprise tone.',
    source_document: 'Editorial_Tone_Guide_v3.pdf',
    source_page: 6,
    severity: 'Warning',
    status: 'Active',
    version: 1,
    created_by: 'Morgan Rivera',
    created_at: new Date(Date.now() - 86400000 * 25).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    rule_id: 'TM-303',
    title: 'Terminology Governance - Banned Buzzwords',
    category: 'Terminology',
    exact_rule_text: 'Use preferred terminology in all communications: Replace "cheap" with "cost-effective", replace "synergy" with "coordinated execution", and replace "foolproof" with "robust".',
    source_document: 'Approved_Glossary_2026.docx',
    source_page: 12,
    severity: 'Violation',
    status: 'Active',
    version: 1,
    created_by: 'Dr. Elena Vance',
    created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 4,
    rule_id: 'ACC-404',
    title: 'WCAG 2.2 Level AA Contrast Requirements',
    category: 'Accessibility',
    exact_rule_text: 'All textual elements in visual assets and banners must achieve a minimum contrast ratio of 4.5:1 against their background for standard text, and 3:1 for large display text.',
    source_document: 'Design_System_Spec.pdf',
    source_page: 44,
    severity: 'Violation',
    status: 'Active',
    version: 1,
    created_by: 'Dr. Elena Vance',
    created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 5,
    rule_id: 'AS-505',
    title: 'Master Corporate Logo Clearspace and Padding',
    category: 'Visual Assets',
    exact_rule_text: 'The NovaTech master logo must be surrounded on all four sides by clearspace equal to at least 15% of the total logo height. Never crowd with text or background artifacts.',
    source_document: 'Visual_Identity_Standards.pdf',
    source_page: 9,
    severity: 'Warning',
    status: 'Active',
    version: 1,
    created_by: 'Morgan Rivera',
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const MOCK_FACTS: ApprovedFact[] = [
  {
    id: 1,
    fact_id: 'FCT-001',
    claim_subject: 'NovaCloud Enterprise Pricing',
    approved_value: '$99 per user/month',
    category: 'Pricing',
    exact_passage: 'NovaCloud Enterprise licenses are billed annually at $99 per user/month.',
    source_document: 'Q1_2026_Pricing_Schedule.pdf',
    source_page: 4,
    version: 1,
    status: 'Active',
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: 2,
    fact_id: 'FCT-002',
    claim_subject: 'Platform Availability SLA',
    approved_value: '99.9% uptime SLA',
    category: 'SLA',
    exact_passage: 'NovaTech commitments guarantee 99.9% uptime availability for all enterprise clusters.',
    source_document: 'Master_Service_Agreement.pdf',
    source_page: 9,
    version: 1,
    status: 'Active',
    created_at: new Date(Date.now() - 86400000 * 25).toISOString(),
  },
];

export const MOCK_TERMS: TerminologyRule[] = [
  {
    id: 1,
    term_id: 'TRM-001',
    banned_term: 'synergy',
    preferred_term: 'coordinated execution',
    case_sensitive: false,
    match_whole_word: true,
    reason: 'Avoid cliché corporate buzzwords. Clarify the operational benefit.',
    severity: 'Violation',
    status: 'Active',
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: 2,
    term_id: 'TRM-002',
    banned_term: 'cheap',
    preferred_term: 'cost-effective',
    case_sensitive: false,
    match_whole_word: true,
    reason: 'Value-oriented phrasing maintains premium enterprise perception.',
    severity: 'Violation',
    status: 'Active',
    created_at: new Date(Date.now() - 86400000 * 25).toISOString(),
  },
  {
    id: 3,
    term_id: 'TRM-003',
    banned_term: 'game-changer',
    preferred_term: 'significant advancement',
    case_sensitive: false,
    match_whole_word: true,
    reason: 'Focus on measurable engineering impact rather than hyperbolic slang.',
    severity: 'Warning',
    status: 'Active',
    created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
  },
];

export const MOCK_PALETTES: BrandColorPalette[] = [
  {
    id: 1,
    color_id: 'PAL-001',
    name: 'Primary Enterprise Navy',
    hex_code: '#1E3A8A',
    rgb_r: 30,
    rgb_g: 58,
    rgb_b: 138,
    role: 'Primary',
    tolerance_delta_e: 4.5,
    is_active: true,
  },
  {
    id: 2,
    color_id: 'PAL-002',
    name: 'Signal Teal',
    hex_code: '#0D9488',
    rgb_r: 13,
    rgb_g: 148,
    rgb_b: 136,
    role: 'Secondary',
    tolerance_delta_e: 5.0,
    is_active: true,
  },
];

const INITIAL_SUBMISSIONS: ContentSubmission[] = [
  {
    id: 1,
    organization_id: 1,
    creator_id: 1,
    title: 'NovaCloud Q4 Enterprise Launch Announcement',
    content_type: 'Launch Copy',
    current_status: 'PENDING_REVIEW',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    updated_at: new Date().toISOString(),
    creator_name: 'Alex Chen (Lead Copywriter)',
    revisions: [
      {
        id: 1,
        submission_id: 1,
        revision_number: 1,
        raw_content: 'We are thrilled to announce NovaCloud Enterprise! For only $79 per user/month, companies can leverage unprecedented synergy across distributed teams. Our game-changer platform provides a cheap way to ensure 100% cloud reliability.',
        created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
        findings: [
          {
            id: 101,
            revision_id: 1,
            check_type: 'FactChecker',
            category: 'Fact',
            severity: 'Violation',
            status: 'Open',
            flagged_text: '$79 per user/month',
            span_start: 67,
            span_end: 85,
            paragraph_index: 0,
            explanation: 'Outdated price "$79 per user/month" contradicts Brand Truth Vault approved rate of "$99 per user/month".',
            rule_clause_id: 'PR-101',
            source_document: 'NovaTech_Brand_Book_2026.pdf',
            source_page: 18,
            source_quote: '$99 per user/month billed annually',
            suggested_fix: '$99 per user/month',
            confidence_score: 0.99,
            confidence_type: 'Rule-Based',
            created_at: new Date().toISOString(),
          },
          {
            id: 102,
            revision_id: 1,
            check_type: 'TerminologyFilter',
            category: 'Terminology',
            severity: 'Violation',
            status: 'Open',
            flagged_text: 'synergy',
            span_start: 119,
            span_end: 126,
            paragraph_index: 0,
            explanation: 'The word "synergy" is banned by corporate brand standards clause TM-303.',
            rule_clause_id: 'TM-303',
            source_document: 'Approved_Glossary_2026.docx',
            source_page: 12,
            source_quote: 'Replace synergy with coordinated execution',
            suggested_fix: 'coordinated execution',
            confidence_score: 1.0,
            confidence_type: 'Rule-Based',
            created_at: new Date().toISOString(),
          },
          {
            id: 103,
            revision_id: 1,
            check_type: 'ToneAuditor',
            category: 'Tone',
            severity: 'Warning',
            status: 'Open',
            flagged_text: 'game-changer',
            span_start: 160,
            span_end: 172,
            paragraph_index: 0,
            explanation: 'Hyperbolic marketing claim lacks technical qualification under Rule TN-202.',
            rule_clause_id: 'TN-202',
            source_document: 'Editorial_Tone_Guide_v3.pdf',
            source_page: 6,
            suggested_fix: 'significant advancement',
            confidence_score: 0.95,
            confidence_type: 'Heuristic',
            created_at: new Date().toISOString(),
          },
          {
            id: 104,
            revision_id: 1,
            check_type: 'TerminologyFilter',
            category: 'Terminology',
            severity: 'Violation',
            status: 'Open',
            flagged_text: 'cheap',
            span_start: 195,
            span_end: 200,
            paragraph_index: 0,
            explanation: '"cheap" diminishes product perception. Replace with preferred term "cost-effective".',
            rule_clause_id: 'TM-303',
            source_document: 'Approved_Glossary_2026.docx',
            source_page: 12,
            suggested_fix: 'cost-effective',
            confidence_score: 1.0,
            confidence_type: 'Rule-Based',
            created_at: new Date().toISOString(),
          },
        ],
      },
    ],
    comments: [
      {
        id: 1,
        submission_id: 1,
        author_id: 2,
        author_name: 'Morgan Rivera (Senior Compliance Reviewer)',
        comment_text: 'Pricing must be updated before final executive signoff. Please apply the $99 fix.',
        created_at: new Date(Date.now() - 1800000).toISOString(),
      },
    ],
  },
  {
    id: 2,
    organization_id: 1,
    creator_id: 1,
    title: 'NovaTech Infrastructure SLA & Security Whitepaper',
    content_type: 'Whitepaper',
    current_status: 'APPROVED',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    creator_name: 'Alex Chen (Lead Copywriter)',
    revisions: [
      {
        id: 2,
        submission_id: 2,
        revision_number: 1,
        raw_content: 'NovaTech provides a 99.9% uptime SLA backed by SOC 2 Type II certified data centers. Enterprise customers benefit from cost-effective scaling and coordinated execution across regions.',
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        findings: [],
      },
    ],
    comments: [],
  },
];

let submissionsStore = [...INITIAL_SUBMISSIONS];
let rulesStore = [...MOCK_RULES];
let factsStore = [...MOCK_FACTS];
let termsStore = [...MOCK_TERMS];
let palettesStore = [...MOCK_PALETTES];

export const mockFallback = {
  login: (email: string): AuthResponse => {
    if (email.includes('admin')) return MOCK_USERS.admin;
    if (email.includes('reviewer')) return MOCK_USERS.reviewer;
    return MOCK_USERS.creator;
  },

  demoSwitch: (role: string): AuthResponse => {
    return MOCK_USERS[role] || MOCK_USERS.creator;
  },

  getRules: () => [...rulesStore],
  getFacts: () => [...factsStore],
  getTerms: () => [...termsStore],
  getPalettes: () => [...palettesStore],

  getSubmissions: (statusFilter?: string) => {
    if (statusFilter && statusFilter !== 'All') {
      return submissionsStore.filter((s) => s.current_status.toLowerCase() === statusFilter.toLowerCase());
    }
    return [...submissionsStore];
  },

  getSubmission: (id: number): ContentSubmission => {
    const sub = submissionsStore.find((s) => s.id === Number(id));
    if (!sub) return submissionsStore[0];
    return sub;
  },

  createSubmission: (title: string, content_type: string, initial_content: string): ContentSubmission => {
    const newId = submissionsStore.length + 1;
    const newSub: ContentSubmission = {
      id: newId,
      organization_id: 1,
      creator_id: 1,
      title,
      content_type,
      current_status: 'DRAFT',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      creator_name: 'Alex Chen (Lead Copywriter)',
      revisions: [
        {
          id: newId,
          submission_id: newId,
          revision_number: 1,
          raw_content: initial_content,
          created_at: new Date().toISOString(),
          findings: [],
        },
      ],
      comments: [],
    };
    submissionsStore.unshift(newSub);
    return newSub;
  },

  saveRevision: (submissionId: number, raw_content: string): ContentSubmission => {
    const sub = submissionsStore.find((s) => s.id === Number(submissionId));
    if (!sub) throw new Error('Submission not found');
    const newRevId = (sub.revisions?.length || 0) + 1;
    sub.revisions = sub.revisions || [];
    sub.revisions.unshift({
      id: Date.now(),
      submission_id: sub.id,
      revision_number: newRevId,
      raw_content,
      created_at: new Date().toISOString(),
      findings: [],
    });
    sub.updated_at = new Date().toISOString();
    return sub;
  },

  runScan: (submissionId: number): ScanResponse => {
    const sub = submissionsStore.find((s) => s.id === Number(submissionId));
    if (!sub) throw new Error('Submission not found');
    const currentRev = sub.revisions?.[0];
    const text = currentRev?.raw_content || '';

    const findings: Finding[] = [];
    let findingCounter = 500;

    for (const term of termsStore) {
      const regex = new RegExp(`\\b${term.banned_term}\\b`, 'gi');
      let match;
      while ((match = regex.exec(text)) !== null) {
        findings.push({
          id: ++findingCounter,
          revision_id: currentRev?.id || 1,
          check_type: 'TerminologyFilter',
          category: 'Terminology',
          severity: term.severity,
          status: 'Open',
          span_start: match.index,
          span_end: match.index + match[0].length,
          paragraph_index: 0,
          flagged_text: match[0],
          explanation: `Banned terminology "${match[0]}" violates brand guidelines. ${term.reason}`,
          rule_clause_id: term.term_id,
          suggested_fix: term.preferred_term,
          source_document: 'Approved_Glossary_2026.docx',
          source_page: 12,
          confidence_score: 1.0,
          confidence_type: 'Rule-Based',
          created_at: new Date().toISOString(),
        });
      }
    }

    const priceMatch = /\$([0-9]+)/.exec(text);
    if (priceMatch && priceMatch[1] !== '99') {
      findings.push({
        id: ++findingCounter,
        revision_id: currentRev?.id || 1,
        check_type: 'FactChecker',
        category: 'Fact',
        severity: 'Violation',
        status: 'Open',
        span_start: priceMatch.index,
        span_end: priceMatch.index + priceMatch[0].length,
        paragraph_index: 0,
        flagged_text: priceMatch[0],
        explanation: `Price "${priceMatch[0]}" contradicts approved Brand Truth Vault rate of "$99 per user/month billed annually".`,
        rule_clause_id: 'PR-101',
        suggested_fix: '$99 per user/month',
        source_document: 'NovaTech_Brand_Book_2026.pdf',
        source_page: 18,
        source_quote: '$99 per user/month billed annually',
        confidence_score: 0.99,
        confidence_type: 'Rule-Based',
        created_at: new Date().toISOString(),
      });
    }

    if (currentRev) {
      currentRev.findings = findings;
    }
    sub.current_status = 'SCANNED';

    return {
      submission_id: sub.id,
      revision_id: currentRev?.id || 1,
      revision_number: currentRev?.revision_number || 1,
      status: 'SCANNED',
      findings,
      ai_provider_used: 'Local Hybrid Rule Engine',
      disclosure_notes: 'Deterministic hybrid verification completed successfully in client mode.',
    };
  },

  applyFix: (findingId: number, editedFix?: string): ScanResponse => {
    for (const sub of submissionsStore) {
      const rev = sub.revisions?.[0];
      if (!rev) continue;
      const findingIdx = rev.findings?.findIndex((f) => f.id === findingId);
      if (findingIdx !== undefined && findingIdx !== -1 && rev.findings) {
        const finding = rev.findings[findingIdx];
        const fixText = editedFix !== undefined && editedFix !== '' ? editedFix : finding.suggested_fix || '';
        
        const orig = rev.raw_content;
        const newContent = orig.slice(0, finding.span_start) + fixText + orig.slice(finding.span_end);
        
        rev.findings.splice(findingIdx, 1);
        rev.raw_content = newContent;
        sub.updated_at = new Date().toISOString();

        return {
          submission_id: sub.id,
          revision_id: rev.id,
          revision_number: rev.revision_number,
          status: 'SCANNED',
          findings: rev.findings,
          ai_provider_used: 'Local Hybrid Rule Engine',
          disclosure_notes: 'Correction applied with surgical intent-preserving span replacement.',
        };
      }
    }
    return {
      submission_id: 1,
      revision_id: 1,
      revision_number: 1,
      status: 'SCANNED',
      findings: [],
      ai_provider_used: 'None',
      disclosure_notes: 'No matching finding found.',
    };
  },

  transitionStatus: (submissionId: number, targetStatus: any): ContentSubmission => {
    const sub = submissionsStore.find((s) => s.id === Number(submissionId));
    if (!sub) throw new Error('Submission not found');
    sub.current_status = targetStatus;
    sub.updated_at = new Date().toISOString();
    return sub;
  },

  issueCertificate: (submissionId: number): ComplianceCertificate => {
    return {
      id: 'cert_1',
      certificate_code: `VERI-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      submission_id: submissionId,
      revision_id: 1,
      content_title: 'NovaCloud Enterprise Launch Announcement',
      source_file_sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      vault_version: '2.4.0',
      approver_id: 3,
      approver_name: 'Dr. Elena Vance',
      approver_role: 'Brand Admin',
      approval_timestamp: new Date().toISOString(),
      issued_at: new Date().toISOString(),
      findings_summary: {
        total_findings: 4,
        resolved_count: 4,
        overridden_count: 0,
        open_count: 0,
        findings_detail: [
          { rule_id: 'PR-101', category: 'Pricing', status: 'Resolved' },
          { rule_id: 'TM-303', category: 'Terminology', status: 'Resolved' },
        ],
      },
      signature_algorithm: 'HMAC-SHA256',
      digital_signature: 'a8b1c4e9f7d24a6b8c0e1f3a5b7d9c2e4f6a8b0c',
      verification_hash: '9f837261a5b4c3d2e1f0',
      is_verified: true,
    };
  },

  getDashboard: (): DashboardStats => {
    let totalFindings = 0;
    let openFindings = 0;
    for (const sub of submissionsStore) {
      const f = sub.revisions?.[0]?.findings || [];
      totalFindings += f.length;
      openFindings += f.filter((x) => x.status === 'Open').length;
    }
    return {
      total_submissions: submissionsStore.length,
      pending_review: submissionsStore.filter((s) => s.current_status === 'PENDING_REVIEW' || s.current_status === 'DRAFT').length,
      approved: submissionsStore.filter((s) => s.current_status === 'APPROVED').length,
      changes_requested: submissionsStore.filter((s) => s.current_status === 'CHANGES_REQUESTED').length,
      open_findings: openFindings,
      resolved_findings: Math.max(0, totalFindings - openFindings + 14),
      overridden_findings: 1,
      findings_by_category: [
        { category: 'Pricing', count: 2 },
        { category: 'Terminology', count: 3 },
        { category: 'Tone', count: 1 },
        { category: 'Accessibility', count: 1 },
      ],
      most_violated_rules: [
        { rule_id: 'PR-101', title: 'Official Enterprise Pricing Standard', category: 'Pricing', violation_count: 12 },
        { rule_id: 'TM-303', title: 'Terminology Governance - Banned Buzzwords', category: 'Terminology', violation_count: 9 },
        { rule_id: 'TN-202', title: 'Executive & Objective Brand Tone', category: 'Tone', violation_count: 5 },
      ],
      unclear_guideline_alerts: [
        {
          rule_id: 'PR-101',
          rule_title: 'Official Enterprise Pricing Standard',
          original_text: 'All external marketing referencing NovaCloud Enterprise must cite $99/user/month.',
          category: 'Pricing',
          total_findings: 14,
          overrides_count: 5,
          override_rate: 35.7,
          reviewer_comments: ['Unclear if billing cycle must be specified as annual in social copy.'],
          suggested_patch_wording: 'Explicitly specify whether the $99/user/month applies to monthly vs. annual commitments in all marketing headlines.',
          patch_rationale: 'Reviewers consistently override findings when context implies annual volume discount.',
          sample_size_adequate: true,
        },
      ],
      is_demo_workspace: true,
      badge_label: 'DEMO WORKSPACE — SYNTHETIC SAMPLE DATA',
    };
  },

  auditVisual: (fgHex?: string, bgHex?: string) => {
    return {
      contrast_ratio: 8.42,
      wcag_aa_normal: true,
      wcag_aa_large: true,
      wcag_aaa_normal: true,
      wcag_aaa_large: true,
      extracted_palette: [
        { hex: fgHex || '#1E3A8A', percentage: 48, matched_palette: 'Primary Enterprise Navy', delta_e: 0.0, is_approved: true },
        { hex: '#0D9488', percentage: 22, matched_palette: 'Signal Teal', delta_e: 1.2, is_approved: true },
        { hex: bgHex || '#FFFFFF', percentage: 30, matched_palette: 'Neutral Light', delta_e: 0.0, is_approved: true },
      ],
      has_alt_text: true,
      recommendation: 'Visual assets comply with WCAG 2.2 AA (8.42:1 > 4.5:1 minimum threshold).',
    };
  },
};
