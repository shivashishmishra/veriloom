import React, { useEffect, useState } from 'react';
import {
  Database,
  Search,
  Plus,
  Upload,
  BookOpen,
  DollarSign,
  Type,
  Palette,
  ShieldCheck,
  CheckCircle2,
  X,
  RotateCw
} from 'lucide-react';
import { api } from '../services/api';
import { BrandRule, ApprovedFact, TerminologyRule, BrandColorPalette } from '../types';
import { useAuth } from '../context/AuthContext';

export const VaultPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'rules' | 'facts' | 'terms' | 'colors'>('rules');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Data
  const [rules, setRules] = useState<BrandRule[]>([]);
  const [facts, setFacts] = useState<ApprovedFact[]>([]);
  const [terms, setTerms] = useState<TerminologyRule[]>([]);
  const [palettes, setPalettes] = useState<BrandColorPalette[]>([]);

  // Modals
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [showAddFactModal, setShowAddFactModal] = useState(false);
  const [showAddTermModal, setShowAddTermModal] = useState(false);
  const [showAddPaletteModal, setShowAddPaletteModal] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);

  // Form states
  const [newRule, setNewRule] = useState({
    rule_id: '',
    title: '',
    category: 'Pricing',
    exact_rule_text: '',
    source_document: 'NovaTech_Brand_Book_2026.pdf',
    source_page: 1,
    severity: 'Violation',
  });

  const [newFact, setNewFact] = useState({
    fact_id: '',
    claim_subject: '',
    approved_value: '',
    category: 'Pricing',
    exact_passage: '',
    source_document: 'NovaTech_Pricing_Schedule_2026.pdf',
    source_page: 1,
  });

  const [newTerm, setNewTerm] = useState({
    term_id: '',
    banned_term: '',
    preferred_term: '',
    reason: '',
    severity: 'Violation',
  });

  const [newPalette, setNewPalette] = useState({
    color_id: '',
    name: '',
    hex_code: '#1D3DD4',
    rgb_r: 29,
    rgb_g: 61,
    rgb_b: 212,
    role: 'Primary',
    tolerance_delta_e: 10.0,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [r, f, t, p] = await Promise.all([
        api.getRules(undefined, search),
        api.getFacts(),
        api.getTerms(),
        api.getPalettes(),
      ]);
      setRules(r);
      setFacts(f);
      setTerms(t);
      setPalettes(p);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search]);

  // Handlers for creating records
  const handleCreateRule = async () => {
    if (!newRule.rule_id || !newRule.exact_rule_text) return;
    await api.createRule(newRule as any);
    setShowAddRuleModal(false);
    loadData();
  };

  const handleCreateFact = async () => {
    if (!newFact.fact_id || !newFact.approved_value) return;
    await api.createFact(newFact as any);
    setShowAddFactModal(false);
    loadData();
  };

  const handleCreateTerm = async () => {
    if (!newTerm.term_id || !newTerm.banned_term) return;
    await api.createTerm(newTerm as any);
    setShowAddTermModal(false);
    loadData();
  };

  const handleCreatePalette = async () => {
    if (!newPalette.color_id || !newPalette.hex_code) return;
    await api.createPalette(newPalette as any);
    setShowAddPaletteModal(false);
    loadData();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center">
              <Database className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Brand Truth Vault</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official organizational repository of verified brand rules, approved fact passages, terminology standards, and visual palettes.
          </p>
        </div>

        {/* Global Vault Search & Actions */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search guidelines..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 w-56"
            />
          </div>

          {user?.role === 'Brand Admin' && (
            <>
              <button
                onClick={() => setShowCsvModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Import CSV</span>
              </button>
              <button
                onClick={() => {
                  if (activeTab === 'rules') setShowAddRuleModal(true);
                  if (activeTab === 'facts') setShowAddFactModal(true);
                  if (activeTab === 'terms') setShowAddTermModal(true);
                  if (activeTab === 'colors') setShowAddPaletteModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs transition"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Record</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Vault Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('rules')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            activeTab === 'rules'
              ? 'bg-brand-600 text-white shadow-xs font-bold'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>Brand Rules ({rules.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('facts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            activeTab === 'facts'
              ? 'bg-brand-600 text-white shadow-xs font-bold'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <DollarSign className="h-4 w-4" />
          <span>Approved Facts ({facts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('terms')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            activeTab === 'terms'
              ? 'bg-brand-600 text-white shadow-xs font-bold'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Type className="h-4 w-4" />
          <span>Terminology Standards ({terms.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('colors')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            activeTab === 'colors'
              ? 'bg-brand-600 text-white shadow-xs font-bold'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Palette className="h-4 w-4" />
          <span>Approved Palettes ({palettes.length})</span>
        </button>
      </div>

      {/* Tab 1: Brand Rules */}
      {activeTab === 'rules' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Clause ID</th>
                <th className="px-5 py-3">Standard Title</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Exact Guideline Text</th>
                <th className="px-5 py-3">Source Document</th>
                <th className="px-5 py-3">Version</th>
                <th className="px-5 py-3">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rules.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/60 transition">
                  <td className="px-5 py-3 font-mono font-bold text-brand-700">{r.rule_id}</td>
                  <td className="px-5 py-3 font-semibold text-slate-800">{r.title}</td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">{r.category}</span>
                  </td>
                  <td className="px-5 py-3 text-slate-700 max-w-md">{r.exact_rule_text}</td>
                  <td className="px-5 py-3 text-slate-500">
                    {r.source_document} {r.source_page ? `(p. ${r.source_page})` : ''}
                  </td>
                  <td className="px-5 py-3 font-mono text-slate-600">v{r.version}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.severity === 'Violation'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {r.severity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Approved Facts */}
      {activeTab === 'facts' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Fact ID</th>
                <th className="px-5 py-3">Claim Subject</th>
                <th className="px-5 py-3">Approved Value</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Exact Source Passage</th>
                <th className="px-5 py-3">Source Citation</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {facts.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50/60 transition">
                  <td className="px-5 py-3 font-mono font-bold text-brand-700">{f.fact_id}</td>
                  <td className="px-5 py-3 font-semibold text-slate-800">{f.claim_subject}</td>
                  <td className="px-5 py-3 font-bold text-emerald-700 bg-emerald-50/50">{f.approved_value}</td>
                  <td className="px-5 py-3">{f.category}</td>
                  <td className="px-5 py-3 text-slate-600 italic max-w-sm">"{f.exact_passage}"</td>
                  <td className="px-5 py-3 text-slate-500">
                    {f.source_document} (p. {f.source_page || 1})
                  </td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {f.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Terminology Standards */}
      {activeTab === 'terms' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Term ID</th>
                <th className="px-5 py-3">Banned / Prohibited Term</th>
                <th className="px-5 py-3">Preferred Term</th>
                <th className="px-5 py-3">Matching Rule</th>
                <th className="px-5 py-3">Compliance Justification</th>
                <th className="px-5 py-3">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {terms.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/60 transition">
                  <td className="px-5 py-3 font-mono font-bold text-brand-700">{t.term_id}</td>
                  <td className="px-5 py-3 font-bold text-rose-700 bg-rose-50/50">"{t.banned_term}"</td>
                  <td className="px-5 py-3 font-bold text-emerald-700 bg-emerald-50/50">
                    "{t.preferred_term || 'None'}"
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {t.match_whole_word ? 'Whole word boundary' : 'Substring'}
                  </td>
                  <td className="px-5 py-3 text-slate-700">{t.reason}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.severity === 'Violation'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {t.severity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: Color Palettes */}
      {activeTab === 'colors' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {palettes.map((pal) => (
            <div key={pal.id} className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="h-28 w-full shadow-inner" style={{ backgroundColor: pal.hex_code }} />
              <div className="p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{pal.name}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                    {pal.role}
                  </span>
                </div>
                <div className="flex items-center justify-between font-mono text-[11px] text-slate-600">
                  <span>HEX: {pal.hex_code}</span>
                  <span>
                    RGB({pal.rgb_r}, {pal.rgb_g}, {pal.rgb_b})
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Delta E Tolerance:</span>
                  <span className="font-bold text-brand-700">&le; {pal.tolerance_delta_e}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add Brand Rule */}
      {showAddRuleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm text-slate-900">Add Brand Rule to Truth Vault</h3>
              <button onClick={() => setShowAddRuleModal(false)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Clause ID (e.g. PR-102)</label>
                <input
                  type="text"
                  value={newRule.rule_id}
                  onChange={(e) => setNewRule({ ...newRule, rule_id: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Title</label>
                <input
                  type="text"
                  value={newRule.title}
                  onChange={(e) => setNewRule({ ...newRule, title: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Category</label>
                <select
                  value={newRule.category}
                  onChange={(e) => setNewRule({ ...newRule, category: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="Pricing">Pricing</option>
                  <option value="Tone">Tone</option>
                  <option value="Terminology">Terminology</option>
                  <option value="Color">Color</option>
                  <option value="Accessibility">Accessibility</option>
                  <option value="Legal">Legal</option>
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">Exact Guideline Text</label>
                <textarea
                  value={newRule.exact_rule_text}
                  onChange={(e) => setNewRule({ ...newRule, exact_rule_text: e.target.value })}
                  rows={3}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button onClick={() => setShowAddRuleModal(false)} className="px-3 py-1.5 border rounded-lg text-xs">Cancel</button>
              <button onClick={handleCreateRule} className="px-4 py-1.5 bg-brand-600 text-white rounded-lg text-xs font-semibold">Save Rule</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: CSV Import */}
      {showCsvModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm text-slate-900">Import Structured Brand CSV</h3>
              <button onClick={() => setShowCsvModal(false)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            <p className="text-slate-600">
              Upload CSV containing columns: <code className="bg-slate-100 px-1 py-0.5 rounded">type,id,title,text,category,severity</code>
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  await api.importCsv(file);
                  setShowCsvModal(false);
                  loadData();
                }
              }}
              className="w-full p-3 border-2 border-dashed rounded-xl cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
};
