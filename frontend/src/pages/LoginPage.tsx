import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight, UserCheck, Sparkles, RotateCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, switchRole } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFastDemoLogin = async (role: 'creator' | 'reviewer' | 'admin') => {
    setSubmitting(true);
    setError(null);
    try {
      await switchRole(role);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate demo account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-950 via-slate-900 to-navy-900 flex items-center justify-center p-4 font-sans text-slate-900">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-navy-900 via-brand-900 to-navy-950 p-6 text-white text-center relative">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white flex items-center justify-center mx-auto shadow-lg mb-3">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">VeriLoom</h1>
          <p className="text-xs text-brand-200 mt-1">Intelligent Brand-Governance Studio</p>
        </div>

        <div className="p-6 space-y-5">
          {/* Judge Demo Fast-Access Bar */}
          <div className="bg-brand-50/70 border border-brand-200 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-brand-950">
              <Sparkles className="h-4 w-4 text-brand-600" />
              <span>Judge Quick-Login (1-Click Authenticated Access)</span>
            </div>
            <p className="text-[11px] text-brand-900">
              Select any pre-seeded persona to test role-based permissions immediately:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleFastDemoLogin('creator')}
                disabled={submitting}
                className="p-2.5 rounded-xl bg-white border border-brand-300 text-center hover:bg-brand-100/50 transition shadow-xs text-xs"
              >
                <span className="block text-base mb-0.5">✍️</span>
                <strong className="block text-slate-800 text-[11px]">Creator</strong>
                <span className="text-[10px] text-slate-500">Alex Chen</span>
              </button>
              <button
                type="button"
                onClick={() => handleFastDemoLogin('reviewer')}
                disabled={submitting}
                className="p-2.5 rounded-xl bg-white border border-brand-300 text-center hover:bg-brand-100/50 transition shadow-xs text-xs"
              >
                <span className="block text-base mb-0.5">🔍</span>
                <strong className="block text-slate-800 text-[11px]">Reviewer</strong>
                <span className="text-[10px] text-slate-500">Morgan R.</span>
              </button>
              <button
                type="button"
                onClick={() => handleFastDemoLogin('admin')}
                disabled={submitting}
                className="p-2.5 rounded-xl bg-white border border-brand-300 text-center hover:bg-brand-100/50 transition shadow-xs text-xs"
              >
                <span className="block text-base mb-0.5">🛡️</span>
                <strong className="block text-slate-800 text-[11px]">Admin</strong>
                <span className="text-[10px] text-slate-500">Dr. Vance</span>
              </button>
            </div>
          </div>

          <div className="relative text-center">
            <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 relative z-10">
              or sign in with credentials
            </span>
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleStandardLogin} className="space-y-3.5 text-xs">
            {error && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 font-medium">
                {error}
              </div>
            )}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="creator@novatech.io"
                  className="w-full pl-9 pr-3 py-2 border rounded-xl border-slate-300 focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Password</label>
              <div className="relative">
                <Lock className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 border rounded-xl border-slate-300 focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              {submitting ? <RotateCw className="h-4 w-4 animate-spin" /> : <span>Sign In to Workspace</span>}
            </button>
          </form>

          <p className="text-[10px] text-center text-slate-400">
            Seeded Demo Credentials: <code className="text-slate-600 font-mono">DemoCreator123!</code> •{' '}
            <code className="text-slate-600 font-mono">DemoReviewer123!</code> •{' '}
            <code className="text-slate-600 font-mono">DemoAdmin123!</code>
          </p>
        </div>
      </div>
    </div>
  );
};
