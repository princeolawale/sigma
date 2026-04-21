export interface RiskScoreInput {
  liquidityUsd: number;
  volume24h: number;
  priceChange24h: number;
}

export function calculateRiskScore({
  liquidityUsd,
  volume24h,
  priceChange24h
}: RiskScoreInput) {
  let score = 100;

  if (liquidityUsd < 10000) {
    score -= 25;
  }

  if (volume24h < 5000) {
    score -= 20;
  }

  if (priceChange24h < -20) {
    score -= 15;
  }

  return Math.min(100, Math.max(0, score));
}
