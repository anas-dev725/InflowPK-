import React, { useState } from "react";
import {
  ShieldCheck,
  Download,
  Copy,
  Check,
  Building,
  FileCheck,
  HelpCircle,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Printer,
  Info,
  Mail,
} from "lucide-react";
import { BankComplianceProfile, SBPCode } from "../types";
import { SBP_PURPOSE_CODES } from "../data/sbpCodes";
import { PAKISTANI_BANKS } from "../data/pakistaniBanks";

interface CompliancePackGeneratorProps {
  initialAmount: number;
  initialPurposeCode: string;
  isPsebRegistered: boolean;
  setIsPsebRegistered: (val: boolean) => void;
}

export const CompliancePackGenerator: React.FC<CompliancePackGeneratorProps> = ({
  initialAmount,
  initialPurposeCode,
  isPsebRegistered,
  setIsPsebRegistered,
}) => {
  const [profile, setProfile] = useState<BankComplianceProfile>({
    freelancerName: "Muhammad Anas",
    cnic: "42101-1234567-1",
    ntn: "7654321-0",
    isPsebRegistered: isPsebRegistered,
    psebRegNumber: "PSEB-IT-2024-8910",
    bankName: "Meezan Bank Limited",
    branchName: "Main Corporate / Freelancer Desk",
    iban: "PK70MEZN0001020304050607",
    accountNumber: "01020304050607",
    invoiceAmountUsd: initialAmount || 2000,
    invoiceNumber: "INV-2026-042",
    remittanceReference: "FT26250XXXXX / MT103 INW",
    purposeCode: initialPurposeCode || "9186",
    clientName: "Acme Cloud Technologies LLC",
    clientCountry: "United States",
  });

  const [copiedMemo, setCopiedMemo] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [activeTab, setActiveTab] = useState<"memo" | "email" | "guide">("memo");

  // Keep synced with parent changes
  React.useEffect(() => {
    setProfile((prev) => ({
      ...prev,
      invoiceAmountUsd: initialAmount || prev.invoiceAmountUsd,
      purposeCode: initialPurposeCode || prev.purposeCode,
      isPsebRegistered: isPsebRegistered,
    }));
  }, [initialAmount, initialPurposeCode, isPsebRegistered]);

  const selectedCode =
    SBP_PURPOSE_CODES.find((c) => c.code === profile.purposeCode) || SBP_PURPOSE_CODES[0];

  const selectedBank =
    PAKISTANI_BANKS.find((b) => b.name === profile.bankName) || PAKISTANI_BANKS[0];

  const taxRate = profile.isPsebRegistered ? "0.25%" : "1.00%";

  // Formal Bank Memo content
  const memoText = `Date: ${new Date().toLocaleDateString("en-PK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })}

To:
The Branch Manager / Head of Trade Services Unit (TSU)
${profile.bankName}
${profile.branchName} Branch, Pakistan

Subject: INWARD REMITTANCE REALIZATION UNDER SBP PURPOSE CODE ${profile.purposeCode} AND APPLICATION OF REDUCED 0.25% TAX RATE UNDER FBR SECTION 154A

Dear Sir / Madam,

I maintain the following foreign currency / Pak Rupee account with your branch:
- Account Title: ${profile.freelancerName}
- Account / IBAN: ${profile.iban}
- CNIC No.: ${profile.cnic}
- National Tax Number (NTN): ${profile.ntn}
${profile.isPsebRegistered ? `- PSEB Exporter Registration No.: ${profile.psebRegNumber}` : "- Exporter Status: Freelance IT / Digital Services"}

I am writing regarding the realization of an incoming foreign remittance received in my account with the following details:
1. Inward Remittance Reference / Inward Advice ID: ${profile.remittanceReference || "Pending Inward Settlement"}
2. Invoiced Remittance Amount: $${profile.invoiceAmountUsd.toLocaleString()} USD
3. Foreign Client / Payer: ${profile.clientName} (${profile.clientCountry})
4. Service Invoice No.: ${profile.invoiceNumber}

STATUTORY DECLARATION & SBP PURPOSE CODE ASSIGNMENT:
As per the State Bank of Pakistan (SBP) Foreign Exchange Manual Chapter 14 and relevant FE Circulars, I hereby formally declare that these export proceeds represent professional services rendered in:
- Nature of Export: ${selectedCode.title}
- Official SBP Purpose Code: ${selectedCode.code} (${selectedCode.shortDesc})

APPLICATION OF REDUCED WITHHOLDING TAX (FBR SECTION 154A):
Under Section 154A of the Income Tax Ordinance 2001, exports of computer software, IT services, or IT-enabled services (ITeS) by persons registered with the Pakistan Software Export Board (PSEB) are subject to a reduced final withholding tax rate of 0.25% (quarter of one percent), instead of the standard 1.00% rate.
My valid PSEB Registration Certificate is attached herewith for your records. Please ensure that withholding tax is deducted strictly at 0.25%.

MANDATORY ISSUANCE OF ELECTRONIC PROCEEDS REALIZATION CERTIFICATE (e-PRC):
In compliance with SBP directives, kindly issue the electronic Proceeds Realization Certificate (e-PRC) containing:
1. Valid PRC Number and System Verification Code
2. Proper classification under Purpose Code ${selectedCode.code}
3. Withholding tax deduction certificate showing 0.25% deduction

Kindly dispatch the digitally signed e-PRC copy to my registered email address at your earliest convenience so that I can upload it onto the FBR IRIS portal for annual tax filing.

Thank you for your prompt cooperation.

Yours sincerely,

_________________________
${profile.freelancerName}
CNIC: ${profile.cnic}
Mobile / Contact: On Account File
Attachments:
1. Copy of Client Invoice / Upwork Contract (${profile.invoiceNumber})
2. Valid PSEB Registration Certificate (${profile.psebRegNumber})
3. Copy of CNIC`;

  // Email version (shorter, actionable for branch email)
  const emailSubject = `URGENT: e-PRC Request & 0.25% WHT Deduction (Sec 154A) - ${profile.freelancerName} - A/C ${profile.accountNumber}`;
  const emailBody = `Dear Branch Operations & TSU Team,

I have an incoming foreign remittance of $${profile.invoiceAmountUsd.toLocaleString()} USD from ${profile.clientName} (${profile.clientCountry}) crediting to my account:

Account Name: ${profile.freelancerName}
IBAN: ${profile.iban}
Remittance Ref: ${profile.remittanceReference || "Attached Wire Advice"}
Invoice Ref: ${profile.invoiceNumber}

REGULATORY INSTRUCTIONS:
1. State Bank of Pakistan (SBP) Purpose Code: ${selectedCode.code} (${selectedCode.title})
2. Tax Withholding: 0.25% under FBR Section 154A (PSEB Registration No. ${profile.psebRegNumber} attached). Do NOT deduct 1%.
3. Document Required: Kindly issue the official electronic Proceeds Realization Certificate (e-PRC) with verification key.

Attached please find:
- Client Invoice
- Valid PSEB Exporter Certificate
- CNIC Copy

Kindly confirm receipt and dispatch of the e-PRC.

Regards,
${profile.freelancerName}
CNIC: ${profile.cnic}
NTN: ${profile.ntn}`;

  const copyToClipboard = (text: string, isMemo: boolean) => {
    navigator.clipboard.writeText(text);
    if (isMemo) {
      setCopiedMemo(true);
      setTimeout(() => setCopiedMemo(false), 2500);
    } else {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2500);
    }
  };

  const downloadPackFile = () => {
    const fileContent = `===================================================================
INFLOWPK OFFICIAL SBP COMPLIANCE PACK & e-PRC CLAIM MEMORANDUM
Generated under SBP FE Circular No. 04 of 2021 & FBR Section 154A
===================================================================

${memoText}

===================================================================
QUICK EMAIL DRAFT:
Subject: ${emailSubject}

${emailBody}
===================================================================`;

    const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `SBP-Compliance-Pack-${profile.invoiceNumber || "Memo"}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                SBP Regulatory Compliance Pack & e-PRC Kit
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                Section 154A Guaranteed
              </span>
            </div>
            <p className="text-sm text-slate-500 max-w-2xl">
              Prevent local Pakistani bank branches from misclassifying your payout.
              Enforces the correct SBP Purpose Code ({selectedCode.code}), locks in the reduced 0.25% export tax,
              and generates the official branch memo to secure your electronic Proceeds Realization Certificate (e-PRC).
            </p>
          </div>

          <button
            id="btn-download-pack"
            onClick={downloadPackFile}
            className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Download Full Pack (.txt)</span>
          </button>
        </div>

        {/* Input Configuration Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          {/* Column 1: Freelancer & PSEB Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span>1. Freelancer Credentials</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Full Legal Name (as on Bank A/C)
              </label>
              <input
                type="text"
                value={profile.freelancerName}
                onChange={(e) => setProfile({ ...profile, freelancerName: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  CNIC Number
                </label>
                <input
                  type="text"
                  value={profile.cnic}
                  onChange={(e) => setProfile({ ...profile, cnic: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  NTN / F-TIN
                </label>
                <input
                  type="text"
                  value={profile.ntn}
                  onChange={(e) => setProfile({ ...profile, ntn: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                />
              </div>
            </div>

            {/* PSEB Registration Switch */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800">
                  PSEB Exporter Registration
                </span>
                <input
                  type="checkbox"
                  checked={profile.isPsebRegistered}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setProfile({ ...profile, isPsebRegistered: checked });
                    setIsPsebRegistered(checked);
                  }}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
              </div>

              {profile.isPsebRegistered ? (
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">
                    PSEB Reg Number
                  </label>
                  <input
                    type="text"
                    value={profile.psebRegNumber}
                    onChange={(e) => setProfile({ ...profile, psebRegNumber: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md font-mono"
                  />
                  <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                    ✓ Eligible for 0.25% WHT under Sec 154A
                  </div>
                </div>
              ) : (
                <div className="text-[11px] text-amber-700">
                  Non-registered: Subject to 1.00% tax. Registering on pseb.org.pk unlocks 0.25% rate.
                </div>
              )}
            </div>
          </div>

          {/* Column 2: Bank & Account Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span>2. Bank & Account Details</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Pakistani Bank Name
              </label>
              <select
                value={profile.bankName}
                onChange={(e) => setProfile({ ...profile, bankName: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                {PAKISTANI_BANKS.map((bank) => (
                  <option key={bank.id} value={bank.name}>
                    {bank.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Branch Name / City
              </label>
              <input
                type="text"
                value={profile.branchName}
                onChange={(e) => setProfile({ ...profile, branchName: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                IBAN (International Bank Account Number)
              </label>
              <input
                type="text"
                value={profile.iban}
                onChange={(e) => setProfile({ ...profile, iban: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
              />
            </div>

            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900">
              <span className="font-bold">{selectedBank.shortName} Tip: </span>
              {selectedBank.instructions}
            </div>
          </div>

          {/* Column 3: Purpose Code & Invoice */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span>3. Purpose Code & Remittance</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                SBP Foreign Exchange Purpose Code
              </label>
              <select
                value={profile.purposeCode}
                onChange={(e) => setProfile({ ...profile, purposeCode: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-semibold text-emerald-900"
              >
                {SBP_PURPOSE_CODES.map((code) => (
                  <option key={code.code} value={code.code}>
                    Code {code.code} - {code.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Invoice Amount (USD)
                </label>
                <input
                  type="number"
                  value={profile.invoiceAmountUsd}
                  onChange={(e) =>
                    setProfile({ ...profile, invoiceAmountUsd: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Invoice / Milestone #
                </label>
                <input
                  type="text"
                  value={profile.invoiceNumber}
                  onChange={(e) => setProfile({ ...profile, invoiceNumber: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Client / Company Name & Country
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={profile.clientName}
                  onChange={(e) => setProfile({ ...profile, clientName: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none"
                  placeholder="Client Name"
                />
                <input
                  type="text"
                  value={profile.clientCountry}
                  onChange={(e) => setProfile({ ...profile, clientCountry: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none"
                  placeholder="Country"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Remittance Reference / MT103 (if known)
              </label>
              <input
                type="text"
                value={profile.remittanceReference}
                onChange={(e) => setProfile({ ...profile, remittanceReference: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-mono outline-none"
                placeholder="FTXXXXXXXXXX"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Output Document & Memo Viewer */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Document Tabs & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:px-6 bg-slate-50 border-b border-slate-200 gap-3">
          <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("memo")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "memo"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Formal Bank Memo
            </button>
            <button
              onClick={() => setActiveTab("email")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "email"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Branch Email Draft
            </button>
            <button
              onClick={() => setActiveTab("guide")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "guide"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              SBP & e-PRC Checklist
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === "memo" && (
              <button
                id="btn-copy-memo"
                onClick={() => copyToClipboard(memoText, true)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  copiedMemo
                    ? "bg-emerald-600 text-white"
                    : "bg-white hover:bg-slate-100 text-slate-800 border border-slate-300"
                }`}
              >
                {copiedMemo ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedMemo ? "Memo Copied!" : "Copy Official Memo"}</span>
              </button>
            )}

            {activeTab === "email" && (
              <>
                <button
                  id="btn-mailto-bank"
                  onClick={() => {
                    const mailtoUrl = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
                    window.location.href = mailtoUrl;
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                  title="Open in your default email client (Outlook, Gmail, Apple Mail)"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Launch in Email App</span>
                </button>

                <button
                  id="btn-copy-email"
                  onClick={() => copyToClipboard(`${emailSubject}\n\n${emailBody}`, false)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    copiedEmail
                      ? "bg-emerald-600 text-white"
                      : "bg-white hover:bg-slate-100 text-slate-800 border border-slate-300"
                  }`}
                >
                  {copiedEmail ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedEmail ? "Email Copied!" : "Copy Email Draft"}</span>
                </button>
              </>
            )}

            <button
              onClick={downloadPackFile}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Text</span>
            </button>
          </div>
        </div>

        {/* Tab Body: Formal Memo */}
        {activeTab === "memo" && (
          <div className="p-6 sm:p-8 bg-white font-mono text-xs sm:text-sm text-slate-800 leading-relaxed overflow-x-auto whitespace-pre-wrap selection:bg-emerald-100">
            {memoText}
          </div>
        )}

        {/* Tab Body: Email */}
        {activeTab === "email" && (
          <div className="p-6 sm:p-8 space-y-4">
            <div className="p-3 bg-slate-100 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase block mb-1">
                Subject:
              </span>
              <div className="text-xs font-bold text-slate-900 font-mono">
                {emailSubject}
              </div>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
              {emailBody}
            </div>
          </div>
        )}

        {/* Tab Body: SBP & e-PRC Checklist Guide */}
        {activeTab === "guide" && (
          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                How e-PRC and Section 154A Work in Pakistan
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Follow this mandatory procedure to ensure your hard-earned export income remains 100% tax-compliant with FBR and SBP.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <h4 className="font-bold text-xs text-slate-900">
                  Notify Branch Before Inward Clearance
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  As soon as your client or platform initiates the transfer, email or deliver the InflowPK memo to your Branch Manager or TSU officer.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <h4 className="font-bold text-xs text-slate-900">
                  Verify Purpose Code & 0.25% Deduction
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Check your account credit SMS or advice. Confirm that only 0.25% was deducted under Section 154A rather than 1.00%.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <h4 className="font-bold text-xs text-slate-900">
                  Collect and Archive e-PRC
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The bank must issue a system-generated e-PRC PDF with a verification code. Retain this to discharge your final tax liability on IRIS.
                </p>
              </div>
            </div>

            {/* Checklist Box */}
            <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3">
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Document Checklist for 100% Approval
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Valid PSEB Exporter Registration Certificate (issued by Pakistan Software Export Board)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Invoice matching the inward remittance amount with Purpose Code {selectedCode.code}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Inward SWIFT MT103 advice or foreign remittance voucher reference</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Freelance undertaking / declaration letter for SBP Foreign Exchange manual</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
