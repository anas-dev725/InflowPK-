import React, { useState } from "react";
import {
  DollarSign,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  Info,
  ChevronDown,
  ChevronUp,
  Clock,
  Award,
  AlertTriangle,
  ArrowDownRight,
  CheckCircle,
} from "lucide-react";
import { RouteCalculation, PayoutChannel } from "../types";
import { compareAllRoutes, formatPKR, formatUSD } from "../utils/payoutCalculator";

interface PayoutOptimizerProps {
  invoiceAmount: number;
  setInvoiceAmount: (amt: number) => void;
  interbankRate: number;
  setInterbankRate: (rate: number) => void;
  isPsebRegistered: boolean;
  setIsPsebRegistered: (val: boolean) => void;
  onSelectRouteForCompliance: (route: RouteCalculation) => void;
}

export const PayoutOptimizer: React.FC<PayoutOptimizerProps> = ({
  invoiceAmount,
  setInvoiceAmount,
  interbankRate,
  setInterbankRate,
  isPsebRegistered,
  setIsPsebRegistered,
  onSelectRouteForCompliance,
}) => {
  const [sourceType, setSourceType] = useState<"direct" | "upwork" | "all">("all");
  const [expandedRouteId, setExpandedRouteId] = useState<string | null>(null);

  const routes = compareAllRoutes(invoiceAmount, interbankRate, isPsebRegistered);

  // Filter based on source if desired
  const filteredRoutes = routes.filter((r) => {
    if (sourceType === "upwork") {
      return ["elevate", "payoneer", "upwork_direct", "wise"].includes(r.channel.id);
    }
    if (sourceType === "direct") {
      return ["elevate", "sadabiz", "swift", "wise"].includes(r.channel.id);
    }
    return true;
  });

  const optimalRoute = routes[0];
  const worstRoute = routes[routes.length - 1];
  const maxSavings = optimalRoute ? optimalRoute.netPkrReceived - worstRoute.netPkrReceived : 0;

  const quickAmounts = [500, 1200, 2000, 3500, 5000, 10000];

  return (
    <div className="space-y-8">
      {/* Top Controls & Configuration Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Corridor Leakage Analyzer
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Net Landing PKR in Your Account
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Payout Route Optimizer
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl mt-1">
              Model real take-home rupees across all channels after factoring in intermediary fees, FX spreads, and FBR Section 154A withholding tax.
            </p>
          </div>

          {/* Quick Stats Pill */}
          {maxSavings > 0 && (
            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex items-center gap-3.5 shrink-0">
              <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Extra Rupees Kept vs Worst Channel
                </div>
                <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                  +{formatPKR(maxSavings)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Parameters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-6 items-end">
          {/* Invoice Amount Input */}
          <div className="md:col-span-5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Invoice Amount (USD)
            </label>
            <div className="relative rounded-xl shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <DollarSign className="w-5 h-5" />
              </div>
              <input
                id="input-invoice-amount"
                type="number"
                min={50}
                step={50}
                value={invoiceAmount || ""}
                onChange={(e) => setInvoiceAmount(Math.max(1, Number(e.target.value)))}
                className="block w-full pl-10 pr-14 py-2.5 text-lg font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-mono"
                placeholder="2000"
              />
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-xs font-bold text-slate-400">
                USD ($)
              </div>
            </div>

            {/* Quick preset chips */}
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              <span className="text-[11px] text-slate-400 mr-1 self-center">Presets:</span>
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setInvoiceAmount(amt)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    invoiceAmount === amt
                      ? "bg-slate-900 dark:bg-emerald-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  ${amt.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Source Filter */}
          <div className="md:col-span-4">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Payment Source
            </label>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setSourceType("all")}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  sourceType === "all"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                All Sources
              </button>
              <button
                onClick={() => setSourceType("direct")}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  sourceType === "direct"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Direct Client
              </button>
              <button
                onClick={() => setSourceType("upwork")}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  sourceType === "upwork"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Upwork/Fiverr
              </button>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
              Filter corridors applicable to your contract structure.
            </p>
          </div>

          {/* SBP / FBR Tax Status Toggle */}
          <div className="md:col-span-3">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              FBR Export Tax
            </label>
            <button
              id="btn-tax-status-toggle"
              type="button"
              onClick={() => setIsPsebRegistered(!isPsebRegistered)}
              className={`w-full py-2 px-3 rounded-xl border flex items-center justify-between text-left transition-all ${
                isPsebRegistered
                  ? "bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300"
                  : "bg-amber-50/60 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300"
              }`}
            >
              <div>
                <div className="text-xs font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  {isPsebRegistered ? "0.25% PSEB Registered" : "1.00% Standard Tax"}
                </div>
                <div className="text-[10px] opacity-80 mt-0.5">
                  {isPsebRegistered
                    ? "Section 154A (75% tax reduction)"
                    : "Unregistered (Non-PSEB rate)"}
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                  isPsebRegistered ? "bg-emerald-600 text-white" : "bg-amber-500 text-white"
                }`}
              >
                {isPsebRegistered ? "✓" : "!"}
              </div>
            </button>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
              PSEB export registration saves Rs. 15,000+ per $2,000.
            </p>
          </div>
        </div>
      </div>

      {/* Primary Comparison Highlight Banner - Clean Institutional Dark Card */}
      {optimalRoute && (
        <div className="bg-slate-900 dark:bg-slate-950 rounded-2xl p-6 text-white border border-slate-800 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-2.5">
                <Award className="w-3.5 h-3.5" />
                <span>Optimal Route for ${invoiceAmount.toLocaleString()}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                {optimalRoute.channel.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                Yields <span className="font-bold text-white font-mono">{formatPKR(optimalRoute.netPkrReceived)}</span> net in your Pakistani bank. You avoid losing <span className="font-bold text-emerald-400 font-mono">{formatPKR(maxSavings)}</span> vs legacy channels.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700 text-center sm:text-right">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Net Deposited in Bank
                </div>
                <div className="text-xl sm:text-2xl font-extrabold text-emerald-400 font-mono">
                  {formatPKR(optimalRoute.netPkrReceived)}
                </div>
              </div>

              <button
                id="btn-optimal-compliance"
                onClick={() => onSelectRouteForCompliance(optimalRoute)}
                className="px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <span>Generate SBP Compliance Pack</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Routes List Side-by-Side Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Payout Routes Ranked by Net PKR (Highest to Lowest)
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Showing {filteredRoutes.length} channels modeled for {formatUSD(invoiceAmount)}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredRoutes.map((route, index) => {
            const isOptimal = index === 0;
            const isExpanded = expandedRouteId === route.channel.id;
            const diffFromOptimal = optimalRoute.netPkrReceived - route.netPkrReceived;

            return (
              <div
                key={route.channel.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOptimal
                    ? "border-emerald-500 dark:border-emerald-600 shadow-2xs ring-1 ring-emerald-500/30"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div className="p-5 sm:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Provider info & badges */}
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm ${
                          isOptimal
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        #{index + 1}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                            {route.channel.name}
                          </h4>
                          {route.channel.badge && (
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                isOptimal
                                  ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                                  : route.channel.id === "payoneer" || route.channel.id === "upwork_direct"
                                  ? "bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                              }`}
                            >
                              {route.channel.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {route.channel.description}
                        </p>

                        {/* Quick metadata badges */}
                        <div className="flex flex-wrap items-center gap-3 mt-2.5 text-xs text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1 font-mono">
                            <span className="text-slate-400">Rate:</span>
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {route.fxRateUsed.toFixed(2)} PKR
                            </span>
                            <span className="text-slate-400 text-[11px]">
                              ({route.channel.spreadPercent}% spread)
                            </span>
                          </span>

                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{route.channel.settlementTime}</span>
                          </span>

                          <span className="flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                            <span>e-PRC: <strong className="text-slate-800 dark:text-slate-200">{route.channel.eprcEase}</strong></span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Numbers & Action */}
                    <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100 dark:border-slate-800">
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 lg:text-right font-medium">
                          Net Deposited to PKR Bank
                        </div>
                        <div
                          className={`text-2xl font-black font-mono lg:text-right ${
                            isOptimal ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"
                          }`}
                        >
                          {formatPKR(route.netPkrReceived)}
                        </div>
                      </div>

                      {diffFromOptimal > 0 ? (
                        <div className="flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400 lg:text-right mt-1">
                          <TrendingDown className="w-3.5 h-3.5" />
                          <span>- {formatPKR(diffFromOptimal)} leakage</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 lg:text-right mt-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Highest Net Payout</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Multi-Hop Trajectory Steps */}
                  <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-slate-400 font-medium">Route Path:</span>
                      {route.channel.hops.map((hop, hIndex) => (
                        <React.Fragment key={hIndex}>
                          <span className="px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                            {hop}
                          </span>
                          {hIndex < route.channel.hops.length - 1 && (
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setExpandedRouteId(isExpanded ? null : route.channel.id)}
                        className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <span>{isExpanded ? "Hide Math" : "View Breakdown"}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        id={`btn-route-memo-${route.channel.id}`}
                        onClick={() => onSelectRouteForCompliance(route)}
                        className="text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 transition-all flex items-center gap-1"
                      >
                        <span>Create Bank Memo</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Fee Leakage Math Panel */}
                {isExpanded && (
                  <div className="bg-slate-50/80 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 p-5 sm:p-6 text-xs text-slate-700 dark:text-slate-300 space-y-4">
                    <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                      <Info className="w-4 h-4 text-slate-500" />
                      <span>Transparent Math & Deduction Audit for {route.channel.name}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 font-mono">
                      <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase">Platform & Wire Fees</div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                          {formatUSD(route.platformFeeUsd + route.intermediaryFeeUsd)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Platform: ${route.platformFeeUsd} | Fixed: ${route.intermediaryFeeUsd}
                        </div>
                      </div>

                      <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase">Hidden FX Spread Loss</div>
                        <div className="text-sm font-bold text-amber-700 dark:text-amber-400 mt-1">
                          {formatPKR(route.fxSpreadLossPkr)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {route.channel.spreadPercent}% below interbank
                        </div>
                      </div>

                      <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase">
                          Withholding Tax ({route.whtPercent}%)
                        </div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                          {formatPKR(route.whtDeductionPkr)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Section 154A export tax
                        </div>
                      </div>

                      <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase">Total Leakage vs Ideal</div>
                        <div className="text-sm font-bold text-rose-700 dark:text-rose-400 mt-1">
                          {formatPKR(route.totalLeakagePkr)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Sum of all friction costs
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="space-y-1">
                        <span className="font-bold text-emerald-800 dark:text-emerald-400">Advantages:</span>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-400">
                          {route.channel.pros.map((p, i) => (
                            <li key={i}>{p}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-1">
                        <span className="font-bold text-amber-800 dark:text-amber-400">Cautions:</span>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-400">
                          {route.channel.cons.map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
