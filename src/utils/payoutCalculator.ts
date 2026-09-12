import { PayoutChannel, RouteCalculation } from "../types";

export const CHANNELS: PayoutChannel[] = [
  {
    id: "remitly",
    name: "Remitly (Direct to Bank / Wallet)",
    provider: "Remitly Global Inc.",
    badge: "First-Transfer Bonus Rate",
    description: "International clients can pay using Card or Apple Pay. Funds land directly in any Pakistani bank or JazzCash/Easypaisa with promotional first-transfer bonus rates.",
    hops: [
      "Client pays via Remitly App/Web using Debit/Credit Card or Apple Pay",
      "Remitly routes via State Bank of Pakistan Raast / 1LINK system",
      "Instant PKR settlement directly into Pakistani bank IBAN or mobile wallet",
    ],
    estimatedFxRate: 280.50,
    spreadPercent: -0.75, // Promotional bonus rate exceeding standard interbank!
    fixedFeeUsd: 0,
    percentageFee: 0,
    settlementTime: "Instant to 2 hours",
    eprcEase: "Very High",
    pros: [
      "First-transfer promotional bonus (+Rs. 2.50 to +Rs. 3.00 / USD)",
      "Instant SBP Raast settlement to all Pakistani banks & JazzCash",
      "Clients can pay in seconds using Apple Pay or normal credit card without sign-up friction",
    ],
    cons: [
      "Bonus rate applies to first transfer or promotional campaigns",
      "Standard subsequent rate reverts to ~1.0% spread",
    ],
    bestFor: "Overseas direct clients paying for the first time, urgent payments, Apple Pay users",
    bonusRateNote: "First-time transfer bonus: +Rs. 2.50 to +Rs. 3.00/USD + $0 transfer fee",
    transferChannels: ["Apple Pay", "Google Pay", "Debit / Credit Card", "US/UK Bank Transfer", "SBP Raast"],
    easeScore: "Seamless",
  },
  {
    id: "elevate",
    name: "Elevate Pay -> Local Bank",
    provider: "Elevate Pay (US FDIC Account)",
    badge: "Lowest Ongoing FX Spread",
    description: "Receive USD in a free US checking account via ACH, then convert to PKR at wholesale interbank rate into any Pakistani bank.",
    hops: [
      "Client / Upwork -> Elevate US Account (ACH: $0)",
      "Elevate FX Engine -> Wholesale conversion (~0.95% spread)",
      "Pakistani Bank Account (1LINK / IBAN with MT103 Advice)",
    ],
    estimatedFxRate: 275.80,
    spreadPercent: 0.95,
    fixedFeeUsd: 1.50,
    percentageFee: 0,
    settlementTime: "12 - 24 hours",
    eprcEase: "Very High",
    pros: [
      "Real US Checking Account (Bangor Savings Bank, FDIC insured)",
      "Lowest consistent ongoing FX spread (~0.95%)",
      "Official SBP Form-R and MT103 wire certificate for 0.25% tax",
    ],
    cons: [
      "Requires initial Pakistani passport/CNIC biometric KYC",
      "ACH clearing takes 24 hours on initial deposit",
    ],
    bestFor: "Direct US clients paying via ACH, Upwork/Deel payouts, recurring invoices > $1,000",
    bonusRateNote: "0% receiving fee on US ACH deposits + wholesale market rates",
    transferChannels: ["US ACH", "US Fedwire", "Upwork Balance", "Deel / Remote", "1LINK / Raast"],
    easeScore: "Easy",
  },
  {
    id: "sadabiz",
    name: "SadaBiz Payment Link",
    provider: "SadaPay Freelancer (SBP EMI)",
    badge: "Instant Card & Apple Pay",
    description: "Send client an invoice with Apple Pay, Google Pay, or Credit/Debit card. Converted at pure Mastercard interbank rate directly into SadaPay.",
    hops: [
      "Client pays with Apple Pay / Card -> SadaBiz Checkout (3.0% flat fee)",
      "Mastercard Interbank FX conversion (~0.2% spread)",
      "Settled directly into SadaPay PKR Wallet / Linked IBAN",
    ],
    estimatedFxRate: 277.90,
    spreadPercent: 0.20,
    fixedFeeUsd: 0,
    percentageFee: 3.0,
    settlementTime: "Instant - 24 hours",
    eprcEase: "Instant App",
    pros: [
      "Clients can pay with Apple Pay / Card in 10 seconds without an account",
      "True Mastercard interbank exchange rate",
      "Instant 1-click in-app SBP e-PRC PDF download",
    ],
    cons: [
      "3.0% flat card processing fee on gross amount",
      "Not applicable for Upwork or freelance platform wallet withdrawals",
    ],
    bestFor: "Direct clients, milestone payments, retainers, clients with corporate credit cards",
    bonusRateNote: "Mastercard interbank FX rate (near 0% exchange spread)",
    transferChannels: ["Apple Pay", "Google Pay", "Visa / Mastercard", "SadaPay PKR Wallet"],
    easeScore: "Seamless",
  },
  {
    id: "nsave",
    name: "nsave (Swiss Offshore Account)",
    provider: "nsave SA (Geneva, Switzerland)",
    badge: "Swiss Bank Account (USD/EUR/GBP)",
    description: "Swiss fintech providing Pakistani passport holders a regulated Swiss offshore bank account with dedicated IBANs in USD, EUR, and GBP to protect against PKR inflation.",
    hops: [
      "Client sends SEPA (EUR), UK Faster Payments (GBP), or ACH (USD) -> Swiss IBAN",
      "Hold funds in Switzerland or convert to PKR when rates are favorable",
      "Disbursement to Pakistani Bank IBAN via SWIFT or international partner",
    ],
    estimatedFxRate: 276.50,
    spreadPercent: 0.70,
    fixedFeeUsd: 0,
    percentageFee: 0.50,
    settlementTime: "1 - 2 business days",
    eprcEase: "Very High",
    pros: [
      "Legally hold funds in Swiss jurisdiction protected from PKR depreciation",
      "Supports multi-currency (EUR SEPA, GBP Faster Payments, USD Wire)",
      "Official Swiss bank statements and SWIFT MT103 remittance advices",
    ],
    cons: [
      "Offshore account maintenance terms apply",
      "Best suited for freelancers holding savings rather than daily spenders",
    ],
    bestFor: "High-earning developers, European/UK clients, holding foreign currency retainers",
    bonusRateNote: "0% conversion loss if keeping funds in USD/EUR/GBP offshore",
    transferChannels: ["SEPA (Eurozone)", "UK Faster Payments", "US ACH / Wire", "SWIFT MT103"],
    easeScore: "Easy",
  },
  {
    id: "ace_money",
    name: "Ace Money Transfer",
    provider: "Ace Capital Group",
    badge: "UK/EU Promotional Rates",
    description: "Highly competitive money transfer service for clients in UK, Europe, Australia, and Canada paying freelancers in Pakistan directly via Raast.",
    hops: [
      "Client pays via Ace App/Web using UK Faster Payments or Debit Card",
      "Ace dispatches directly to Pakistani banking system via Raast",
      "Funds credited into local PKR bank or JazzCash",
    ],
    estimatedFxRate: 279.80,
    spreadPercent: -0.20,
    fixedFeeUsd: 0,
    percentageFee: 0,
    settlementTime: "Instant to 1 hour",
    eprcEase: "Very High",
    pros: [
      "Frequent promotional promo codes and bonus exchange rates",
      "Instant SBP Raast delivery into Meezan, HBL, Standard Chartered, or JazzCash",
      "Extremely popular and trusted across the UK & Europe",
    ],
    cons: [
      "Limited direct US corporate payment capabilities",
      "Requires client to initiate via Ace portal",
    ],
    bestFor: "UK & European clients, British Pounds (GBP) & Euros (EUR) invoices",
    bonusRateNote: "Fee-free first transfer + competitive promotional exchange rate",
    transferChannels: ["UK Faster Payments", "SEPA", "Debit Card", "1LINK / Raast"],
    easeScore: "Seamless",
  },
  {
    id: "wise",
    name: "Wise (TransferWise)",
    provider: "Wise Business / Personal",
    badge: "Global Multi-Currency",
    description: "Receive multi-currency payments and transfer to Pakistani bank accounts via local disbursement partners.",
    hops: [
      "Client sends USD/GBP/EUR -> Wise balance",
      "Wise Currency Conversion (~1.42% blended fee & spread)",
      "Dispatched to Pakistani Bank Account via local partner",
    ],
    estimatedFxRate: 274.50,
    spreadPercent: 1.42,
    fixedFeeUsd: 2.20,
    percentageFee: 0.45,
    settlementTime: "4 to 24 hours",
    eprcEase: "Moderate",
    pros: [
      "Global standard for multi-currency contracts",
      "Real-time mid-market rate transparently calculated",
      "Fast 4-24 hour clearance into Pakistani banks",
    ],
    cons: [
      "New personal USD receiving account openings are currently restricted in Pakistan",
      "Local bank may require manual support ticket to issue SBP e-PRC",
    ],
    bestFor: "Clients in UK/EU with existing Wise balances, multi-currency projects",
    bonusRateNote: "Transparent mid-market exchange rate without hidden markups",
    transferChannels: ["Wise Balance", "ACH Debit", "Card", "Direct Local Bank"],
    easeScore: "Easy",
  },
  {
    id: "jazzcash_nayapay",
    name: "JazzCash / NayaPay (via Payoneer/Remit)",
    provider: "JazzCash / NayaPay Mobile Wallets",
    badge: "Instant Mobile Cashout (<5 min)",
    description: "Link Payoneer or receive inward remittances directly inside your mobile wallet app for immediate liquidity and ATM cash withdrawal.",
    hops: [
      "Earnings stored in Payoneer balance or sent via Remitly/MoneyGram",
      "Direct API sync into JazzCash or NayaPay PKR wallet",
      "Instant PKR credit available on debit card / ATM / 1LINK",
    ],
    estimatedFxRate: 271.40,
    spreadPercent: 2.50,
    fixedFeeUsd: 0,
    percentageFee: 2.0,
    settlementTime: "Instant (within 5 minutes)",
    eprcEase: "Instant App",
    pros: [
      "Instant liquidity in under 5 minutes without visiting a bank",
      "Instant digital PRC download inside JazzCash app",
      "Works with biometric verification on any Pakistani smartphone",
    ],
    cons: [
      "Wallet monthly balance limits unless upgraded to Level 2 biometric status",
      "2.0% fee on Payoneer wallet cashout",
    ],
    bestFor: "Urgent liquidity, daily expenses, mobile-first freelancers needing immediate ATM cash",
    bonusRateNote: "Instant cashout into mobile wallet with zero bank branch visits",
    transferChannels: ["Payoneer API", "Remitly Inward", "Raast", "JazzCash / NayaPay App"],
    easeScore: "Seamless",
  },
  {
    id: "payoneer",
    name: "Payoneer -> Local Bank",
    provider: "Payoneer Global",
    badge: "Upwork & Fiverr Standard",
    description: "Default option for many freelancers, but suffers from layered 2% withdrawal fees plus hidden 2.8% FX spreads.",
    hops: [
      "Upwork / Fiverr / Client -> Payoneer account",
      "Payoneer takes 2% withdrawal fee",
      "Payoneer converts at marked-down exchange rate (~2.8% spread)",
      "Pakistani Bank receives funds via local clearing partner",
    ],
    estimatedFxRate: 270.65,
    spreadPercent: 2.80,
    fixedFeeUsd: 1.50,
    percentageFee: 2.0,
    settlementTime: "2 to 4 business days",
    eprcEase: "Moderate",
    pros: [
      "Pre-integrated into Upwork, Fiverr, and PeoplePerHour",
      "Widely available to all Pakistani freelancers with CNIC",
    ],
    cons: [
      "Hidden FX spread bleeds 2.8% to 3.5% silently",
      "Layered 2% withdrawal fee",
      "FIRC / e-PRC requires manual customer care ticket",
    ],
    bestFor: "Emergency fallback or freelancers without alternative accounts",
    bonusRateNote: "$25 referral bonus when receiving first $1,000",
    transferChannels: ["Upwork Payout", "Fiverr Balance", "Global Payment Service", "Pakistani IBAN"],
    easeScore: "Moderate",
  },
  {
    id: "swift",
    name: "Direct SWIFT Wire to Bank",
    provider: "Traditional Bank Wire",
    badge: "Enterprise Standard",
    description: "Client sends direct international wire (TT) from foreign corporate bank to your Pakistani USD or PKR account.",
    hops: [
      "Client's Foreign Bank dispatches international wire via SWIFT network",
      "Intermediary Correspondent Bank (JPMorgan/Citi) deducts $35 - $45",
      "Receiving Pakistani Bank converts at internal TT buying rate (~2.0% spread)",
    ],
    estimatedFxRate: 272.90,
    spreadPercent: 2.00,
    fixedFeeUsd: 35.00,
    percentageFee: 0,
    settlementTime: "3 to 5 business days",
    eprcEase: "Very High",
    pros: [
      "Enterprise standard for Fortune 500 & corporate clients",
      "Direct inward remittance MT103 advice readily available for 0.25% tax lock",
    ],
    cons: [
      "Severe intermediary deductions ($35-$50) on smaller invoices",
      "Slow clearing times (3-5 business days)",
      "Local branch officers often mistake it for general remittances and deduct 1% tax",
    ],
    bestFor: "Large corporate retainers (>$5,000) where client agrees to pay wire fees",
    bonusRateNote: "Direct institutional MT103 wire trail for audit defense",
    transferChannels: ["SWIFT Network", "Fedwire", "Correspondent Banking", "Local PKR IBAN"],
    easeScore: "Complex",
  },
  {
    id: "upwork_direct",
    name: "Upwork Direct Local Bank (LBP)",
    provider: "Upwork Direct to Local Bank",
    badge: "Highest Hidden Leakage",
    description: "Direct PKR withdrawal inside Upwork. Seems cheap with $0.99 fee, but uses predatory exchange rate spreads exceeding 3.5%.",
    hops: [
      "Upwork charges nominal $0.99 withdrawal fee",
      "Clearing partner applies aggressive 3.5% - 4.2% hidden FX markup",
      "Settles into Pakistani bank account in PKR (often misclassified under wrong SBP code)",
    ],
    estimatedFxRate: 268.70,
    spreadPercent: 3.50,
    fixedFeeUsd: 0.99,
    percentageFee: 0,
    settlementTime: "2 to 4 business days",
    eprcEase: "Difficult",
    pros: [
      "Convenient 1-click inside Upwork interface",
      "No external intermediary accounts needed",
    ],
    cons: [
      "Extreme FX spread loss (> PKR 20,000 on a $2,000 payout)",
      "Missing SBP purpose code in batch clearance leads to 1% tax deduction instead of 0.25%",
    ],
    bestFor: "Only convenient for very small amounts (<$100)",
    bonusRateNote: "No bonus rates — predatory exchange rate spread",
    transferChannels: ["Upwork Balance", "1LINK Direct Local Bank"],
    easeScore: "Moderate",
  },
  {
    id: "skrill",
    name: "Skrill -> Local Bank",
    provider: "Paysafe Group",
    badge: "Legacy Niche Wallet",
    description: "Alternative digital wallet option used on specific freelance networks, subject to high conversion spreads.",
    hops: [
      "Client transfers USD/EUR to your Skrill wallet",
      "Skrill applies 3.99% currency conversion spread",
      "Bank transfer fee deducted on withdrawal to Pakistani IBAN",
    ],
    estimatedFxRate: 267.30,
    spreadPercent: 3.99,
    fixedFeeUsd: 5.80,
    percentageFee: 0,
    settlementTime: "2 to 5 business days",
    eprcEase: "Difficult",
    pros: [
      "Accepted on niche design and affiliate platforms",
      "Supports international credit cards",
    ],
    cons: [
      "High 3.99% conversion markup",
      "No formal automated SBP e-PRC",
      "Risk of account verification holds",
    ],
    bestFor: "Platforms that only disburse earnings through Skrill",
    bonusRateNote: "VIP loyalty rewards for high-volume transactions",
    transferChannels: ["Skrill Wallet", "Credit Card", "International Bank Transfer"],
    easeScore: "Moderate",
  },
];

export function calculatePayoutRoute(
  channel: PayoutChannel,
  invoiceAmountUsd: number,
  interbankRate: number,
  isPsebRegistered: boolean
): RouteCalculation {
  const grossAmountUsd = invoiceAmountUsd;

  // 1. Platform / Percentage fee in USD
  const platformFeeUsd = (grossAmountUsd * channel.percentageFee) / 100;

  // 2. Intermediary / Fixed fee in USD
  const intermediaryFeeUsd = channel.fixedFeeUsd;

  // 3. Net USD available for FX conversion
  const netUsdToConvert = Math.max(0, grossAmountUsd - platformFeeUsd - intermediaryFeeUsd);

  // 4. FX Rate used: calculate dynamic rate based on current interbank benchmark
  const actualSpreadRatio = channel.spreadPercent / 100;
  const fxRateUsed = Number((interbankRate * (1 - actualSpreadRatio)).toFixed(2));

  // 5. FX Spread Loss in PKR (difference between interbank and effective rate on net USD)
  const idealPkr = netUsdToConvert * interbankRate;
  const grossPkr = netUsdToConvert * fxRateUsed;
  const fxSpreadLossPkr = idealPkr - grossPkr;

  // 6. Withholding Tax (WHT under Section 154A)
  // For PSEB registered: 0.25% of gross PKR proceeds
  // For Non-registered or misclassified: 1.00%
  const whtPercent = isPsebRegistered ? 0.25 : 1.0;
  const whtDeductionPkr = (grossPkr * whtPercent) / 100;

  // 7. Net PKR Received in Freelancer's Bank Account
  const netPkrReceived = Math.round(grossPkr - whtDeductionPkr);

  // 8. Total Leakage = (Benchmark ideal PKR without fees) - (Actual Net PKR Received)
  const benchmarkPkr = grossAmountUsd * interbankRate;
  const totalLeakagePkr = Math.max(0, benchmarkPkr - netPkrReceived);

  return {
    channel,
    grossAmountUsd,
    platformFeeUsd: Number(platformFeeUsd.toFixed(2)),
    intermediaryFeeUsd: Number(intermediaryFeeUsd.toFixed(2)),
    netUsdToConvert: Number(netUsdToConvert.toFixed(2)),
    fxRateUsed,
    interbankRate,
    fxSpreadLossPkr: Math.round(fxSpreadLossPkr),
    grossPkr: Math.round(grossPkr),
    whtPercent,
    whtDeductionPkr: Math.round(whtDeductionPkr),
    netPkrReceived,
    totalLeakagePkr: Math.round(totalLeakagePkr),
    savingsVsWorstPkr: 0, // Will be computed after sorting
    isOptimal: false,
  };
}

export function compareAllRoutes(
  invoiceAmountUsd: number,
  interbankRate: number = 278.45,
  isPsebRegistered: boolean = true
): RouteCalculation[] {
  const routes = CHANNELS.map((channel) =>
    calculatePayoutRoute(channel, invoiceAmountUsd, interbankRate, isPsebRegistered)
  );

  // Sort descending by net PKR received
  routes.sort((a, b) => b.netPkrReceived - a.netPkrReceived);

  const worstNetPkr = routes[routes.length - 1].netPkrReceived;

  // Mark optimal and calculate savings vs lowest route
  routes.forEach((route, index) => {
    route.isOptimal = index === 0;
    route.savingsVsWorstPkr = Math.max(0, route.netPkrReceived - worstNetPkr);
  });

  return routes;
}

export function formatPKR(val: number): string {
  return "PKR " + Math.round(val).toLocaleString("en-PK");
}

export function formatUSD(val: number): string {
  return "$" + val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
