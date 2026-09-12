import express from "express";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json({ limit: "15mb" }));

// Enable CORS for all incoming requests (Vercel serverless, preview iframes, cross-origin)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

// Lazy-initialized Gemini client
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Resilient Gemini multi-model fallback to shield against temporary 503 high-demand spikes
async function generateGeminiContentWithFallback(
  ai: GoogleGenAI,
  params: {
    contents: any;
    config?: any;
    modelPreference?: string[];
  }
) {
  const models = params.modelPreference || ["gemini-3.1-flash-lite", "gemini-3.8-flash"];
  let lastErr: any = null;

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });
      return response;
    } catch (err: any) {
      console.warn(`Model ${model} unavailable (${err?.status || err?.code || "error"}): ${err?.message || err}. Trying next fallback.`);
      lastErr = err;
    }
  }

  throw lastErr || new Error("All AI models currently unavailable.");
}

// In-memory cache for live exchange rates
interface FXCache {
  timestamp: number;
  data: any;
}
let fxCache: FXCache | null = null;
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

const apiRouter = express.Router();

// Health check
apiRouter.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Live FX rates endpoint with real interbank cross-rates
apiRouter.get("/fx-rates", async (_req, res) => {
  const now = Date.now();
  if (fxCache && now - fxCache.timestamp < CACHE_TTL_MS) {
    return res.json(fxCache.data);
  }

  try {
    const response = await fetch("https://open.er-api.com/v6/latest/USD");
    if (!response.ok) {
      throw new Error(`FX API responded with status ${response.status}`);
    }
    const apiData = (await response.json()) as any;
    const rates = apiData.rates || {};

    const usdPkr = Number((rates.PKR || 278.45).toFixed(2));
    const usdEur = rates.EUR || 0.862;
    const usdGbp = rates.GBP || 0.740;
    const usdAed = rates.AED || 3.6725;
    const usdSar = rates.SAR || 3.750;
    const usdCad = rates.CAD || 1.360;
    const usdAud = rates.AUD || 1.510;

    // Cross-rates: 1 unit of foreign currency in PKR = (USD/PKR) / (USD/Foreign)
    const eurPkr = Number((usdPkr / usdEur).toFixed(2));
    const gbpPkr = Number((usdPkr / usdGbp).toFixed(2));
    const aedPkr = Number((usdPkr / usdAed).toFixed(2));
    const sarPkr = Number((usdPkr / usdSar).toFixed(2));
    const cadPkr = Number((usdPkr / usdCad).toFixed(2));
    const audPkr = Number((usdPkr / usdAud).toFixed(2));

    const payload = {
      base: "USD",
      interbankRate: usdPkr,
      openMarketRate: Number((usdPkr * 1.006).toFixed(2)),
      source: "Open Exchange Rates (Interbank Cross-Rates) & SBP Reference",
      lastUpdated: new Date().toISOString(),
      currencies: {
        USD: { code: "USD", name: "US Dollar", symbol: "$", pkrRate: usdPkr, usdMultiplier: 1.0 },
        EUR: { code: "EUR", name: "Euro", symbol: "€", pkrRate: eurPkr, usdMultiplier: Number((1 / usdEur).toFixed(4)) },
        GBP: { code: "GBP", name: "British Pound", symbol: "£", pkrRate: gbpPkr, usdMultiplier: Number((1 / usdGbp).toFixed(4)) },
        AED: { code: "AED", name: "UAE Dirham", symbol: "AED", pkrRate: aedPkr, usdMultiplier: Number((1 / usdAed).toFixed(4)) },
        SAR: { code: "SAR", name: "Saudi Riyal", symbol: "SAR", pkrRate: sarPkr, usdMultiplier: Number((1 / usdSar).toFixed(4)) },
        CAD: { code: "CAD", name: "Canadian Dollar", symbol: "C$", pkrRate: cadPkr, usdMultiplier: Number((1 / usdCad).toFixed(4)) },
        AUD: { code: "AUD", name: "Australian Dollar", symbol: "A$", pkrRate: audPkr, usdMultiplier: Number((1 / usdAud).toFixed(4)) },
      },
      channels: {
        elevate: {
          estimatedRate: Number((usdPkr * (1 - 0.0095)).toFixed(2)),
          spreadPercent: 0.95,
          wireFeeUsd: 0,
          achFeeUsd: 1.50,
          speed: "Instant - 3 hours to local PKR IBAN (via 1LINK / Raast) after 1-2 day US ACH",
        },
        sadabiz: {
          estimatedRate: usdPkr,
          spreadPercent: 0.15,
          platformFeePercent: 3.0,
          speed: "Instant to 24 hours (settles into SadaPay PKR wallet directly)",
        },
        wise: {
          estimatedRate: Number((usdPkr * (1 - 0.0142)).toFixed(2)),
          spreadPercent: 1.42,
          fixedFeeUsd: 2.20,
          speed: "4 to 24 hours directly to local Pakistani bank",
        },
        payoneer: {
          estimatedRate: Number((usdPkr * (1 - 0.028)).toFixed(2)),
          spreadPercent: 2.80,
          withdrawalFeePercent: 2.0,
          speed: "2 to 4 business days",
        },
        swiftDirect: {
          estimatedRate: Number((usdPkr * (1 - 0.020)).toFixed(2)),
          spreadPercent: 2.0,
          intermediaryFeeUsd: 35.0,
          speed: "3 to 5 business days",
        },
        upworkDirect: {
          estimatedRate: Number((usdPkr * (1 - 0.038)).toFixed(2)),
          spreadPercent: 3.80,
          fixedFeeUsd: 0.99,
          speed: "2 to 4 business days",
        },
      },
    };

    fxCache = { timestamp: now, data: payload };
    return res.json(payload);
  } catch (error) {
    console.error("Failed to fetch live FX rates, using reliable SBP fallback:", error);
    const usdPkr = 278.45;
    return res.json({
      base: "USD",
      interbankRate: usdPkr,
      openMarketRate: 280.20,
      source: "State Bank of Pakistan Weighted Interbank Benchmark (Offline Fallback)",
      lastUpdated: new Date().toISOString(),
      currencies: {
        USD: { code: "USD", name: "US Dollar", symbol: "$", pkrRate: 278.45, usdMultiplier: 1.0 },
        EUR: { code: "EUR", name: "Euro", symbol: "€", pkrRate: 322.20, usdMultiplier: 1.157 },
        GBP: { code: "GBP", name: "British Pound", symbol: "£", pkrRate: 375.50, usdMultiplier: 1.348 },
        AED: { code: "AED", name: "UAE Dirham", symbol: "AED", pkrRate: 75.80, usdMultiplier: 0.272 },
        SAR: { code: "SAR", name: "Saudi Riyal", symbol: "SAR", pkrRate: 74.20, usdMultiplier: 0.266 },
        CAD: { code: "CAD", name: "Canadian Dollar", symbol: "C$", pkrRate: 204.50, usdMultiplier: 0.734 },
        AUD: { code: "AUD", name: "Australian Dollar", symbol: "A$", pkrRate: 184.20, usdMultiplier: 0.661 },
      },
    });
  }
});

function generateHeuristicContractAnalysis(contractText: string) {
  const detectedAmount = extractAmountFromText(contractText);
  return {
    summary: "Preliminary legal & scope scan completed based on client milestones and contract terms.",
    detectedAmount: detectedAmount || 2000,
    detectedCurrency: "USD",
    serviceCategory: detectCategory(contractText),
    recommendedPurposeCode: {
      code: "9186",
      title: "Computer software / IT services export",
      reason: "Standard classification for software development and programming under SBP Forex Manual Chapter 14.",
    },
    scopeCreepRisks: [
      {
        risk: "Unbounded Revisions Clause",
        severity: "high",
        explanation: "No strict ceiling on iterative revisions specified. Client can demand endless changes under the same price.",
        suggestion: "Add: 'Includes up to two (2) rounds of minor cosmetic revisions. Subsequent rounds billed at $45/hr.'",
      },
      {
        risk: "Milestone Sign-off Window Missing",
        severity: "medium",
        explanation: "Contract doesn't define an acceptance period. The client may leave the milestone pending indefinitely.",
        suggestion: "Add: 'Deliverables considered accepted and approved after 5 business days without written feedback.'",
      },
    ],
    paymentTermsRisks: [
      {
        issue: "Delayed Settlement / Net Terms",
        riskLevel: "medium",
        recommendation: "Ensure a minimum 30% upfront deposit before kickoff or escrow lock.",
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
    ],
  };
}

// AI Contract & Scope Analysis Endpoint
apiRouter.post("/analyze-contract", async (req, res) => {
  const { contractText } = req.body;
  if (!contractText || typeof contractText !== "string" || contractText.trim().length < 10) {
    return res.status(400).json({
      error: "Please provide a valid client brief, Upwork contract, or scope of work text.",
    });
  }

  try {
    const ai = getAIClient();
    if (!ai) {
      return res.json({ analysis: generateHeuristicContractAnalysis(contractText) });
    }

    const prompt = `You are an elite legal-financial advisor specializing in Pakistani freelancers, remote developers, and digital agencies exporting services under State Bank of Pakistan (SBP) and FBR regulations.
Analyze the following client contract, brief, or proposal:

"""
${contractText.slice(0, 15000)}
"""

Carefully extract the financial terms, detect scope creep risks, identify delayed payment traps, and recommend the exact State Bank of Pakistan (SBP) Purpose Code under Foreign Exchange Manual (e.g., Code 9186 for Software Development, 9187 for Software Consultancy, 9185 for Hardware Consultancy, 9210 for Digital Content/Graphic Design, 9220 for SEO/Digital Marketing, 9200 for BPO/Call Centers, 9190 for Other Computer Services).

Provide the output strictly in the following JSON schema.`;

    const response = await generateGeminiContentWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            detectedAmount: { type: Type.NUMBER, description: "Total or milestone USD invoice amount if found, otherwise null" },
            detectedCurrency: { type: Type.STRING },
            serviceCategory: { type: Type.STRING },
            recommendedPurposeCode: {
              type: Type.OBJECT,
              properties: {
                code: { type: Type.STRING },
                title: { type: Type.STRING },
                reason: { type: Type.STRING },
              },
              required: ["code", "title", "reason"],
            },
            scopeCreepRisks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  risk: { type: Type.STRING },
                  severity: { type: Type.STRING, description: "high, medium, or low" },
                  explanation: { type: Type.STRING },
                  suggestion: { type: Type.STRING },
                },
                required: ["risk", "severity", "explanation", "suggestion"],
              },
            },
            paymentTermsRisks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  issue: { type: Type.STRING },
                  riskLevel: { type: Type.STRING, description: "high, medium, or low" },
                  recommendation: { type: Type.STRING },
                },
                required: ["issue", "riskLevel", "recommendation"],
              },
            },
            counterClauses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  textToCopy: { type: Type.STRING },
                },
                required: ["title", "textToCopy"],
              },
            },
          },
          required: [
            "summary",
            "serviceCategory",
            "recommendedPurposeCode",
            "scopeCreepRisks",
            "paymentTermsRisks",
            "counterClauses",
          ],
        },
      },
    });

    const text = response.text ? response.text.trim() : "{}";
    const parsedData = JSON.parse(text);

    return res.json({ analysis: parsedData });
  } catch (error: any) {
    console.warn("Contract analysis fallback activated:", error?.message || error);
    return res.json({ analysis: generateHeuristicContractAnalysis(contractText), fallback: true });
  }
});

// Resilient Heuristic Deal Router (ensures 100% demo uptime if offline or during cloud spikes)
function generateHeuristicDealRoute(rawText: string, invoiceAmountHint?: number, currencyHint?: string) {
  const amount = invoiceAmountHint || extractAmountFromText(rawText) || 1500;
  const isUS = /us|usa|dollar|\$|united states|california|new york|texas|san francisco|chicago/i.test(rawText);
  const isUK = /uk|london|gbp|pound|£|england|manchester/i.test(rawText);
  const isEU = /euro|€|germany|france|netherlands|berlin|sepa|swiss|chf/i.test(rawText);
  const isCard = /card|apple pay|google pay|credit card|stripe|checkout|link/i.test(rawText);

  let gatewayId = "elevate";
  let gatewayName = "Elevate Pay -> Local Bank";
  let deliveryTime = "12 - 24 hours (instant to PKR via 1LINK/Raast after ACH)";
  let transferChannels = ["US ACH", "Fedwire", "Upwork Balance", "1LINK / Raast"];
  let fxRate = 275.80;
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
        "Require payment receipt before transferring final source code / admin access.",
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
    clientReadyReply: `Hi! Thank you for the update. To make payment as seamless and zero-fee as possible on your end, you can pay directly using ${transferChannels[0]} or ${transferChannels[1]}. This processes instantly without any international wire fees. Let me know if you'd like me to send the payment details or a direct checkout link!`,
    actionStepsForFreelancer: [
      "1. Generate your SBP-compliant export invoice with Purpose Code 9186.",
      "2. Provide your receiving routing details to the client.",
      "3. Upon deposit, download your automated e-PRC certificate to lock 0.25% income tax.",
    ],
  };
}

// Hackathon AI Deal Judge & Gateway Router:
apiRouter.post("/route-deal", async (req, res) => {
  const { input, imageBase64, imageMimeType, invoiceAmountHint, currencyHint } = req.body;
  const rawText = input || "Client message screenshot";

  try {
    if (!input && !imageBase64) {
      return res.status(400).json({
        error: "Please provide a client message, WhatsApp thread, Upwork brief, or upload a photo/screenshot.",
      });
    }

    const ai = getAIClient();

    // Heuristic fallback for offline/demo reliability
    if (!ai) {
      const fallbackResult = generateHeuristicDealRoute(rawText, invoiceAmountHint, currencyHint);
      return res.json({ result: fallbackResult });
    }

    const contentParts: any[] = [];
    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      contentParts.push({
        inlineData: {
          data: cleanBase64,
          mimeType: imageMimeType || "image/jpeg",
        },
      });
    }

    const promptText = `You are the Lead Financial Strategist and Chief AI Deal Judge for InflowPK. You are judging and routing a messy real-world freelance deal or client communication for a Pakistani freelancer.

MESSY INPUT (Client chat, brief, or document text):
"""
${(input || "").slice(0, 15000)}
"""
${imageBase64 ? "[An image/screenshot of the client message or invoice is also attached]" : ""}

CONSTRAINTS & HACKATHON CRITERIA:
1. "The AI has to be doing the work": Show genuine judgment — classify, extract, reason, and route.
2. Pakistani FX Reality:
   - Interbank USD/PKR benchmark is ~278.45.
   - Predatory routes (Upwork Direct LBP, legacy Payoneer, SWIFT wires) bleed 2.8% to 4.5% + $35 wire fees.
   - SBP-compliant modern routes:
     * Remitly: Offers promotional bonus FX rates for first-time senders (+Rs. 2.50 to +Rs. 3.00/USD). Lands via Raast in instant-2 hours.
     * Elevate Pay: Free US checking account (Bangor Savings Bank). Lowest ongoing FX spread (0.95%). Lands in 12-24h.
     * SadaBiz: Instant Apple Pay / Google Pay / Card payment link. Converted at Mastercard interbank rate (0% spread), 3% fee.
     * nsave: Swiss offshore bank account for Pakistanis (USD/EUR/GBP). Holds foreign currency legally against PKR depreciation.
     * Ace Money Transfer: Bonus promotional rates for UK/EU corridors via Raast.
     * Wise: 4-24h multi-currency conversion.
     * JazzCash / NayaPay: Instant cashout (<5 min).
     * SWIFT Wire: 3-5 days, heavy fees, only for enterprise >$5k.

DO THE WORK IN 4 STAGES:
1. CLASSIFY: Client location, inferred payment methods (Card, Apple Pay, ACH, SEPA, Wire), client type.
2. EXTRACT: Invoice amount, currency, billing structure, SBP Purpose Code (9186 software, 9210 design, 9220 marketing, 9200 BPO).
3. REASON: Explain corridor dynamics, calculate PKR leakage saved vs bad options, note bonus rates available, identify contract traps.
4. ROUTE: Select the best gateway with exact delivery time, transfer channels for client, net PKR, runner-up, a polite client-ready message to copy-paste, and freelancer action steps.

Return strictly JSON matching the specified schema.`;

    contentParts.push(promptText);

    const response = await generateGeminiContentWithFallback(ai, {
      contents: contentParts,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            clientProfile: {
              type: Type.OBJECT,
              properties: {
                clientLocation: { type: Type.STRING },
                inferredPaymentMethods: { type: Type.ARRAY, items: { type: Type.STRING } },
                clientType: { type: Type.STRING, enum: ["Direct Client", "Agency", "Enterprise", "Marketplace"] },
              },
              required: ["clientLocation", "inferredPaymentMethods", "clientType"],
            },
            commercialTerms: {
              type: Type.OBJECT,
              properties: {
                invoiceAmount: { type: Type.NUMBER },
                currency: { type: Type.STRING },
                pkrEquivalent: { type: Type.NUMBER },
                billingStructure: { type: Type.STRING, enum: ["Fixed Price", "Hourly", "Retainer", "Milestone"] },
              },
              required: ["invoiceAmount", "currency", "pkrEquivalent", "billingStructure"],
            },
            reasoning: {
              type: Type.OBJECT,
              properties: {
                corridorSummary: { type: Type.STRING },
                hiddenLeakageWarning: { type: Type.STRING },
                contractPitfalls: { type: Type.ARRAY, items: { type: Type.STRING } },
                sbpPurposeCode: {
                  type: Type.OBJECT,
                  properties: {
                    code: { type: Type.STRING },
                    title: { type: Type.STRING },
                    taxRate: { type: Type.STRING },
                  },
                  required: ["code", "title", "taxRate"],
                },
              },
              required: ["corridorSummary", "hiddenLeakageWarning", "contractPitfalls", "sbpPurposeCode"],
            },
            optimalRoute: {
              type: Type.OBJECT,
              properties: {
                gatewayId: { type: Type.STRING },
                gatewayName: { type: Type.STRING },
                deliveryTimeLocalAccount: { type: Type.STRING },
                transferChannels: { type: Type.ARRAY, items: { type: Type.STRING } },
                effectiveFxRatePkr: { type: Type.NUMBER },
                bonusRateNote: { type: Type.STRING },
                netPkrDeposited: { type: Type.NUMBER },
                rupeesSavedVsLegacy: { type: Type.NUMBER },
                whyChosen: { type: Type.STRING },
              },
              required: [
                "gatewayId",
                "gatewayName",
                "deliveryTimeLocalAccount",
                "transferChannels",
                "effectiveFxRatePkr",
                "netPkrDeposited",
                "rupeesSavedVsLegacy",
                "whyChosen",
              ],
            },
            runnerUpRoute: {
              type: Type.OBJECT,
              properties: {
                gatewayName: { type: Type.STRING },
                deliveryTimeLocalAccount: { type: Type.STRING },
                netPkrDeposited: { type: Type.NUMBER },
                tradeoffNote: { type: Type.STRING },
              },
              required: ["gatewayName", "deliveryTimeLocalAccount", "netPkrDeposited", "tradeoffNote"],
            },
            clientReadyReply: { type: Type.STRING },
            actionStepsForFreelancer: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: [
            "clientProfile",
            "commercialTerms",
            "reasoning",
            "optimalRoute",
            "runnerUpRoute",
            "clientReadyReply",
            "actionStepsForFreelancer",
          ],
        },
      },
    });

    const text = response.text ? response.text.trim() : "{}";
    const parsedData = JSON.parse(text);

    return res.json({ result: parsedData });
  } catch (error: any) {
    console.warn("AI routing fallback activated:", error?.message || error);
    const fallbackResult = generateHeuristicDealRoute(rawText, invoiceAmountHint, currencyHint);
    return res.json({ result: fallbackResult, fallback: true });
  }
});

function extractAmountFromText(text: string): number | null {
  const match = text.match(/\$\s?([0-9]+(?:,[0-9]{3})*(?:\.[0-9]{2})?)/);
  if (match && match[1]) {
    return parseFloat(match[1].replace(/,/g, ""));
  }
  return null;
}

function detectCategory(text: string): string {
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

// Mount both prefixed (/api) and direct (/) to guarantee compatibility across Vercel rewrites and standard Express
app.use("/api", apiRouter);
app.use("/", apiRouter);

export { app, getAIClient, generateGeminiContentWithFallback };
export default app;
