import React from 'react';
import { GitCompare, Check, AlertCircle } from 'lucide-react';

interface DiffViewerProps {
  originalText: string;
  revisedText: string;
  originalRevNum: number;
  revisedRevNum: number;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  originalText,
  revisedText,
  originalRevNum,
  revisedRevNum,
}) => {
  const oldParas = originalText.split('\n\n').filter((p) => p.trim());
  const newParas = revisedText.split('\n\n').filter((p) => p.trim());

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-xs">
      {/* Header */}
      <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitCompare className="h-4 w-4 text-brand-600" />
          <span className="font-bold text-slate-800">Visual Paragraph-Level Version Diff</span>
        </div>
        <div className="flex items-center gap-4 text-slate-500 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-500"></span>
            Revision {originalRevNum} (Original)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            Revision {revisedRevNum} (Current)
          </span>
        </div>
      </div>

      {/* Side-by-Side Panes */}
      <div className="grid grid-cols-2 divide-x divide-slate-200 max-h-[500px] overflow-y-auto">
        {/* Left: Original */}
        <div className="p-4 space-y-3 bg-rose-50/20">
          <div className="text-[11px] font-bold uppercase text-slate-500 mb-2">Revision {originalRevNum} Content</div>
          {oldParas.map((para, idx) => {
            const isModified = newParas[idx] !== para;
            return (
              <div
                key={idx}
                className={`p-2.5 rounded-lg border font-mono text-[11px] leading-relaxed transition ${
                  isModified
                    ? 'bg-rose-50 border-rose-200 text-rose-950 line-through opacity-80'
                    : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <span className="text-[9px] font-sans font-bold text-slate-400 block mb-0.5">Paragraph {idx + 1}</span>
                {para}
              </div>
            );
          })}
        </div>

        {/* Right: Revised */}
        <div className="p-4 space-y-3 bg-emerald-50/20">
          <div className="text-[11px] font-bold uppercase text-slate-500 mb-2">Revision {revisedRevNum} Content</div>
          {newParas.map((para, idx) => {
            const isModified = oldParas[idx] !== para;
            return (
              <div
                key={idx}
                className={`p-2.5 rounded-lg border font-mono text-[11px] leading-relaxed transition ${
                  isModified
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-medium'
                    : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[9px] font-sans font-bold text-slate-400">Paragraph {idx + 1}</span>
                  {isModified && (
                    <span className="text-[9px] font-sans font-bold px-1.5 py-0.2 rounded bg-emerald-200 text-emerald-800 uppercase">
                      Updated
                    </span>
                  )}
                </div>
                {para}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
