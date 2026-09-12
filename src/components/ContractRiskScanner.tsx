import React, { useState } from "react";
import {
  FileText,
  AlertTriangle,
  ShieldCheck,
  FileSearch,
  Copy,
  Check,
  ArrowRight,
  Send,
  Loader2,
  DollarSign,
  Briefcase,
  Layers,
  HelpCircle,
} from "lucide-react";
import { ContractAnalysisResult } from "../types";

interface ContractRiskScannerProps {
  onApplyDetectedAmount: (amount: number) => void;
  onApplyPurposeCode: (code: string) => void;
  onNavigateToCompliance: () => void;
}

const SAMPLE_CONTRACTS = [
  {
    id: "sample-upwork",
    title: "Upwork $2,000 Full-Stack App (Vague Milestones)",
    badge: "Scope Creep & Unlimited Revisions",
    text: `Job Title: Full-Stack React & Node.js Dashboard Application
Client Location: Austin, Texas, USA
Fixed-Price Budget: $2,000 USD (Escrow funded: $500 for Milestone 1)

Scope & Deliverables:
We need a seasoned developer to build a complete SaaS analytics dashboard. You will build user auth, team management, Stripe billing integration, dynamic chart builders, and export to CSV/PDF.

Terms:
1. Freelancer will work until the client is completely satisfied with the design and functionality. Unlimited revisions are included until final launch.
2. Milestone 1 ($500) covers initial prototype and auth.
3. Milestone 2 ($1,500) will be released once the full app is deployed to production, tested by our beta users, and all bugs found by our team over a 60-day observation window are resolved.
4. Freelancer agrees to be on-call for urgent maintenance for 30 days post-launch without additional billing.`,
  },
  {
    id: "sample-retainer",
    title: "Enterprise Retainer $3,500/mo (Net-60 Payment Trap)",
    badge: "Delayed Payment & IP Risk",
    text: `Independent Contractor Master Services Agreement
Parties: Apex Digital Solutions Inc. (Delaware) and Freelance Contractor
Compensation: $3,500 USD monthly retainer

Statement of Work:
Contractor will provide software architecture, cloud engineering, and technical advisory services as requested by the Product Management department from time to time. No weekly hourly cap is established; Contractor is expected to deliver whatever deliverables are assigned within standard sprint cycles.

Payment & Invoicing Terms:
Invoices shall be rendered at the conclusion of each calendar month. Due to enterprise procurement cycles, payment shall be processed on Net-60 terms from the date invoice is approved by corporate accounts payable. 

Intellectual Property:
All work product, code, documentation, and underlying concepts immediately transfer to Company at moment of creation, regardless of whether invoice settlement is pending or delayed.`,
  },
  {
    id: "sample-design",
    title: "UI/UX & Mobile Design Milestone ($1,200)",
    badge: "Design Deliverable Creep",
    text: `Design Brief: Native Mobile App UI/UX for FinTech Startup
Client: FinTech Labs Ltd, London, UK
Project Fee: $1,200 USD

Deliverables:
- Complete Figma prototype for iOS and Android app (approx 10 screens).
- User flow diagram and moodboards.
- Note: If additional screens (e.g. edge cases, empty states, error modals, admin web view) are needed during subsequent developer handoff, designer will provide them as part of standard design completion.
- Payment will be remitted via international SWIFT wire transfer to contractor's Pakistani bank account upon final Figma link transfer.`,
  },
];

export const ContractRiskScanner: React.FC<ContractRiskScannerProps> = ({
  onApplyDetectedAmount,
  onApplyPurposeCode,
  onNavigateToCompliance,
}) => {
  const [contractText, setContractText] = useState<string>(SAMPLE_CONTRACTS[0].text);
  const [loading, setLoading] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<ContractAnalysisResult | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!contractText.trim()) return;
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/analyze-contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractText }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to analyze contract.");
      }

      const data = await res.json();
      setAnalysis(data.analysis);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "An unexpected error occurred during analysis.");
    } finally {
      setLoading(false);
    }
  };

  const copyClause = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  return (
    <div className="space-y-8">
      {/* Header card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                AI Contract & Scope Creep Risk Scanner
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
                Gemini 3.8 Intelligence
              </span>
            </div>
            <p className="text-sm text-slate-500 max-w-2xl">
              Paste client briefs, Upwork contracts, or email proposals before accepting.
              Flags indefinite revisions, delayed payment traps (Net-60), extracts the invoice amount,
              and auto-maps the exact State Bank of Pakistan (SBP) Purpose Code.
            </p>
          </div>

          <button
            id="btn-scan-contract-top"
            onClick={handleAnalyze}
            disabled={loading || !contractText.trim()}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Scanning Contract Risks...</span>
              </>
            ) : (
              <>
                <FileSearch className="w-4 h-4" />
                <span>Run Scope & Risk Scan</span>
              </>
            )}
          </button>
        </div>

        {/* 1-Click Realistic Samples */}
        <div className="pt-6">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
            Or Load a Realistic Scenario Preset:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {SAMPLE_CONTRACTS.map((sample) => (
              <button
                key={sample.id}
                onClick={() => {
                  setContractText(sample.text);
                  setAnalysis(null);
                }}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  contractText === sample.text
                    ? "bg-indigo-50/60 border-indigo-300 ring-1 ring-indigo-200"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <div className="text-xs font-bold text-slate-900 truncate">
                  {sample.title}
                </div>
                <div className="text-[11px] font-semibold text-indigo-600 mt-1">
                  {sample.badge}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Textarea Input */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Client Brief / Contract Document Text
            </label>
            <span className="text-xs text-slate-400 font-mono">
              {contractText.length.toLocaleString()} characters
            </span>
          </div>

          <textarea
            id="textarea-contract-input"
            rows={7}
            value={contractText}
            onChange={(e) => setContractText(e.target.value)}
            placeholder="Paste your Upwork job description, scope of work, client proposal email, or retainer agreement here..."
            className="w-full p-4 text-sm text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono transition-all"
          />

          {errorMessage && (
            <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      </div>

      {/* Analysis Results Panel */}
      {analysis && (
        <div className="space-y-6">
          {/* Executive Overview Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                  Audit Summary
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
                  Contract Diagnosis & SBP Classification
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {analysis.detectedAmount && (
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                    <span className="text-xs text-emerald-700 font-medium">Invoice Amount:</span>
                    <span className="text-sm font-extrabold text-emerald-900 font-mono">
                      ${analysis.detectedAmount.toLocaleString()} USD
                    </span>
                    <button
                      id="btn-apply-detected-amt"
                      onClick={() => onApplyDetectedAmount(analysis.detectedAmount!)}
                      className="ml-1 text-xs font-bold text-emerald-700 underline hover:text-emerald-800"
                    >
                      Optimize Payout →
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-xl">
                  <span className="text-xs text-indigo-700 font-medium">Category:</span>
                  <span className="text-xs font-bold text-indigo-900">
                    {analysis.serviceCategory}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-sm text-slate-700 mt-4 leading-relaxed">
              {analysis.summary}
            </p>

            {/* SBP Code Recommendation Box */}
            <div className="mt-5 p-4 rounded-xl bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-mono font-bold text-xl shrink-0">
                  {analysis.recommendedPurposeCode.code}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                      State Bank of Pakistan (SBP) Purpose Code
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                      0.25% FBR Tax Eligible
                    </span>
                  </div>
                  <div className="text-base font-bold text-white mt-0.5">
                    {analysis.recommendedPurposeCode.title}
                  </div>
                  <div className="text-xs text-slate-300 mt-1">
                    {analysis.recommendedPurposeCode.reason}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  id="btn-apply-sbp-code"
                  onClick={() => {
                    onApplyPurposeCode(analysis.recommendedPurposeCode.code);
                    onNavigateToCompliance();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <span>Build Bank Memo with Code {analysis.recommendedPurposeCode.code}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Scope Creep Risks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Scope Creep Traps */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900">
                  Scope Creep & Revision Traps
                </h3>
              </div>

              <div className="space-y-3.5">
                {analysis.scopeCreepRisks.map((risk, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/80 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-amber-950">
                        {risk.risk}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          risk.severity === "high"
                            ? "bg-rose-100 text-rose-800"
                            : risk.severity === "medium"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {risk.severity} risk
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {risk.explanation}
                    </p>
                    <div className="bg-white p-2.5 rounded-lg border border-amber-200/60 text-xs text-emerald-900">
                      <span className="font-bold text-emerald-700">Fix: </span>
                      {risk.suggestion}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment & Invoicing Traps */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <DollarSign className="w-5 h-5 text-indigo-500" />
                <h3 className="text-base font-bold text-slate-900">
                  Payment Terms & Settlement Risks
                </h3>
              </div>

              <div className="space-y-3.5">
                {analysis.paymentTermsRisks.map((pr, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-200/80 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-indigo-950">
                        {pr.issue}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          pr.riskLevel === "high"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-indigo-100 text-indigo-800"
                        }`}
                      >
                        {pr.riskLevel}
                      </span>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-indigo-200/60 text-xs text-slate-700">
                      <span className="font-bold text-indigo-700">Counter-Measure: </span>
                      {pr.recommendation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Ready-to-Copy Counter Clauses */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Ready-to-Use Protective Contract Clauses
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Copy and paste these exact clauses into your client chat, Upwork proposal, or contract appendix.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.counterClauses.map((clause, idx) => {
                const isCopied = copiedIndex === idx;
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-900 mb-1.5 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>{clause.title}</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed italic bg-white p-3 rounded-lg border border-slate-200 font-mono">
                        "{clause.textToCopy}"
                      </p>
                    </div>

                    <button
                      onClick={() => copyClause(clause.textToCopy, idx)}
                      className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        isCopied
                          ? "bg-emerald-600 text-white"
                          : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied to Clipboard!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Clause to Reply</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
