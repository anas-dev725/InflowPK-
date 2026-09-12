import React from "react";
import {
  X,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Wallet,
  FileSearch,
  Building,
  HelpCircle,
  TrendingDown,
  Clock,
  ExternalLink,
} from "lucide-react";
import { FeatureTab } from "./Sidebar";

interface FreelancerGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: FeatureTab) => void;
}

export const FreelancerGuideModal: React.FC<FreelancerGuideModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-2">
            <span>Simple 3-Step Guide</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            How a Pakistani Freelancer Uses InflowPK
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            Never lose money to hidden dollar exchange markdowns or pay 1% tax when you only owe 0.25%.
            Here is your exact workflow from client offer to local bank deposit.
          </p>
        </div>

        {/* Steps Journey */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Step 1 */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-all space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-800 font-extrabold flex items-center justify-center shrink-0">
                  1
                </div>
                <div>
                  <div className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                    Before starting work or bidding
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Scan the Contract or Client Message
                  </h3>
                </div>
              </div>

              <button
                onClick={() => {
                  onNavigate("contract");
                  onClose();
                }}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shrink-0 transition-all flex items-center gap-1"
              >
                <span>Go to Scanner</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              <strong>The Problem:</strong> Clients often slip in "unlimited revisions until 100% satisfied" or "Net-60 payment terms" (paying you 2 months later).
              <br />
              <strong>What to do:</strong> Paste the Upwork job, contract, or email into the <strong>Contract & Risk Scanner</strong>. It instantly highlights red flags, tells you what counter-offer to write, and finds your official State Bank Purpose Code (like <strong>9186</strong> for software).
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50/70 transition-all space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-extrabold flex items-center justify-center shrink-0">
                  2
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    When dollars are ready in Upwork / Deel / Client
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Find the Highest PKR Payout Route
                  </h3>
                </div>
              </div>

              <button
                onClick={() => {
                  onNavigate("optimizer");
                  onClose();
                }}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shrink-0 transition-all flex items-center gap-1"
              >
                <span>Go to Calculator</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              <strong>The Problem:</strong> If you click "Withdraw to Local Bank (PKR)" inside Upwork or Payoneer, they quietly convert your dollars at an exchange rate Rs. 10 to Rs. 15 below the actual market rate. On a $2,000 withdrawal, <strong>you lose PKR 20,000+!</strong>
              <br />
              <strong>What to do:</strong> Enter your USD amount in the <strong>Payout Calculator</strong>. It compares Elevate Pay, SadaBiz, Wise, Payoneer, and Bank Wire so you can choose the route that deposits the most Rupees into your Pakistani bank.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/40 hover:bg-amber-50/70 transition-all space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white font-extrabold flex items-center justify-center shrink-0">
                  3
                </div>
                <div>
                  <div className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                    When money enters your Pakistani Bank (Meezan, HBL, Alfalah, etc.)
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Send Bank Memo for 0.25% Tax & e-PRC
                  </h3>
                </div>
              </div>

              <button
                onClick={() => {
                  onNavigate("compliance");
                  onClose();
                }}
                className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shrink-0 transition-all flex items-center gap-1"
              >
                <span>Go to Bank Pack</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              <strong>The Problem:</strong> Branch staff in Pakistan often don't know the IT export rules. They wrongly deduct 1.00% tax (instead of 0.25%) and fail to generate your <strong>e-PRC</strong> (Proceeds Realization Certificate), which you must submit to FBR during tax filing.
              <br />
              <strong>What to do:</strong> Open the <strong>SBP & e-PRC Pack</strong>. Fill your name, CNIC, and bank. In 1 click, copy or download the pre-filled legal letter citing SBP Circular No. 04 and FBR Section 154A. Hand or email this to your branch manager!
            </p>
          </div>

          {/* Real Life Example Box */}
          <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              <span>Summary in One Sentence:</span>
            </div>
            <p className="leading-relaxed">
              Use InflowPK whenever you have foreign freelance dollars: check your contract before starting, calculate the best withdrawal route to save Rs. 20,000+, and download your bank letter so you only pay 0.25% tax.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:px-8 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Compliant with SBP FE Manual & FBR Section 154A
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs"
          >
            Got it, let's begin!
          </button>
        </div>
      </div>
    </div>
  );
};
