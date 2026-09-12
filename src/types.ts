export interface PayoutChannel {
  id: string;
  name: string;
  provider: string;
  badge?: string;
  description: string;
  hops: string[];
  estimatedFxRate: number; // e.g. 275.90
  spreadPercent: number; // e.g. 0.95%
  fixedFeeUsd: number; // e.g. 1.50
  percentageFee: number; // e.g. 0% or 3%
  settlementTime: string; // e.g. "Instant - 24 hours"
  eprcEase: "Instant App" | "Very High" | "Moderate" | "Difficult";
  pros: string[];
  cons: string[];
  bestFor: string;
  bonusRateNote?: string;
  transferChannels?: string[];
  easeScore?: "Seamless" | "Easy" | "Moderate" | "Complex";
}

export interface RouteCalculation {
  channel: PayoutChannel;
  grossAmountUsd: number;
  platformFeeUsd: number;
  intermediaryFeeUsd: number;
  netUsdToConvert: number;
  fxRateUsed: number;
  interbankRate: number;
  fxSpreadLossPkr: number;
  grossPkr: number;
  whtPercent: number; // 0.25 or 1.00
  whtDeductionPkr: number;
  netPkrReceived: number;
  totalLeakagePkr: number; // fxSpreadLoss + fees in PKR + wht
  savingsVsWorstPkr: number;
  isOptimal: boolean;
}

export interface SBPCode {
  code: string;
  title: string;
  shortDesc: string;
  category: "IT" | "ITeS" | "Creative" | "Consulting" | "Other";
  fbr154aEligible: boolean; // qualifies for 0.25%
  typicalRoles: string[];
  documentationNeeded: string[];
}

export interface ContractRisk {
  risk: string;
  severity: "high" | "medium" | "low";
  explanation: string;
  suggestion: string;
}

export interface PaymentRisk {
  issue: string;
  riskLevel: "high" | "medium" | "low";
  recommendation: string;
}

export interface CounterClause {
  title: string;
  textToCopy: string;
}

export interface ContractAnalysisResult {
  summary: string;
  detectedAmount: number | null;
  detectedCurrency: string;
  serviceCategory: string;
  recommendedPurposeCode: {
    code: string;
    title: string;
    reason: string;
  };
  scopeCreepRisks: ContractRisk[];
  paymentTermsRisks: PaymentRisk[];
  counterClauses: CounterClause[];
}

export interface BankComplianceProfile {
  freelancerName: string;
  cnic: string;
  ntn: string;
  isPsebRegistered: boolean;
  psebRegNumber: string;
  bankName: string;
  branchName: string;
  iban: string;
  accountNumber: string;
  invoiceAmountUsd: number;
  invoiceNumber: string;
  remittanceReference: string;
  purposeCode: string;
  clientName: string;
  clientCountry: string;
}

export interface AIDealRouteResult {
  clientProfile: {
    clientLocation: string;
    inferredPaymentMethods: string[];
    clientType: "Direct Client" | "Agency" | "Enterprise" | "Marketplace";
  };
  commercialTerms: {
    invoiceAmount: number;
    currency: string;
    pkrEquivalent: number;
    billingStructure: "Fixed Price" | "Hourly" | "Retainer" | "Milestone";
  };
  reasoning: {
    corridorSummary: string;
    hiddenLeakageWarning: string;
    contractPitfalls: string[];
    sbpPurposeCode: {
      code: string;
      title: string;
      taxRate: string;
    };
  };
  optimalRoute: {
    gatewayId: string;
    gatewayName: string;
    deliveryTimeLocalAccount: string;
    transferChannels: string[];
    effectiveFxRatePkr: number;
    bonusRateNote?: string;
    netPkrDeposited: number;
    rupeesSavedVsLegacy: number;
    whyChosen: string;
  };
  runnerUpRoute: {
    gatewayName: string;
    deliveryTimeLocalAccount: string;
    netPkrDeposited: number;
    tradeoffNote: string;
  };
  clientReadyReply: string;
  actionStepsForFreelancer: string[];
}

export interface InflowRecord {
  id: string;
  clientName: string;
  clientCountry: string;
  grossAmountUsd: number;
  currency: string;
  gatewayUsed: string;
  purposeCode: string;
  date: string;
  effectiveFxRate: number;
  netPkrReceived: number;
  rupeesSavedVsLegacy: number;
  whtDeductionPkr: number;
  status: "Realized" | "Pending Memo" | "e-PRC Claimed";
  notes?: string;
}

