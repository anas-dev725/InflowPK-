import React from "react";
import {
  Wallet,
  FileSearch,
  ShieldCheck,
  TableProperties,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  DollarSign,
  ArrowUpRight,
  Info,
  Layers,
  Lightbulb,
  BookOpen,
  ArrowRightLeft,
  Sun,
  Moon,
  Compass,
  Sparkles,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export type FeatureTab =
  | "aideal"
  | "beginner"
  | "converter"
  | "optimizer"
  | "contract"
  | "compliance"
  | "matrix";

interface SidebarProps {
  activeTab: FeatureTab;
  setActiveTab: (tab: FeatureTab) => void;
  invoiceAmount: number;
  setInvoiceAmount: (amount: number) => void;
  interbankRate: number;
  setInterbankRate: (rate: number) => void;
  isPsebRegistered: boolean;
  setIsPsebRegistered: (val: boolean) => void;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
  onOpenGuideModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  invoiceAmount,
  setInvoiceAmount,
  interbankRate,
  setInterbankRate,
  isPsebRegistered,
  setIsPsebRegistered,
  isMobileOpen = false,
  setIsMobileOpen,
  onOpenGuideModal,
}) => {
  const { theme, toggleTheme } = useTheme();

  const navItems: {
    id: FeatureTab;
    stepNumber: string;
    title: string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    badgeColor?: string;
  }[] = [
    {
      id: "aideal",
      stepNumber: "AI Judge",
      title: "AI Deal Router",
      subtitle: "Messy chat to optimal payout",
      icon: Sparkles,
      badge: "Hackathon",
      badgeColor: "bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300",
    },
    {
      id: "beginner",
      stepNumber: "Start Here",
      title: "Gateway & Speed Finder",
      subtitle: "Find your gateway & arrival time",
      icon: Compass,
      badge: "Beginner",
      badgeColor: "bg-indigo-100 text-indigo-800",
    },
    {
      id: "converter",
      stepNumber: "Live FX",
      title: "Currency Converter",
      subtitle: "USD, GBP, EUR, AED to PKR",
      icon: ArrowRightLeft,
      badge: "Rates",
      badgeColor: "bg-blue-100 text-blue-800",
    },
    {
      id: "optimizer",
      stepNumber: "Step 1",
      title: "Payout Calculator",
      subtitle: "Find the highest PKR route",
      icon: Wallet,
      badge: "Save PKR",
      badgeColor: "bg-emerald-100 text-emerald-800",
    },
    {
      id: "contract",
      stepNumber: "Step 2",
      title: "Contract & Offer Scanner",
      subtitle: "Spot scope creep & traps",
      icon: FileSearch,
      badge: "AI Review",
      badgeColor: "bg-indigo-100 text-indigo-800",
    },
    {
      id: "compliance",
      stepNumber: "Step 3",
      title: "SBP & e-PRC Pack",
      subtitle: "Bank letter & 0.25% tax lock",
      icon: ShieldCheck,
      badge: "Sec 154A",
      badgeColor: "bg-amber-100 text-amber-800",
    },
    {
      id: "matrix",
      stepNumber: "Directory",
      title: "Gateways & Delivery Times",
      subtitle: "Rates & arrival in local account",
      icon: TableProperties,
      badge: "11 Gateways",
      badgeColor: "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300",
    },
  ];

  const handleSelectTab = (tab: FeatureTab) => {
    setActiveTab(tab);
    if (setIsMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <aside
      className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}
    >
      {/* Top Header Section */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
        {/* Brand Logo & Theme Toggle */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-base shadow-sm shadow-emerald-200 dark:shadow-none shrink-0">
              PK
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  Inflow<span className="text-emerald-600">PK</span>
                </span>
                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  v2.2
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                Pakistani Freelancer Finance Hub
              </p>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle dark/light mode"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>
        </div>

        {/* Navigation Section */}
        <div className="space-y-1">
          {/* Quick Guide Launch Button */}
          {onOpenGuideModal && (
            <button
              onClick={onOpenGuideModal}
              className="w-full mb-3 py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-300 text-xs font-bold transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span>How to Use InflowPK</span>
              </div>
              <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full group-hover:scale-105 transition-transform">
                Guide →
              </span>
            </button>
          )}

          <div className="px-2 mb-1.5 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Navigation & Tools
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">Step-by-Step</span>
          </div>

          <nav className="space-y-1" id="features-nav-panel">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-2.5 group relative ${
                    isActive
                      ? "bg-slate-900 dark:bg-emerald-600 text-white shadow-xs"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      isActive
                        ? "bg-emerald-500 dark:bg-emerald-700 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-white dark:group-hover:bg-slate-700 group-hover:text-emerald-600"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>

                  <div className="flex-1 min-w-0 pr-1">
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={`text-xs font-bold truncate ${
                          isActive ? "text-white" : "text-slate-900 dark:text-white"
                        }`}
                      >
                        {item.title}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {item.stepNumber}
                      </span>
                    </div>
                    <p
                      className={`text-[11px] truncate mt-0.5 ${
                        isActive ? "text-slate-300 dark:text-emerald-100" : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {item.subtitle}
                    </p>
                  </div>

                  {isActive && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-emerald-400 rounded-l" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick Settings & Preset Payout Widget */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="px-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Quick Payout Settings
            </span>
          </div>

          {/* Amount Quick-Adjust */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/70 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <span>Invoice Amount</span>
              </label>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">USD ($)</span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                <DollarSign className="w-4 h-4" />
              </div>
              <input
                id="sidebar-invoice-input"
                type="number"
                min={50}
                step={50}
                value={invoiceAmount || ""}
                onChange={(e) => setInvoiceAmount(Math.max(1, Number(e.target.value)))}
                className="w-full pl-7 pr-3 py-1.5 text-sm font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-slate-900 dark:text-white"
              />
            </div>
            {/* Quick buttons */}
            <div className="flex items-center justify-between gap-1 pt-1">
              {[1000, 2000, 3500, 5000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setInvoiceAmount(amt)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-all ${
                    invoiceAmount === amt
                      ? "bg-emerald-600 text-white"
                      : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  }`}
                >
                  ${amt >= 1000 ? `${amt / 1000}k` : amt}
                </button>
              ))}
            </div>
          </div>

          {/* USD/PKR Interbank Benchmark */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/70 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>USD/PKR Benchmark</span>
              </div>
              <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-200 dark:border-emerald-800">
                Interbank
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-base font-extrabold text-slate-900 dark:text-white font-mono">
                Rs. {interbankRate.toFixed(2)}
              </div>
              <button
                onClick={() => {
                  const newRate = prompt(
                    "Update USD/PKR Benchmark Rate:",
                    interbankRate.toString()
                  );
                  if (newRate && !isNaN(Number(newRate))) {
                    setInterbankRate(Number(newRate));
                  }
                }}
                className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 underline"
                title="Edit benchmark rate manually"
              >
                Change
              </button>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              State Bank weighted interbank market average.
            </p>
          </div>

          {/* PSEB Tax Switch */}
          <div
            onClick={() => setIsPsebRegistered(!isPsebRegistered)}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              isPsebRegistered
                ? "bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/60"
                : "bg-amber-50/70 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 hover:bg-amber-50 dark:hover:bg-amber-950/60"
            }`}
            title="Click to toggle PSEB registration status"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                <span>PSEB Registered</span>
              </div>
              <div
                className={`w-4 h-4 rounded flex items-center justify-center text-white text-[10px] font-bold ${
                  isPsebRegistered ? "bg-emerald-600" : "bg-amber-500"
                }`}
              >
                {isPsebRegistered ? "✓" : "!"}
              </div>
            </div>
            <div className="text-xs font-extrabold">
              {isPsebRegistered ? (
                <span className="text-emerald-700 dark:text-emerald-300">0.25% Tax (Section 154A)</span>
              ) : (
                <span className="text-amber-800 dark:text-amber-300">1.00% Standard Tax</span>
              )}
            </div>
            <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5 leading-tight">
              {isPsebRegistered
                ? "Eligible for reduced 0.25% export withholding tax."
                : "Tap here to see your 75% tax savings with PSEB."}
            </p>
          </div>
        </div>
      </div>

      {/* Friendly Bottom Tip Card */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
        <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>Freelancer Tip</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
            Elevate Pay + local PKR transfer saves up to <strong>PKR 25,000</strong> per $2,000 vs direct Upwork withdrawal.
          </p>
        </div>
      </div>
    </aside>
  );
};
