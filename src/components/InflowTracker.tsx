import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Download,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  Building2,
  DollarSign,
  Landmark,
  ShieldCheck,
  Search,
  Percent,
} from "lucide-react";
import { InflowRecord } from "../types";
import { formatPKR } from "../utils/payoutCalculator";

const STORAGE_KEY = "inflowpk_ledger_records_v1";

const INITIAL_RECORDS: InflowRecord[] = [
  {
    id: "rec-001",
    clientName: "Apex SaaS Solutions",
    clientCountry: "United States",
    grossAmountUsd: 3200,
    currency: "USD",
    gatewayUsed: "Elevate Pay (ACH)",
    purposeCode: "9186 - IT Services",
    date: "2026-09-02",
    effectiveFxRate: 277.8,
    netPkrReceived: 886736,
    rupeesSavedVsLegacy: 35200,
    whtDeductionPkr: 2222,
    status: "e-PRC Claimed",
    notes: "React / Node.js backend development sprint",
  },
  {
    id: "rec-002",
    clientName: "Novus Brand Agency",
    clientCountry: "United Kingdom",
    grossAmountUsd: 1850,
    currency: "USD",
    gatewayUsed: "SadaBiz (Apple Pay Link)",
    purposeCode: "9210 - Graphic Design",
    date: "2026-08-25",
    effectiveFxRate: 274.5,
    netPkrReceived: 492608,
    rupeesSavedVsLegacy: 18400,
    whtDeductionPkr: 1235,
    status: "Realized",
    notes: "Figma mobile UI system & landing page",
  },
  {
    id: "rec-003",
    clientName: "CloudScale GmbH",
    clientCountry: "Germany",
    grossAmountUsd: 4500,
    currency: "USD",
    gatewayUsed: "Wise (SEPA Transfer)",
    purposeCode: "9186 - IT Services",
    date: "2026-08-11",
    effectiveFxRate: 277.2,
    netPkrReceived: 1244280,
    rupeesSavedVsLegacy: 48000,
    whtDeductionPkr: 3118,
    status: "e-PRC Claimed",
    notes: "Kubernetes DevOps architecture contract",
  },
  {
    id: "rec-004",
    clientName: "Desert Horizon Media",
    clientCountry: "United Arab Emirates",
    grossAmountUsd: 2100,
    currency: "USD",
    gatewayUsed: "Elevate Pay",
    purposeCode: "9220 - Digital Marketing",
    date: "2026-07-28",
    effectiveFxRate: 276.9,
    netPkrReceived: 579950,
    rupeesSavedVsLegacy: 21500,
    whtDeductionPkr: 1453,
    status: "Realized",
    notes: "Paid search & funnel optimization retainer",
  },
];

interface InflowTrackerProps {
  onNavigateToPack?: () => void;
  isPsebRegistered?: boolean;
}

export const InflowTracker: React.FC<InflowTrackerProps> = ({
  onNavigateToPack,
  isPsebRegistered = true,
}) => {
  const [records, setRecords] = useState<InflowRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return INITIAL_RECORDS;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGateway, setSelectedGateway] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State for new entry
  const [formData, setFormData] = useState({
    clientName: "",
    clientCountry: "United States",
    grossAmountUsd: "",
    gatewayUsed: "Elevate Pay",
    purposeCode: "9186 - IT Services",
    notes: "",
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.error("Failed to persist records", e);
    }
  }, [records]);

  // Calculations
  const totalUsd = records.reduce((sum, r) => sum + r.grossAmountUsd, 0);
  const totalPkr = records.reduce((sum, r) => sum + r.netPkrReceived, 0);
  const totalSavings = records.reduce((sum, r) => sum + r.rupeesSavedVsLegacy, 0);
  const totalWht = records.reduce((sum, r) => sum + r.whtDeductionPkr, 0);
  const fe25AllowanceUsd = Math.round(totalUsd * 0.5); // SBP allows 50% retention in foreign currency accounts

  const filteredRecords = records.filter((rec) => {
    const matchesSearch =
      rec.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.clientCountry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.notes?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGateway =
      selectedGateway === "All" || rec.gatewayUsed.includes(selectedGateway);

    return matchesSearch && matchesGateway;
  });

  const handleDeleteRecord = (id: string) => {
    setRecords(records.filter((r) => r.id !== id));
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(formData.grossAmountUsd);
    if (!formData.clientName || isNaN(amount) || amount <= 0) return;

    const fxRate = 277.5;
    const estPkr = Math.round(amount * fxRate * 0.985);
    const estSavings = Math.round(amount * 11.5);
    const estWht = Math.round(estPkr * (isPsebRegistered ? 0.0025 : 0.01));

    const newRecord: InflowRecord = {
      id: "rec-" + Date.now(),
      clientName: formData.clientName,
      clientCountry: formData.clientCountry,
      grossAmountUsd: amount,
      currency: "USD",
      gatewayUsed: formData.gatewayUsed,
      purposeCode: formData.purposeCode,
      date: new Date().toISOString().split("T")[0],
      effectiveFxRate: fxRate,
      netPkrReceived: estPkr,
      rupeesSavedVsLegacy: estSavings,
      whtDeductionPkr: estWht,
      status: "Realized",
      notes: formData.notes || "Direct client remittance",
    };

    setRecords([newRecord, ...records]);
    setShowAddModal(false);
    setFormData({
      clientName: "",
      clientCountry: "United States",
      grossAmountUsd: "",
      gatewayUsed: "Elevate Pay",
      purposeCode: "9186 - IT Services",
      notes: "",
    });
  };

  // Export CSV for FBR Tax Filing / Tax Consultant
  const handleExportCSV = () => {
    const headers = [
      "Date",
      "Client Name",
      "Client Country",
      "Inward USD",
      "Gateway Channel",
      "SBP Purpose Code",
      "Effective FX Rate (PKR)",
      "Net PKR Received",
      "Rupees Saved vs Bank Wire",
      "FBR WHT Deducted (PKR)",
      "Status",
      "Notes",
    ];

    const rows = records.map((r) => [
      r.date,
      `"${r.clientName.replace(/"/g, '""')}"`,
      `"${r.clientCountry}"`,
      r.grossAmountUsd,
      `"${r.gatewayUsed}"`,
      `"${r.purposeCode}"`,
      r.effectiveFxRate,
      r.netPkrReceived,
      r.rupeesSavedVsLegacy,
      r.whtDeductionPkr,
      r.status,
      `"${(r.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `InflowPK_Remittance_Ledger_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 w-full">
      {/* Overview Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 mb-2">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Inflow Ledger & Payout History</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Track Inward Remittances & Rupee Savings
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl">
              Log client receipts, monitor cumulative bank fees saved, verify SBP Purpose Code compliance, and export certified remittance summaries for your FBR tax filing.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Log Payout</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
              title="Download CSV for your accountant or FBR Iris tax filing"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Realized USD */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Foreign Inflow</span>
            <DollarSign className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            ${totalUsd.toLocaleString()} <span className="text-xs text-slate-500 font-normal">USD</span>
          </div>
          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
            ≈ {formatPKR(totalPkr)} realized
          </div>
        </div>

        {/* Card 2: Total Rupees Saved */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">FX Leakage Prevented</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {formatPKR(totalSavings)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Kept in your pocket vs. standard SWIFT
          </div>
        </div>

        {/* Card 3: SBP FE-25 Retention Allowance */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">FE-25 Retention (50%)</span>
            <Landmark className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
            ${fe25AllowanceUsd.toLocaleString()} <span className="text-xs text-slate-500 font-normal">USD</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Legal capacity in Exporter USD Account
          </div>
        </div>

        {/* Card 4: 0.25% Tax Under Section 154A */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Sec 154A WHT Paid</span>
            <Percent className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">
            {formatPKR(totalWht)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isPsebRegistered ? "0.25% final tax rate active" : "Standard 1% withholding"}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search client, country, or notes..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Gateway Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <span className="text-xs font-semibold text-slate-400 mr-1">Gateway:</span>
            {["All", "Elevate", "SadaBiz", "Wise"].map((gw) => (
              <button
                key={gw}
                onClick={() => setSelectedGateway(gw)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors shrink-0 ${
                  selectedGateway === gw
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                }`}
              >
                {gw}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
                <th className="py-3.5 px-4">Date & Client</th>
                <th className="py-3.5 px-4">Inward Amount</th>
                <th className="py-3.5 px-4">Gateway Used</th>
                <th className="py-3.5 px-4">Purpose Code</th>
                <th className="py-3.5 px-4">Net Deposited</th>
                <th className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400">Rupees Saved</th>
                <th className="py-3.5 px-4">e-PRC Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    No remittance records match your criteria. Click "Log Payout" to add your first transaction!
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => (
                  <tr
                    key={rec.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {rec.clientName}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span>{rec.date}</span>
                        <span>&bull;</span>
                        <span>{rec.clientCountry}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      ${rec.grossAmountUsd.toLocaleString()} {rec.currency}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                        {rec.gatewayUsed}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        {rec.purposeCode}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {formatPKR(rec.netPkrReceived)}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-700 dark:text-emerald-300">
                      +{formatPKR(rec.rupeesSavedVsLegacy)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          rec.status === "e-PRC Claimed"
                            ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300"
                            : "bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300"
                        }`}
                      >
                        {rec.status === "e-PRC Claimed" ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        <span>{rec.status}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteRecord(rec.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SBP Regulation & Tax Advisory Card */}
      <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>SBP Circular No. 04 / Exporter Protection Notice</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Freelancers registered with PSEB are legally entitled to 0.25% withholding tax under FBR Section 154A. Keep your e-PRC numbers documented in this ledger for effortless annual income tax filing.
          </p>
        </div>

        {onNavigateToPack && (
          <button
            onClick={onNavigateToPack}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold shrink-0 transition-colors"
          >
            Generate Bank Memo →
          </button>
        )}
      </div>

      {/* Add Payout Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Log New Payout Entry
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Client / Company Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Studio LLC"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Amount (USD)
                  </label>
                  <input
                    type="number"
                    required
                    min="10"
                    placeholder="2500"
                    value={formData.grossAmountUsd}
                    onChange={(e) => setFormData({ ...formData, grossAmountUsd: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Client Country
                  </label>
                  <select
                    value={formData.clientCountry}
                    onChange={(e) => setFormData({ ...formData, clientCountry: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option>United States</option>
                    <option>United Kingdom</option>
                    <option>Germany / EU</option>
                    <option>United Arab Emirates</option>
                    <option>Australia</option>
                    <option>Canada</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Gateway Used
                  </label>
                  <select
                    value={formData.gatewayUsed}
                    onChange={(e) => setFormData({ ...formData, gatewayUsed: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option>Elevate Pay</option>
                    <option>SadaBiz</option>
                    <option>Wise</option>
                    <option>Payoneer</option>
                    <option>Remitly</option>
                    <option>Direct Bank Wire</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    SBP Purpose Code
                  </label>
                  <select
                    value={formData.purposeCode}
                    onChange={(e) => setFormData({ ...formData, purposeCode: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option>9186 - IT Services</option>
                    <option>9210 - Graphic Design</option>
                    <option>9220 - Digital Marketing</option>
                    <option>9200 - BPO / Call Center</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Project Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Next.js dashboard milestone 1"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
