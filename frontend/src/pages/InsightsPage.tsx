import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Wrench,
  CheckCircle2,
  FileText,
  RotateCw,
  Sparkles,
  ShieldCheck,
  Percent
} from 'lucide-react';
import { api } from '../services/api';
import { DashboardStats, UnclearGuidelineAlert } from '../types';
import { PatchModal } from '../components/PatchModal';

export const InsightsPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePatchAlert, setActivePatchAlert] = useState<UnclearGuidelineAlert | null>(null);

  const loadInsights = async () => {
    setLoading(true);
    try {
      const data = await api.getDashboard();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <BarChart3 className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Governance Insights &amp; Guideline Friction Analysis</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Detects recurring compliance friction and statistically anomalous override rates to continuously improve brand standards.
          </p>
        </div>
      </div>

      {/* Guideline-Friction Analysis (Improvement 2) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Improvement 2: Interactive Guideline-Patch Recommender
              </h2>
              <p className="text-xs text-slate-500">
                Standards exceeding 40% reviewer override threshold are flagged for clarification.
              </p>
            </div>
          </div>
        </div>

        {stats?.unclear_guideline_alerts && stats.unclear_guideline_alerts.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {stats.unclear_guideline_alerts.map((alert) => (
              <div
                key={alert.rule_id}
                className="bg-amber-50/60 border border-amber-200 rounded-xl p-5 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-amber-900 bg-amber-200/80 px-2.5 py-0.5 rounded border border-amber-300">
                      {alert.rule_id}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">{alert.rule_title}</h3>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                      {(alert.override_rate * 100).toFixed(0)}% Override Rate
                    </span>
                  </div>

                  <button
                    onClick={() => setActivePatchAlert(alert)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                  >
                    <Wrench className="h-3.5 w-3.5" />
                    <span>Review &amp; Apply Guideline Patch</span>
                  </button>
                </div>

                {/* Evidence Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-white p-3.5 rounded-lg border border-amber-200/80">
                  <div>
                    <span className="text-slate-500 font-medium">Total Detected Findings:</span>
                    <p className="font-bold text-slate-900 text-sm">{alert.total_findings}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Reviewer Overrides:</span>
                    <p className="font-bold text-amber-700 text-sm">{alert.overrides_count}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Statistical Sample:</span>
                    <p className="font-bold text-emerald-700 text-sm">
                      Adequate (&ge; 2 recorded reviews)
                    </p>
                  </div>
                </div>

                {/* Original Rule vs Reviewer Comments */}
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-bold text-slate-700 block mb-0.5">Current Official Guideline:</span>
                    <p className="font-mono text-slate-700 bg-white p-2 rounded border border-slate-200 text-[11px]">
                      "{alert.original_text}"
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 block mb-0.5">Documented Reviewer Feedback:</span>
                    <p className="text-slate-600 italic bg-white p-2 rounded border border-slate-200 text-[11px]">
                      {alert.reviewer_comments.length > 0
                        ? `"${alert.reviewer_comments.join('"; "')}"`
                        : 'Reviewers routinely override this standard in legitimate business cases.'}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-amber-100/60 rounded-lg text-xs text-amber-950 font-medium">
                  <strong>Recommended Next Step:</strong> {alert.patch_rationale}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
            <p className="font-semibold text-slate-700">No Guideline Friction Detected.</p>
            <p className="mt-1">All brand guidelines are currently within acceptable compliance tolerance levels (&lt; 40% override rate).</p>
          </div>
        )}
      </div>

      {/* Override Rate by Standard */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Standard Violation &amp; Override Frequency</h3>
        <div className="divide-y divide-slate-100 text-xs">
          {stats?.most_violated_rules.map((rule) => (
            <div key={rule.rule_id} className="py-3 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-brand-700">{rule.rule_id}</span>
                  <span className="font-semibold text-slate-800">{rule.title}</span>
                </div>
                <span className="text-[11px] text-slate-500">{rule.category} Category</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-700">{rule.violation_count} Total Violations</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {activePatchAlert && (
        <PatchModal
          alert={activePatchAlert}
          onClose={() => setActivePatchAlert(null)}
          onSuccess={() => {
            setActivePatchAlert(null);
            loadInsights();
          }}
        />
      )}
    </div>
  );
};
