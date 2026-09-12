# InflowPK — Cross-Border Remittance Optimizer & SBP Compliance Co-Pilot

**InflowPK** is an intelligent financial routing engine and legal co-pilot built specifically for Pakistani freelancers, software agencies, and export service providers.

It solves the four biggest financial hurdles of receiving foreign client payments in Pakistan:
1. **Hidden FX Spreads & Payout Routing**: Calculating real net-PKR across Elevate Pay, Wise, Payoneer, Sadapay, and local wire transfers.
2. **SBP Regulatory Compliance**: Generating instant, bank-ready audit packets, Purpose Code mappings (e.g., Code `9186` for software exports), and FBR Section 154A (0.25% concessionary tax) cover letters.
3. **AI Deal & Scope Judge**: Parsing messy client chats (WhatsApp, Slack, Upwork) into structured payment terms, escrow milestones, and payment instructions.
4. **Contract & Retainer Risk Guard**: Auditing service agreements for predatory clauses, indemnification traps, and delayed payout terms with instant counter-proposals.

---

## Key Features

- **AI Deal Judge & Payout Router**:
  - Paste messy client messages or briefs to extract project budget, timeline, and client origin country.
  - Automatically recommends the optimal payment rail (ACH, SEPA, Stripe, or SWIFT) to minimize gateway fees and maximize net PKR.
  - Generates ready-to-send payment instructions formatted for clients.

- **Contract Risk Scanner**:
  - Scans contracts and retainer agreements.
  - Computes a contract risk rating (0–100) and flags high-risk clauses (unlimited revisions, IP assignment before payment, excessive liabilities).
  - Supplies one-click copyable renegotiation scripts.

- **SBP Bank Compliance & e-PRC Generator**:
  - Maps freelance disciplines to official State Bank of Pakistan Foreign Exchange Purpose Codes.
  - Generates formal compliance letters addressed to branch managers for swift PRC (Proceeds Realization Certificate) issuance under FBR 154A.

- **Live & Benchmark FX Matrix**:
  - Real-time PKR conversion spreads across major currencies (USD, GBP, EUR, AED, CAD, AUD).
  - Gateway comparison showing actual received PKR after platform commission, intermediary deductions, and currency markup.

---

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Motion
- **Backend / API**: Express, Node.js (`server.ts`)
- **AI Engine**: Google Gemini API (`@google/genai`) running securely via server-side endpoints
- **Deployment**: Vercel Serverless (`/api/index.ts`) & Cloud Run

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- A Gemini API Key from [Google AI Studio](https://aistudio.google.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/inflow-pk.git
   cd inflow-pk
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Add your Gemini API key inside `.env`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. Run the local development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deployment on Vercel

InflowPK includes built-in support for Vercel serverless deployment via `/api/index.ts` and `vercel.json`.

1. Push your code to GitHub.
2. Import the repository into your [Vercel Dashboard](https://vercel.com).
3. Under **Settings → Environment Variables**, add:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: Your Google Gemini API Key
   - **Environments**: Select *Production*, *Preview*, and *Development*.
4. Deploy! Vercel will automatically build the client and route API requests through the serverless function.

---

## Project Structure

```text
├── api/
│   └── index.ts          # Vercel serverless entry point
├── src/
│   ├── components/       # UI modules (AIDealRouter, ContractAuditor, etc.)
│   ├── App.tsx           # Primary dashboard & tabs layout
│   └── main.tsx          # Client entry point
├── server.ts             # Express backend with Gemini AI endpoints
├── vercel.json           # Vercel serverless routing configuration
├── vite.config.ts        # Vite configuration
└── package.json          # Scripts & dependencies
```

---

## License

MIT License. Crafted for the Pakistani freelancer community.
