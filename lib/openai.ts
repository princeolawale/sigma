import OpenAI from "openai";

export interface RiskSummaryInput {
  symbol: string;
  liquidityUsd: number;
  volume24h: number;
  priceChange24h: number;
  riskScore: number;
}

let client: OpenAI | null = null;
const RISK_DISCLAIMER =
  "Crypto is risky. Always do your own research; this is not financial advice.";

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
  volume24h,
  priceChange24h,
  riskScore
}: RiskSummaryInput) {
  const openai = getOpenAIClient();

  const response = await openai.responses.create({
    model: process.env.OPENAI_MODEL ?? "gpt-5.4-mini",
    max_output_tokens: 90,
    input: [
      {
        role: "system",
        content:
          "You write concise, beginner-friendly crypto token risk summaries. Do not use hype. Do not provide financial advice. Keep the summary to 1-2 short sentences."
      },
      {
        role: "user",
        content: [
          `Token symbol: ${symbol}`,
          `Liquidity USD: ${liquidityUsd}`,
          `24h volume USD: ${volume24h}`,
          `24h price change percent: ${priceChange24h}`,
          `Risk score out of 100: ${riskScore}`
        ].join("\n")
      }
    ]
  });

  const summary = response.output_text.trim();

  if (!summary) {
    throw new Error("OpenAI returned an empty risk summary.");
  }

  return `${summary} ${RISK_DISCLAIMER}`;
}
