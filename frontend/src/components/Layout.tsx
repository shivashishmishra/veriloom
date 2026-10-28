import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileCheck2,
  Database,
  Palette,
  CheckCircle2,
  BarChart3,
  History,
  Settings,
  ShieldCheck,
  Sparkles,
  UserCheck,
  ChevronRight,
  LogOut,
  Building2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  onStartTour?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ onStartTour }) => {
  const { user, switchRole, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/studio', label: 'Review Studio', icon: FileCheck2, badge: 'Core' },
    { to: '/vault', label: 'Brand Truth Vault', icon: Database },
    { to: '/visual', label: 'Visual Auditor', icon: Palette },
    { to: '/approvals', label: 'Approvals', icon: CheckCircle2 },
    { to: '/insights', label: 'Governance Insights', icon: BarChart3 },
    { to: '/audit', label: 'Audit Log', icon: History },
    { to: '/settings', label: 'Settings & Disclosures', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-navy-900 text-white flex flex-col border-r border-navy-800 flex-shrink-0">
        {/* Brand Header */}
        <div className="p-5 border-b border-navy-800">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/30">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight text-white">VeriLoom</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-brand-800 text-brand-200">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-normal">Brand-Governance Studio</p>
            </div>
          </div>
          <p className="mt-3 text-[11px] text-slate-400 italic leading-snug">
            "Every Claim Substantiated. Every Visual On-Brand. Every Fix Explainable."
          </p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/40 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-navy-800'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-500/30 text-brand-300 border border-brand-400/30 uppercase">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Workspace Footer */}
        <div className="p-4 border-t border-navy-800 bg-navy-950/60">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="h-4 w-4 text-brand-400" />
            <span className="text-xs font-semibold text-slate-200 truncate">NovaTech AI Solutions</span>
          </div>
          <p className="text-[10px] text-slate-400">Enterprise Workspace</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-xs z-10 flex-shrink-0">
          {/* Left: Synthetic Demo Badge */}
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
              DEMO WORKSPACE — SYNTHETIC SAMPLE DATA
            </div>
          </div>

          {/* Right: Guided Tour & Role Switcher */}
          <div className="flex items-center gap-4">
            {onStartTour && (
              <button
                onClick={onStartTour}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-sm hover:brightness-105 transition"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                <span>Guided Judge Tour</span>
              </button>
            )}

            {/* Role Switcher Pill */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 px-2">Role:</span>
              <button
                onClick={() => switchRole('creator')}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition ${
                  user?.role === 'Creator'
                    ? 'bg-white text-brand-700 shadow-xs font-bold border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Creator: Alex Chen"
              >
                ✍️ Creator
              </button>
              <button
                onClick={() => switchRole('reviewer')}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition ${
                  user?.role === 'Reviewer'
                    ? 'bg-white text-indigo-700 shadow-xs font-bold border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Reviewer: Morgan Rivera"
              >
                🔍 Reviewer
              </button>
              <button
                onClick={() => switchRole('admin')}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition ${
                  user?.role === 'Brand Admin'
                    ? 'bg-white text-purple-700 shadow-xs font-bold border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Brand Admin: Dr. Elena Vance"
              >
                🛡️ Brand Admin
              </button>
            </div>

            {/* Authenticated User Display */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="h-8 w-8 rounded-full bg-brand-100 text-brand-800 flex items-center justify-center font-bold text-xs border border-brand-200">
                {user?.full_name ? user.full_name[0] : 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-tight">{user?.full_name || 'Demo User'}</p>
                <p className="text-[10px] text-slate-500">{user?.role || 'Guest'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Route Body */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
