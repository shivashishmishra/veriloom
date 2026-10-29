import React, { useEffect, useState } from 'react';
import {
  FileText,
  Play,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  GitCompare,
  ArrowRight,
  BookOpen,
  Wrench,
  Check,
  X,
  FileCheck2,
  Clock,
  Sparkles,
  Upload,
  Download,
  Award,
  Plus
} from 'lucide-react';
import { api } from '../services/api';
import { ContentSubmission, ContentRevision, Finding, DeltaScanStats, ComplianceCertificate } from '../types';
import { useAuth } from '../context/AuthContext';
import { DiffViewer } from '../components/DiffViewer';
import { CertificateModal } from '../components/CertificateModal';

export const ReviewStudioPage: React.FC = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<ContentSubmission[]>([]);
  const [activeSub, setActiveSub] = useState<ContentSubmission | null>(null);
  const [activeRev, setActiveRev] = useState<ContentRevision | null>(null);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);

  // Studio Modes & State
  const [viewMode, setViewMode] = useState<'annotated' | 'diff' | 'editor'>('annotated');
  const [editedText, setEditedText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [scanning, setScanning] = useState(false);
  const [deltaStats, setDeltaStats] = useState<DeltaScanStats | null>(null);
  const [showDeltaBanner, setShowDeltaBanner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fix Editing & Overrides
  const [editingFixId, setEditingFixId] = useState<number | null>(null);
  const [customFixText, setCustomFixText] = useState('');
  const [overrideModalFinding, setOverrideModalFinding] = useState<Finding | null>(null);
  const [overrideReason, setOverrideReason] = useState('');

  // Certificate Modal
  const [activeCertificate, setActiveCertificate] = useState<ComplianceCertificate | null>(null);

  // New Draft & Upload Modal State
  const [showNewDraftModal, setShowNewDraftModal] = useState(false);
  const [newDraftTitle, setNewDraftTitle] = useState('');
  const [newDraftType, setNewDraftType] = useState('Launch Copy');
  const [newDraftTab, setNewDraftTab] = useState<'text' | 'file'>('text');
  const [newDraftText, setNewDraftText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadSubmitting, setUploadSubmitting] = useState(false);

  // Load submissions
  const loadSubmissions = async (preferredId?: number) => {
    setLoading(true);
    try {
      const data = await api.getSubmissions();
      setSubmissions(data);
      if (data.length > 0) {
        const target = preferredId ? data.find((s) => s.id === preferredId) || data[0] : data[0];
        setActiveSub(target);
        if (target.revisions && target.revisions.length > 0) {
          const latestRev = target.revisions[target.revisions.length - 1];
          setActiveRev(latestRev);
          setEditedText(latestRev.raw_content);
          if (latestRev.findings.length > 0) {
            setSelectedFinding(latestRev.findings[0]);
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  // When active submission changes
  const handleSelectSubmission = (subId: number) => {
    const found = submissions.find((s) => s.id === subId);
    if (found) {
      setActiveSub(found);
      const latestRev = found.revisions[found.revisions.length - 1];
      setActiveRev(latestRev);
      setEditedText(latestRev?.raw_content || '');
      setSelectedFinding(latestRev?.findings[0] || null);
      setDeltaStats(null);
    }
  };

  // Create or Upload New Draft
  const handleCreateNewDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDraftTitle.trim()) {
      alert('Please provide a document title.');
      return;
    }

    setUploadSubmitting(true);
    try {
      let contentToUse = newDraftText.trim();
      let createdSub: ContentSubmission | null = null;

      if (newDraftTab === 'file' && selectedFile) {
        const lowerName = selectedFile.name.toLowerCase();
        if (
          lowerName.endsWith('.txt') ||
          lowerName.endsWith('.md') ||
          lowerName.endsWith('.markdown') ||
          lowerName.endsWith('.html') ||
          lowerName.endsWith('.htm')
        ) {
          contentToUse = await selectedFile.text();
          createdSub = await api.createSubmission(newDraftTitle.trim(), newDraftType, contentToUse);
        } else {
          createdSub = await api.createSubmission(
            newDraftTitle.trim(),
            newDraftType,
            `Uploaded file: ${selectedFile.name}`
          );
          try {
            await api.uploadDocument(createdSub.id, selectedFile);
          } catch (uploadErr) {
            console.warn('Backend document extraction failed or running in static mode:', uploadErr);
          }
        }
      } else {
        if (!contentToUse) {
          alert('Please enter or paste the draft content.');
          setUploadSubmitting(false);
          return;
        }
        createdSub = await api.createSubmission(newDraftTitle.trim(), newDraftType, contentToUse);
      }

      if (createdSub) {
        setShowNewDraftModal(false);
        setNewDraftTitle('');
        setNewDraftText('');
        setSelectedFile(null);
        await loadSubmissions(createdSub.id);
        // Automatically run verification scan on the new draft!
        await api.runScan(createdSub.id);
        await loadSubmissions(createdSub.id);
      }
    } catch (err: any) {
      alert(`Failed to create draft: ${err.message}`);
    } finally {
      setUploadSubmitting(false);
    }
  };

  // Run Hybrid Verification Scan
  const handleRunScan = async () => {
    if (!activeSub) return;
    setScanning(true);
    try {
      const scanRes = await api.runScan(activeSub.id);
      if (scanRes.delta_stats) {
        setDeltaStats(scanRes.delta_stats);
        setShowDeltaBanner(true);
      }
      // Refresh current submission to load newly created findings
      await loadSubmissions(activeSub.id);
    } catch (err: any) {
      alert(`Scan failed: ${err.message}`);
    } finally {
      setScanning(false);
    }
  };

  // Apply Intent-Preserving Fix (Check 6)
  const handleApplyFix = async (findingId: number, customText?: string) => {
    try {
      const res = await api.applyFix(findingId, customText);
      setEditingFixId(null);
      // Reload submission with new revision
      await loadSubmissions(activeSub?.id);
      if (res.delta_stats) {
        setDeltaStats(res.delta_stats);
        setShowDeltaBanner(true);
      }
    } catch (err: any) {
      alert(`Failed to apply fix: ${err.message}`);
    }
  };

  // Override Finding (Reviewer)
  const handleConfirmOverride = async () => {
    if (!overrideModalFinding || !overrideReason.trim()) return;
    try {
      await api.overrideFinding(overrideModalFinding.id, overrideReason.trim());
      setOverrideModalFinding(null);
      setOverrideReason('');
      await loadSubmissions(activeSub?.id);
    } catch (err: any) {
      alert(`Failed to override finding: ${err.message}`);
    }
  };

  // Transition Submission Status
  const handleTransition = async (targetStatus: string, reason?: string) => {
    if (!activeSub) return;
    try {
      await api.transitionStatus(activeSub.id, targetStatus, reason);
      await loadSubmissions(activeSub.id);
    } catch (err: any) {
      alert(`Status transition error: ${err.message}`);
    }
  };

  // View Certificate
  const handleViewCertificate = async () => {
    if (!activeSub) return;
    try {
      const cert = await api.getCertificate(activeSub.id);
      setActiveCertificate(cert);
    } catch (_) {
      // If not yet issued, try issuing if current user is Reviewer/Admin
      if (activeSub.current_status === 'APPROVED') {
        try {
          const issued = await api.issueCertificate(activeSub.id);
          setActiveCertificate(issued);
        } catch (err: any) {
          alert(`Certificate generation error: ${err.message}`);
        }
      } else {
        alert('Compliance Certificate is issued only after authorized human approval (status APPROVED).');
      }
    }
  };

  // Filter findings
  const findings = activeRev?.findings || [];
  const filteredFindings = findings.filter((f) => {
    if (categoryFilter === 'ALL') return true;
    if (categoryFilter === 'OPEN') return f.status === 'Open' || f.status === 'Needs Human Review';
    if (categoryFilter === 'RESOLVED') return f.status === 'Resolved';
    if (categoryFilter === 'OVERRIDDEN') return f.status === 'Overridden';
    return f.category.toUpperCase() === categoryFilter;
  });

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Top Studio Control Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Left: Submission & Revision Selectors */}
        <div className="flex items-center gap-3">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              Draft Document
            </label>
            <select
              value={activeSub?.id || ''}
              onChange={(e) => handleSelectSubmission(Number(e.target.value))}
              className="font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-brand-500"
            >
              {submissions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} ({s.current_status})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowNewDraftModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 mt-3.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold text-xs border border-brand-200 transition shadow-2xs"
            title="Create new draft or upload document (.pdf, .docx, .md, .txt, .html)"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>+ New Draft / Upload</span>
          </button>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              Revision
            </label>
            <select
              value={activeRev?.id || ''}
              onChange={(e) => {
                const r = activeSub?.revisions.find((rev) => rev.id === Number(e.target.value));
                if (r) {
                  setActiveRev(r);
                  setEditedText(r.raw_content);
                }
              }}
              className="font-mono text-slate-800 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs"
            >
              {activeSub?.revisions.map((r) => (
                <option key={r.id} value={r.id}>
                  Rev {r.revision_number} ({r.findings.length} findings)
                </option>
              ))}
            </select>
          </div>

          <div className="pl-2 border-l border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              Status
            </span>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeSub?.current_status === 'APPROVED'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : activeSub?.current_status === 'PENDING_REVIEW'
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : activeSub?.current_status === 'CHANGES_REQUESTED'
                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                  : 'bg-blue-100 text-blue-800 border border-blue-300'
              }`}
            >
              {activeSub?.current_status || 'DRAFT'}
            </span>
          </div>
        </div>

        {/* Right: Studio Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Run Scan Button */}
          <button
            onClick={handleRunScan}
            disabled={scanning}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-xs transition disabled:opacity-50"
          >
            {scanning ? <RotateCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-white" />}
            <span>{scanning ? 'Scanning 6 Checks...' : 'Run Hybrid Scan'}</span>
          </button>

          {/* Creator Submit for Review */}
          {user?.role === 'Creator' && activeSub?.current_status !== 'PENDING_REVIEW' && activeSub?.current_status !== 'APPROVED' && (
            <button
              onClick={() => handleTransition('PENDING_REVIEW')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition"
            >
              <Clock className="h-4 w-4" />
              <span>Submit for Review</span>
            </button>
          )}

          {/* Reviewer / Admin Actions */}
          {(user?.role === 'Reviewer' || user?.role === 'Brand Admin') && (
            <>
              {activeSub?.current_status !== 'APPROVED' && (
                <button
                  onClick={() => handleTransition('APPROVED')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Grant Human Approval</span>
                </button>
              )}
              {activeSub?.current_status === 'APPROVED' && (
                <button
                  onClick={handleViewCertificate}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-brand-700 to-indigo-700 text-white font-semibold text-xs shadow-sm transition"
                >
                  <Award className="h-4 w-4 text-amber-300" />
                  <span>View Compliance Certificate</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delta Scan Banner (Improvement 1) */}
      {showDeltaBanner && deltaStats && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 flex items-center justify-between text-xs text-indigo-950 animate-fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-brand-600 flex-shrink-0" />
            <span>
              <strong>SHA-256 Delta Scan Complete:</strong> {deltaStats.total_paragraphs} paragraphs analyzed in{' '}
              {deltaStats.scan_duration_ms}ms.{' '}
              {deltaStats.unchanged_paragraphs > 0
                ? `${deltaStats.unchanged_paragraphs} unchanged paragraph(s) reused ${deltaStats.cached_findings_reused} cached finding(s); ${deltaStats.modified_paragraphs} paragraph(s) rescanned.`
                : 'Full baseline scan executed against Brand Truth Vault.'}
            </span>
          </div>
          <button onClick={() => setShowDeltaBanner(false)} className="text-slate-400 hover:text-slate-700">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Main Split-Pane Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT PANE: Document Draft & Span Annotator (7 Columns) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Subheader Tabs */}
          <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setViewMode('annotated')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                  viewMode === 'annotated'
                    ? 'bg-white text-brand-700 shadow-xs border border-slate-200'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Annotated Draft
              </button>
              <button
                onClick={() => setViewMode('diff')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                  viewMode === 'diff'
                    ? 'bg-white text-brand-700 shadow-xs border border-slate-200'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Revision Diff
              </button>
              <button
                onClick={() => setViewMode('editor')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                  viewMode === 'editor'
                    ? 'bg-white text-brand-700 shadow-xs border border-slate-200'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Edit Raw Text
              </button>
            </div>

            <div className="text-[11px] font-mono text-slate-500 truncate max-w-[200px]">
              SHA-256: {activeRev?.file_sha256?.substring(0, 12)}...
            </div>
          </div>

          {/* Pane Content */}
          <div className="p-5 min-h-[500px]">
            {viewMode === 'annotated' && (
              <div className="space-y-4">
                {activeRev?.raw_content
                  .split('\n\n')
                  .filter((p) => p.trim())
                  .map((paraText, pIdx) => {
                    // Check if this paragraph has findings
                    const paraFindings = findings.filter((f) => f.paragraph_index === pIdx);

                    return (
                      <div
                        key={pIdx}
                        className={`p-3.5 rounded-xl border text-xs leading-relaxed transition ${
                          paraFindings.length > 0
                            ? 'bg-slate-50/60 border-slate-300'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1.5">
                          <span>Paragraph {pIdx + 1}</span>
                          {paraFindings.length > 0 && (
                            <span className="font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                              {paraFindings.length} issue(s) detected
                            </span>
                          )}
                        </div>

                        {/* Text rendering with highlighted problematic spans */}
                        <p className="text-slate-800 text-sm leading-relaxed font-sans">
                          {renderAnnotatedParagraph(paraText, paraFindings, (f) => setSelectedFinding(f))}
                        </p>
                      </div>
                    );
                  })}
              </div>
            )}

            {viewMode === 'diff' && (
              <div>
                {activeSub && activeSub.revisions.length > 1 ? (
                  <DiffViewer
                    originalText={activeSub.revisions[0].raw_content}
                    revisedText={activeRev?.raw_content || ''}
                    originalRevNum={activeSub.revisions[0].revision_number}
                    revisedRevNum={activeRev?.revision_number || 1}
                  />
                ) : (
                  <div className="text-center py-16 text-slate-400 text-xs">
                    <GitCompare className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                    <p>Only 1 revision exists for this submission.</p>
                    <p className="mt-1">Apply a suggested fix to generate Revision 2 and compare side-by-side!</p>
                  </div>
                )}
              </div>
            )}

            {viewMode === 'editor' && (
              <div className="space-y-3">
                <textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  rows={14}
                  className="w-full p-3 font-mono text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500"
                />
                <button
                  onClick={async () => {
                    if (!activeSub) return;
                    await api.saveRevision(activeSub.id, editedText);
                    await loadSubmissions(activeSub.id);
                    setViewMode('annotated');
                  }}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  Save as New Revision &amp; Rescan
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANE: Findings, Source Evidence & Intent-Preserving Fixes (5 Columns) */}
        <div className="lg:col-span-5 space-y-3">
          {/* Category Filter Tabs */}
          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-1 overflow-x-auto text-xs">
            {['ALL', 'Fact', 'Terminology', 'Tone', 'Accessibility'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition whitespace-nowrap ${
                  categoryFilter === cat
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Findings List */}
          <div className="space-y-3 max-h-[750px] overflow-y-auto pr-1">
            {filteredFindings.length === 0 ? (
              <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
                <p className="font-semibold text-slate-700">No findings matching active filter.</p>
                <p className="mt-1">Content conforms to configured brand standards.</p>
              </div>
            ) : (
              filteredFindings.map((f) => {
                const isSelected = selectedFinding?.id === f.id;
                const isResolved = f.status === 'Resolved';
                const isOverridden = f.status === 'Overridden';

                return (
                  <div
                    key={f.id}
                    onClick={() => setSelectedFinding(f)}
                    className={`bg-white rounded-xl border transition p-4 cursor-pointer shadow-xs ${
                      isSelected
                        ? 'border-brand-500 ring-2 ring-brand-500/20 shadow-md'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Finding Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            f.severity === 'Violation'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {f.severity}
                        </span>
                        <span className="text-xs font-bold text-slate-700">{f.category}</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isResolved
                            ? 'bg-emerald-100 text-emerald-800'
                            : isOverridden
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {f.status}
                      </span>
                    </div>

                    {/* Flagged Text */}
                    <div className="mb-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Flagged Content</span>
                      <p className="font-mono text-xs font-bold text-rose-700 bg-rose-50/70 px-2 py-1 rounded border border-rose-200 inline-block">
                        "{f.flagged_text}"
                      </p>
                    </div>

                    {/* Explanation */}
                    <p className="text-xs text-slate-700 leading-relaxed mb-3">{f.explanation}</p>

                    {/* Grounded Source Evidence Card */}
                    {f.source_quote && (
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 mb-3 text-xs">
                        <div className="flex items-center justify-between text-[10px] font-bold text-brand-700 mb-1">
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            Approved Vault Evidence: Clause {f.rule_clause_id || 'STD'}
                          </span>
                          <span className="text-slate-400 font-normal">
                            {f.source_document || 'Brand Truth Vault'} (p. {f.source_page || 1})
                          </span>
                        </div>
                        <p className="font-mono text-[11px] text-slate-800 italic bg-white p-1.5 rounded border border-slate-200 leading-snug">
                          "{f.source_quote}"
                        </p>
                      </div>
                    )}

                    {/* Suggested Intent-Preserving Fix (Check 6) */}
                    {f.suggested_fix && !isResolved && (
                      <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-2.5 mb-3 text-xs">
                        <div className="flex items-center justify-between text-[10px] font-bold text-emerald-800 mb-1">
                          <span className="flex items-center gap-1">
                            <Wrench className="h-3 w-3" />
                            Suggested Intent-Preserving Fix:
                          </span>
                          <span className="text-[10px] font-mono text-emerald-700">
                            Confidence: {f.confidence_score} ({f.confidence_type})
                          </span>
                        </div>
                        {editingFixId === f.id ? (
                          <div className="space-y-1.5">
                            <input
                              type="text"
                              value={customFixText}
                              onChange={(e) => setCustomFixText(e.target.value)}
                              className="w-full p-1.5 rounded border border-emerald-400 text-xs font-mono"
                            />
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => setEditingFixId(null)}
                                className="px-2 py-0.5 text-[10px] border rounded bg-white"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleApplyFix(f.id, customFixText)}
                                className="px-2.5 py-0.5 text-[10px] font-bold bg-emerald-700 text-white rounded"
                              >
                                Apply Edited
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="font-mono text-xs font-bold text-emerald-900 bg-white p-1 rounded border border-emerald-200">
                            {f.suggested_fix}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      {f.suggested_fix && !isResolved && editingFixId !== f.id && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApplyFix(f.id);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] shadow-xs transition"
                          >
                            <Check className="h-3 w-3" />
                            <span>Apply Fix</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingFixId(f.id);
                              setCustomFixText(f.suggested_fix || '');
                            }}
                            className="px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-100 rounded border border-slate-200"
                          >
                            Edit
                          </button>
                        </div>
                      )}

                      {/* Reviewer Override Action */}
                      {(user?.role === 'Reviewer' || user?.role === 'Brand Admin') && !isResolved && !isOverridden && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOverrideModalFinding(f);
                          }}
                          className="ml-auto text-[11px] font-semibold text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded border border-amber-200 transition"
                        >
                          Override with Reason...
                        </button>
                      )}

                      {isOverridden && (
                        <div className="text-[11px] text-slate-500 italic">
                          Override justification: "{f.override_reason}"
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Reviewer Override Modal */}
      {overrideModalFinding && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-600" />
                <span>Formal Finding Override</span>
              </h3>
              <button onClick={() => setOverrideModalFinding(null)} className="text-slate-400 hover:text-slate-700">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Overriding finding <strong>"{overrideModalFinding.flagged_text}"</strong> requires an authenticated justification reason recorded in the permanent audit trail.
            </p>
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Mandatory Override Reason:
              </label>
              <textarea
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                rows={3}
                placeholder="e.g. Approved grandfathered rate under partner contract schedule 4.1"
                className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setOverrideModalFinding(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmOverride}
                disabled={overrideReason.trim().length < 5}
                className="px-4 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg disabled:opacity-40 transition"
              >
                Confirm Override
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Content Draft & Multi-Format Upload */}
      {showNewDraftModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">New Content Draft &amp; Document Upload</h3>
                  <p className="text-[11px] text-slate-500">Supports PDF, DOCX, Markdown, HTML, and TXT drafts</p>
                </div>
              </div>
              <button onClick={() => setShowNewDraftModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewDraft} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Document Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newDraftTitle}
                  onChange={(e) => setNewDraftTitle(e.target.value)}
                  placeholder="e.g. Q4 Global Product Launch Announcement"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Content Type</label>
                <select
                  value={newDraftType}
                  onChange={(e) => setNewDraftType(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-brand-500"
                >
                  <option value="Launch Copy">Launch Copy</option>
                  <option value="Whitepaper">Whitepaper</option>
                  <option value="Press Release">Press Release</option>
                  <option value="Email">Customer Email</option>
                  <option value="Blog Post">Blog Post</option>
                  <option value="Product Documentation">Product Documentation</option>
                </select>
              </div>

              {/* Input Mode Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <button
                  type="button"
                  onClick={() => setNewDraftTab('text')}
                  className={`px-3 py-1 text-xs rounded-md font-semibold transition ${
                    newDraftTab === 'text' ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  📝 Paste / Write Draft
                </button>
                <button
                  type="button"
                  onClick={() => setNewDraftTab('file')}
                  className={`px-3 py-1 text-xs rounded-md font-semibold transition ${
                    newDraftTab === 'file' ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  📁 Upload Document (.pdf, .docx, .md, .txt, .html)
                </button>
              </div>

              {newDraftTab === 'text' ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">Draft Body</label>
                    <button
                      type="button"
                      onClick={() => {
                        setNewDraftTitle('NovaTech Q4 Cloud Launch Announcement');
                        setNewDraftText(
                          'We are thrilled to announce NovaCloud Enterprise! For only $79 per user/month, companies can leverage unprecedented synergy across distributed teams. Our game-changer platform provides a cheap way to ensure 100% cloud reliability.'
                        );
                      }}
                      className="text-[11px] font-semibold text-brand-600 hover:underline"
                    >
                      Load Sample Faulty Draft
                    </button>
                  </div>
                  <textarea
                    rows={5}
                    value={newDraftText}
                    onChange={(e) => setNewDraftText(e.target.value)}
                    placeholder="Enter or paste your text draft..."
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 font-mono"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">Select Document File</label>
                  <div className="border-2 border-dashed border-slate-300 hover:border-brand-400 rounded-xl p-4 text-center cursor-pointer relative bg-slate-50 hover:bg-slate-100/50 transition">
                    <input
                      type="file"
                      accept=".pdf,.docx,.md,.markdown,.txt,.html,.htm"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 10 * 1024 * 1024) {
                            alert('File exceeds 10 MB limit.');
                            return;
                          }
                          setSelectedFile(file);
                          if (!newDraftTitle) {
                            setNewDraftTitle(file.name.replace(/\.[^/.]+$/, ''));
                          }
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <Upload className="h-6 w-6 text-slate-400 mx-auto mb-1.5" />
                    <p className="text-xs font-semibold text-slate-700">
                      {selectedFile ? selectedFile.name : 'Click or drag document to upload'}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {selectedFile
                        ? `${(selectedFile.size / 1024).toFixed(1)} KB`
                        : 'PDF, DOCX, Markdown, HTML, TXT (up to 10 MB)'}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowNewDraftModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadSubmitting}
                  className="px-4 py-1.5 text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-lg shadow-xs transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {uploadSubmitting && <RotateCw className="h-3.5 w-3.5 animate-spin" />}
                  <span>{uploadSubmitting ? 'Processing...' : 'Create & Scan Draft'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {activeCertificate && (
        <CertificateModal certificate={activeCertificate} onClose={() => setActiveCertificate(null)} />
      )}
    </div>
  );
};

// Helper function to highlight problematic spans inside paragraphs
function renderAnnotatedParagraph(
  text: string,
  findings: Finding[],
  onSelectFinding: (f: Finding) => void
) {
  if (findings.length === 0) return text;

  // Find occurrences of flagged texts
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyIdx = 0;

  for (const f of findings) {
    if (!f.flagged_text || !remaining.includes(f.flagged_text)) continue;

    const idx = remaining.indexOf(f.flagged_text);
    if (idx > 0) {
      parts.push(remaining.substring(0, idx));
    }

    parts.push(
      <span
        key={keyIdx++}
        onClick={() => onSelectFinding(f)}
        className={`px-1.5 py-0.5 rounded cursor-pointer font-semibold transition border ${
          f.severity === 'Violation'
            ? 'bg-rose-100 text-rose-900 border-rose-300 hover:bg-rose-200'
            : f.severity === 'Warning'
            ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
            : 'bg-cyan-100 text-cyan-900 border-cyan-300 hover:bg-cyan-200'
        }`}
        title={`${f.category}: ${f.explanation}`}
      >
        {f.flagged_text}
      </span>
    );

    remaining = remaining.substring(idx + f.flagged_text.length);
  }

  if (remaining) {
    parts.push(remaining);
  }

  return parts;
}
