import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertOctagon,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
  AlertTriangle,
  RotateCw,
  Sparkles,
  FileCheck2
} from 'lucide-react';
import { api } from '../services/api';
import { DashboardStats, ContentSubmission } from '../types';
import { PatchModal } from '../components/PatchModal';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [submissions, setSubmissions] = useState<ContentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePatchAlert, setActivePatchAlert] = useState<any | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashData, subs] = await Promise.all([api.getDashboard(), api.getSubmissions()]);
      setStats(dashData);
      setSubmissions(subs);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <RotateCw className="h-6 w-6 animate-spin mr-2" />
        <span>Loading governance metrics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero */}
      <div className="bg-gradient-to-r from-navy-950 via-brand-900 to-navy-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30 mb-2">
              <Sparkles className="h-3 w-3" />
              Intelligent Pre-Publication Verification
            </div>
            <h1 className="text-2xl font-bold tracking-tight">NovaTech Brand-Governance Dashboard</h1>
            <p className="text-slate-300 text-xs mt-1 max-w-xl">
              Real-time governance analytics calculated directly from stored review decisions, fact records, and verification scans.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/studio')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-white font-semibold text-xs shadow-lg shadow-brand-500/30 transition transform hover:-translate-y-0.5"
            >
              <FileCheck2 className="h-4 w-4" />
              <span>Start a Content Review</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Unclear Guideline Friction Alerts Banner (Improvement 2) */}
      {stats?.unclear_guideline_alerts && stats.unclear_guideline_alerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-amber-900">
                  Guideline Friction Detected: {stats.unclear_guideline_alerts[0].rule_id} ({stats.unclear_guideline_alerts[0].rule_title})
                </h3>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-200 text-amber-900">
                  {(stats.unclear_guideline_alerts[0].override_rate * 100).toFixed(0)}% Override Rate
                </span>
              </div>
              <p className="text-xs text-amber-800 mt-0.5">
                Reviewers have overridden this rule in {stats.unclear_guideline_alerts[0].overrides_count} of{' '}
                {stats.unclear_guideline_alerts[0].total_findings} reviews. An automated clarification patch is ready for Brand Admin review.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActivePatchAlert(stats.unclear_guideline_alerts[0])}
            className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs flex-shrink-0 transition"
          >
            Review Guideline Patch
          </button>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Total Submissions</span>
            <FileText className="h-4 w-4 text-brand-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats?.total_submissions || 0}</div>
          <p className="text-[11px] text-slate-500 mt-1">Across all draft categories</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Awaiting Review</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-600">{stats?.pending_review || 0}</div>
          <p className="text-[11px] text-slate-500 mt-1">Pending human approval</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Authorized Approvals</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">{stats?.approved || 0}</div>
          <p className="text-[11px] text-slate-500 mt-1">Issued compliance certificates</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Resolved Findings</span>
            <ShieldAlert className="h-4 w-4 text-brand-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats?.resolved_findings || 0}</div>
          <p className="text-[11px] text-slate-500 mt-1">
            {stats?.overridden_findings || 0} formal overrides recorded
          </p>
        </div>
      </div>

      {/* Breakdown Section: Category Distribution & Violated Rules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
            <span>Findings by Governance Category</span>
            <span className="text-xs font-normal text-slate-500">Live database metrics</span>
          </h3>
          <div className="space-y-3">
            {stats?.findings_by_category && stats.findings_by_category.length > 0 ? (
              stats.findings_by_category.map((cat) => (
                <div key={cat.category} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-700">{cat.category}</span>
                    <span className="font-bold text-slate-900">{cat.count} issues</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-600 rounded-full"
                      style={{
                        width: `${Math.min(100, (cat.count / (stats?.open_findings + stats?.resolved_findings + stats?.overridden_findings || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No recorded scan findings in database.</p>
            )}
          </div>
        </div>

        {/* Most Frequently Violated Rules */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
            <span>Most Frequently Violated Standards</span>
            <span className="text-xs text-brand-600 font-semibold cursor-pointer" onClick={() => navigate('/insights')}>
              View Insights &rarr;
            </span>
          </h3>
          <div className="divide-y divide-slate-100">
            {stats?.most_violated_rules && stats.most_violated_rules.length > 0 ? (
              stats.most_violated_rules.map((rule) => (
                <div key={rule.rule_id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded border border-brand-200">
                        {rule.rule_id}
                      </span>
                      <span className="text-xs font-semibold text-slate-800">{rule.title}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-0.5 block">{rule.category} standard</span>
                  </div>
                  <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    {rule.violation_count} violations
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No rule violations recorded.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Submissions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Recent Content Submissions</h3>
          <button onClick={() => navigate('/studio')} className="text-xs text-brand-600 font-semibold hover:underline">
            Open Review Studio &rarr;
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Content Title</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Revisions</th>
                <th className="px-5 py-3">Creator</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {submissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-5 py-3 font-semibold text-slate-900">{sub.title}</td>
                  <td className="px-5 py-3 text-slate-600">{sub.content_type}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        sub.current_status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : sub.current_status === 'CHANGES_REQUESTED'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : sub.current_status === 'PENDING_REVIEW'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-blue-100 text-blue-800 border border-blue-300'
                      }`}
                    >
                      {sub.current_status}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-mono text-slate-600">Rev {sub.revisions.length}</td>
                  <td className="px-5 py-3 text-slate-600">{sub.creator_name || 'Alex Chen'}</td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => navigate('/studio')}
                      className="text-xs text-brand-600 font-bold hover:text-brand-800"
                    >
                      Review &rarr;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patch Modal if Active */}
      {activePatchAlert && (
        <PatchModal
          alert={activePatchAlert}
          onClose={() => setActivePatchAlert(null)}
          onSuccess={() => {
            setActivePatchAlert(null);
            loadData();
          }}
        />
      )}
    </div>
  );
};
