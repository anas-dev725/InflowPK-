import React, { useState, useEffect } from "react";
import { Sidebar, FeatureTab } from "./components/Sidebar";
import { TopHeader } from "./components/TopHeader";
import { PayoutOptimizer } from "./components/PayoutOptimizer";
import { ContractRiskScanner } from "./components/ContractRiskScanner";
import { CompliancePackGenerator } from "./components/CompliancePackGenerator";
import { ChannelMatrixGuide } from "./components/ChannelMatrixGuide";
import { FreelancerGuideModal } from "./components/FreelancerGuideModal";
import { BeginnerGatewayAdvisor } from "./components/BeginnerGatewayAdvisor";
import { CurrencyConverter } from "./components/CurrencyConverter";
import { AIDealRouter } from "./components/AIDealRouter";
import { InflowTracker } from "./components/InflowTracker";
import { RouteCalculation } from "./types";
import { CurrencyCode } from "./utils/currencies";

import {
  ShieldCheck,
  BookOpen,
  X,
  Compass,
  ArrowRight,
  Bot,
  Wallet,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
} from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<FeatureTab>("aideal");
  const [invoiceAmount, setInvoiceAmount] = useState<number>(2000);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>("USD");
  const [interbankRate, setInterbankRate] = useState<number>(278.45);
  const [isPsebRegistered, setIsPsebRegistered] = useState<boolean>(true);
  const [selectedPurposeCode, setSelectedPurposeCode] = useState<string>("9186");
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState<boolean>(false);
  const [showLifecycleTracker, setShowLifecycleTracker] = useState<boolean>(true);

  // Derive which stage the current tab belongs to
  const currentStage: 1 | 2 | 3 =
    activeTab === "aideal" || activeTab === "contract"
      ? 1
      : activeTab === "optimizer" || activeTab === "beginner" || activeTab === "converter"
      ? 2
      : 3;

  // Fetch live market benchmark rate on mount
  useEffect(() => {
    fetch("/api/fx-rates")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data?.interbankRate) {
          setInterbankRate(data.interbankRate);
        }
      })
      .catch((err) => console.warn("Using default benchmark rate:", err?.message || err));
  }, []);

  const handleSelectRouteForCompliance = (route: RouteCalculation) => {
    setInvoiceAmount(route.grossAmountUsd);
    setActiveTab("compliance");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleApplyDetectedAmount = (amt: number) => {
    setInvoiceAmount(amt);
    setActiveTab("optimizer");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleApplyPurposeCode = (code: string) => {
    setSelectedPurposeCode(code);
    setActiveTab("compliance");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Mobile Drawer Backdrop */}
      {isMobileNavOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setIsMobileNavOpen(false)}
        />
      )}

      {/* 3-Step Freelancer Guide Modal */}
      <FreelancerGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        onNavigate={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />

      {/* Left Navigation Panel / Features Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        invoiceAmount={invoiceAmount}
        setInvoiceAmount={setInvoiceAmount}
        interbankRate={interbankRate}
        setInterbankRate={setInterbankRate}
        isPsebRegistered={isPsebRegistered}
        setIsPsebRegistered={setIsPsebRegistered}
        isMobileOpen={isMobileNavOpen}
        setIsMobileOpen={setIsMobileNavOpen}
        onOpenGuideModal={() => setIsGuideModalOpen(true)}
      />

      {/* Main Content Area on the Right */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader
          activeTab={activeTab}
          onOpenMobileMenu={() => setIsMobileNavOpen(true)}
          invoiceAmount={invoiceAmount}
          interbankRate={interbankRate}
          isPsebRegistered={isPsebRegistered}
          setIsPsebRegistered={setIsPsebRegistered}
          onOpenGuideModal={() => setIsGuideModalOpen(true)}
        />

        <main className="flex-1 w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 space-y-6">
          {/* Interactive Remittance Lifecycle Journey Tracker */}
          {showLifecycleTracker ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs transition-colors relative">
              <button
                onClick={() => setShowLifecycleTracker(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Hide lifecycle tracker"
                aria-label="Hide lifecycle tracker"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pr-8 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Freelancer Remittance Journey
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">•</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Stage {currentStage} of 3 Active
                  </span>
                </div>

                <button
                  onClick={() => setIsGuideModalOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline w-fit"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>How Remittances Work (SBP Guide)</span>
                </button>
              </div>

              {/* 3 Step Interactive Story Track */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3">
                {/* Stage 1 */}
                <button
                  onClick={() => {
                    setActiveTab("aideal");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`text-left p-3.5 rounded-xl border transition-all relative ${
                    currentStage === 1
                      ? "bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 shadow-2xs"
                      : "bg-slate-50/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          currentStage === 1
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        1
                      </span>
                      <span className="text-[11px] font-extrabold uppercase tracking-wide text-indigo-700 dark:text-indigo-400">
                        Deal & Scope
                      </span>
                    </div>
                    {currentStage === 1 ? (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-600 text-white">
                        Current
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">Step 1</span>
                    )}
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    AI Router & Contract Guard
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Scan client chats, spot payment traps, and route to optimal payout channels.
                  </p>
                </button>

                {/* Stage 2 */}
                <button
                  onClick={() => {
                    setActiveTab("optimizer");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`text-left p-3.5 rounded-xl border transition-all relative ${
                    currentStage === 2
                      ? "bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 shadow-2xs"
                      : "bg-slate-50/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          currentStage === 2
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        2
                      </span>
                      <span className="text-[11px] font-extrabold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                        Route & Rates
                      </span>
                    </div>
                    {currentStage === 2 ? (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-600 text-white">
                        Current
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">Step 2</span>
                    )}
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    Net PKR Calculator & FX
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Compare 11 corridors, check clearance times, and avoid hidden bank spreads.
                  </p>
                </button>

                {/* Stage 3 */}
                <button
                  onClick={() => {
                    setActiveTab("compliance");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`text-left p-3.5 rounded-xl border transition-all relative ${
                    currentStage === 3
                      ? "bg-amber-50/70 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 shadow-2xs"
                      : "bg-slate-50/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          currentStage === 3
                            ? "bg-amber-600 text-white"
                            : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        3
                      </span>
                      <span className="text-[11px] font-extrabold uppercase tracking-wide text-amber-800 dark:text-amber-400">
                        Bank & Tax Lock
                      </span>
                    </div>
                    {currentStage === 3 ? (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-600 text-white">
                        Current
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">Step 3</span>
                    )}
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    SBP Bank Letter & Inflow Ledger
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Lock 0.25% Sec 154A tax rate, generate bank clearance memo & log realized savings.
                  </p>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-medium">
                  Current Stage: <strong className="text-slate-900 dark:text-white">Stage {currentStage}</strong> (
                  {currentStage === 1
                    ? "Deal & Scope"
                    : currentStage === 2
                    ? "Route & Rates"
                    : "Bank & Tax Lock"}
                  )
                </span>
              </div>
              <button
                onClick={() => setShowLifecycleTracker(true)}
                className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold text-xs flex items-center gap-1"
              >
                <span>Show Remittance Journey</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {activeTab === "aideal" && (
            <AIDealRouter
              onApplyToCalculator={(amt, tab) => {
                setInvoiceAmount(amt);
                if (tab) setActiveTab(tab);
                else setActiveTab("optimizer");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              onApplyPurposeCode={(code) => {
                setSelectedPurposeCode(code);
              }}
            />
          )}

          {activeTab === "ledger" && (
            <InflowTracker
              onNavigateToPack={() => {
                setActiveTab("compliance");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              isPsebRegistered={isPsebRegistered}
            />
          )}

          {activeTab === "beginner" && (
            <BeginnerGatewayAdvisor
              onSelectTab={setActiveTab}
              onSetInvoiceAmount={(amt) => setInvoiceAmount(amt)}
            />
          )}

          {activeTab === "converter" && (
            <CurrencyConverter
              onApplyToCalculator={(usdVal, tab, curr) => {
                setInvoiceAmount(usdVal);
                if (curr) setSelectedCurrency(curr);
                if (tab) setActiveTab(tab);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          )}

          {activeTab === "optimizer" && (
            <PayoutOptimizer
              invoiceAmount={invoiceAmount}
              setInvoiceAmount={setInvoiceAmount}
              selectedCurrency={selectedCurrency}
              setSelectedCurrency={setSelectedCurrency}
              interbankRate={interbankRate}
              setInterbankRate={setInterbankRate}
              isPsebRegistered={isPsebRegistered}
              setIsPsebRegistered={setIsPsebRegistered}
              onSelectRouteForCompliance={handleSelectRouteForCompliance}
            />
          )}

          {activeTab === "contract" && (
            <ContractRiskScanner
              onApplyDetectedAmount={handleApplyDetectedAmount}
              onApplyPurposeCode={handleApplyPurposeCode}
              onNavigateToCompliance={() => setActiveTab("compliance")}
            />
          )}

          {activeTab === "compliance" && (
            <CompliancePackGenerator
              initialAmount={invoiceAmount}
              initialPurposeCode={selectedPurposeCode}
              isPsebRegistered={isPsebRegistered}
              setIsPsebRegistered={setIsPsebRegistered}
            />
          )}

          {activeTab === "matrix" && (
            <ChannelMatrixGuide
              invoiceAmount={invoiceAmount}
              interbankRate={interbankRate}
              isPsebRegistered={isPsebRegistered}
              onSelectTab={setActiveTab}
              onSetInvoiceAmount={(amt) => setInvoiceAmount(amt)}
            />
          )}
        </main>

        {/* Clean, Reassuring Footer */}
        <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 mt-8 transition-colors">
          <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 dark:text-white">InflowPK</span>
              <span>•</span>
              <span>Built for Pakistani freelancers, remote developers & creators</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>0.25% Tax under FBR Sec 154A</span>
              </span>
              <span>•</span>
              <span>SBP FE Circular 04/2021</span>
              <span>•</span>
              <span>Purpose Code 9186</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

