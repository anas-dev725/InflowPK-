import React, { useState, useMemo } from "react";
import { CHANNELS } from "../utils/payoutCalculator";
import { formatPKR } from "../utils/payoutCalculator";
import {
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  RefreshCw,
  Search,
  Filter,
  DollarSign,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Info,
  Building2,
  CreditCard,
  Wallet,
  Tag,
  Zap,
} from "lucide-react";
import { FeatureTab } from "./Sidebar";

interface ChannelMatrixGuideProps {
  invoiceAmount?: number;
  interbankRate?: number;
  isPsebRegistered?: boolean;
  onSelectTab?: (tab: FeatureTab) => void;
  onSetInvoiceAmount?: (amount: number) => void;
}

type SortOption = "netPkr" | "speed" | "rate" | "fees";
type FilterCategory = "all" | "bonus" | "fast" | "cards" | "marketplaces" | "bank_wire";

export const ChannelMatrixGuide: React.FC<ChannelMatrixGuideProps> = ({
  invoiceAmount = 2000,
  interbankRate = 278.45,
  isPsebRegistered = true,
  onSelectTab,
  onSetInvoiceAmount,
}) => {
  const [customAmount, setCustomAmount] = useState<number>(invoiceAmount);
  const [sortBy, setSortBy] = useState<SortOption>("netPkr");
  const [filterCat, setFilterCat] = useState<FilterCategory>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // Tax rate (0.25% with PSEB, 1.0% without)
  const taxRatePercent = isPsebRegistered ? 0.25 : 1.0;

  // Process and enrich each gateway option
  const gateways = useMemo(() => {
    return CHANNELS.map((ch) => {
      // 1. Calculate platform fee
      const platformFeeUsd = (customAmount * ch.percentageFee) / 100;
      // 2. Intermediary / fixed fee
      const fixedFeeUsd = ch.fixedFeeUsd;
      // 3. Net USD to convert
      const netUsd = Math.max(0, customAmount - platformFeeUsd - fixedFeeUsd);
      // 4. Effective FX Rate
      const effectiveRate = Number((interbankRate * (1 - ch.spreadPercent / 100)).toFixed(2));
      // 5. Gross PKR
      const grossPkr = netUsd * effectiveRate;
      // 6. Tax
      const taxPkr = (grossPkr * taxRatePercent) / 100;
      // 7. Net PKR credited in local bank account
      const netPkr = Math.round(grossPkr - taxPkr);

      // Numeric speed score for sorting (hours)
      let speedHours = 72;
      if (ch.id === "remitly") speedHours = 1;
      else if (ch.id === "ace_money") speedHours = 1;
      else if (ch.id === "sadabiz") speedHours = 2;
      else if (ch.id === "jazzcash_nayapay") speedHours = 0.5;
      else if (ch.id === "wise") speedHours = 18;
      else if (ch.id === "elevate") speedHours = 24;
      else if (ch.id === "nsave") speedHours = 36;
      else if (ch.id === "payoneer") speedHours = 48;
      else if (ch.id === "upwork_direct") speedHours = 60;
      else if (ch.id === "swift") speedHours = 96;
      else if (ch.id === "skrill") speedHours = 72;

      // Delivery breakdown text
      let deliveryBreakdown = "";
      if (ch.id === "remitly") {
        deliveryBreakdown = "Client pays via Apple Pay or Card -> Dispatched instantly through SBP Raast / 1LINK directly to your Pakistani IBAN or JazzCash. Total: Instant to 2 hours.";
      } else if (ch.id === "ace_money") {
        deliveryBreakdown = "Client sends via UK Faster Payments or Card -> Direct settlement into Pakistani bank account via Raast. Total: Instant to 1 hour.";
      } else if (ch.id === "nsave") {
        deliveryBreakdown = "Client sends SEPA (EUR), UK Faster Payments (GBP), or ACH (USD) -> Credited to your Swiss IBAN -> Hold in foreign currency or withdraw to Pakistani IBAN via SWIFT/partner. Total: 1 to 2 business days.";
      } else if (ch.id === "elevate") {
        deliveryBreakdown = "US Client ACH: 24-48h -> Withdrawal to local Pakistani IBAN: Instant - 3 hours (via 1LINK/Raast). Total: 1-2 business days.";
      } else if (ch.id === "sadabiz") {
        deliveryBreakdown = "Client confirms payment link with Apple Pay / Card -> Instant credit into your SadaPay PKR wallet. Total: Instant to 24 hours.";
      } else if (ch.id === "wise") {
        deliveryBreakdown = "Wise converts mid-market -> Dispatched to local Pakistani bank partner. Total: 4 to 24 hours.";
      } else if (ch.id === "payoneer") {
        deliveryBreakdown = "Client/Upwork loads Payoneer (1-2 days) -> Withdrawal to local Pakistani bank (1-2 days). Total: 2 to 4 business days.";
      } else if (ch.id === "swift") {
        deliveryBreakdown = "Foreign bank wire via SWIFT network -> Intermediary bank clearing -> Local branch compliance hold. Total: 3 to 5 business days.";
      } else if (ch.id === "upwork_direct") {
        deliveryBreakdown = "Upwork initiates batch ACH via local Pakistani clearing house. Total: 2 to 4 business days.";
      } else if (ch.id === "jazzcash_nayapay") {
        deliveryBreakdown = "Direct API withdrawal from Payoneer balance to JazzCash/NayaPay wallet. Total: Instant (under 5 minutes).";
      } else if (ch.id === "skrill") {
        deliveryBreakdown = "Skrill balance withdrawal to local Pakistani bank account. Total: 2 to 5 business days.";
      }

      return {
        ...ch,
        netUsd,
        effectiveRate,
        grossPkr,
        taxPkr,
        netPkr,
        speedHours,
        deliveryBreakdown,
        totalFeesUsd: platformFeeUsd + fixedFeeUsd,
      };
    });
  }, [customAmount, interbankRate, taxRatePercent]);

  // Find max net PKR to calculate savings vs top route
  const maxNetPkr = useMemo(() => {
    return Math.max(...gateways.map((g) => g.netPkr));
  }, [gateways]);

  // Filter and sort gateways
  const filteredAndSorted = useMemo(() => {
    return gateways
      .filter((g) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const match =
            g.name.toLowerCase().includes(q) ||
            g.provider.toLowerCase().includes(q) ||
            g.bestFor.toLowerCase().includes(q) ||
            g.settlementTime.toLowerCase().includes(q) ||
            (g.bonusRateNote && g.bonusRateNote.toLowerCase().includes(q)) ||
            (g.transferChannels && g.transferChannels.some((c) => c.toLowerCase().includes(q)));
          if (!match) return false;
        }

        // Category filter
        if (filterCat === "bonus") return Boolean(g.bonusRateNote);
        if (filterCat === "fast") return g.speedHours <= 24;
        if (filterCat === "cards")
          return (
            g.id === "remitly" ||
            g.id === "sadabiz" ||
            g.id === "ace_money" ||
            g.id === "wise" ||
            (g.transferChannels && g.transferChannels.some((c) => c.includes("Card") || c.includes("Apple Pay")))
          );
        if (filterCat === "marketplaces")
          return g.id === "elevate" || g.id === "payoneer" || g.id === "upwork_direct" || g.id === "jazzcash_nayapay";
        if (filterCat === "bank_wire") return g.id === "swift" || g.id === "elevate" || g.id === "nsave" || g.id === "wise";
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "netPkr") return b.netPkr - a.netPkr;
        if (sortBy === "speed") return a.speedHours - b.speedHours;
        if (sortBy === "rate") return b.effectiveRate - a.effectiveRate;
        if (sortBy === "fees") return a.totalFeesUsd - b.totalFeesUsd;
        return 0;
      });
  }, [gateways, searchQuery, filterCat, sortBy]);

  const toggleRow = (id: string) => {
    setExpandedRow((prev) => (prev === id ? null : id));
  };

  const handleAmountPreset = (amt: number) => {
    setCustomAmount(amt);
    if (onSetInvoiceAmount) onSetInvoiceAmount(amt);
  };

  return (
    <div className="space-y-6">
      {/* Header & Overview */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Independent Banking Directory
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                8 Verified Pakistani Freelance Gateways
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Payment Gateways & Delivery Times to Pakistan
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Every method available for Pakistani freelancers to receive international client funds, with real effective exchange rates, transparent delivery timelines to your local PKR account, direct charges, and State Bank compliance.
            </p>
          </div>

          {/* SBP Live Benchmark Card */}
          <div className="bg-slate-50 dark:bg-slate-800/80 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shrink-0 min-w-[240px]">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Interbank Reference
              </span>
              <span className="text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded">
                Live Feed
              </span>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono mt-1">
              Rs. {interbankRate.toFixed(2)}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
              <span>USD/PKR SBP Market Base</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">
                Tax: {taxRatePercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Amount Input & Preset Chips */}
        <div className="pt-6 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
          <div className="sm:col-span-6 lg:col-span-5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Simulated Invoice Amount (USD)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                $
              </span>
              <input
                type="number"
                min={50}
                step={50}
                value={customAmount || ""}
                onChange={(e) => {
                  const val = Math.max(1, Number(e.target.value));
                  setCustomAmount(val);
                  if (onSetInvoiceAmount) onSetInvoiceAmount(val);
                }}
                className="w-full pl-8 pr-16 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                placeholder="2000"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400">
                USD
              </span>
            </div>
          </div>

          <div className="sm:col-span-6 lg:col-span-7">
            <span className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Quick Test Amounts
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[500, 1000, 2000, 3500, 5000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => handleAmountPreset(amt)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    customAmount === amt
                      ? "bg-slate-900 dark:bg-emerald-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  ${amt >= 1000 ? `${amt / 1000}k` : amt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filter & View Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {[
            { id: "all", label: `All Gateways (${gateways.length})` },
            { id: "bonus", label: "Bonus Rates & Promos" },
            { id: "fast", label: "Fastest (<24h Delivery)" },
            { id: "cards", label: "Apple Pay & Cards" },
            { id: "marketplaces", label: "Upwork & Fiverr" },
            { id: "bank_wire", label: "Direct Bank / Wire" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCat(cat.id as FilterCategory)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                filterCat === cat.id
                  ? "bg-slate-900 dark:bg-emerald-600 text-white shadow-2xs"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Sort & View Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-700 dark:text-slate-300">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-transparent font-bold text-slate-900 dark:text-white outline-none cursor-pointer text-xs"
            >
              <option value="netPkr" className="dark:bg-slate-900">Highest Net PKR</option>
              <option value="speed" className="dark:bg-slate-900">Fastest Delivery Time</option>
              <option value="rate" className="dark:bg-slate-900">Best Exchange Rate</option>
              <option value="fees" className="dark:bg-slate-900">Lowest Direct Fees</option>
            </select>
          </div>

          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-0.5">
            <button
              onClick={() => setViewMode("table")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                viewMode === "table"
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                viewMode === "cards"
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Cards
            </button>
          </div>
        </div>
      </div>

      {/* Main Table View */}
      {viewMode === "table" ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Gateway & Provider</th>
                  <th className="py-3.5 px-4">Time to Deliver in Local Account</th>
                  <th className="py-3.5 px-4">Effective Rate (PKR)</th>
                  <th className="py-3.5 px-4">Direct Fees</th>
                  <th className="py-3.5 px-4">Net PKR on ${customAmount.toLocaleString()}</th>
                  <th className="py-3.5 px-4">e-PRC Ease</th>
                  <th className="py-3.5 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredAndSorted.map((item) => {
                  const isTopNet = item.netPkr === maxNetPkr;
                  const difference = item.netPkr - maxNetPkr;
                  const isExpanded = expandedRow === item.id;

                  return (
                    <React.Fragment key={item.id}>
                      <tr
                        onClick={() => toggleRow(item.id)}
                        className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer ${
                          isTopNet ? "bg-emerald-50/30 dark:bg-emerald-950/10" : ""
                        }`}
                      >
                        {/* Gateway Name */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-1.5 flex-wrap">
                                <span>{item.name}</span>
                                {isTopNet && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-600 text-white">
                                    Top Payout
                                  </span>
                                )}
                                {item.bonusRateNote && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                                    Bonus Rate
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                {item.provider}
                              </div>
                              {item.transferChannels && (
                                <div className="flex items-center gap-1 flex-wrap mt-1">
                                  <span className="text-[10px] text-slate-400 font-medium">Pay via:</span>
                                  {item.transferChannels.slice(0, 3).map((ch, idx) => (
                                    <span
                                      key={idx}
                                      className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[9px] font-medium text-slate-600 dark:text-slate-300"
                                    >
                                      {ch}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Delivery Time to Local Account */}
                        <td className="py-4 px-4">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 font-bold text-xs">
                            <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>{item.settlementTime}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 truncate max-w-[200px]">
                            {item.deliveryBreakdown.split("->")[0]}
                          </div>
                        </td>

                        {/* Effective FX Rate */}
                        <td className="py-4 px-4 font-mono">
                          <div className="font-extrabold text-slate-900 dark:text-white text-xs">
                            Rs. {item.effectiveRate.toFixed(2)}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">
                            {item.spreadPercent === 0
                              ? "0% spread (Interbank)"
                              : `${item.spreadPercent}% below SBP`}
                          </div>
                        </td>

                        {/* Direct Fees */}
                        <td className="py-4 px-4 font-mono text-xs">
                          {item.totalFeesUsd === 0 ? (
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              $0.00 Free
                            </span>
                          ) : (
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              ${item.totalFeesUsd.toFixed(2)}
                            </span>
                          )}
                          <div className="text-[10px] text-slate-400">
                            {item.percentageFee > 0 ? `${item.percentageFee}% gross` : ""}
                            {item.fixedFeeUsd > 0 ? ` +$${item.fixedFeeUsd}` : ""}
                          </div>
                        </td>

                        {/* Net PKR Credited */}
                        <td className="py-4 px-4 font-mono">
                          <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                            {formatPKR(item.netPkr)}
                          </div>
                          {difference < 0 ? (
                            <div className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
                              {formatPKR(difference)} vs Top
                            </div>
                          ) : (
                            <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                              Highest PKR
                            </div>
                          )}
                        </td>

                        {/* e-PRC Ease */}
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.eprcEase === "Instant App" || item.eprcEase === "Very High"
                                ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300"
                                : item.eprcEase === "Moderate"
                                ? "bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300"
                                : "bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300"
                            }`}
                          >
                            {item.eprcEase}
                          </span>
                        </td>

                        {/* Expand Action */}
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRow(item.id);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded In-Depth Drawer */}
                      {isExpanded && (
                        <tr className="bg-slate-50/70 dark:bg-slate-800/50">
                          <td colSpan={7} className="p-4 sm:p-6">
                            <div className="space-y-4 max-w-4xl">
                              <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                                  Delivery Timeline & Steps to Your Pakistani Bank
                                </h4>
                                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                                  {item.deliveryBreakdown}
                                </p>
                              </div>

                              {item.bonusRateNote && (
                                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
                                  <Tag className="w-4 h-4 text-amber-600 shrink-0" />
                                  <div>
                                    <span className="font-bold">Promotional Bonus / Rate Feature: </span>
                                    <span>{item.bonusRateNote}</span>
                                  </div>
                                </div>
                              )}

                              {item.transferChannels && (
                                <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
                                  <span className="font-bold text-slate-700 dark:text-slate-300">Channels Client Can Pay With:</span>
                                  {item.transferChannels.map((ch, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-medium shadow-2xs"
                                    >
                                      {ch}
                                    </span>
                                  ))}
                                </div>
                              )}

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                                <div>
                                  <span className="block text-[10px] font-bold uppercase text-slate-400">
                                    Best Suited For
                                  </span>
                                  <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
                                    {item.bestFor}
                                  </span>
                                </div>
                                <div>
                                  <span className="block text-[10px] font-bold uppercase text-slate-400">
                                    Advantages
                                  </span>
                                  <ul className="text-xs text-slate-600 dark:text-slate-400 list-disc list-inside space-y-0.5 mt-0.5">
                                    {item.pros.slice(0, 2).map((p, idx) => (
                                      <li key={idx}>{p}</li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <span className="block text-[10px] font-bold uppercase text-slate-400">
                                    Drawbacks & Caveats
                                  </span>
                                  <ul className="text-xs text-slate-600 dark:text-slate-400 list-disc list-inside space-y-0.5 mt-0.5">
                                    {item.cons.slice(0, 2).map((c, idx) => (
                                      <li key={idx}>{c}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-2">
                                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                  Net calculation includes {taxRatePercent}% FBR withholding tax under Section 154A.
                                </span>
                                {onSelectTab && (
                                  <button
                                    onClick={() => onSelectTab("optimizer")}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition-colors"
                                  >
                                    <span>Calculate Payout Breakdown</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAndSorted.map((item) => {
            const isTopNet = item.netPkr === maxNetPkr;
            const difference = item.netPkr - maxNetPkr;

            return (
              <div
                key={item.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 shadow-xs flex flex-col justify-between transition-all ${
                  isTopNet
                    ? "border-emerald-500 dark:border-emerald-500/80 ring-1 ring-emerald-500/20"
                    : "border-slate-200 dark:border-slate-800"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-bold text-slate-900 dark:text-white text-base">
                          {item.name}
                        </h3>
                        {isTopNet && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-600 text-white">
                            Top Rate
                          </span>
                        )}
                        {item.bonusRateNote && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                            <Zap className="w-2.5 h-2.5" />
                            <span>Bonus Rate</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.provider}
                      </p>

                      {/* Transfer channels pills */}
                      {item.transferChannels && (
                        <div className="flex items-center gap-1 flex-wrap mt-2">
                          <span className="text-[10px] text-slate-400 font-medium">Pay via:</span>
                          {item.transferChannels.map((ch, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-700 dark:text-slate-300"
                            >
                              {ch}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                        item.eprcEase === "Instant App" || item.eprcEase === "Very High"
                          ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {item.eprcEase} e-PRC
                    </span>
                  </div>

                  {/* Delivery time highlight */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl my-3 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        Landing Time in Pakistani Bank:
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {item.settlementTime}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                      {item.deliveryBreakdown}
                    </p>
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-3 gap-2 py-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase font-mono">
                        FX Rate
                      </span>
                      <span className="font-extrabold text-slate-900 dark:text-white font-mono">
                        Rs. {item.effectiveRate.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase font-mono">
                        Direct Fees
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                        ${item.totalFeesUsd.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase font-mono">
                        Net Payout
                      </span>
                      <span className="font-extrabold text-emerald-700 dark:text-emerald-400 font-mono">
                        {formatPKR(item.netPkr)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] truncate max-w-[200px]">
                    {item.bestFor}
                  </span>
                  {difference < 0 ? (
                    <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 font-mono">
                      {formatPKR(difference)} vs Top
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      Maximum Rupees
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Transparent Data Source & Exchange Rates Truth Box */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Data Source & Foreign Exchange Rate Transparency
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
            <span className="font-bold text-slate-900 dark:text-white block">
              Where are the rates fetched from?
            </span>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              Rates are fetched from live open interbank feeds (<span className="font-mono text-slate-700 dark:text-slate-300">open.er-api.com</span>) cross-referenced against the <strong>State Bank of Pakistan (SBP) weighted interbank market average</strong>.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
            <span className="font-bold text-slate-900 dark:text-white block">
              Why was the Euro (EUR) rate previously lower?
            </span>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              Earlier static tables relied on historical 2023 rates (Rs. 305/EUR). We updated the live feed: 1 EUR is now correctly valued at <strong className="text-emerald-700 dark:text-emerald-400 font-mono">~Rs. 322.20</strong> based on the real USD/PKR (278.4) and EUR/USD (1.157) cross-rate.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
            <span className="font-bold text-slate-900 dark:text-white block">
              How is the net landing PKR calculated?
            </span>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              Formula: <span className="font-mono text-[10px] block mt-0.5 text-slate-800 dark:text-slate-200">Net USD = Gross - Fixed Fees - % Fees</span>
              <span className="font-mono text-[10px] block text-slate-800 dark:text-slate-200">Net PKR = (Net USD × Effective FX) - Section 154A Tax</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
