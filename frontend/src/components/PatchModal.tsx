import React, { useState } from 'react';
import { UnclearGuidelineAlert } from '../types';
import { api } from '../services/api';
import { Wrench, CheckCircle2, AlertTriangle, X, ShieldAlert, ArrowRight } from 'lucide-react';

interface PatchModalProps {
  alert: UnclearGuidelineAlert;
  onClose: () => void;
  onSuccess: () => void;
}

export const PatchModal: React.FC<PatchModalProps> = ({ alert, onClose, onSuccess }) => {
  const [proposedText, setProposedText] = useState(alert.suggested_patch_wording);
  const [reason, setReason] = useState(
    `Rule override rate of ${(alert.override_rate * 100).toFixed(0)}% exceeded 40% threshold. Disambiguating scope based on reviewer comments.`
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApply = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await api.patchGuideline(alert.rule_id, proposedText, reason);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to apply guideline amendment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                Improvement 2 • Guideline-Patch Recommender
              </span>
              <h3 className="text-base font-bold text-slate-900">
                Amend Guideline: {alert.rule_id} ({alert.rule_title})
              </h3>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Override Evidence Summary */}
        <div className="bg-amber-50/70 border border-amber-200 p-3.5 rounded-xl text-xs space-y-2">
          <div className="flex items-center justify-between font-semibold text-amber-900">
            <span>Friction Detection Metrics:</span>
            <span>
              Overrides: {alert.overrides_count}/{alert.total_findings} ({(alert.override_rate * 100).toFixed(0)}% Rate)
            </span>
          </div>
          <p className="text-slate-700">
            <strong className="text-slate-900">Reviewer Feedback:</strong>{' '}
            {alert.reviewer_comments.length > 0
              ? `"${alert.reviewer_comments.join('; ')}"`
              : 'Reviewers repeatedly override this standard due to contextual ambiguity.'}
          </p>
          <p className="text-[11px] text-amber-800 leading-snug">
            <strong>Rationale:</strong> {alert.patch_rationale}
          </p>
        </div>

        {/* Original vs Proposed Wording Comparison */}
        <div className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-slate-600 block mb-1">Current Ambiguous Guideline Text:</label>
            <div className="p-2.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 font-mono text-[11px]">
              {alert.original_text}
            </div>
          </div>

          <div>
            <label className="font-bold text-brand-800 block mb-1">
              Proposed Disambiguated Guideline Wording (Editable):
            </label>
            <textarea
              value={proposedText}
              onChange={(e) => setProposedText(e.target.value)}
              rows={4}
              className="w-full p-2.5 rounded-lg border border-brand-300 focus:ring-2 focus:ring-brand-500 font-mono text-[11px] text-slate-900"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-600 block mb-1">Audit Justification Reason:</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-300 text-xs"
            />
          </div>
        </div>

        {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={submitting || !proposedText.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition disabled:opacity-50"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>{submitting ? 'Applying Amendment...' : 'Accept & Publish New Version'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
