import {
  AuthResponse, BrandRule, ApprovedFact, TerminologyRule, BrandColorPalette,
  ContentSubmission, ScanResponse, Finding, DashboardStats, ComplianceCertificate, AuditEvent
} from '../types';

const BASE_URL = '/api';

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

  // If response is a blob/file, handled separately
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/pdf')) {
    return (await res.blob()) as unknown as T;
  }

  return (await res.json()) as T;
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  demoSwitch: (role: string) =>
    request<AuthResponse>(`/auth/demo-switch/${role}`, { method: 'POST' }),

  // Vault
  getRules: (category?: string, search?: string) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    return request<BrandRule[]>(`/vault/rules?${params.toString()}`);
  },
  createRule: (rule: Partial<BrandRule>) =>
    request<BrandRule>('/vault/rules', { method: 'POST', body: JSON.stringify(rule) }),
  updateRule: (ruleId: string, rule: Partial<BrandRule>) =>
    request<BrandRule>(`/vault/rules/${ruleId}`, { method: 'PUT', body: JSON.stringify(rule) }),
  archiveRule: (ruleId: string) =>
    request<{ message: string }>(`/vault/rules/${ruleId}`, { method: 'DELETE' }),

  getFacts: (category?: string) => {
    const params = category ? `?category=${encodeURIComponent(category)}` : '';
    return request<ApprovedFact[]>(`/vault/facts${params}`);
  },
  createFact: (fact: Partial<ApprovedFact>) =>
    request<ApprovedFact>('/vault/facts', { method: 'POST', body: JSON.stringify(fact) }),

  getTerms: () => request<TerminologyRule[]>('/vault/terms'),
  createTerm: (term: Partial<TerminologyRule>) =>
    request<TerminologyRule>('/vault/terms', { method: 'POST', body: JSON.stringify(term) }),

  getPalettes: () => request<BrandColorPalette[]>('/vault/palettes'),
  createPalette: (pal: Partial<BrandColorPalette>) =>
    request<BrandColorPalette>('/vault/palettes', { method: 'POST', body: JSON.stringify(pal) }),

  importCsv: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request<{ message: string }>('/vault/import-csv', { method: 'POST', body: formData });
  },

  // Submissions
  getSubmissions: (statusFilter?: string) => {
    const params = statusFilter ? `?status_filter=${statusFilter}` : '';
    return request<ContentSubmission[]>(`/submissions${params}`);
  },
  getSubmission: (id: number) => request<ContentSubmission>(`/submissions/${id}`),
  createSubmission: (title: string, content_type: string, initial_content: string) =>
    request<ContentSubmission>('/submissions', {
      method: 'POST',
      body: JSON.stringify({ title, content_type, initial_content }),
    }),
  saveRevision: (submissionId: number, raw_content: string) =>
    request<ContentSubmission>(`/submissions/${submissionId}/revisions`, {
      method: 'POST',
      body: JSON.stringify({ raw_content }),
    }),
  uploadDocument: (submissionId: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request<ContentSubmission>(`/submissions/${submissionId}/upload-document`, {
      method: 'POST',
      body: formData,
    });
  },
  addComment: (submissionId: number, commentText: string, findingId?: number, revisionId?: number) =>
    request<any>(`/submissions/${submissionId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ comment_text: commentText, finding_id: findingId, revision_id: revisionId }),
    }),

  // Verification Scans & Fixes
  runScan: (submissionId: number) =>
    request<ScanResponse>(`/scans/${submissionId}`, { method: 'POST' }),
  applyFix: (findingId: number, editedFix?: string) =>
    request<ScanResponse>(`/scans/apply-fix/${findingId}`, {
      method: 'POST',
      body: JSON.stringify({ edited_fix: editedFix }),
    }),
  overrideFinding: (findingId: number, reason: string) =>
    request<Finding>(`/scans/override/${findingId}`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  // Visual Auditor
  auditVisual: (file?: File, fgHex?: string, bgHex?: string, isLarge = false) => {
    const formData = new FormData();
    if (file) formData.append('file', file);
    if (fgHex) formData.append('foreground_hex', fgHex);
    if (bgHex) formData.append('background_hex', bgHex);
    formData.append('is_large_text', String(isLarge));
    return request<any>('/visual/audit', { method: 'POST', body: formData });
  },

  // Workflow
  transitionStatus: (submissionId: number, targetStatus: string, reason?: string) =>
    request<ContentSubmission>(`/workflow/submissions/${submissionId}/transition`, {
      method: 'POST',
      body: JSON.stringify({ target_status: targetStatus, reason }),
    }),
  getAuditLog: (submissionId?: number, actionType?: string) => {
    const params = new URLSearchParams();
    if (submissionId) params.append('submission_id', String(submissionId));
    if (actionType) params.append('action_type', actionType);
    return request<AuditEvent[]>(`/workflow/audit-log?${params.toString()}`);
  },

  // Analytics & Patch Recommender
  getDashboard: () => request<DashboardStats>('/analytics/dashboard'),
  patchGuideline: (ruleId: string, newText: string, reason: string) =>
    request<BrandRule>('/analytics/patch-guideline', {
      method: 'POST',
      body: JSON.stringify({ rule_id: ruleId, new_rule_text: newText, reason }),
    }),

  // Certificates
  issueCertificate: (submissionId: number) =>
    request<ComplianceCertificate>(`/certificates/issue/${submissionId}`, { method: 'POST' }),
  getCertificate: (submissionId: number) =>
    request<ComplianceCertificate>(`/certificates/${submissionId}`),
  downloadCertificatePdf: async (submissionId: number, code: string) => {
    const blob = await request<Blob>(`/certificates/${submissionId}/pdf`);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VeriLoom_Certificate_${code}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
  verifyCertificate: (code: string) =>
    request<any>(`/certificates/verify?certificate_code=${encodeURIComponent(code)}`, { method: 'POST' }),

  // Demo Workspace
  resetDemoSeed: () => request<any>('/demo/reset-seed', { method: 'POST' }),
};
