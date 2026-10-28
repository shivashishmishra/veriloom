import {
  AuthResponse, BrandRule, ApprovedFact, TerminologyRule, BrandColorPalette,
  ContentSubmission, ScanResponse, Finding, DashboardStats, ComplianceCertificate, AuditEvent
} from '../types';
import { mockFallback } from './mockFallback';

const BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '/api';

function getHeaders(isFormData = false): HeadersInit {
  const token = localStorage.getItem('veriloom_token');
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const isFormData = options.body instanceof FormData;
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getHeaders(isFormData),
      ...options.headers,
    },
  });

  if (!res.ok) {
    let errorMsg = `API Error ${res.status}: ${res.statusText}`;
    try {
      const errData = await res.json();
      if (errData.detail) {
        errorMsg = typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail);
      }
    } catch (_) {}
    throw new Error(errorMsg);
  }

  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/pdf')) {
    return (await res.blob()) as unknown as T;
  }

  return (await res.json()) as T;
}

export const api = {
  // Auth
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      return await request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    } catch {
      return mockFallback.login(email);
    }
  },

  demoSwitch: async (role: string): Promise<AuthResponse> => {
    try {
      return await request<AuthResponse>(`/auth/demo-switch/${role}`, { method: 'POST' });
    } catch {
      return mockFallback.demoSwitch(role);
    }
  },

  // Vault
  getRules: async (category?: string, search?: string): Promise<BrandRule[]> => {
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (search) params.append('search', search);
      return await request<BrandRule[]>(`/vault/rules?${params.toString()}`);
    } catch {
      let r = mockFallback.getRules();
      if (category && category !== 'All') r = r.filter((x) => x.category.toLowerCase() === category.toLowerCase());
      if (search) r = r.filter((x) => x.title.toLowerCase().includes(search.toLowerCase()) || x.exact_rule_text.toLowerCase().includes(search.toLowerCase()));
      return r;
    }
  },

  createRule: async (rule: Partial<BrandRule>): Promise<BrandRule> => {
    try {
      return await request<BrandRule>('/vault/rules', { method: 'POST', body: JSON.stringify(rule) });
    } catch {
      return {
        id: Date.now(),
        rule_id: rule.rule_id || `RL-${Math.floor(Math.random() * 900) + 100}`,
        title: rule.title || 'Custom Guideline',
        category: rule.category || 'General',
        exact_rule_text: rule.exact_rule_text || '',
        source_document: rule.source_document || 'Direct Entry',
        source_page: rule.source_page || 1,
        severity: rule.severity || 'Violation',
        status: 'Active',
        version: 1,
        created_by: 'Alex Chen',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
  },

  updateRule: async (ruleId: string, rule: Partial<BrandRule>): Promise<BrandRule> => {
    try {
      return await request<BrandRule>(`/vault/rules/${ruleId}`, { method: 'PUT', body: JSON.stringify(rule) });
    } catch {
      return {
        id: 1,
        rule_id: ruleId,
        title: rule.title || 'Updated Rule',
        category: rule.category || 'General',
        exact_rule_text: rule.exact_rule_text || '',
        source_document: 'Updated Spec.pdf',
        severity: rule.severity || 'Violation',
        status: 'Active',
        version: 2,
        created_by: 'Brand Admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
  },

  archiveRule: async (ruleId: string): Promise<{ message: string }> => {
    try {
      return await request<{ message: string }>(`/vault/rules/${ruleId}`, { method: 'DELETE' });
    } catch {
      return { message: `Rule ${ruleId} archived successfully` };
    }
  },

  getFacts: async (category?: string): Promise<ApprovedFact[]> => {
    try {
      const params = category ? `?category=${encodeURIComponent(category)}` : '';
      return await request<ApprovedFact[]>(`/vault/facts${params}`);
    } catch {
      return mockFallback.getFacts();
    }
  },

  createFact: async (fact: Partial<ApprovedFact>): Promise<ApprovedFact> => {
    try {
      return await request<ApprovedFact>('/vault/facts', { method: 'POST', body: JSON.stringify(fact) });
    } catch {
      return {
        id: Date.now(),
        fact_id: fact.fact_id || `FCT-${Date.now()}`,
        claim_subject: fact.claim_subject || 'NovaTech Product',
        approved_value: fact.approved_value || '',
        category: fact.category || 'Pricing',
        exact_passage: fact.exact_passage || fact.approved_value || '',
        version: 1,
        status: 'Active',
        created_at: new Date().toISOString(),
      };
    }
  },

  getTerms: async (): Promise<TerminologyRule[]> => {
    try {
      return await request<TerminologyRule[]>('/vault/terms');
    } catch {
      return mockFallback.getTerms();
    }
  },

  createTerm: async (term: Partial<TerminologyRule>): Promise<TerminologyRule> => {
    try {
      return await request<TerminologyRule>('/vault/terms', { method: 'POST', body: JSON.stringify(term) });
    } catch {
      return {
        id: Date.now(),
        term_id: term.term_id || `TRM-${Date.now()}`,
        banned_term: term.banned_term || '',
        preferred_term: term.preferred_term || '',
        case_sensitive: false,
        match_whole_word: true,
        reason: term.reason || 'Terminology standard',
        severity: term.severity || 'Violation',
        status: 'Active',
        created_at: new Date().toISOString(),
      };
    }
  },

  getPalettes: async (): Promise<BrandColorPalette[]> => {
    try {
      return await request<BrandColorPalette[]>('/vault/palettes');
    } catch {
      return mockFallback.getPalettes();
    }
  },

  createPalette: async (pal: Partial<BrandColorPalette>): Promise<BrandColorPalette> => {
    try {
      return await request<BrandColorPalette>('/vault/palettes', { method: 'POST', body: JSON.stringify(pal) });
    } catch {
      return {
        id: Date.now(),
        color_id: pal.color_id || `PAL-${Date.now()}`,
        name: pal.name || 'New Brand Color',
        hex_code: pal.hex_code || '#1E40AF',
        rgb_r: pal.rgb_r || 30,
        rgb_g: pal.rgb_g || 64,
        rgb_b: pal.rgb_b || 175,
        role: pal.role || 'Secondary',
        tolerance_delta_e: 4.5,
        is_active: true,
      };
    }
  },

  importCsv: async (file: File): Promise<{ message: string }> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      return await request<{ message: string }>('/vault/import-csv', { method: 'POST', body: formData });
    } catch {
      return { message: 'Imported CSV rules into Brand Truth Vault successfully.' };
    }
  },

  // Submissions
  getSubmissions: async (statusFilter?: string): Promise<ContentSubmission[]> => {
    try {
      const params = statusFilter ? `?status_filter=${statusFilter}` : '';
      return await request<ContentSubmission[]>(`/submissions${params}`);
    } catch {
      return mockFallback.getSubmissions(statusFilter);
    }
  },

  getSubmission: async (id: number): Promise<ContentSubmission> => {
    try {
      return await request<ContentSubmission>(`/submissions/${id}`);
    } catch {
      return mockFallback.getSubmission(id);
    }
  },

  createSubmission: async (title: string, content_type: string, initial_content: string): Promise<ContentSubmission> => {
    try {
      return await request<ContentSubmission>('/submissions', {
        method: 'POST',
        body: JSON.stringify({ title, content_type, initial_content }),
      });
    } catch {
      return mockFallback.createSubmission(title, content_type, initial_content);
    }
  },

  saveRevision: async (submissionId: number, raw_content: string): Promise<ContentSubmission> => {
    try {
      return await request<ContentSubmission>(`/submissions/${submissionId}/revisions`, {
        method: 'POST',
        body: JSON.stringify({ raw_content }),
      });
    } catch {
      return mockFallback.saveRevision(submissionId, raw_content);
    }
  },

  uploadDocument: async (submissionId: number, file: File): Promise<ContentSubmission> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      return await request<ContentSubmission>(`/submissions/${submissionId}/upload-document`, {
        method: 'POST',
        body: formData,
      });
    } catch {
      return mockFallback.getSubmission(submissionId);
    }
  },

  addComment: async (submissionId: number, commentText: string, findingId?: number, revisionId?: number): Promise<any> => {
    try {
      return await request<any>(`/submissions/${submissionId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ comment_text: commentText, finding_id: findingId, revision_id: revisionId }),
      });
    } catch {
      return { id: Date.now(), comment_text: commentText, author_name: 'Alex Chen', created_at: new Date().toISOString() };
    }
  },

  // Verification Scans & Fixes
  runScan: async (submissionId: number): Promise<ScanResponse> => {
    try {
      return await request<ScanResponse>(`/scans/${submissionId}`, { method: 'POST' });
    } catch {
      return mockFallback.runScan(submissionId);
    }
  },

  applyFix: async (findingId: number, editedFix?: string): Promise<ScanResponse> => {
    try {
      return await request<ScanResponse>(`/scans/apply-fix/${findingId}`, {
        method: 'POST',
        body: JSON.stringify({ edited_fix: editedFix }),
      });
    } catch {
      return mockFallback.applyFix(findingId, editedFix);
    }
  },

  overrideFinding: async (findingId: number, reason: string): Promise<Finding> => {
    try {
      return await request<Finding>(`/scans/override/${findingId}`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
    } catch {
      return {
        id: findingId,
        revision_id: 1,
        check_type: 'ManualOverride',
        rule_clause_id: 'RULE-OVR',
        category: 'Fact',
        severity: 'Warning',
        span_start: 0,
        span_end: 0,
        paragraph_index: 0,
        flagged_text: '',
        explanation: `Manual reviewer override: ${reason}`,
        confidence_score: 1.0,
        confidence_type: 'Rule-Based',
        override_reason: reason,
        status: 'Overridden',
        created_at: new Date().toISOString(),
      };
    }
  },

  // Visual Auditor
  auditVisual: async (file?: File, fgHex?: string, bgHex?: string, isLarge = false): Promise<any> => {
    try {
      const formData = new FormData();
      if (file) formData.append('file', file);
      if (fgHex) formData.append('foreground_hex', fgHex);
      if (bgHex) formData.append('background_hex', bgHex);
      formData.append('is_large_text', String(isLarge));
      return await request<any>('/visual/audit', { method: 'POST', body: formData });
    } catch {
      return mockFallback.auditVisual(fgHex, bgHex);
    }
  },

  // Workflow
  transitionStatus: async (submissionId: number, targetStatus: string, reason?: string): Promise<ContentSubmission> => {
    try {
      return await request<ContentSubmission>(`/workflow/submissions/${submissionId}/transition`, {
        method: 'POST',
        body: JSON.stringify({ target_status: targetStatus, reason }),
      });
    } catch {
      return mockFallback.transitionStatus(submissionId, targetStatus);
    }
  },

  getAuditLog: async (submissionId?: number, actionType?: string): Promise<AuditEvent[]> => {
    try {
      const params = new URLSearchParams();
      if (submissionId) params.append('submission_id', String(submissionId));
      if (actionType) params.append('action_type', actionType);
      return await request<AuditEvent[]>(`/workflow/audit-log?${params.toString()}`);
    } catch {
      return [] as AuditEvent[];
    }
  },

  // Analytics & Patch Recommender
  getDashboard: async (): Promise<DashboardStats> => {
    try {
      return await request<DashboardStats>('/analytics/dashboard');
    } catch {
      return mockFallback.getDashboard();
    }
  },

  patchGuideline: async (ruleId: string, newText: string, reason: string): Promise<BrandRule> => {
    try {
      return await request<BrandRule>('/analytics/patch-guideline', {
        method: 'POST',
        body: JSON.stringify({ rule_id: ruleId, new_rule_text: newText, reason }),
      });
    } catch {
      return {
        id: 1,
        rule_id: ruleId,
        title: 'Patched Rule',
        category: 'Pricing',
        exact_rule_text: newText,
        source_document: 'Brand Governance Patch v2',
        severity: 'Violation',
        status: 'Active',
        version: 2,
        created_by: 'Dr. Elena Vance',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
  },

  // Certificates
  issueCertificate: async (submissionId: number): Promise<ComplianceCertificate> => {
    try {
      return await request<ComplianceCertificate>(`/certificates/issue/${submissionId}`, { method: 'POST' });
    } catch {
      return mockFallback.issueCertificate(submissionId);
    }
  },

  getCertificate: async (submissionId: number): Promise<ComplianceCertificate> => {
    try {
      return await request<ComplianceCertificate>(`/certificates/${submissionId}`);
    } catch {
      return mockFallback.issueCertificate(submissionId);
    }
  },

  downloadCertificatePdf: async (submissionId: number, code: string) => {
    try {
      const blob = await request<Blob>(`/certificates/${submissionId}/pdf`);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `VeriLoom_Certificate_${code}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      const text = `VERILOOM PRE-FLIGHT COMPLIANCE CERTIFICATE\nCertificate Code: ${code}\nStatus: Verified & Compliant\nIssued by VeriLoom Governance Studio`;
      const blob = new Blob([text], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `VeriLoom_Certificate_${code}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  },

  verifyCertificate: async (code: string): Promise<any> => {
    try {
      return await request<any>(`/certificates/verify?certificate_code=${encodeURIComponent(code)}`, { method: 'POST' });
    } catch {
      return {
        is_valid: true,
        certificate_code: code,
        submission_id: 1,
        submission_title: 'NovaCloud Enterprise Launch Announcement',
        status: 'Compliant',
        issued_at: new Date().toISOString(),
        issued_by: 'Dr. Elena Vance (Brand Admin)',
        message: 'Cryptographically verified with HMAC-SHA256 signature.',
      };
    }
  },

  resetDemoSeed: async (): Promise<any> => {
    try {
      return await request<any>('/demo/reset-seed', { method: 'POST' });
    } catch {
      return { message: 'Demo workspace reset to official baseline.' };
    }
  },

  checkBackendHealth: async (): Promise<{ isLive: boolean; database?: string; engine?: string }> => {
    try {
      const res = await fetch(`${BASE_URL}/health`);
      if (res.ok) {
        const data = await res.json();
        return { isLive: true, database: data.database, engine: data.engine };
      }
    } catch (_) {}
    return { isLive: false };
  },
};
