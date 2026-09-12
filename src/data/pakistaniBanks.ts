export interface BankInfo {
  id: string;
  name: string;
  shortName: string;
  defaultEmailSubject: string;
  fxDeskNotes: string;
  eprcPortalUrl?: string;
  freelancerFriendlyScore: 1 | 2 | 3 | 4 | 5; // 5 is easiest to get e-PRC
  instructions: string;
}

export const PAKISTANI_BANKS: BankInfo[] = [
  {
    id: "meezan",
    name: "Meezan Bank Limited",
    shortName: "Meezan",
    defaultEmailSubject: "Request for e-PRC Issuance & 0.25% Tax Rate Application (Section 154A) - Ref:",
    fxDeskNotes: "Has dedicated Freelancer Asaan Account & Roshan Digital. Issue e-PRCs promptly via TSU Karachi.",
    freelancerFriendlyScore: 5,
    instructions: "Submit PSEB registration certificate and invoice to your branch manager or email to Trade Services Unit.",
  },
  {
    id: "hbl",
    name: "Habib Bank Limited (HBL)",
    shortName: "HBL",
    defaultEmailSubject: "Application of Reduced 0.25% Tax & e-PRC Issuance under FBR Section 154A",
    fxDeskNotes: "Offers HBL Freelancer Account. Centralized FX processing.",
    freelancerFriendlyScore: 4,
    instructions: "Ensure your branch manager logs the transaction under Purpose Code 9186 instead of generic family maintenance.",
  },
  {
    id: "alfalah",
    name: "Bank Alfalah Limited",
    shortName: "Alfalah",
    defaultEmailSubject: "Urgent: Export Proceeds Realization Certificate (e-PRC) with SBP Code 9186",
    fxDeskNotes: "Very popular among remote agencies. Alfalah Rapid Freelancer Portal available.",
    freelancerFriendlyScore: 5,
    instructions: "Attach Upwork/invoice statement and PSEB certificate. Branch will dispatch request to Central Treasury.",
  },
  {
    id: "scb",
    name: "Standard Chartered Bank (SCB)",
    shortName: "Standard Chartered",
    defaultEmailSubject: "Inward Remittance Clearance under SBP Code 9186 and FBR 154A",
    fxDeskNotes: "Best international wire routing without intermediary correspondent bounce.",
    freelancerFriendlyScore: 4,
    instructions: "Strict compliance. Always provide MT103 copy from sending bank to claim e-PRC within 72 hours.",
  },
  {
    id: "faysal",
    name: "Faysal Bank Limited",
    shortName: "Faysal",
    defaultEmailSubject: "Claim for 0.25% Withholding Tax under Sec 154A & e-PRC Request",
    fxDeskNotes: "Faysal Islamic Digibank supports direct freelancer onboarding.",
    freelancerFriendlyScore: 4,
    instructions: "Provide Freelancer undertaking letter and valid CNIC along with PSEB registration.",
  },
  {
    id: "mcb",
    name: "MCB Bank Limited",
    shortName: "MCB",
    defaultEmailSubject: "Proceeds Realization Certificate (PRC) Issuance - IT Export Proceeds",
    fxDeskNotes: "Legacy bank; local branches sometimes default to 1% tax if not reminded with circular.",
    freelancerFriendlyScore: 3,
    instructions: "Hand over the InflowPK generated memo in print or email directly to the Operations Manager.",
  },
  {
    id: "ubl",
    name: "United Bank Limited (UBL)",
    shortName: "UBL",
    defaultEmailSubject: "Request for Section 154A Tax Adjustment (0.25%) and e-PRC Verification",
    fxDeskNotes: "UBL Freelancer current account available.",
    freelancerFriendlyScore: 4,
    instructions: "Branch will route through Central Processing Center (CPC). Keep the MT103 reference handy.",
  },
  {
    id: "sadapay",
    name: "SadaPay / SadaBiz",
    shortName: "SadaBiz",
    defaultEmailSubject: "e-PRC Verification for Freelancer Inward Card Receipt",
    fxDeskNotes: "Fintech partner with built-in instant e-PRC PDF download directly in the app.",
    freelancerFriendlyScore: 5,
    instructions: "e-PRC is generated natively within the SadaPay app after client invoice settlement.",
  },
  {
    id: "other",
    name: "Other Pakistani Scheduled Bank",
    shortName: "Other Bank",
    defaultEmailSubject: "Official Request: e-PRC Issuance & 0.25% Export Tax Rate under FBR Section 154A",
    fxDeskNotes: "General scheduled commercial bank.",
    freelancerFriendlyScore: 3,
    instructions: "Present the formal SBP compliance pack to Branch Manager and Operations Head.",
  },
];
