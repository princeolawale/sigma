import OpenAI from "openai";

export interface RiskSummaryInput {
  symbol: string;
  liquidityUsd: number;
  marketCapUsd: number | null;
  volume24h: number;
  priceChange24h: number;
  riskScore: number;
  riskLevel: string;
  breakdown: {
    liquidity: number;
    marketCap: number;
    holders: number;
    activity: number;
    pressure: number;
    volatility: number;
    pool: number;
    security: number;
  };
  penalties: string[];
}

let client: OpenAI | null = null;

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  if (!client) {
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  return client;
}

export async function generateRiskSummary({
  symbol,
  liquidityUsd,
  marketCapUsd,
  volume24h,
  priceChange24h,
  riskScore,
  riskLevel,
  breakdown,
  penalties
}: RiskSummaryInput) {
  const openai = getOpenAIClient();

  const response = await openai.responses.create({
    model: process.env.OPENAI_MODEL ?? "gpt-5.4-mini",
    max_output_tokens: 90,
    input: [
      {
        role: "system",
        content:
          "You explain a deterministic crypto token risk score. Do not invent or change the score. Do not override the risk level. Keep the summary to 2 short sentences, trader-friendly, and non-hype."
      },
      {
        role: "user",
        content: [
          `Token symbol: ${symbol}`,
          `Liquidity USD: ${liquidityUsd}`,
          `Market cap USD: ${marketCapUsd ?? "unavailable"}`,
          `24h volume USD: ${volume24h}`,
          `24h price change percent: ${priceChange24h}`,
          `Risk score out of 100: ${riskScore}`
          ,`Risk level: ${riskLevel}`,
          `Breakdown: ${JSON.stringify(breakdown)}`,
          `Penalties: ${penalties.join(", ") || "none"}`
        ].join("\n")
      }
    ]
  });

  const summary = response.output_text.trim();

  if (!summary) {
    throw new Error("OpenAI returned an empty risk summary.");
  }

  return summary;
}
