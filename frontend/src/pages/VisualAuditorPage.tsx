import React, { useState } from 'react';
import {
  Palette,
  Upload,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Eye,
  ShieldCheck,
  Sliders,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';

export const VisualAuditorPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [auditing, setAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<any | null>(null);

  // Manual WCAG Evaluator
  const [fgColor, setFgColor] = useState('#1D3DD4');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [contrastResult, setContrastResult] = useState<any | null>(null);
  const [contrastChecking, setContrastChecking] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAuditResult(null);
    }
  };

  const handleRunAudit = async () => {
    if (!selectedFile) return;
    setAuditing(true);
    try {
      const res = await api.auditVisual(selectedFile);
      setAuditResult(res.asset_audit);
    } catch (err: any) {
      alert(`Audit failed: ${err.message}`);
    } finally {
      setAuditing(false);
    }
  };

  const handleCheckContrast = async () => {
    setContrastChecking(true);
    try {
      const res = await api.auditVisual(undefined, fgColor, bgColor, false);
      setContrastResult(res.wcag_contrast);
    } catch (err: any) {
      alert(`Contrast calculation failed: ${err.message}`);
    } finally {
      setContrastChecking(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center">
              <Palette className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Visual Brand Auditor &amp; WCAG Contrast Suite</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Deterministic CIE76 Delta E color distance comparison and WCAG 2.2 relative luminance accessibility verification.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Image / SVG Color Analyzer (7 Columns) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Check 4: Visual Brand-Colour Consistency</h3>
              <p className="text-xs text-slate-500">Extracts dominant colors, compares against palette, flags Delta E &gt; 10.</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
              CIE76 Delta E Formula
            </span>
          </div>

          {/* Upload Area */}
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition cursor-pointer relative">
            <input
              type="file"
              accept="image/png,image/jpeg,image/svg+xml"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            {previewUrl ? (
              <div className="space-y-3">
                <img src={previewUrl} alt="Asset preview" className="max-h-48 mx-auto rounded-lg shadow-sm border" />
                <p className="text-xs text-slate-600 font-semibold">{selectedFile?.name}</p>
                <p className="text-[11px] text-brand-600">Click or drag to replace image</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-8 w-8 mx-auto text-slate-400" />
                <p className="text-xs font-semibold text-slate-700">Upload Image (PNG, JPG) or SVG Vector Asset</p>
                <p className="text-[11px] text-slate-400">Dominant palette will be extracted and measured</p>
              </div>
            )}
          </div>

          {selectedFile && (
            <button
              onClick={handleRunAudit}
              disabled={auditing}
              className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-xs transition flex items-center justify-center gap-2"
            >
              {auditing ? <RotateCw className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
              <span>{auditing ? 'Extracting Swatches & Calculating Delta E...' : 'Run Visual Palette Audit'}</span>
            </button>
          )}

          {/* Audit Results */}
          {auditResult && (
            <div className="space-y-4 pt-3 border-t border-slate-200 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Extracted Swatches ({auditResult.total_extracted_colors})
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    auditResult.overall_status === 'PASS'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}
                >
                  {auditResult.overall_status === 'PASS' ? 'ON-BRAND PALETTE' : 'FLAGGED DEVIATIONS DETECTED'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {auditResult.swatches.map((swatch: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex items-center gap-3 text-xs ${
                      swatch.is_on_brand ? 'bg-white border-slate-200' : 'bg-rose-50/60 border-rose-200'
                    }`}
                  >
                    {/* Color Swatch */}
                    <div
                      className="h-12 w-12 rounded-lg border shadow-xs flex-shrink-0"
                      style={{ backgroundColor: swatch.extracted_hex }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-slate-900">{swatch.extracted_hex}</span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                            swatch.is_on_brand
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          &Delta;E: {swatch.delta_e}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        Matched: <strong>{swatch.nearest_brand_color}</strong>
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Tolerance threshold: &le; {swatch.tolerance}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <strong>Measurement Disclosure:</strong> Delta E values greater than 10.0 represent perceivable color discrepancies against approved brand swatches. Complex photographic gradients require human verification.
              </p>
            </div>
          )}
        </div>

        {/* Right: WCAG 2.2 Contrast Calculator (5 Columns) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Check 5: WCAG 2.2 Contrast &amp; Accessibility</h3>
            <p className="text-xs text-slate-500">
              Evaluates relative luminance: (L1 + 0.05) / (L2 + 0.05).
            </p>
          </div>

          {/* Interactive Contrast Picker */}
          <div className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Foreground / Text Color (sRGB HEX):</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="h-8 w-12 rounded cursor-pointer border border-slate-300"
                />
                <input
                  type="text"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="font-mono text-xs px-2.5 py-1.5 border rounded-lg flex-1"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Background Surface Color (sRGB HEX):</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="h-8 w-12 rounded cursor-pointer border border-slate-300"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="font-mono text-xs px-2.5 py-1.5 border rounded-lg flex-1"
                />
              </div>
            </div>

            <button
              onClick={handleCheckContrast}
              disabled={contrastChecking}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-xs transition"
            >
              {contrastChecking ? 'Computing WCAG Luminance...' : 'Calculate WCAG 2.2 Contrast Ratio'}
            </button>
          </div>

          {/* Live Preview Box */}
          <div
            className="p-5 rounded-xl border shadow-inner text-center space-y-1 transition"
            style={{ backgroundColor: bgColor, color: fgColor }}
          >
            <p className="text-base font-bold">The quick brown fox jumps over the lazy dog</p>
            <p className="text-xs opacity-90">Sample body copy rendered at 12pt regular weight</p>
          </div>

          {/* Contrast Measurement Breakdown */}
          {contrastResult && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-600">Calculated Contrast Ratio:</span>
                <span className="text-xl font-bold font-mono text-slate-900">
                  {contrastResult.contrast_ratio}:1
                </span>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <span>Normal Text (Requires &ge; 4.5:1):</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                      contrastResult.contrast_ratio >= 4.5
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {contrastResult.contrast_ratio >= 4.5 ? 'PASS' : 'FAIL'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Large Text 18pt+ (Requires &ge; 3.0:1):</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                      contrastResult.contrast_ratio >= 3.0
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {contrastResult.contrast_ratio >= 3.0 ? 'PASS' : 'FAIL'}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 mt-2">{contrastResult.recommendation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
