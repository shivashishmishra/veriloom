import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCw,
  MessageSquare,
  FileCheck2,
  ShieldCheck,
  Award,
  ChevronRight,
  GitCompare,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { ContentSubmission, ComplianceCertificate } from '../types';
import { useAuth } from '../context/AuthContext';
import { DiffViewer } from '../components/DiffViewer';
import { CertificateModal } from '../components/CertificateModal';

export const ApprovalsPage: React.FC = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<ContentSubmission[]>([]);
  const [activeSub, setActiveSub] = useState<ContentSubmission | null>(null);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [decisionNotes, setDecisionNotes] = useState('');
  const [activeCert, setActiveCert] = useState<ComplianceCertificate | null>(null);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const data = await api.getSubmissions();
      setSubmissions(data);
      if (data.length > 0 && !activeSub) {
        // Select pending or first
        const pending = data.find((s) => s.current_status === 'PENDING_REVIEW') || data[0];
        setActiveSub(pending);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const handleStatusTransition = async (targetStatus: string) => {
    if (!activeSub) return;
    try {
      await api.transitionStatus(activeSub.id, targetStatus, decisionNotes);
      setDecisionNotes('');
      await loadSubmissions();
    } catch (err: any) {
      alert(`Approval error: ${err.message}`);
    }
  };

  const handleAddComment = async () => {
    if (!activeSub || !commentText.trim()) return;
    try {
      await api.addComment(activeSub.id, commentText.trim());
      setCommentText('');
      await loadSubmissions();
    } catch (err: any) {
      alert(`Comment failed: ${err.message}`);
    }
  };

  const handleViewCertificate = async () => {
    if (!activeSub) return;
    try {
      const cert = await api.getCertificate(activeSub.id);
      setActiveCert(cert);
    } catch (_) {
      try {
        const issued = await api.issueCertificate(activeSub.id);
        setActiveCert(issued);
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const latestRev = activeSub?.revisions[activeSub.revisions.length - 1];
  const firstRev = activeSub?.revisions[0];
  const unresolvedViolations = latestRev?.findings.filter((f) => f.status === 'Open') || [];
  const overrides = latestRev?.findings.filter((f) => f.status === 'Overridden') || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Governance Review &amp; Approval Desk</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Authorised human sign-off workflow. AI provides evidence and automated checks; authorized humans retain ultimate approval control.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Submissions Queue (4 Columns) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-2">
            Submissions Queue ({submissions.length})
          </h3>
          <div className="space-y-2">
            {submissions.map((s) => {
              const isSelected = activeSub?.id === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => setActiveSub(s)}
                  className={`p-3.5 rounded-xl border text-xs cursor-pointer transition ${
                    isSelected
                      ? 'bg-brand-50/70 border-brand-400 ring-2 ring-brand-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 truncate max-w-[190px]">{s.title}</span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        s.current_status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : s.current_status === 'PENDING_REVIEW'
                          ? 'bg-amber-100 text-amber-800'
                          : s.current_status === 'CHANGES_REQUESTED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {s.current_status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500 text-[11px] mt-2">
                    <span>{s.content_type}</span>
                    <span className="font-mono">Rev {s.revisions.length}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Decision Workstation (8 Columns) */}
        {activeSub ? (
          <div className="lg:col-span-8 space-y-5">
            {/* Active Submission Header Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">{activeSub.title}</h2>
                  <p className="text-xs text-slate-500">
                    Created by {activeSub.creator_name || 'Alex Chen'} • {activeSub.content_type}
                  </p>
                </div>
                {activeSub.current_status === 'APPROVED' ? (
                  <button
                    onClick={handleViewCertificate}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
                  >
                    <Award className="h-4 w-4 text-amber-300" />
                    <span>View Compliance Certificate</span>
                  </button>
                ) : (
                  <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                    Awaiting Human Review
                  </span>
                )}
              </div>

              {/* Status & Unresolved Violations Alert */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-medium">Open Unresolved Violations:</span>
                  <p
                    className={`text-lg font-bold ${
                      unresolvedViolations.length > 0 ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    {unresolvedViolations.length} issue(s)
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-medium">Documented Formal Overrides:</span>
                  <p className="text-lg font-bold text-amber-700">{overrides.length} override(s)</p>
                </div>
              </div>

              {/* Reviewer Action Bar */}
              {(user?.role === 'Reviewer' || user?.role === 'Brand Admin') && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <label className="text-xs font-bold text-slate-700 block">
                    Reviewer Decision Justification / Feedback Note:
                  </label>
                  <textarea
                    value={decisionNotes}
                    onChange={(e) => setDecisionNotes(e.target.value)}
                    placeholder="Enter formal approval commentary or change instructions..."
                    rows={2}
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500"
                  />
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => handleStatusTransition('CHANGES_REQUESTED')}
                      className="px-4 py-2 rounded-lg bg-rose-50 text-rose-800 hover:bg-rose-100 font-semibold text-xs border border-rose-200 transition"
                    >
                      Request Changes
                    </button>
                    <button
                      onClick={() => handleStatusTransition('APPROVED')}
                      disabled={unresolvedViolations.length > 0}
                      className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs disabled:opacity-40 transition"
                      title={
                        unresolvedViolations.length > 0
                          ? 'All critical violations must be resolved or formally overridden before approval.'
                          : 'Grant approval and issue compliance certificate.'
                      }
                    >
                      Grant Final Approval
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Version Diff Viewer if Multiple Revisions */}
            {activeSub.revisions.length > 1 && (
              <DiffViewer
                originalText={firstRev?.raw_content || ''}
                revisedText={latestRev?.raw_content || ''}
                originalRevNum={firstRev?.revision_number || 1}
                revisedRevNum={latestRev?.revision_number || 2}
              />
            )}

            {/* Inline Reviewer Comments Thread */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-brand-600" />
                <span>Governance Review Comments &amp; Discussion ({activeSub.comments.length})</span>
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {activeSub.comments.map((c) => (
                  <div key={c.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span className="font-bold text-slate-700">{c.author_name || 'Reviewer'}</span>
                      <span>{new Date(c.created_at).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-slate-800">{c.comment_text}</p>
                  </div>
                ))}
              </div>

              {/* Add Comment input */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Type an inline feedback comment..."
                  className="flex-1 p-2 rounded-lg border border-slate-300 text-xs"
                />
                <button
                  onClick={handleAddComment}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 bg-white p-16 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
            Select a submission from the queue to review evidence and decisions.
          </div>
        )}
      </div>

      {activeCert && <CertificateModal certificate={activeCert} onClose={() => setActiveCert(null)} />}
    </div>
  );
};
