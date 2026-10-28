import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, X, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface GuidedTourProps {
  currentStep: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
}

export const TOUR_STEPS = [
  {
    step: 1,
    title: 'Step 1: Explore Brand Truth Vault',
    description: 'Inspect official brand rules, approved pricing schedule ($99/user/month), and banned terminology in the Vault.',
    path: '/vault',
    recommendedRole: 'admin',
    actionText: 'Go to Brand Truth Vault',
  },
  {
    step: 2,
    title: 'Step 2: Open Draft in Review Studio',
    description: 'Open the prepared content draft "NovaTech Q3 Enterprise Cloud Launch Announcement" with deliberately seeded compliance issues.',
    path: '/studio',
    recommendedRole: 'creator',
    actionText: 'Open Review Studio',
  },
  {
    step: 3,
    title: 'Step 3: Run Hybrid Verification Scan',
    description: 'Execute the 6-check deterministic verification engine with SHA-256 delta scanning and grounded source retrieval.',
    path: '/studio',
    recommendedRole: 'creator',
    actionText: 'Run Scan in Studio',
  },
  {
    step: 4,
    title: 'Step 4: Inspect Source Grounding',
    description: 'Click on the pricing contradiction finding ($79/mo) to view the exact cited clause PR-101 and verified passage.',
    path: '/studio',
    recommendedRole: 'creator',
    actionText: 'Review Evidence',
  },
  {
    step: 5,
    title: 'Step 5: Apply Intent-Preserving Fix',
    description: 'Click "Apply Fix" to cleanly replace $79 with $99 without rewriting the paragraph, automatically generating Revision 2.',
    path: '/studio',
    recommendedRole: 'creator',
    actionText: 'Apply Fix',
  },
  {
    step: 6,
    title: 'Step 6: Reviewer Human Approval',
    description: 'Switch to the Reviewer role (Morgan Rivera) to inspect the revision diff, comments, and grant authorized human approval.',
    path: '/approvals',
    recommendedRole: 'reviewer',
    actionText: 'Go to Approvals',
  },
  {
    step: 7,
    title: 'Step 7: Pre-Flight Compliance Certificate',
    description: 'Inspect the cryptographic Pre-Flight Compliance Certificate, verify its HMAC signature, and download the high-res PDF.',
    path: '/studio',
    recommendedRole: 'reviewer',
    actionText: 'View Certificate',
  },
  {
    step: 8,
    title: 'Step 8: Governance Insights & Guideline Patching',
    description: 'See live override rate analytics and review the AI-suggested guideline patch for ambiguous rules (Rule PR-101).',
    path: '/insights',
    recommendedRole: 'admin',
    actionText: 'View Insights',
  },
];

export const GuidedTour: React.FC<GuidedTourProps> = ({ currentStep, onNext, onPrev, onClose }) => {
  const navigate = useNavigate();
  const { switchRole } = useAuth();
  const stepData = TOUR_STEPS[currentStep - 1] || TOUR_STEPS[0];

  const handleAction = async () => {
    if (stepData.recommendedRole) {
      await switchRole(stepData.recommendedRole as any);
    }
    navigate(stepData.path);
  };

  return (
    <div className="fixed bottom-5 right-6 z-50 w-[420px] bg-navy-950 text-white rounded-2xl shadow-2xl border border-navy-700/80 p-5 backdrop-blur-md animate-fade-in">
      <div className="flex items-center justify-between mb-3 border-b border-navy-800 pb-2">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-amber-400 text-navy-950 flex items-center justify-center font-bold text-xs">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
            Judge Onboarding Tour • Step {currentStep} of {TOUR_STEPS.length}
          </span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-md">
          <X className="h-4 w-4" />
        </button>
      </div>

      <h4 className="text-sm font-bold text-white mb-1.5">{stepData.title}</h4>
      <p className="text-xs text-slate-300 leading-relaxed mb-4">{stepData.description}</p>

      <div className="flex items-center justify-between pt-2 border-t border-navy-800">
        <div className="flex items-center gap-1.5">
          <button
            onClick={onPrev}
            disabled={currentStep === 1}
            className="p-1.5 rounded-lg border border-navy-700 text-slate-300 hover:bg-navy-800 disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onNext}
            disabled={currentStep === TOUR_STEPS.length}
            className="p-1.5 rounded-lg border border-navy-700 text-slate-300 hover:bg-navy-800 disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <button
          onClick={handleAction}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-semibold shadow-sm transition"
        >
          <span>{stepData.actionText}</span>
          <ChevronRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};
