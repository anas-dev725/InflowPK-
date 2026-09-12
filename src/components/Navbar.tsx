import React from "react";
import { ArrowUpRight, ShieldCheck, Wallet, FileText, CheckCircle2, TrendingUp } from "lucide-react";

interface NavbarProps {
  activeTab: "optimizer" | "contract" | "compliance" | "matrix";
  setActiveTab: (tab: "optimizer" | "contract" | "compliance" | "matrix") => void;
  interbankRate: number;
  setInterbankRate: (rate: number) => void;
  isPsebRegistered: boolean;
  setIsPsebRegistered: (val: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  interbankRate,
  isPsebRegistered,
  setIsPsebRegistered,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-sm shadow-emerald-200">
              <span>PK</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-slate-900">
                  Inflow<span className="text-emerald-600">PK</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  SBP & FBR 154A
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block">
                Remittance Optimizer & Compliance Engine
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              id="nav-tab-optimizer"
              onClick={() => setActiveTab("optimizer")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "optimizer"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              <Wallet className="w-4 h-4 text-emerald-600" />
              <span>Payout Optimizer</span>
            </button>

            <button
              id="nav-tab-contract"
              onClick={() => setActiveTab("contract")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "contract"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Contract Scanner</span>
            </button>

            <button
              id="nav-tab-compliance"
              onClick={() => setActiveTab("compliance")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "compliance"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>SBP & e-PRC Pack</span>
            </button>

            <button
              id="nav-tab-matrix"
              onClick={() => setActiveTab("matrix")}
              className={`hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "matrix"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              <TrendingUp className="w-4 h-4 text-slate-600" />
              <span>Channels Matrix</span>
            </button>
          </nav>

          {/* Live Rate & Tax Status Indicator */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-medium text-slate-700 border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>USD/PKR Interbank:</span>
              <span className="font-bold text-slate-900 font-mono">
                {interbankRate.toFixed(2)}
              </span>
            </div>

            <button
              id="btn-toggle-pseb-nav"
              onClick={() => setIsPsebRegistered(!isPsebRegistered)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                isPsebRegistered
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-amber-50 border-amber-200 text-amber-800"
              }`}
              title="Click to toggle PSEB registration status"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isPsebRegistered ? "PSEB Registered: 0.25% Tax" : "Non-PSEB: 1.00% Tax"}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
