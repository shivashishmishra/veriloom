import React, { useEffect, useState } from 'react';
import { History, Search, ShieldCheck, Filter, RotateCw } from 'lucide-react';
import { api } from '../services/api';
import { AuditEvent } from '../types';

export const AuditLogPage: React.FC = () => {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [filterAction, setFilterAction] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await api.getAuditLog(undefined, filterAction || undefined);
      setEvents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [filterAction]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <History className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Immutable Governance Audit Log</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Append-only historical trail of all scan runs, override reasons, guideline amendments, and authorization events.
          </p>
        </div>

        {/* Filter Action */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="text-xs p-2 rounded-lg border border-slate-300 bg-slate-50 font-medium"
          >
            <option value="">All Governance Actions</option>
            <option value="SUBMISSION_CREATED">SUBMISSION_CREATED</option>
            <option value="SCAN_EXECUTED">SCAN_EXECUTED</option>
            <option value="FIX_APPLIED">FIX_APPLIED</option>
            <option value="STATUS_CHANGED">STATUS_CHANGED</option>
            <option value="FINDING_OVERRIDDEN">FINDING_OVERRIDDEN</option>
            <option value="RULE_PATCHED">RULE_PATCHED</option>
            <option value="CERTIFICATE_ISSUED">CERTIFICATE_ISSUED</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
            <tr>
              <th className="px-5 py-3">Timestamp (UTC)</th>
              <th className="px-5 py-3">Acting User</th>
              <th className="px-5 py-3">Action Type</th>
              <th className="px-5 py-3">Submission / Target</th>
              <th className="px-5 py-3">Outcome</th>
              <th className="px-5 py-3">Justification Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {events.map((e) => (
              <tr key={e.id} className="hover:bg-slate-50/60 transition">
                <td className="px-5 py-3 font-mono text-slate-600">
                  {new Date(e.timestamp).toLocaleString()}
                </td>
                <td className="px-5 py-3 font-semibold text-slate-800">{e.user_name || 'System Engine'}</td>
                <td className="px-5 py-3">
                  <span
                    className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      e.action_type.includes('OVERRIDDEN')
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : e.action_type.includes('CERTIFICATE')
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : e.action_type.includes('PATCHED')
                        ? 'bg-purple-100 text-purple-900 border border-purple-300'
                        : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    {e.action_type}
                  </span>
                </td>
                <td className="px-5 py-3 text-slate-600 font-mono">
                  {e.submission_id ? `Sub #${e.submission_id}` : e.rule_id || 'System'}
                </td>
                <td className="px-5 py-3 font-semibold text-slate-700">{e.outcome}</td>
                <td className="px-5 py-3 text-slate-600 italic max-w-xs truncate">
                  {e.reason ? `"${e.reason}"` : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
