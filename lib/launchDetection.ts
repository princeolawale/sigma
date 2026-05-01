import type { DexscreenerPair } from "@/lib/dexscreener";
import type { ExplorerAnalysis } from "@/lib/explorer";

export type LaunchType =
  | "manual Uniswap launch"
  | "bonding curve launch"
  | "curve-to-LP migration"
  | "fair launch"
  | "unknown launch type";

export interface LaunchAnalysis {
  launchType: LaunchType;
  confidence: "verified" | "likely" | "unknown";
  summary: string;
  migrationStatus: string;
  indicators: string[];
}

function includesAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term));
}

export function detectLaunch(pair: DexscreenerPair | null, explorer: ExplorerAnalysis) {
  const dexId = pair?.dexId?.toLowerCase() ?? "";
  const labels = pair?.labels?.join(" ").toLowerCase() ?? "";
  const sourceCode = explorer.sourceCode?.toLowerCase() ?? "";
  const indicators: string[] = [];

  const createdAtMs = explorer.contractCreatedAt
    ? explorer.contractCreatedAt * 1000
    : null;
  const pairCreatedAtMs = pair?.pairCreatedAt ?? null;
  const poolDelayHours =
    createdAtMs && pairCreatedAtMs
      ? Number((((pairCreatedAtMs - createdAtMs) / 1000) / 3600).toFixed(2))
      : null;

  const looksBondingCurve =
    includesAny(sourceCode, [
      "bondingcurve",
      "bonding curve",
      "pump",
      "graduat",
      "fairlaunch"
    ]) || includesAny(labels, ["bonding", "pump"]);

  const looksLpDex = includesAny(dexId, [
    "uniswap",
    "sushiswap",
    "pancake",
    "aerodrome",
    "raydium"
  ]);

  if (looksBondingCurve && looksLpDex && poolDelayHours !== null && poolDelayHours > 0.5) {
    indicators.push(
      "Contract source or labels suggest a bonding curve style launch."
    );
    indicators.push(
      `Primary LP appeared about ${poolDelayHours} hours after contract creation.`
    );

    return {
      launchType: "curve-to-LP migration",
      confidence: "likely",
      summary:
        "The token likely began on a bonding curve or staged launch flow and later migrated into a standard LP pool.",
      migrationStatus:
        "Likely bonding-curve to LP migration detected, but exact migration transactions were not fully verified.",
      indicators
    } satisfies LaunchAnalysis;
  }

  if (looksBondingCurve) {
    indicators.push("Source code or pair metadata includes bonding-curve style terms.");

    return {
      launchType: "bonding curve launch",
      confidence: "likely",
      summary:
        "The launch appears consistent with a bonding curve style token release rather than a simple LP bootstrap.",
      migrationStatus: "No clear LP migration evidence was verified yet.",
      indicators
    } satisfies LaunchAnalysis;
  }

  if (
    looksLpDex &&
    explorer.lpDeployerPercent !== null &&
    explorer.lpDeployerPercent < 5 &&
    explorer.deployerTokenBalance !== null
  ) {
    indicators.push("Launch liquidity sits on a standard LP-based DEX.");
    indicators.push("Deployer-held LP share appears limited.");

    return {
      launchType: "fair launch",
      confidence: "likely",
      summary:
        "This looks more like a fairer LP-first launch, with no strong signals of a staged bonding-curve migration.",
      migrationStatus: "No migration pattern detected from available data.",
      indicators
    } satisfies LaunchAnalysis;
  }

  if (looksLpDex) {
    indicators.push("Primary market is on a standard LP-based DEX.");

    return {
      launchType: "manual Uniswap launch",
      confidence: "likely",
      summary:
        "The token appears to have launched directly into a standard LP market rather than through an obvious staged launch wrapper.",
      migrationStatus: "No migration pattern detected from available data.",
      indicators
    } satisfies LaunchAnalysis;
  }

  return {
    launchType: "unknown launch type",
    confidence: "unknown",
    summary:
      "Not enough data to verify whether the token launched manually, through a bonding curve, or via a migration flow.",
    migrationStatus: "Not enough data to verify.",
    indicators: ["Market structure did not expose enough launch metadata."]
  } satisfies LaunchAnalysis;
}
