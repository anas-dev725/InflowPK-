import React, { useState } from "react";
import {
  Upload,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Clock,
  Bot,
  DollarSign,
  FileText,
  MessageSquare,
  HelpCircle,
  TrendingUp,
  CreditCard,
  Building,
  RefreshCw,
  Info,
  BookmarkCheck,
} from "lucide-react";

import { AIDealRouteResult } from "../types";
import { formatPKR, formatUSD } from "../utils/payoutCalculator";
import { FeatureTab } from "./Sidebar";

interface AIDealRouterProps {
  onApplyToCalculator: (amount: number, tab?: FeatureTab) => void;
  onApplyPurposeCode?: (code: string) => void;
}

const DEMO_PRESETS = [
  {
    label: "US Client (Stripe vs ACH)",
    desc: "$2,800 Dev Project via chat",
    text: `Client (San Francisco, USA):
"Hey Anas, our team reviewed the proposal and we want to move forward with the frontend rebuild ($2,800). Can I just pay you with a company credit card or Stripe? How does receiving money in Pakistan work? Also, we want revisions included until our CMO signs off on the final design."`,
  },
  {
    label: "UK Client (Apple Pay / Instant)",
    desc: "£1,400 Branding & UI",
    text: `Client (London, UK):
"Hi Anas! Loved your Figma work. We're ready to kickoff the branding project for £1,400. What's the quickest way for me to pay you using Apple Pay or my UK debit card? We need the initial screens by next Tuesday."`,
  },
  {
    label: "European Enterprise ($5,500)",
    desc: "Retainer & Swiss/SEPA IBAN",
    text: `Client (Berlin, Germany):
"Dear Anas, please send us your formal invoice for the $5,500 Q3 infrastructure retainer. Our finance department can transfer via SEPA (EUR) or international wire. We require your company name, IBAN, and tax identification code."`,
  },
];

export const AIDealRouter: React.FC<AIDealRouterProps> = ({
  onApplyToCalculator,
  onApplyPurposeCode,
}) => {
  const [inputText, setInputText] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AIDealRouteResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedReply, setCopiedReply] = useState(false);
  const [savedToLedger, setSavedToLedger] = useState(false);
  const [activePipelineStep, setActivePipelineStep] = useState(0);

  // File upload handler (drag & drop or click)
  const handleImageSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (PNG, JPG, WebP screenshot).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImagePreview(dataUrl);
      setImageBase64(dataUrl);
      setImageMimeType(file.type);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageSelect(e.target.files[0]);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageBase64(null);
    setImageMimeType(null);
  };

  const runAnalysis = async (textToUse?: string) => {
    const promptContent = textToUse !== undefined ? textToUse : inputText;
    if (!promptContent.trim() && !imageBase64) {
      setError("Please paste a client message, WhatsApp thread, or upload a screenshot.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setActivePipelineStep(1);

    // Progressive step indicator for judges
    const timer1 = setTimeout(() => setActivePipelineStep(2), 700);
    const timer2 = setTimeout(() => setActivePipelineStep(3), 1400);
    const timer3 = setTimeout(() => setActivePipelineStep(4), 2100);

    try {
      const res = await fetch("/api/route-deal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: promptContent,
          imageBase64,
          imageMimeType,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Failed to analyze deal.");
      }

      const data = await res.json();
      setResult(data.result);
    } catch (err: any) {
      setError(err.message || "An error occurred while routing the deal.");
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      setIsLoading(false);
      setActivePipelineStep(0);
    }
  };

  const copyClientReply = () => {
    if (!result?.clientReadyReply) return;
    navigator.clipboard.writeText(result.clientReadyReply);
    setCopiedReply(true);
    setTimeout(() => setCopiedReply(false), 2500);
  };

  const handleSaveToLedger = () => {
    if (!result) return;
    const clientLoc = result.clientProfile?.clientLocation || "Direct Client";
    const newRecord = {
      id: "rec-" + Date.now(),
      clientName: clientLoc.split(",")[0] || "Client Project",
      clientCountry: clientLoc.includes(",") ? clientLoc.split(",")[1].trim() : clientLoc,
      grossAmountUsd: result.commercialTerms.invoiceAmount,
      currency: result.commercialTerms.currency || "USD",
      gatewayUsed: result.optimalRoute.gatewayName,
      purposeCode: (result.reasoning.sbpPurposeCode?.code || "9186") + " - " + (result.reasoning.sbpPurposeCode?.title || "IT Services"),
      date: new Date().toISOString().split("T")[0],
      effectiveFxRate: result.optimalRoute.effectiveFxRatePkr || 277.5,
      netPkrReceived: result.optimalRoute.netPkrDeposited,
      rupeesSavedVsLegacy: result.optimalRoute.rupeesSavedVsLegacy,
      whtDeductionPkr: Math.round(result.optimalRoute.netPkrDeposited * 0.0025),
      status: "Realized" as const,
      notes: result.optimalRoute.whyChosen,
    };
    try {
      const existing = localStorage.getItem("inflowpk_ledger_records_v1");
      const list = existing ? JSON.parse(existing) : [];
      localStorage.setItem("inflowpk_ledger_records_v1", JSON.stringify([newRecord, ...list]));
      setSavedToLedger(true);
      setTimeout(() => setSavedToLedger(false), 3000);
    } catch (e) {
      console.error("Failed to save to ledger", e);
    }
  };


  return (
    <div className="space-y-6">
      {/* Hackathon Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 mb-2">
              <Bot className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>AI Deal Judge & Gateway Router</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Turn Messy Client Chats into Optimal Payouts
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Paste a WhatsApp/Slack thread, Upwork offer, or client brief. The AI extracts deal terms, calculates hidden FX cuts, flags scope traps, and routes you to the payment gateway that puts the most PKR in your Pakistani bank.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
              <span className="font-bold text-slate-900 dark:text-white">4-Stage Pipeline:</span> Classify &bull; Extract &bull; Reason &bull; Route
            </div>
          </div>
        </div>
      </div>

      {/* Input Section: Text or Image + Demo Presets */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm transition-colors space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
            <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>1. Feed Messy Input (Chat Thread, Brief, or Screenshot)</span>
          </label>

          {/* Quick Demo Presets for 3-minute Hackathon Pitch */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mr-1">Demo Scenarios:</span>
            {DEMO_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputText(preset.text);
                  runAnalysis(preset.text);
                }}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 border border-slate-200 dark:border-slate-700 transition-colors"
                title={preset.desc}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Responsive Desktop 2-Column: Text & Screenshot Side-by-Side */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          {/* Text Input Area (7 cols on lg) */}
          <div className="lg:col-span-7 flex flex-col">
            <textarea
              rows={5}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Paste client chat, Upwork proposal, email brief, or message thread here...\nExample: "Hey Anas, we're ready to hire you for $2,500. Can I pay via Stripe or wire? How do we send to Pakistan?"`}
              className="w-full flex-1 min-h-[130px] text-xs sm:text-sm font-mono p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400 transition-colors"
            />
          </div>

          {/* Drag & Drop Screenshot / Image Area (5 cols on lg) */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="lg:col-span-5 border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 rounded-xl p-4 text-center transition-colors bg-slate-50/50 dark:bg-slate-950/50 flex flex-col items-center justify-center min-h-[130px]"
          >
            {imagePreview ? (
              <div className="flex items-center justify-between gap-3 w-full p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <img
                  src={imagePreview}
                  alt="Uploaded screenshot"
                  className="w-16 h-16 object-cover rounded border border-slate-200 dark:border-slate-700 shrink-0"
                />
                <div className="text-left flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                    Screenshot Attached
                  </p>
                  <p className="text-[11px] text-slate-500">Ready for multimodal analysis</p>
                </div>
                <button
                  type="button"
                  onClick={removeImage}
                  className="px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded font-bold"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 py-2 w-full">
                <div className="p-2.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Drop client chat screenshot</span>
                  <div className="text-[11px] text-slate-400 mt-0.5">or click to browse PNG, JPG</div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-slate-500">
            Judges: Model classifies location &bull; extracts figures &bull; detects scope traps &bull; routes optimal gateway
          </span>
          <button
            type="button"
            disabled={isLoading || (!inputText.trim() && !imageBase64)}
            onClick={() => runAnalysis()}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Judging & Routing...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>AI Reason & Route</span>
              </>
            )}
          </button>
        </div>

        {/* Progressive Pipeline Visualizer during Loading */}
        {isLoading && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Executing Hackathon Judgement Pipeline:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-[11px]">
              <div
                className={`p-2 rounded-lg border transition-colors ${
                  activePipelineStep >= 1
                    ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 text-indigo-700 dark:text-indigo-300 font-bold"
                    : "bg-white dark:bg-slate-900 border-slate-200 text-slate-400"
                }`}
              >
                1. Classify Corridor
              </div>
              <div
                className={`p-2 rounded-lg border transition-colors ${
                  activePipelineStep >= 2
                    ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 text-indigo-700 dark:text-indigo-300 font-bold"
                    : "bg-white dark:bg-slate-900 border-slate-200 text-slate-400"
                }`}
              >
                2. Extract Terms & SBP Code
              </div>
              <div
                className={`p-2 rounded-lg border transition-colors ${
                  activePipelineStep >= 3
                    ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 text-indigo-700 dark:text-indigo-300 font-bold"
                    : "bg-white dark:bg-slate-900 border-slate-200 text-slate-400"
                }`}
              >
                3. Reason FX & Bonus Rates
              </div>
              <div
                className={`p-2 rounded-lg border transition-colors ${
                  activePipelineStep >= 4
                    ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 text-indigo-700 dark:text-indigo-300 font-bold"
                    : "bg-white dark:bg-slate-900 border-slate-200 text-slate-400"
                }`}
              >
                4. Route & Client Reply
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Structured Output Section */}
      {result && (
        <div className="space-y-6">
          {/* Top Card: Optimal Route Recommendation */}
          <div className="bg-white dark:bg-slate-900 border-2 border-emerald-500/80 rounded-2xl p-5 sm:p-6 shadow-sm relative overflow-hidden transition-colors">
            <div className="absolute top-0 right-0 bg-emerald-500 text-white font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-bl-xl shadow-xs">
              Optimal AI Payout Route
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {result.optimalRoute.gatewayName}
                  </h3>
                  {result.optimalRoute.bonusRateNote && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                      {result.optimalRoute.bonusRateNote}
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  {result.optimalRoute.whyChosen}
                </p>

                {/* Delivery Time & Client Channels */}
                <div className="flex flex-wrap items-center gap-4 pt-2 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                    <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Lands in Local Account: {result.optimalRoute.deliveryTimeLocalAccount}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <span className="font-bold">Client Pays With:</span>
                    <div className="flex items-center gap-1">
                      {result.optimalRoute.transferChannels.map((ch, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-medium"
                        >
                          {ch}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* PKR Financial Summary */}
              <div className="lg:text-right shrink-0 bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 min-w-[240px]">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Net Deposited into PKR Account
                </p>
                <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {formatPKR(result.optimalRoute.netPkrDeposited)}
                </p>
                <div className="mt-1 flex items-center lg:justify-end gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Saves Rs. {result.optimalRoute.rupeesSavedVsLegacy.toLocaleString()} vs legacy wire/LBP</span>
                </div>
                <div className="mt-3 space-y-2">
                  <button
                    onClick={() => {
                      onApplyToCalculator(result.commercialTerms.invoiceAmount, "optimizer");
                      if (onApplyPurposeCode) {
                        onApplyPurposeCode(result.reasoning.sbpPurposeCode.code);
                      }
                    }}
                    className="w-full py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>View in Payout Optimizer</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={handleSaveToLedger}
                    disabled={savedToLedger}
                    className="w-full py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/80 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-600"
                  >
                    {savedToLedger ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">Logged to Inflow Ledger!</span>
                      </>
                    ) : (
                      <>
                        <BookmarkCheck className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Save Deal to Ledger</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Runner-up Tradeoff */}
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-400">
              <div>
                <span className="font-bold text-slate-900 dark:text-white">Runner-Up Alternative:</span>{" "}
                {result.runnerUpRoute.gatewayName} ({result.runnerUpRoute.deliveryTimeLocalAccount}) &bull;{" "}
                <span className="text-slate-500">{result.runnerUpRoute.tradeoffNote}</span>
              </div>
              <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {formatPKR(result.runnerUpRoute.netPkrDeposited)}
              </div>
            </div>
          </div>

          {/* 3-Column Structured Breakdown: Intelligence, Risks, and Compliance */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Column 1: Client & Commercial Intelligence */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Building className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>1. Extracted Deal Terms</span>
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Client Location:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {result.clientProfile.clientLocation}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Invoice Amount:</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">
                    {result.commercialTerms.currency} {result.commercialTerms.invoiceAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Structure:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {result.commercialTerms.billingStructure}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Client Type:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {result.clientProfile.clientType}
                  </span>
                </div>
              </div>

              <div className="pt-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white">Corridor Summary: </span>
                {result.reasoning.corridorSummary}
              </div>
            </div>

            {/* Column 2: Contract Risks & Pitfalls */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>2. Pitfalls & Scope Safeguards</span>
              </h4>

              <div className="space-y-2">
                {result.reasoning.contractPitfalls.map((pitfall, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-300"
                  >
                    &bull; {pitfall}
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-slate-500 pt-1">
                {result.reasoning.hiddenLeakageWarning}
              </p>
            </div>

            {/* Column 3: SBP Tax & Bank Compliance */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>3. SBP & FBR Tax Lock</span>
              </h4>

              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 text-xs space-y-1.5">
                <div className="flex items-center justify-between font-bold text-emerald-900 dark:text-emerald-200">
                  <span>Purpose Code:</span>
                  <span className="font-mono bg-white dark:bg-emerald-900 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-700">
                    {result.reasoning.sbpPurposeCode.code}
                  </span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                  {result.reasoning.sbpPurposeCode.title}
                </p>
                <p className="text-emerald-700 dark:text-emerald-400 font-bold text-[11px]">
                  {result.reasoning.sbpPurposeCode.taxRate}
                </p>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <span className="font-bold text-slate-900 dark:text-white">Next Action Steps:</span>
                {result.actionStepsForFreelancer.map((step, idx) => (
                  <p key={idx} className="text-[11px] leading-relaxed">
                    {step}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Client-Ready Reply Box (Copy-paste straight into WhatsApp / Slack / Upwork) */}
          <div className="bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/60 rounded-2xl p-5 sm:p-6 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Client-Ready Response (Send to WhatsApp / Slack / Email)</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Polite, professional response guiding the client to your optimal route without awkwardness.
                </p>
              </div>

              <button
                onClick={copyClientReply}
                className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/80 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-all flex items-center gap-1.5 border border-indigo-200 dark:border-indigo-800"
              >
                {copiedReply ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Message</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-sans leading-relaxed whitespace-pre-wrap">
              {result.clientReadyReply}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
