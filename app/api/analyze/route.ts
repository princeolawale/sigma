import { NextRequest, NextResponse } from "next/server";
import { detectBestPair, type DexscreenerPair } from "@/lib/dexscreener";
import { searchPools } from "@/lib/geckoterminal";
import { getExplorerAnalysis } from "@/lib/explorer";
import { detectLaunch } from "@/lib/launchDetection";
import { calculateRiskScore } from "@/lib/riskScore";

interface AnalyzeRequestBody {
  address?: string;
}

function getNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function formatDexName(dexId: string | null | undefined) {
  if (!dexId) {
    return "Not enough data to verify.";
  }

  return dexId
    .split(/[-_]/g)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function poolAgeHoursFromTimestamp(value: number | null | undefined) {
  if (!value) {
    return null;
  }

  return Number((((Date.now() - value) / 1000) / 3600).toFixed(2));
}

function describeLpSafety(input: {
  burned: number | null;
  locked: number | null;
  deployer: number | null;
}) {
  if (input.burned !== null && input.burned >= 50) {
    return {
      status: "burned",
      details: `At least ${input.burned}% of the LP appears to sit in burn addresses.`
    };
  }

  if (input.locked !== null && input.locked >= 50) {
    return {
      status: "locked",
      details: `At least ${input.locked}% of the LP appears to be held by known lockers.`
    };
  }

  if (input.deployer !== null && input.deployer >= 10) {
    return {
      status: "deployer-held",
      details: `The deployer still appears to control about ${input.deployer}% of LP ownership.`
    };
  }

  if (
    input.burned !== null ||
    input.locked !== null ||
    input.deployer !== null
  ) {
    return {
      status: "protocol-held",
      details:
        "LP ownership does not look heavily deployer-held, but protocol or multisig custody still needs direct verification."
    };
  }

  return {
    status: "unknown",
    details: "Not enough data to verify."
  };
}

function buildFallbackPairFromGecko(
  query: string,
  pool: Awaited<ReturnType<typeof searchPools>>[number] | undefined
) {
  if (!pool) {
    return null;
  }

  return {
    chainId: pool.id.split("_")[0] ?? "unknown",
    dexId: pool.relationships?.dex?.data?.id ?? "geckoterminal",
    pairAddress: pool.attributes?.address ?? pool.id,
    baseToken: {
      address: query,
      symbol: "Unknown",
      name: "Unknown"
    },
    quoteToken: {
      symbol: "Unknown"
    },
    liquidity: {
      usd: Number(pool.attributes?.reserve_in_usd ?? 0)
    },
    volume: {
      h24: Number(pool.attributes?.volume_usd?.h24 ?? 0)
    },
    priceChange: {
      h24: Number(pool.attributes?.price_change_percentage?.h24 ?? 0)
    },
    pairCreatedAt: pool.attributes?.pool_created_at
      ? Date.parse(pool.attributes.pool_created_at)
      : undefined
  } satisfies DexscreenerPair;
}

function percentFromRaw(rawValue: string | null, rawTotal: string | null) {
  const value = Number(rawValue ?? 0);
  const total = Number(rawTotal ?? 0);

  if (!Number.isFinite(value) || !Number.isFinite(total) || total <= 0) {
    return null;
  }

  return Number(((value / total) * 100).toFixed(2));
}

function buildAnalystReport(input: {
  symbol: string;
  launchSummary: string;
  launchType: string;
  lpDetails: string;
  liquidityUsd: number;
  dexName: string;
  riskVerdict: string;
  riskReasons: string[];
  migrationStatus: string;
  whaleSummary: string;
}) {
  const whatHappened = `${input.symbol} is currently trading primarily on ${input.dexName} with about $${Math.round(
    input.liquidityUsd
  ).toLocaleString()} of visible liquidity. ${input.launchSummary}`;

  const whyItMatters = `${input.lpDetails} ${input.migrationStatus} ${input.whaleSummary}`.trim();

  const whatToVerifyNext = [
    "Confirm LP custody directly on the explorer before trusting the liquidity profile.",
    "Check whether deployer-linked wallets are still receiving or redistributing supply.",
    "Verify whether the current market is the token’s first liquidity venue or a post-migration pool."
  ];

  const finalVerdict = input.riskReasons.length
    ? `${input.riskVerdict}: ${input.riskReasons[0]}`
    : `${input.riskVerdict}: Current public data does not show a single dominant red flag, but further wallet-level verification is still recommended.`;

  return {
    whatHappened,
    whyItMatters,
    whatToVerifyNext,
    finalVerdict
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AnalyzeRequestBody;
    const address = body.address?.trim();

    if (!address) {
      return NextResponse.json(
        { error: "Token contract address is required." },
        { status: 400 }
      );
    }

    const dexResult = await detectBestPair(address).catch(() => ({
      pair: null,
      pairs: [],
      source: "token" as const
    }));

    const geckoPools =
      dexResult.pair === null ? await searchPools(address).catch(() => []) : [];

    const pair =
      dexResult.pair ?? buildFallbackPairFromGecko(address, geckoPools[0]);

    if (!pair) {
      return NextResponse.json(
        { error: "No token data found for this contract address." },
        { status: 404 }
      );
    }

    const explorer = await getExplorerAnalysis({
      chain: pair.chainId,
      tokenAddress: address,
      lpTokenAddress: pair.pairAddress ?? null
    });

    const launch = detectLaunch(pair, explorer);
    const liquidityUsd = getNumber(pair.liquidity?.usd);
    const volume24h = getNumber(pair.volume?.h24);
    const priceChange24h = getNumber(pair.priceChange?.h24);
    const poolAgeHours = poolAgeHoursFromTimestamp(pair.pairCreatedAt ?? null);
    const dexName = formatDexName(pair.dexId);

    const lpSafety = describeLpSafety({
      burned: explorer.lpBurnedPercent,
      locked: explorer.lpLockedPercent,
      deployer: explorer.lpDeployerPercent
    });

    const deployerTokenPercent = percentFromRaw(
      explorer.deployerTokenBalance,
      explorer.totalSupply
    );

    const topHolderPercent =
      explorer.topHolders.length > 0 && explorer.totalSupply
        ? Number(
            (
              (Number(explorer.topHolders[0].quantity) / Number(explorer.totalSupply)) *
              100
            ).toFixed(2)
          )
        : null;

    const top10HolderPercent =
      explorer.topHolders.length > 0 && explorer.totalSupply
        ? Number(
            (
              (explorer.topHolders.reduce((sum, holder) => {
                return sum + Number(holder.quantity);
              }, 0) /
                Number(explorer.totalSupply)) *
              100
            ).toFixed(2)
          )
        : null;

    const contractOwnedSupply =
      explorer.topHolders.length > 0 && explorer.totalSupply
        ? Number(
            (
              (explorer.topHolders
                .filter((holder) => holder.addressType === "C")
                .reduce((sum, holder) => sum + Number(holder.quantity), 0) /
                Number(explorer.totalSupply)) *
              100
            ).toFixed(2)
          )
        : null;

    const suspiciousWhaleConcentration =
      topHolderPercent !== null && topHolderPercent >= 20
        ? `Top wallet controls about ${topHolderPercent}% of supply.`
        : top10HolderPercent !== null && top10HolderPercent >= 60
          ? `Top wallets control about ${top10HolderPercent}% of supply.`
          : "No dominant whale cluster was confirmed from the available holder data.";

    const risk = calculateRiskScore({
      liquidityUsd,
      volume24h,
      priceChange24h,
      lpSafetyStatus: lpSafety.status,
      deployerTokenPercent,
      top10HolderPercent,
      contractOwnedSupplyPercent: contractOwnedSupply,
      migrationLikely: launch.launchType === "curve-to-LP migration",
      launchConfidence: launch.confidence
    });

    const report = buildAnalystReport({
      symbol: pair.baseToken?.symbol ?? "Unknown",
      launchSummary: launch.summary,
      launchType: launch.launchType,
      lpDetails: lpSafety.details,
      liquidityUsd,
      dexName,
      riskVerdict: risk.verdict,
      riskReasons: risk.reasons,
      migrationStatus: launch.migrationStatus,
      whaleSummary: suspiciousWhaleConcentration
    });

    const dataAvailability: string[] = [];

    if (!explorer.explorerName) {
      dataAvailability.push(
        "Explorer-backed deployer and holder data is unavailable without a server-side explorer API key."
      );
    }

    if (explorer.topHolders.length === 0) {
      dataAvailability.push(
        "Top holder concentration could not be fully verified."
      );
    }

    return NextResponse.json({
      data: {
        token: {
          address,
          symbol: pair.baseToken?.symbol ?? "Unknown",
          name: pair.baseToken?.name ?? "Unknown",
          chain: pair.chainId ?? "unknown"
        },
        launchIntelligence: {
          launchType: launch.launchType,
          confidence: launch.confidence,
          summary: launch.summary,
          migrationStatus: launch.migrationStatus,
          indicators: launch.indicators
        },
        liquidityBreakdown: {
          dexName,
          pairAddress: pair.pairAddress ?? "Not enough data to verify.",
          baseToken: pair.baseToken?.symbol ?? "Unknown",
          quoteToken: pair.quoteToken?.symbol ?? "Unknown",
          liquidityUsd,
          volume24h,
          priceChange24h,
          poolAgeHours
        },
        lpSafety: {
          status: lpSafety.status,
          details: lpSafety.details,
          lpTokenAddress: pair.pairAddress ?? null,
          burnedPercent: explorer.lpBurnedPercent,
          lockedPercent: explorer.lpLockedPercent,
          deployerHeldPercent: explorer.lpDeployerPercent
        },
        holderRisk: {
          deployerAddress:
            explorer.deployerAddress ?? "Not enough data to verify.",
          deployerTokenPercent,
          holderCount: explorer.holderCount,
          topHolderPercent,
          top10HolderPercent,
          contractOwnedSupplyPercent: contractOwnedSupply,
          suspiciousWhaleConcentration,
          details: [
            deployerTokenPercent !== null
              ? `Deployer wallet controls about ${deployerTokenPercent}% of current supply.`
              : "Deployer token balance could not be verified.",
            top10HolderPercent !== null
              ? `Top tracked holders control about ${top10HolderPercent}% of supply.`
              : "Top holder concentration is not enough data to verify.",
            contractOwnedSupply !== null
              ? `Contract-owned supply is about ${contractOwnedSupply}%.`
              : "Contract-owned supply is not enough data to verify."
          ]
        },
        analystReport: report,
        riskScore: risk.score,
        riskVerdict: risk.verdict,
        summary: report.finalVerdict,
        dataAvailability
      }
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to analyze token. Please try again.";

    return NextResponse.json(
      { error: message || "Unable to analyze token. Please try again." },
      { status: 500 }
    );
  }
}
