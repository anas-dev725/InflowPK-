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
import { RouteCalculation } from "./types";
import { ShieldCheck, BookOpen, X, Sparkles } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<FeatureTab>("aideal");
  const [invoiceAmount, setInvoiceAmount] = useState<number>(2000);
  const [interbankRate, setInterbankRate] = useState<number>(278.45);
  const [isPsebRegistered, setIsPsebRegistered] = useState<boolean>(true);
  const [selectedPurposeCode, setSelectedPurposeCode] = useState<string>("9186");
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState<boolean>(false);
  const [showBannerGuide, setShowBannerGuide] = useState<boolean>(true);

  // Fetch live market benchmark rate on mount
  useEffect(() => {
    fetch("/api/fx-rates")
      .then((res) => res.json())
      .then((data) => {
        if (data.interbankRate) {
          setInterbankRate(data.interbankRate);
        }
      })
      .catch((err) => console.log("Using default benchmark rate", err));
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

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
          {/* Helpful 3-Step Overview Banner for Pakistani Freelancers */}
          {showBannerGuide && (
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-700 relative overflow-hidden">
              <button
                onClick={() => setShowBannerGuide(false)}
                className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700/50 transition-colors"
                title="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pr-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-1.5">
                    <span>How to Use InflowPK</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    New here? Follow the Pakistani Freelancer Journey:
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    <strong>1. Gateway Finder:</strong> Discover which gateway fits you & how fast money lands. &bull;{" "}
                    <strong>2. Calculator:</strong> Save Rs. 20,000+ on exchange rates. &bull;{" "}
                    <strong>3. Bank Pack:</strong> Lock 0.25% export tax & claim your e-PRC.
                  </p>
                </div>

                <button
                  onClick={() => setIsGuideModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shrink-0 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Open Full Guide</span>
                </button>
              </div>
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

          {activeTab === "beginner" && (
            <BeginnerGatewayAdvisor
              onSelectTab={setActiveTab}
              onSetInvoiceAmount={(amt) => setInvoiceAmount(amt)}
            />
          )}

          {activeTab === "converter" && (
            <CurrencyConverter
              onApplyToCalculator={(usdVal, tab) => {
                setInvoiceAmount(usdVal);
                if (tab) setActiveTab(tab);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          )}

          {activeTab === "optimizer" && (
            <PayoutOptimizer
              invoiceAmount={invoiceAmount}
              setInvoiceAmount={setInvoiceAmount}
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
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
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

