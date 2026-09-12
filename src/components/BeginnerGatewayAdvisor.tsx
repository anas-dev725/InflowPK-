import React, { useState } from "react";
import {
  Wallet,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Building,
  CreditCard,
  Globe,
  FileCheck,
  Timer,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { FeatureTab } from "./Sidebar";
import { CurrencyCode, formatCurrencyAmount } from "../utils/currencies";

interface BeginnerGatewayAdvisorProps {
  onSelectTab: (tab: FeatureTab) => void;
  onSetInvoiceAmount?: (amount: number) => void;
}

type ClientSource = "upwork" | "us_direct" | "uk_eu" | "card_link" | "gulf" | "retainer";
type Priority = "savings" | "speed" | "easy_setup";

interface GatewayAdvice {
  title: string;
  provider: string;
  badge: string;
  badgeColor: string;
  settlementTime: string;
  timelineSteps: { step: string; time: string; note: string }[];
  setupTime: string;
  documentsNeeded: string[];
  whyThisOne: string;
  howToSetup: string[];
  caveats: string;
  recommendedRouteId: string;
}

export const BeginnerGatewayAdvisor: React.FC<BeginnerGatewayAdvisorProps> = ({
  onSelectTab,
}) => {
  const [source, setSource] = useState<ClientSource>("upwork");
  const [priority, setPriority] = useState<Priority>("savings");

  // Recommendation engine
  const getRecommendation = (): GatewayAdvice => {
    if (source === "card_link") {
      return {
        title: "SadaBiz by SadaPay",
        provider: "SadaPay Freelancer Account (SBP EMI)",
        badge: "Fastest Card Checkout",
        badgeColor: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300",
        settlementTime: "Instant to 24 Hours",
        timelineSteps: [
          { step: "Send Link", time: "Instant", note: "Create custom payment link in the SadaPay app" },
          { step: "Client Pays", time: "10 Seconds", note: "Client pays via Apple Pay or credit/debit card" },
          { step: "Money in Bank", time: "Same Day / Next Day", note: "Lands directly in your SadaPay PKR wallet or linked IBAN" },
        ],
        setupTime: "5 - 10 Minutes with Pakistani CNIC",
        documentsNeeded: [
          "Pakistani CNIC (Smart Card)",
          "Active Pakistani SIM card registered under your CNIC",
          "One screenshot of your freelance profile or client invoice",
        ],
        whyThisOne:
          "If your client doesn't want to wire money and just wants to click a link with Apple Pay or their Visa/Mastercard, SadaBiz is hands down the simplest experience. No foreign account required.",
        howToSetup: [
          "Download SadaPay app from App Store / Google Play",
          "Upgrade to a SadaBiz Freelancer account in the settings tab",
          "Submit your CNIC and freelance work proof (takes 24-48h for approval)",
          "Create a USD payment link and send it directly to your client",
        ],
        caveats:
          "SadaPay charges a 3.0% transaction processing fee, but you get Mastercard's true interbank exchange rate with instant in-app e-PRC download.",
        recommendedRouteId: "sadabiz",
      };
    }

    if (source === "uk_eu") {
      return {
        title: "Wise or Elevate Pay",
        provider: "Wise Business / Elevate Pay",
        badge: "Best for GBP / EUR",
        badgeColor: "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300",
        settlementTime: "1 to 2 Business Days",
        timelineSteps: [
          { step: "Client Sends GBP/EUR", time: "Day 1 (Morning)", note: "Client sends local bank transfer to your IBAN/Sort Code" },
          { step: "Conversion", time: "Day 1 (Afternoon)", note: "Converted to PKR at low mid-market spreads" },
          { step: "Local Deposit", time: "Day 2", note: "Dispatched via 1LINK into your Meezan / HBL / Alfalah account" },
        ],
        setupTime: "10 - 15 Minutes",
        documentsNeeded: [
          "Pakistani Passport or Smart CNIC",
          "Proof of residence (utility bill or bank statement)",
          "Active email and mobile number",
        ],
        whyThisOne:
          "For clients in London, Germany, or the Netherlands, sending GBP or EUR via local clearing saves them $40 international wire fees, and gives you transparent conversion rates.",
        howToSetup: [
          "Open an Elevate or Wise account",
          "Get your local UK Account Number + Sort Code or Euro IBAN",
          "Share these details on your invoice with the client",
          "Transfer funds to your Pakistani bank account once received",
        ],
        caveats:
          "New personal Wise USD account creation is restricted in Pakistan, but existing accounts or Elevate Pay work smoothly.",
        recommendedRouteId: "wise",
      };
    }

    if (source === "retainer" && priority === "savings") {
      return {
        title: "Direct SWIFT Wire (With Bank Memo)",
        provider: "Meezan / HBL / Alfalah Foreign Inward Remittance",
        badge: "Best for Large Retainers ($3,000+)",
        badgeColor: "bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300",
        settlementTime: "3 to 5 Business Days",
        timelineSteps: [
          { step: "Client Wire", time: "Day 1", note: "Client dispatches TT wire via JPMorgan/Citi/HSBC" },
          { step: "Correspondent Intermediary", time: "Day 2 - 3", note: "Wire routes through US clearing ($25 - $40 intermediary fee)" },
          { step: "SBP Clearance & Bank Deposit", time: "Day 4 - 5", note: "Lands in your Pakistani bank with 0.25% WHT if Purpose Code 9186 is quoted" },
        ],
        setupTime: "No app needed (Use existing bank account)",
        documentsNeeded: [
          "Your Pakistani Bank IBAN and SWIFT Code",
          "Client Agreement or Statement of Work (SOW)",
          "InflowPK SBP Bank Memo citing Circular No. 04 of 2021",
        ],
        whyThisOne:
          "For large enterprise clients paying $3,000 to $10,000/month, the fixed $35 wire fee is tiny compared to the volume, and your funds land directly in your home bank.",
        howToSetup: [
          "Give client your 24-character Pakistani IBAN and SWIFT Code",
          "Explicitly instruct them to write 'IT Services SBP Code 9186' in the wire memo",
          "Download the InflowPK Bank Memo and email it to your branch manager when the wire hits",
        ],
        caveats:
          "Always send the bank memo! Otherwise branches deduct 1.00% tax instead of 0.25% and forget your e-PRC.",
        recommendedRouteId: "swift",
      };
    }

    // Default & Most Common: Upwork / US Direct -> Elevate Pay
    return {
      title: "Elevate Pay (Bangor Savings Bank US Account)",
      provider: "Elevate Pay + Local Pakistani Bank Transfer",
      badge: "Highest PKR Yield (Saves Rs. 20,000+)",
      badgeColor: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300",
      settlementTime: "12 to 24 Hours",
      timelineSteps: [
        { step: "Withdraw from Upwork/Client", time: "Day 1 (Morning)", note: "Free ACH transfer from Upwork or US client to your Elevate US checking account" },
        { step: "Elevate Clearing", time: "Day 1 (Evening)", note: "Dollars arrive in your FDIC-insured Bangor Savings Bank US account ($0 fee)" },
        { step: "Transfer to Pakistan", time: "Day 2 (Within 24h)", note: "Convert at wholesale interbank rate (~0.95% spread) directly into any Pakistani bank" },
      ],
      setupTime: "10 Minutes via Elevate Mobile App",
      documentsNeeded: [
        "Pakistani CNIC (Smart Card) or Passport",
        "Upwork / Fiverr profile link or freelance proof",
        "Pakistani residential address",
      ],
      whyThisOne:
        "Elevate Pay is currently the undisputed gold standard for Pakistani remote workers. It gives you a real US checking account with routing & account numbers. Upwork deposits there for free via ACH, and you convert to PKR at wholesale rates.",
      howToSetup: [
        "Download the Elevate Pay app on iOS or Android",
        "Sign up and complete identity verification with your Smart CNIC",
        "Once approved (usually 2-24 hours), copy your US Routing & Account Number",
        "Add this as a 'Direct to US Bank (ACH)' in Upwork or send it to your US client",
        "When money arrives, hit 'Send to Pakistan' and enter your local Meezan/HBL IBAN",
      ],
      caveats:
        "Elevate transfers via 1LINK/Raast and provides instant transaction advice that your local bank accepts for e-PRC issuance.",
      recommendedRouteId: "elevate",
    };
  };

  const advice = getRecommendation();

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 mb-3">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>New Freelancer Gateway Advisor</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Which Payment Gateway Should You Choose?
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
          If you just started freelancing in Pakistan, navigating US bank accounts, hidden exchange spreads, and local bank transfers can feel overwhelming.
          Select your scenario below to get your exact match, setup steps, and landing timeline.
        </p>

        {/* Step 1: Where are you getting paid from */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
            Step 1: Where is your client paying you from?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {[
              { id: "upwork", label: "Upwork / Fiverr", desc: "Freelance Platform" },
              { id: "us_direct", label: "Direct US Client", desc: "ACH or US wire" },
              { id: "uk_eu", label: "UK / Europe", desc: "GBP £ or EUR €" },
              { id: "card_link", label: "Credit Card / Apple Pay", desc: "Instant link checkout" },
              { id: "gulf", label: "Dubai / Saudi", desc: "AED or SAR" },
              { id: "retainer", label: "Large Retainer", desc: "$3,000+ monthly" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setSource(item.id as ClientSource)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  source === item.id
                    ? "bg-slate-900 dark:bg-emerald-600 text-white border-slate-900 dark:border-emerald-600 shadow-xs"
                    : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <div className="font-bold text-xs">{item.label}</div>
                <div
                  className={`text-[10px] mt-0.5 ${
                    source === item.id ? "text-slate-300 dark:text-emerald-100" : "text-slate-400 dark:text-slate-500"
                  }`}
                >
                  {item.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: What is your priority */}
        <div className="mt-5">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5">
            Step 2: What matters most to you?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              {
                id: "savings",
                title: "Maximum PKR (Save the most money)",
                desc: "Lowest hidden FX markdown, keeps up to PKR 25,000 more",
              },
              {
                id: "speed",
                title: "Fastest Landing Time",
                desc: "Same-day or next-day clearance in your Pakistani bank",
              },
              {
                id: "easy_setup",
                title: "Easiest Signup (Just CNIC)",
                desc: "No US LLC or complex foreign paperwork required",
              },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setPriority(item.id as Priority)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  priority === item.id
                    ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 dark:border-emerald-500/80 ring-1 ring-emerald-400"
                    : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <div className="font-bold text-xs text-slate-900 dark:text-white">{item.title}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result Recommendation Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Top title & badge */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${advice.badgeColor}`}>
                {advice.badge}
              </span>
              <span className="text-xs text-slate-400 font-medium">Your Best Match</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              {advice.title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{advice.provider}</p>
          </div>

          <button
            onClick={() => onSelectTab("optimizer")}
            className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs shrink-0"
          >
            <span>Calculate Your Real Payout</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Big Settlement Speed & Timeline Section */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                How Long Will It Take to Land in Your Pakistani Account?
              </h3>
            </div>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              <Timer className="w-3.5 h-3.5" />
              <span>{advice.settlementTime}</span>
            </span>
          </div>

          {/* Step-by-step landing timeline */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {advice.timelineSteps.map((t, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 relative"
              >
                <div className="flex items-center justify-between text-[11px] font-bold text-emerald-700 dark:text-emerald-400 mb-1">
                  <span>Step {idx + 1}: {t.step}</span>
                  <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300 font-mono text-[10px]">
                    {t.time}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {t.note}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Requirements & Why It Works Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Documents & Requirements */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
              <FileCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>What Documents Do You Need to Start?</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Setup takes approximately <strong>{advice.setupTime}</strong>. You do NOT need a US LLC or foreign address.
            </p>
            <ul className="space-y-2 pt-1">
              {advice.documentsNeeded.map((doc, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Setup Instructions */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
              <Building className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>How to Set It Up (Step-by-Step)</span>
            </div>
            <ol className="space-y-2 text-xs text-slate-700 dark:text-slate-300 list-decimal list-inside leading-relaxed">
              {advice.howToSetup.map((step, i) => (
                <li key={i} className="pl-1">
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Why this recommendation & Important tip */}
        <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 space-y-2 text-xs">
          <div className="font-bold text-amber-950 dark:text-amber-200 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Important Pakistani Tax & Bank Note:</span>
          </div>
          <p className="text-amber-900 dark:text-amber-300 leading-relaxed">
            {advice.caveats}
          </p>
          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={() => onSelectTab("compliance")}
              className="text-xs font-bold text-emerald-700 dark:text-emerald-400 underline hover:text-emerald-800"
            >
              Generate your official SBP 0.25% Bank Memo in 1 click →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
