export type CurrencyCode = "USD" | "GBP" | "EUR" | "AED" | "SAR" | "CAD" | "AUD";

export interface CurrencyInfo {
  code: CurrencyCode;
  name: string;
  symbol: string;
  flag: string;
  // Interbank PKR rate benchmark
  pkrRate: number;
  // Multiplier vs 1 USD (e.g. 1 GBP = 1.316 USD)
  usdMultiplier: number;
  typicalFeeSpread: number; // in %
  sampleAmounts: number[];
}

export const SUPPORTED_CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  USD: {
    code: "USD",
    name: "US Dollar",
    symbol: "$",
    flag: "🇺🇸",
    pkrRate: 278.45,
    usdMultiplier: 1.0,
    typicalFeeSpread: 1.5,
    sampleAmounts: [500, 1000, 2000, 3500, 5000],
  },
  GBP: {
    code: "GBP",
    name: "British Pound",
    symbol: "£",
    flag: "🇬🇧",
    pkrRate: 375.50,
    usdMultiplier: 1.348,
    typicalFeeSpread: 1.8,
    sampleAmounts: [400, 800, 1500, 2500, 4000],
  },
  EUR: {
    code: "EUR",
    name: "Euro",
    symbol: "€",
    flag: "🇪🇺",
    pkrRate: 322.20,
    usdMultiplier: 1.157,
    typicalFeeSpread: 1.6,
    sampleAmounts: [500, 1000, 2000, 3000, 5000],
  },
  AED: {
    code: "AED",
    name: "UAE Dirham",
    symbol: "AED",
    flag: "🇦🇪",
    pkrRate: 75.80,
    usdMultiplier: 0.272,
    typicalFeeSpread: 2.2,
    sampleAmounts: [1500, 3500, 7500, 15000, 25000],
  },
  SAR: {
    code: "SAR",
    name: "Saudi Riyal",
    symbol: "SAR",
    flag: "🇸🇦",
    pkrRate: 74.20,
    usdMultiplier: 0.266,
    typicalFeeSpread: 2.2,
    sampleAmounts: [1500, 3500, 7500, 15000, 25000],
  },
  CAD: {
    code: "CAD",
    name: "Canadian Dollar",
    symbol: "C$",
    flag: "🇨🇦",
    pkrRate: 204.50,
    usdMultiplier: 0.734,
    typicalFeeSpread: 1.9,
    sampleAmounts: [750, 1500, 3000, 5000, 7500],
  },
  AUD: {
    code: "AUD",
    name: "Australian Dollar",
    symbol: "A$",
    flag: "🇦🇺",
    pkrRate: 184.20,
    usdMultiplier: 0.661,
    typicalFeeSpread: 1.9,
    sampleAmounts: [750, 1500, 3000, 5000, 7500],
  },
};

export function convertToUSD(amount: number, from: CurrencyCode): number {
  const info = SUPPORTED_CURRENCIES[from];
  return Number((amount * info.usdMultiplier).toFixed(2));
}

export function convertFromUSD(amountUsd: number, to: CurrencyCode): number {
  const info = SUPPORTED_CURRENCIES[to];
  return Number((amountUsd / info.usdMultiplier).toFixed(2));
}

export function convertToPKR(amount: number, from: CurrencyCode): number {
  const info = SUPPORTED_CURRENCIES[from];
  return Math.round(amount * info.pkrRate);
}

export function formatCurrencyAmount(amount: number, currency: CurrencyCode): string {
  const info = SUPPORTED_CURRENCIES[currency];
  return `${info.symbol}${amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}
