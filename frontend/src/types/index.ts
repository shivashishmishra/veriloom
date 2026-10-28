export type UserRole = 'Creator' | 'Reviewer' | 'Brand Admin';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  organization_id: number;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user_id: number;
  email: string;
  full_name: string;
  role: UserRole;
  organization_id: number;
  organization_name: string;
  is_demo: boolean;
}

export interface BrandRule {
  id: number;
  rule_id: string;
  title: string;
  category: string;
  exact_rule_text: string;
  source_document?: string;
  source_page?: number;
  severity: 'Violation' | 'Warning' | 'Info';
  effective_from?: string;
  expires_at?: string;
  version: number;
  status: 'Active' | 'Archived' | 'Deprecated';
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ApprovedFact {
  id: number;
  fact_id: string;
  claim_subject: string;
  approved_value: string;
  category: string;
  exact_passage: string;
  source_document?: string;
  source_page?: number;
  effective_from?: string;
  expires_at?: string;
  version: number;
  status: 'Active' | 'Archived';
  created_at: string;
}

export interface TerminologyRule {
  id: number;
  term_id: string;
  banned_term: string;
  preferred_term?: string;
  case_sensitive: boolean;
  match_whole_word: boolean;
  reason?: string;
  severity: 'Violation' | 'Warning';
  status: 'Active' | 'Archived';
  created_at: string;
}

export interface BrandColorPalette {
  id: number;
  color_id: string;
  name: string;
  hex_code: string;
  rgb_r: number;
  rgb_g: number;
  rgb_b: number;
  lab_l?: number;
  lab_a?: number;
  lab_b?: number;
  role: 'Primary' | 'Secondary' | 'Accent' | 'Background' | 'Text';
  tolerance_delta_e: number;
  is_active: boolean;
}

export type FindingStatus = 'Open' | 'Resolved' | 'Overridden' | 'Needs Human Review' | 'Unsubstantiated';

export interface Finding {
  id: number;
  revision_id: number;
  check_type: string;
  category: 'Terminology' | 'Tone' | 'Fact' | 'Visual' | 'Accessibility';
  severity: 'Violation' | 'Warning' | 'Info';
  status: FindingStatus;
  flagged_text: string;
  span_start: number;
  span_end: number;
  paragraph_index: number;
  explanation: string;
  rule_clause_id?: string;
  source_document?: string;
  source_page?: number;
  source_quote?: string;
  suggested_fix?: string;
  confidence_score: number;
  confidence_type: 'Calibrated' | 'Rule-Based' | 'Heuristic';
  override_reason?: string;
  overridden_by_id?: number;
  overridden_at?: string;
  created_at: string;
}

export interface ContentRevision {
  id: number;
  submission_id: number;
  revision_number: number;
  raw_content: string;
  file_sha256?: string;
  created_by_id?: number;
  created_at: string;
  findings: Finding[];
}

export interface SubmissionComment {
  id: number;
  submission_id: number;
  revision_id?: number;
  author_id: number;
  author_name?: string;
  finding_id?: number;
  comment_text: string;
  created_at: string;
}

export type SubmissionStatus = 'DRAFT' | 'SCANNED' | 'CHANGES_REQUESTED' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';

export interface ContentSubmission {
  id: number;
  organization_id: number;
  creator_id: number;
  creator_name?: string;
  title: string;
  content_type: string;
  current_status: SubmissionStatus;
  assigned_reviewer_id?: number;
  assigned_reviewer_name?: string;
  created_at: string;
  updated_at: string;
  revisions: ContentRevision[];
  comments: SubmissionComment[];
}

export interface DeltaScanStats {
  total_paragraphs: number;
  unchanged_paragraphs: number;
  modified_paragraphs: number;
  cached_findings_reused: number;
  new_findings_detected: number;
  scan_duration_ms: number;
  sha256_hash: string;
}

export interface ScanResponse {
  submission_id: number;
  revision_id: number;
  revision_number: number;
  status: string;
  findings: Finding[];
  delta_stats?: DeltaScanStats;
  ai_provider_used: string;
  disclosure_notes: string;
}

export interface UnclearGuidelineAlert {
  rule_id: string;
  rule_title: string;
  original_text: string;
  category: string;
  total_findings: number;
  overrides_count: number;
  override_rate: number;
  reviewer_comments: string[];
  suggested_patch_wording: string;
  patch_rationale: string;
  sample_size_adequate: boolean;
}

export interface DashboardStats {
  total_submissions: number;
  pending_review: number;
  approved: number;
  changes_requested: number;
  open_findings: number;
  resolved_findings: number;
  overridden_findings: number;
  findings_by_category: { category: string; count: number }[];
  most_violated_rules: { rule_id: string; title: string; category: string; violation_count: number }[];
  unclear_guideline_alerts: UnclearGuidelineAlert[];
  is_demo_workspace: boolean;
  badge_label: string;
}

export interface ComplianceCertificate {
  id: string;
  certificate_code: string;
  submission_id: number;
  revision_id: number;
  content_title: string;
  source_file_sha256: string;
  vault_version: string;
  approver_id: number;
  approver_name: string;
  approver_role: string;
  approval_timestamp: string;
  issued_at: string;
  findings_summary: {
    total_findings: number;
    resolved_count: number;
    overridden_count: number;
    open_count: number;
    findings_detail: Array<{
      rule_id?: string;
      category: string;
      status: string;
      override_reason?: string;
    }>;
  };
  signature_algorithm: string;
  digital_signature: string;
  verification_hash: string;
  is_verified: boolean;
}

export interface AuditEvent {
  id: number;
  user_id?: number;
  user_name?: string;
  action_type: string;
  submission_id?: number;
  revision_id?: number;
  finding_id?: number;
  rule_id?: string;
  outcome: string;
  reason?: string;
  details?: string;
  timestamp: string;
}
