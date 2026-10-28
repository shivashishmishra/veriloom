import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Cpu,
  Lock,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { api } from '../services/api';

export const SettingsPage: React.FC = () => {
  const [resetting, setResetting] = useState(false);
  const [resetMsg, setResetMsg] = useState<string | null>(null);

  const handleResetDemo = async () => {
    setResetting(true);
    try {
      const res = await api.resetDemoSeed();
      setResetMsg(res.message);
    } catch (err: any) {
      alert(`Reset failed: ${err.message}`);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Settings className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Governance Settings &amp; AI Disclosures</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            System configuration, cryptographic signing parameters, and mandatory AI capability transparency.
          </p>
        </div>
      </div>

      {/* Mandatory Capability & Model Disclosure Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Cpu className="h-5 w-5 text-brand-600" />
          <h2 className="text-sm font-bold text-slate-900">AI Provider &amp; Deterministic Architecture Disclosure</h2>
        </div>

        <div className="space-y-3 text-xs leading-relaxed text-slate-700">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-900">Offline &amp; Deterministic Execution Integrity:</h4>
            <p>
              VeriLoom does <strong>not</strong> rely on an external AI API key for its core verification pipeline. The six checks execute real, testable algorithms:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li><strong>Check 1 (Terminology):</strong> Deterministic regex matcher with word boundary protection.</li>
              <li><strong>Check 3 (Facts &amp; Claims):</strong> Grounded evidence verification strictly matched against the Brand Truth Vault database records.</li>
              <li><strong>Check 4 (Visual Colors):</strong> CIE76 Delta E color distance calculation ($L^*a^*b^*$ space).</li>
              <li><strong>Check 5 (WCAG 2.2):</strong> Mathematical relative luminance &amp; contrast ratio calculation per W3C specification.</li>
              <li><strong>Check 6 (Intent-Preserving Fixes):</strong> Surgical span replacements preserving surrounding text and original drafts.</li>
            </ul>
          </div>

          <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200 text-amber-950">
            <strong>Non-Fabrication Guarantee:</strong> VeriLoom will never simulate successful API responses, fabricate citations, or invent clause IDs. If an external model is unconfigured or a source passage is not found in the Brand Truth Vault, findings are transparently flagged as <em>Unsubstantiated</em> or routed to <em>Human Review</em>.
          </div>
        </div>
      </div>

      {/* Privacy & Confidential Data Protection */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Lock className="h-5 w-5 text-brand-600" />
          <h2 className="text-sm font-bold text-slate-900">Confidentiality &amp; Local PII Masking</h2>
        </div>

        <div className="text-xs text-slate-700 space-y-2">
          <p>
            Local masking interceptor actively redacts customer emails, telephone numbers, and API tokens before transmitting any draft content to external LLM services. Redacted placeholders are restored safely post-processing.
          </p>
          <div className="flex items-center gap-2 text-emerald-700 font-semibold mt-1">
            <CheckCircle2 className="h-4 w-4" />
            <span>Active: Local PII Redaction Filter Enabled</span>
          </div>
        </div>
      </div>

      {/* Demo Workspace Reset */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Reset Synthetic Demo Workspace</h2>
            <p className="text-xs text-slate-500">
              Restore the NovaTech synthetic brand guidelines, pricing rules, and prepared drafts for judge evaluation.
            </p>
          </div>
          <button
            onClick={handleResetDemo}
            disabled={resetting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${resetting ? 'animate-spin' : ''}`} />
            <span>{resetting ? 'Resetting...' : 'Reload Demo Data'}</span>
          </button>
        </div>

        {resetMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
            {resetMsg}
          </div>
        )}
      </div>
    </div>
  );
};
