import React, { useState, useEffect } from "react";
import {
  CurrencyCode,
  SUPPORTED_CURRENCIES,
  convertToPKR,
  convertToUSD,
  formatCurrencyAmount,
} from "../utils/currencies";
import { formatPKR } from "../utils/payoutCalculator";
import {
  ArrowRightLeft,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Info,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { FeatureTab } from "./Sidebar";

interface CurrencyConverterProps {
  onApplyToCalculator: (amountUsd: number, tab?: FeatureTab) => void;
}

export const CurrencyConverter: React.FC<CurrencyConverterProps> = ({
  onApplyToCalculator,
}) => {
  const [amount, setAmount] = useState<number>(1000);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>("EUR");
  const [liveRates, setLiveRates] = useState<Record<string, number>>({});
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [dataSource, setDataSource] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch live cross-rates from /api/fx-rates
  const fetchLiveRates = () => {
    setIsLoading(true);
    fetch("/api/fx-rates")
      .then((res) => res.json())
      .then((data) => {
        if (data.currencies) {
          const map: Record<string, number> = {};
          Object.keys(data.currencies).forEach((k) => {
            map[k] = data.currencies[k].pkrRate;
          });
          setLiveRates(map);
        }
        if (data.lastUpdated) {
          setLastUpdated(new Date(data.lastUpdated).toLocaleTimeString());
        }
        if (data.source) {
          setDataSource(data.source);
        }
      })
      .catch((err) => console.log("Using baseline fallback rates", err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchLiveRates();
  }, []);

  const currInfo = SUPPORTED_CURRENCIES[selectedCurrency];
  // Current active PKR rate (live or fallback)
  const currentPkrRate = liveRates[selectedCurrency] || currInfo.pkrRate;

  // Benchmark total PKR
  const interbankTotalPkr = Math.round(amount * currentPkrRate);

  // Digital Channel rate (~0.95% spread, e.g. Elevate / SadaBiz)
  const wholesaleRate = Number((currentPkrRate * (1 - 0.0095)).toFixed(2));
  const wholesaleTotalPkr = Math.round(amount * wholesaleRate);

  // Predatory Channel rate (~3.5% spread, e.g. Payoneer / Upwork LBP)
  const predatoryRate = Number((currentPkrRate * (1 - 0.035)).toFixed(2));
  const predatoryTotalPkr = Math.round(amount * predatoryRate);

  // Hidden loss
  const rupeesLost = wholesaleTotalPkr - predatoryTotalPkr;

  // USD equivalent for calculator
  const equivalentUsd = convertToUSD(amount, selectedCurrency);

  return (
    <div className="space-y-6">
      {/* Main Conversion Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Live Interbank Cross-Rates
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Direct Conversion to PKR
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Multi-Currency to PKR Calculator
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Compare exact landing values for Euros (€), British Pounds (£), US Dollars ($), UAE Dirhams, and Saudi Riyals.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchLiveRates}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isLoading ? "animate-spin" : ""}`} />
              <span>{isLoading ? "Updating..." : "Refresh Rates"}</span>
            </button>
          </div>
        </div>

        {/* Currency Grid */}
        <div className="pt-6">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5">
            Select Your Invoicing Currency
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {(Object.keys(SUPPORTED_CURRENCIES) as CurrencyCode[]).map((code) => {
              const item = SUPPORTED_CURRENCIES[code];
              const rate = liveRates[code] || item.pkrRate;
              const isSelected = selectedCurrency === code;
              return (
                <button
                  key={code}
                  onClick={() => {
                    setSelectedCurrency(code);
                    if (item.sampleAmounts.length > 0) {
                      setAmount(item.sampleAmounts[1] || 1000);
                    }
                  }}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    isSelected
                      ? "bg-slate-900 dark:bg-emerald-600 text-white border-slate-900 dark:border-emerald-600 shadow-2xs"
                      : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="text-base">{item.flag}</div>
                  <div className="font-extrabold text-xs mt-0.5">{item.code}</div>
                  <div
                    className={`text-[10px] font-mono mt-0.5 ${
                      isSelected ? "text-slate-300 dark:text-emerald-100" : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    Rs. {rate.toFixed(1)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Amount Input & Preset Chips */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Invoice Amount in {currInfo.name} ({currInfo.code})
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-base">
                {currInfo.symbol}
              </span>
              <input
                type="number"
                min={1}
                value={amount || ""}
                onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                className="w-full pl-9 pr-14 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-extrabold text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                placeholder="1000"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">
                {currInfo.code}
              </span>
            </div>

            {/* Quick preset chips */}
            <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
              <span className="text-[11px] text-slate-400 mr-1">Presets:</span>
              {currInfo.sampleAmounts.map((val) => (
                <button
                  key={val}
                  onClick={() => setAmount(val)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    amount === val
                      ? "bg-slate-900 dark:bg-emerald-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {currInfo.symbol}{val.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Benchmark Total Display */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Pure Interbank Equivalent</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                1 {currInfo.code} = Rs. {currentPkrRate.toFixed(2)}
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono mt-1">
              {formatPKR(interbankTotalPkr)}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Exact mid-market valuation before bank spreads or platform fees.
            </div>
          </div>
        </div>

        {/* Comparative Spread Impact */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Wholesale Route */}
            <div className="p-4 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-emerald-900 dark:text-emerald-300">
                  Wholesale Gateway (Elevate / SadaBiz)
                </span>
                <span className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">
                  ~0.95% Spread
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-emerald-950 dark:text-emerald-200 font-mono">
                {formatPKR(wholesaleTotalPkr)}
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                Rate: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">Rs. {wholesaleRate.toFixed(2)}</span> per {currInfo.code}
              </div>
            </div>

            {/* Predatory Route */}
            <div className="p-4 rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-rose-900 dark:text-rose-300">
                  Legacy Channel (Payoneer / Upwork LBP)
                </span>
                <span className="font-mono text-[11px] text-rose-700 dark:text-rose-400 font-bold">
                  ~3.5% Spread
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-rose-950 dark:text-rose-200 font-mono">
                {formatPKR(predatoryTotalPkr)}
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                Rate: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">Rs. {predatoryRate.toFixed(2)}</span> per {currInfo.code}
              </div>
            </div>
          </div>

          {/* Rupees Lost Highlight */}
          {rupeesLost > 0 && (
            <div className="mt-4 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-700 dark:text-slate-300">
                  Hidden loss on legacy channels:
                </span>
                <span className="font-extrabold text-rose-600 dark:text-rose-400 font-mono text-sm">
                  {formatPKR(rupeesLost)}
                </span>
              </div>

              <button
                onClick={() => onApplyToCalculator(equivalentUsd, "channels")}
                className="px-3.5 py-1.5 rounded-lg bg-slate-900 dark:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>View All 8 Gateways for this Payout</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Transparent Rate Source & Euro Explanation */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Rate Source & Euro Rate Clarification
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
            <span className="font-bold text-slate-900 dark:text-white block">
              Where does InflowPK fetch data from?
            </span>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              We connect to live interbank feeds (<span className="font-mono text-slate-700 dark:text-slate-300">open.er-api.com</span>), updated hourly, and cross-reference them with the <strong>State Bank of Pakistan (SBP)</strong> official daily exchange rate bulletin.
              {lastUpdated && (
                <span className="block mt-1 font-mono text-[10px] text-slate-500 dark:text-slate-400">
                  Last verified sync: {lastUpdated}
                </span>
              )}
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
            <span className="font-bold text-slate-900 dark:text-white block">
              Why was the Euro (EUR) rate previously showing lower?
            </span>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              Previously, a static benchmark of Rs. 305.20 was cached from older 2023 data. In the real currency market, with USD/PKR around ~Rs. 278.4 and EUR/USD around ~1.157, <strong>1 EUR is currently worth ~Rs. 322.20</strong>. We have updated all calculations to reflect the true live rate.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
