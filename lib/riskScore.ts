export interface RiskScoreInput {
  liquidityUsd: number;
  volume24h: number;
  priceChange24h: number;
  lpSafetyStatus: string;
  deployerTokenPercent: number | null;
  top10HolderPercent: number | null;
  contractOwnedSupplyPercent: number | null;
  migrationLikely: boolean;
  launchConfidence: "verified" | "likely" | "unknown";
}

export interface RiskScoreResult {
  score: number;
  verdict: string;
  reasons: string[];
}

export function calculateRiskScore({
  liquidityUsd,
  volume24h,
  priceChange24h,
  lpSafetyStatus,
  deployerTokenPercent,
  top10HolderPercent,
  contractOwnedSupplyPercent,
  migrationLikely,
  launchConfidence
}: RiskScoreInput): RiskScoreResult {
  let score = 84;
  const reasons: string[] = [];

  if (liquidityUsd < 15000) {
    score -= 16;
    reasons.push("Liquidity is thin for a fresh token market.");
  } else if (liquidityUsd > 100000) {
    score += 4;
  }

  if (volume24h < 10000) {
    score -= 10;
    reasons.push("Trading activity is still light.");
  } else if (volume24h > 100000) {
    score += 3;
  }

  if (priceChange24h < -35) {
    score -= 12;
    reasons.push("Price action is volatile on the downside.");
  } else if (priceChange24h > 80) {
    score -= 8;
    reasons.push("Price action is overheated and prone to sharp reversals.");
  }

  if (lpSafetyStatus === "deployer-held") {
    score -= 22;
    reasons.push("Deployer-held LP creates a direct rug vector.");
  } else if (lpSafetyStatus === "unknown") {
    score -= 10;
    reasons.push("LP ownership could not be verified.");
  } else if (lpSafetyStatus === "burned" || lpSafetyStatus === "locked") {
    score += 4;
  }

  if (deployerTokenPercent !== null && deployerTokenPercent > 15) {
    score -= 14;
    reasons.push("Deployer retains a large token share.");
  }

  if (top10HolderPercent !== null && top10HolderPercent > 70) {
    score -= 16;
    reasons.push("Holder concentration is heavy across the top wallets.");
  } else if (top10HolderPercent !== null && top10HolderPercent > 50) {
    score -= 9;
  }

  if (contractOwnedSupplyPercent !== null && contractOwnedSupplyPercent > 20) {
    score -= 12;
    reasons.push("Contract-controlled supply is elevated.");
  }

  if (migrationLikely) {
    score -= 4;
    reasons.push("Migration flows add operational uncertainty until verified.");
  }

  if (launchConfidence === "unknown") {
    score -= 6;
    reasons.push("Launch path could not be verified cleanly.");
  }

  const finalScore = Math.min(99, Math.max(0, Math.round(score)));
  const verdict =
    finalScore >= 75
      ? "Lower Risk"
      : finalScore >= 45
        ? "Moderate Risk"
        : "High Risk";

  return {
    score: finalScore,
    verdict,
    reasons
  };
}
