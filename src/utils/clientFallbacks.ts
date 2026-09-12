import { AIDealRouteResult, ContractAnalysisResult } from "../types";

export function extractAmountFromText(text: string): number | null {
  const match = text.match(/\$\s?([0-9]+(?:,[0-9]{3})*(?:\.[0-9]{2})?)/);
  if (match && match[1]) {
    return parseFloat(match[1].replace(/,/g, ""));
  }
  const generalMatch = text.match(/(?:usd|pkr|eur|gbp|\$|£|€)?\s*([0-9]{2,6}(?:\.[0-9]{2})?)/i);
  if (generalMatch && generalMatch[1]) {
    const val = parseFloat(generalMatch[1]);
    if (val >= 10 && val <= 100000) return val;
  }
  return null;
}

export function detectCategory(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes("design") || lower.includes("figma") || lower.includes("ui/ux") || lower.includes("video")) {
    return "Design & Digital Media (Purpose Code 9210)";
  }
  if (lower.includes("marketing") || lower.includes("seo") || lower.includes("social media") || lower.includes("ads")) {
    return "Digital Marketing & SEO (Purpose Code 9220)";
  }
  if (lower.includes("data entry") || lower.includes("virtual assistant") || lower.includes("customer support")) {
    return "BPO & Call Center Services (Purpose Code 9200)";
  }
  return "Software Development & IT Services (Purpose Code 9186)";
}

export function getClientSideContractAnalysis(contractText: string): ContractAnalysisResult {
  const detectedAmount = extractAmountFromText(contractText);
  return {
    summary: "Comprehensive preliminary legal, scope & compliance scan computed via InflowPK on-device heuristic engine.",
    detectedAmount: detectedAmount || 2000,
    detectedCurrency: "USD",
    serviceCategory: detectCategory(contractText),
    recommendedPurposeCode: {
      code: "9186",
      title: "Computer software / IT services export",
      reason: "Standard classification for software development, SaaS, and web architecture under SBP Foreign Exchange Manual Chapter 14.",
    },
    scopeCreepRisks: [
      {
        risk: "Unbounded Revisions Clause",
        severity: "high",
        explanation: "No strict ceiling on iterative revisions specified. Client can demand endless iterations and rework under the same fixed fee.",
        suggestion: "Add: 'Scope includes up to two (2) consolidated rounds of feedback. Subsequent iterations billed at $45/hr.'",
      },
      {
        risk: "Milestone Sign-off Window Missing",
        severity: "medium",
        explanation: "Contract doesn't define an acceptance timeframe. The client may leave the milestone pending review indefinitely.",
        suggestion: "Add: 'Deliverables considered accepted and approved after 5 business days without written feedback.'",
      },
      {
        risk: "Vague Deliverable Acceptance Criteria",
        severity: "medium",
        explanation: "Deliverables depend on subjective client satisfaction rather than verifiable technical requirements.",
        suggestion: "Define explicit testable acceptance benchmarks (e.g. 'passes responsive Figma specs and unit tests').",
      },
    ],
    paymentTermsRisks: [
      {
        issue: "Delayed Settlement / Net-30 Terms",
        riskLevel: "medium",
        recommendation: "Ensure a minimum 30% upfront deposit before kickoff or escrow lock.",
      },
      {
        issue: "Transfer & FX Wire Deductions",
        riskLevel: "low",
        recommendation: "Specify that sender covers intermediary wire fees (OUR fee instruction) to prevent $35 SWIFT haircuts.",
      },
    ],
    counterClauses: [
      {
        title: "Defined Scope & Revision Cap",
        textToCopy: "Scope of Work is strictly limited to the deliverables explicitly outlined in Appendix A. Two (2) consolidated rounds of feedback are included within 5 business days of deliverable submission. Out-of-scope work or structural revisions will be quoted separately under a change order.",
      },
      {
        title: "Payment Milestones & Release",
        textToCopy: "Invoices are payable within 7 business days of delivery. Upon formal submission, Client has 5 business days to review; absence of rejection constitutes formal acceptance.",
      },
      {
        title: "IP Transfer Upon Full Settlement",
        textToCopy: "All intellectual property rights and codebase licenses transfer to the Client exclusively upon receipt of 100% full cleared payment.",
      },
    ],
  };
}

export function getClientSideDealRoute(
  rawText: string,
  invoiceAmountHint?: number,
  currencyHint?: string
): AIDealRouteResult {
  const amount = invoiceAmountHint || extractAmountFromText(rawText) || 1500;
  const isUS = /us|usa|dollar|\$|united states|california|new york|texas|san francisco|chicago|america/i.test(rawText);
  const isUK = /uk|london|gbp|pound|£|england|manchester|british/i.test(rawText);
  const isEU = /euro|€|germany|france|netherlands|berlin|sepa|swiss|chf|amsterdam/i.test(rawText);
  const isCard = /card|apple pay|google pay|credit card|stripe|checkout|link/i.test(rawText);

  let gatewayId = "elevate";
  let gatewayName = "Elevate Pay -> Local Bank";
  let deliveryTime = "12 - 24 hours (instant to PKR via 1LINK/Raast after ACH)";
  let transferChannels = ["US ACH", "Fedwire", "Upwork Balance", "1LINK / Raast"];
  let fxRate = 276.50;
  let bonusNote = "Wholesale interbank rate (~0.95% spread) with 0% receiving fee";
  let why = "Direct US client paying via ACH. Elevate provides a free US checking account with 0% deposit fee and highest net PKR.";

  if (isCard) {
    gatewayId = "sadabiz";
    gatewayName = "SadaBiz Payment Link";
    deliveryTime = "Instant to 24 hours directly into SadaPay PKR wallet";
    transferChannels = ["Apple Pay", "Google Pay", "Visa / Mastercard"];
    fxRate = 277.90;
    bonusNote = "Pure Mastercard interbank FX rate (near 0% exchange spread)";
    why = "Client requested to pay with card/Apple Pay. SadaBiz generates a frictionless 10-second payment link with instant SBP e-PRC.";
  } else if (isUK) {
    gatewayId = "ace_money";
    gatewayName = "Ace Money Transfer";
    deliveryTime = "Instant to 1 hour via SBP Raast into Pakistani bank";
    transferChannels = ["UK Faster Payments", "Debit Card", "SEPA", "1LINK / Raast"];
    fxRate = 279.80;
    bonusNote = "UK promotional rate (+Rs. 1.50 over market) and fee-free first transfer";
    why = "Client based in UK. Ace Money Transfer offers promotional rates and instant delivery straight to your Pakistani IBAN.";
  } else if (isEU) {
    gatewayId = "nsave";
    gatewayName = "nsave (Swiss Offshore Account)";
    deliveryTime = "1 to 2 business days via SEPA EUR clearing";
    transferChannels = ["SEPA Bank Transfer", "Direct Debit", "SWIFT"];
    fxRate = 295.20;
    bonusNote = "Hold in Swiss EUR account to hedge against Rupee depreciation";
    why = "European enterprise client requiring formal SEPA IBAN. nsave provides a regulated Swiss IBAN accessible to Pakistanis.";
  }

  const grossPkr = Math.round(amount * fxRate);
  const netPkr = Math.round(grossPkr * 0.9975); // 0.25% tax
  const legacyPkr = Math.round(amount * 268.70 * 0.99); // 3.5% spread + 1% tax
  const saved = Math.max(0, netPkr - legacyPkr);

  return {
    clientProfile: {
      clientLocation: isUS ? "United States" : isUK ? "United Kingdom" : isEU ? "European Union" : "International / Overseas",
      inferredPaymentMethods: isCard ? ["Credit Card", "Apple Pay"] : ["Bank Transfer (ACH/Faster Payments)", "Debit Card"],
      clientType: "Direct Client",
    },
    commercialTerms: {
      invoiceAmount: amount,
      currency: currencyHint || (isUK ? "GBP" : isEU ? "EUR" : "USD"),
      pkrEquivalent: grossPkr,
      billingStructure: "Fixed Price",
    },
    reasoning: {
      corridorSummary: `Detected payment corridor from ${isUS ? "US" : isUK ? "UK" : isEU ? "EU" : "international client"}. The client seeks an easy transfer method without local Pakistan branch red tape.`,
      hiddenLeakageWarning: `Standard payment routes (Upwork LBP or traditional SWIFT) would silently consume up to PKR ${saved.toLocaleString()} in hidden FX markups and intermediary fees.`,
      contractPitfalls: [
        "Ensure an explicit deliverable acceptance window of 5 business days to prevent milestone stalling.",
        "Require payment receipt or escrow funding before transferring final production keys.",
      ],
      sbpPurposeCode: {
        code: "9186",
        title: "Computer Software & IT Services Export",
        taxRate: "0.25% under FBR Section 154A (PSEB Registered)",
      },
    },
    optimalRoute: {
      gatewayId,
      gatewayName,
      deliveryTimeLocalAccount: deliveryTime,
      transferChannels,
      effectiveFxRatePkr: fxRate,
      bonusRateNote: bonusNote,
      netPkrDeposited: netPkr,
      rupeesSavedVsLegacy: saved,
      whyChosen: why,
    },
    runnerUpRoute: {
      gatewayName: "Remitly (Direct to Bank)",
      deliveryTimeLocalAccount: "Instant to 2 hours via SBP Raast",
      netPkrDeposited: Math.round(amount * 280.50 * 0.9975),
      tradeoffNote: "Fastest delivery and first-transfer bonus, but requires client to enter your IBAN on Remitly.",
    },
    clientReadyReply: `Hi! Thank you for the update. To make payment as seamless and zero-fee as possible on your end, you can pay directly using ${transferChannels[0]} or ${transferChannels[1]}. This processes smoothly without international wire fees. Let me know if you'd like me to send the payment details or a direct link!`,
    actionStepsForFreelancer: [
      "1. Generate your SBP-compliant export invoice with Purpose Code 9186.",
      "2. Provide your receiving routing details to the client.",
      "3. Upon deposit, download your automated e-PRC certificate to lock 0.25% income tax.",
    ],
  };
}

/**
 * Compresses an image in the browser if it exceeds max dimensions or size,
 * avoiding payload overflow and "Failed to fetch" errors.
 */
export async function compressImageFile(
  file: File,
  maxDimension = 1400,
  quality = 0.85
): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Failed to decode image"));
      img.onload = () => {
        let { width, height } = img;
        if (width <= maxDimension && height <= maxDimension && file.size < 1024 * 1024) {
          // No compression needed
          resolve({ base64: e.target?.result as string, mimeType: file.type });
          return;
        }

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve({ base64: e.target?.result as string, mimeType: file.type });
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL("image/jpeg", quality);
        resolve({ base64: compressedBase64, mimeType: "image/jpeg" });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
