import React from "react";
import { Menu, ShieldCheck, HelpCircle, ChevronRight, BookOpen, Sun, Moon } from "lucide-react";
import { FeatureTab } from "./Sidebar";
import { formatPKR } from "../utils/payoutCalculator";
import { useTheme } from "../context/ThemeContext";

interface TopHeaderProps {
  activeTab: FeatureTab;
  onOpenMobileMenu: () => void;
  invoiceAmount: number;
  interbankRate: number;
  isPsebRegistered: boolean;
  setIsPsebRegistered: (val: boolean) => void;
  onOpenGuideModal?: () => void;
}

const TAB_TITLES: Record<
  FeatureTab,
  { title: string; subtitle: string; tag: string; tagColor: string }
> = {
  aideal: {
    title: "AI Deal Judge & Gateway Router",
    subtitle: "Turn client chat & project scope into the optimal payout route & tax code",
    tag: "Stage 1 • Deal Analysis",
    tagColor: "bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300",
  },
  contract: {
    title: "Contract & Scope Guard",
    subtitle: "Scan client brief, Upwork job, or contract to spot payment traps & milestone risks",
    tag: "Stage 1 • Scope Review",
    tagColor: "bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300",
  },
  optimizer: {
    title: "Net PKR Payout Calculator",
    subtitle: "Compare 11 withdrawal corridors to maximize take-home Pakistani Rupees",
    tag: "Stage 2 • Route Comparison",
    tagColor: "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300",
  },
  beginner: {
    title: "Gateway & Clearance Speed Finder",
    subtitle: "Find your optimal payout account, required documents & clearance speed",
    tag: "Stage 2 • Corridors",
    tagColor: "bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300",
  },
  converter: {
    title: "Multi-Currency to PKR Converter",
    subtitle: "Real-time rates for USD, GBP, EUR, AED & SAR with hidden bank spread detector",
    tag: "Stage 2 • Live FX",
    tagColor: "bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300",
  },
  compliance: {
    title: "SBP Bank Letter & e-PRC Pack",
    subtitle: "Official bank clearance memo for 0.25% Sec 154A tax lock & swift fund release",
    tag: "Stage 3 • Bank & Tax",
    tagColor: "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300",
  },
  ledger: {
    title: "Inflow Ledger & FX Savings Tracker",
    subtitle: "Realized earnings, cumulative bank markups saved, and certified FBR tax records",
    tag: "Stage 3 • Payout Records",
    tagColor: "bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300",
  },
  matrix: {
    title: "Gateways Comparison Directory",
    subtitle: "Complete directory of 11 payment channels with effective rates, cards & KYC requirements",
    tag: "Stage 3 • Full Directory",
    tagColor: "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200",
  },
};

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeTab,
  onOpenMobileMenu,
  invoiceAmount,
  interbankRate,
  isPsebRegistered,
  setIsPsebRegistered,
  onOpenGuideModal,
}) => {
  const { theme, toggleTheme } = useTheme();
  const currentInfo = TAB_TITLES[activeTab] || TAB_TITLES.optimizer;
  const roughPkr = invoiceAmount * interbankRate;

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 transition-colors">
      <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-10 py-3 flex items-center justify-between gap-4">
        {/* Mobile menu trigger & Section title */}
        <div className="flex items-center gap-3">
          <button
            id="btn-mobile-sidebar-toggle"
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {currentInfo.title}
              </h2>
              <span
                className={`hidden sm:inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ${currentInfo.tagColor}`}
              >
                {currentInfo.tag}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              {currentInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Quick At-a-Glance Info Pills & Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {onOpenGuideModal && (
            <button
              onClick={onOpenGuideModal}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all"
              title="Click for a 3-step guide on how to use InflowPK"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>How It Works</span>
            </button>
          )}

          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Value:</span>
            <span className="font-extrabold text-slate-900 dark:text-white font-mono">
              ${invoiceAmount.toLocaleString()} USD
            </span>
            <span className="text-slate-400">≈</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              {formatPKR(roughPkr)}
            </span>
          </div>

          <button
            id="btn-quick-tax-toggle"
            onClick={() => setIsPsebRegistered(!isPsebRegistered)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              isPsebRegistered
                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100"
                : "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 hover:bg-amber-100"
            }`}
            title="Click to toggle PSEB 0.25% vs 1.00% tax rate"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{isPsebRegistered ? "0.25% Tax" : "1.00% Tax"}</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            aria-label="Toggle dark/light theme"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
