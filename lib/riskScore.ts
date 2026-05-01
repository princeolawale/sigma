export interface RiskScoreInput {
  symbol: string;
  liquidityUsd: number;
  marketCapUsd: number | null;
  volume24h: number;
  buys24h: number | null;
  sells24h: number | null;
  priceChangeM5: number | null;
  priceChangeH1: number | null;
  priceChangeH6: number | null;
  priceChange24h: number;
  poolAgeHours: number | null;
  topHolderPercent: number | null;
  top10HolderPercent: number | null;
}

export interface ScoreBreakdown {
  liquidity: number;
  marketCap: number;
  holders: number;
  activity: number;
  pressure: number;
  volatility: number;
  pool: number;
  security: number;
}

export interface RiskScoreResult {
  score: number;
  breakdown: ScoreBreakdown;
  penalties: string[];
  reasons: string[];
}

const STABLECOINS = new Set(["USDT", "USDC", "DAI"]);

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function calculateRiskScore({
  symbol,
  liquidityUsd,
  marketCapUsd,
  volume24h,
  buys24h,
  sells24h,
  priceChangeM5,
  priceChangeH1,
  priceChangeH6,
  priceChange24h,
  poolAgeHours,
  topHolderPercent,
  top10HolderPercent
}: RiskScoreInput): RiskScoreResult {
  const penalties: string[] = [];
  const reasons: string[] = [];

  const breakdown: ScoreBreakdown = {
    liquidity: liquidityUsd > 2_000_000 ? 20
      : liquidityUsd >= 500_000 ? 16
      : liquidityUsd >= 150_000 ? 12
      : liquidityUsd >= 50_000 ? 8
      : 4,
    marketCap:
      marketCapUsd === null ? 0
      : marketCapUsd > 5_000_000_000 ? 15
      : marketCapUsd >= 500_000_000 ? 13
      : marketCapUsd >= 50_000_000 ? 10
      : marketCapUsd >= 5_000_000 ? 7
      : 4,
    holders:
      topHolderPercent === null || top10HolderPercent === null
        ? 0
        : (topHolderPercent < 2 ? 10
            : topHolderPercent < 5 ? 8
            : topHolderPercent <= 10 ? 6
            : topHolderPercent <= 20 ? 3
            : 0) +
          (top10HolderPercent < 20 ? 10
            : top10HolderPercent < 40 ? 8
            : top10HolderPercent <= 60 ? 5
            : 2),
    activity: 1,
    pressure: 0,
    volatility: 2,
    pool: poolAgeHours === null ? 0 : poolAgeHours >= 24 * 30 ? 5 : poolAgeHours >= 72 ? 3 : 1,
    security: 10
  };

  const volumeLiquidityRatio = liquidityUsd > 0 ? volume24h / liquidityUsd : 0;
  breakdown.activity =
    volumeLiquidityRatio >= 1 ? 15
      : volumeLiquidityRatio >= 0.5 ? 12
      : volumeLiquidityRatio >= 0.2 ? 8
      : volumeLiquidityRatio >= 0.05 ? 4
      : 1;

  const totalTxns24h =
    (buys24h ?? 0) + (sells24h ?? 0);
  const buyShare =
    totalTxns24h > 0 && buys24h !== null ? buys24h / totalTxns24h : null;
  const sellShare =
    totalTxns24h > 0 && sells24h !== null ? sells24h / totalTxns24h : null;

  breakdown.pressure =
    buyShare === null ? 0
      : buyShare > 0.6 ? 10
      : buyShare >= 0.4 ? 7
      : buyShare >= 0.25 ? 4
      : 1;

  const absoluteMove = Math.abs(priceChange24h);
  breakdown.volatility =
    absoluteMove <= 8 ? 10
      : absoluteMove <= 20 ? 8
      : absoluteMove <= 40 ? 5
      : 2;

  if (liquidityUsd < 30_000) {
    penalties.push("Liquidity below $30K");
    reasons.push("Thin liquidity leaves the pool vulnerable to sharp slippage.");
  }

  if (marketCapUsd !== null && marketCapUsd < 1_000_000) {
    penalties.push("Market cap below $1M");
    reasons.push("Sub-$1M market cap still sits in a fragile maturity range.");
  }

  if (topHolderPercent !== null && topHolderPercent > 15) {
    penalties.push("Top holder above 15%");
    reasons.push("A single wallet controls too much supply.");
  }

  if (top10HolderPercent !== null && top10HolderPercent > 70) {
    penalties.push("Top 10 holders above 70%");
    reasons.push("Top-wallet concentration is extremely heavy.");
  }

  if (
    volumeLiquidityRatio >= 0.5 &&
    sellShare !== null &&
    sellShare > 0.6
  ) {
    penalties.push("High volume with sell-heavy flow");
    reasons.push("Most of the active flow is leaning to sells.");
  }

  if (
    [priceChangeM5, priceChangeH1, priceChangeH6]
      .filter((value): value is number => typeof value === "number")
      .some((value) => value <= -30)
  ) {
    penalties.push("Short timeframe drop above 30%");
    reasons.push("A sharp short-window drop raises momentum and exit risk.");
  }

  let score =
    breakdown.liquidity +
    breakdown.marketCap +
    breakdown.holders +
    breakdown.activity +
    breakdown.pressure +
    breakdown.volatility +
    breakdown.pool +
    breakdown.security;

  score -= penalties.reduce((sum, penalty) => {
    switch (penalty) {
      case "Liquidity below $30K":
        return sum + 10;
      case "Market cap below $1M":
        return sum + 5;
      case "Top holder above 15%":
        return sum + 10;
      case "Top 10 holders above 70%":
        return sum + 10;
      case "High volume with sell-heavy flow":
        return sum + 5;
      case "Short timeframe drop above 30%":
        return sum + 5;
      default:
        return sum;
    }
  }, 0);

  const upperSymbol = symbol.toUpperCase();

  if (STABLECOINS.has(upperSymbol)) {
    score = Math.max(score, 90);
  }

  if (
    marketCapUsd !== null &&
    marketCapUsd > 1_000_000_000 &&
    liquidityUsd > 1_000_000 &&
    topHolderPercent !== null &&
    topHolderPercent < 5
  ) {
    score = Math.max(score, 85);
  }

  if (topHolderPercent !== null && topHolderPercent > 25) {
    score = Math.min(score, 50);
  }

  if (liquidityUsd < 20_000) {
    score = Math.min(score, 45);
  }

  if (top10HolderPercent !== null && top10HolderPercent > 80) {
    score = Math.min(score, 55);
  }

  const finalScore = clamp(Math.round(score), 0, 100);

  if (reasons.length === 0) {
    if (finalScore >= 85) {
      reasons.push("Liquidity, maturity, and market structure all look comparatively strong.");
    } else if (finalScore >= 70) {
      reasons.push("The setup looks tradable, but a few metrics still need monitoring.");
    } else if (finalScore >= 50) {
      reasons.push("Several market structure signals still need caution.");
    } else {
      reasons.push("The current mix of liquidity, concentration, and activity is high risk.");
    }
  }

  return {
    score: finalScore,
    breakdown,
    penalties,
    reasons
  };
}
