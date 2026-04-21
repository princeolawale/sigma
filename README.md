# SIGMA

SIGMA is an AI-powered crypto token analyzer. Paste a token contract address to receive a risk score, liquidity and trading metrics, and a concise AI-generated risk summary.

## Folder Structure

```txt
sigma-token-analyzer/
├── app/
│   ├── api/
│   │   └── token/
│   │       └── analyze/
│   │           └── route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ResultCard.tsx
│   └── TokenAnalyzer.tsx
├── lib/
│   ├── openai.ts
│   └── riskScore.ts
├── public/
│   ├── icon.png
│   └── logo.png
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

## Setup

Install dependencies:

```bash
npm install
```

Create `.env.local`:

```bash
OPENAI_API_KEY=your_key_here
```

Optional model override:

```bash
OPENAI_MODEL=gpt-5.4-mini
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API

`POST /api/token/analyze`

Request body:

```json
{
  "address": "token_contract_address"
}
```

Response body:

```json
{
  "data": {
    "symbol": "TOKEN",
    "liquidityUsd": 25000,
    "volume24h": 12000,
    "priceChange24h": -4.5,
    "riskScore": 100,
    "summary": "Liquidity and trading activity are relatively healthy, while the recent price movement looks contained. This token appears lower risk by these basic metrics, but this is not financial advice."
  }
}
```
