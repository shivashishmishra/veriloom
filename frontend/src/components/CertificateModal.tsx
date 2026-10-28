import React, { useState } from 'react';
import { ComplianceCertificate } from '../types';
import { api } from '../services/api';
import {
  ShieldCheck,
  Download,
  FileText,
  CheckCircle2,
  AlertTriangle,
  X,
  Lock,
  QrCode,
  Award
} from 'lucide-react';

interface CertificateModalProps {
  certificate: ComplianceCertificate;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ certificate, onClose }) => {
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<string | null>(null);

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const res = await api.verifyCertificate(certificate.certificate_code);
      setVerificationResult(res.verification_message);
    } catch (err: any) {
      setVerificationResult(`Verification error: ${err.message}`);
    } finally {
      setVerifying(false);
    }
  };

  const handleDownloadPdf = async () => {
    await api.downloadCertificatePdf(certificate.submission_id, certificate.certificate_code);
  };

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(certificate, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `VeriLoom_Certificate_${certificate.certificate_code}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Certificate Header Banner */}
        <div className="bg-gradient-to-r from-navy-900 via-brand-900 to-navy-950 p-6 text-white rounded-t-2xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-amber-400 text-navy-950 flex items-center justify-center shadow-lg">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-amber-300">
                Official Pre-Flight Verification Seal
              </span>
              <h2 className="text-xl font-bold tracking-tight text-white">Brand Compliance Certificate</h2>
            </div>
          </div>
          <p className="text-xs text-slate-300">
            Cryptographically certified pre-publication verification issued under the Inkloom Governance Standard.
          </p>
        </div>

        {/* Certificate Body */}
        <div className="p-6 space-y-5">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 font-medium">Certificate Code:</span>
              <p className="font-mono font-bold text-brand-700 text-sm">{certificate.certificate_code}</p>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Content Title:</span>
              <p className="font-semibold text-slate-800 truncate">{certificate.content_title}</p>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Authorized Approver:</span>
              <p className="font-semibold text-slate-800">{certificate.approver_name} ({certificate.approver_role})</p>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Approval Timestamp:</span>
              <p className="font-mono text-slate-700">{new Date(certificate.approval_timestamp).toLocaleString()}</p>
            </div>
            <div className="col-span-2">
              <span className="text-slate-500 font-medium">Content SHA-256 Digest:</span>
              <p className="font-mono text-[11px] text-slate-600 bg-white px-2 py-1 rounded border border-slate-200 truncate">
                {certificate.source_file_sha256}
              </p>
            </div>
          </div>

          {/* Audit Resolution Summary */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Verification Breakdown
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-center">
                <span className="text-xl font-bold text-emerald-700">{certificate.findings_summary.resolved_count}</span>
                <p className="text-[11px] font-medium text-emerald-800">Resolved Violations</p>
              </div>
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-center">
                <span className="text-xl font-bold text-amber-700">{certificate.findings_summary.overridden_count}</span>
                <p className="text-[11px] font-medium text-amber-800">Documented Overrides</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-center">
                <span className="text-xl font-bold text-slate-700">{certificate.findings_summary.open_count}</span>
                <p className="text-[11px] font-medium text-slate-600">Open Critical Issues</p>
              </div>
            </div>
          </div>

          {/* Digital Signature & Verification Box */}
          <div className="bg-slate-900 text-white p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-bold text-slate-200">
                  Digital Signature ({certificate.signature_algorithm})
                </span>
              </div>
              <button
                onClick={handleVerify}
                disabled={verifying}
                className="text-xs font-semibold px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded transition"
              >
                {verifying ? 'Checking...' : 'Verify Authenticity'}
              </button>
            </div>
            <p className="font-mono text-[10px] text-slate-400 break-all bg-black/40 p-2 rounded border border-slate-800">
              {certificate.digital_signature}
            </p>
            {verificationResult && (
              <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/60 p-2 rounded border border-emerald-800">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                <span>{verificationResult}</span>
              </div>
            )}
          </div>

          {/* Download Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={handleDownloadJson}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <FileText className="h-4 w-4" />
              <span>Export JSON Certificate</span>
            </button>
            <button
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition"
            >
              <Download className="h-4 w-4" />
              <span>Download Printable PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
