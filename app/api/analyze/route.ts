import { NextRequest, NextResponse } from "next/server";
import { detectBestPair, type DexscreenerPair } from "@/lib/dexscreener";
import { searchPools } from "@/lib/geckoterminal";
import { detectLaunch } from "@/lib/launchDetection";
import { calculateRiskScore } from "@/lib/riskScore";
import {
  getEvmHolderStats,
  getEvmTokenHolders,
  getSolanaHolderStats,
  getSolanaTopHolders
} from "@/lib/moralis";
import {
  normalizeEvmHolderData,
  normalizeSolanaHolderData,
  type HolderDistribution
} from "@/lib/holderAnalysis";

interface AnalyzeRequestBody {
  address?: string;
}

function getNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function formatDexName(dexId: string | null | undefined) {
  if (!dexId) {
    return "Unavailable";
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

function mapMoralisChain(chain: string | null | undefined) {
  switch (chain) {
    case "ethereum":
      return "eth";
    case "base":
      return "base";
    case "bsc":
      return "bsc";
    case "polygon":
      return "polygon";
    case "arbitrum":
      return "arbitrum";
    case "avalanche":
    case "avax":
      return "avalanche";
    default:
      return null;
  }
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
    priceUsd: pool.attributes?.base_token_price_usd ?? undefined,
    txns: {
      h24: {
        buys: undefined,
        sells: undefined
      }
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
  liquidityUsd: number;
  marketCapUsd: number | null;
  volume24h: number;
  priceChange24h: number;
  dexName: string;
  riskVerdict: string;
  riskReasons: string[];
  marketRiskSummary: string;
}) {
  const whatHappened = `${input.symbol} is currently trading primarily on ${input.dexName} with about $${Math.round(
    input.liquidityUsd
  ).toLocaleString()} of visible liquidity, ${Math.round(
    input.volume24h
  ).toLocaleString()} in 24h volume, and a ${input.priceChange24h >= 0 ? "+" : ""}${input.priceChange24h.toFixed(2)}% move over the last day.${input.marketCapUsd !== null ? ` Estimated market cap sits near $${Math.round(input.marketCapUsd).toLocaleString()}.` : ""}`;

  const whyItMatters = input.marketRiskSummary;

  const whatToVerifyNext = [
    "Track whether liquidity stays stable as volume rotates through the pool.",
    "Watch for abrupt price and activity shifts across the primary trading pair.",
    "Enable explorer-backed checks later for deployer, holder, and LP custody verification."
  ];

  const preferredReason =
    input.riskReasons.find((reason) => {
      return !reason.toLowerCase().includes("launch path");
    }) ?? input.riskReasons[0];

  const finalVerdict = input.riskReasons.length
    ? `${input.riskVerdict}: ${preferredReason}`
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

    const launch = detectLaunch(pair, {
      chainId: null,
      explorerName: null,
      deployerAddress: null,
      deployerTokenBalance: null,
      contractCreatedAt: null,
      creationTxHash: null,
      totalSupply: null,
      holderCount: null,
      topHolders: [],
      sourceCode: null,
      sourceVerified: false,
      lpBurnedPercent: null,
      lpLockedPercent: null,
      lpDeployerPercent: null
    });
    const liquidityUsd = getNumber(pair.liquidity?.usd);
    const volume24h = getNumber(pair.volume?.h24);
    const priceChange24h = getNumber(pair.priceChange?.h24);
    const priceUsd = Number(pair.priceUsd ?? 0);
    const poolAgeHours = poolAgeHoursFromTimestamp(pair.pairCreatedAt ?? null);
    const dexName = formatDexName(pair.dexId);
    const buys24h = pair.txns?.h24?.buys ?? null;
    const sells24h = pair.txns?.h24?.sells ?? null;

    let holderDistribution: HolderDistribution | null = null;
    let holderDataAvailable = false;

    try {
      if (pair.chainId === "solana") {
        const [holderStats, topHolders] = await Promise.all([
          getSolanaHolderStats(address),
          getSolanaTopHolders(address)
        ]);
        holderDistribution = normalizeSolanaHolderData({
          stats: holderStats,
          holders: topHolders
        });
      } else {
        const moralisChain = mapMoralisChain(pair.chainId);
        if (moralisChain) {
          const [holderStats, topHolders] = await Promise.all([
            getEvmHolderStats(address, moralisChain),
            getEvmTokenHolders(address, moralisChain)
          ]);
          holderDistribution = normalizeEvmHolderData({
            stats: holderStats,
            holders: topHolders
          });
        }
      }
      holderDataAvailable = Boolean(holderDistribution);
    } catch {
      holderDistribution = null;
      holderDataAvailable = false;
    }

    const marketRiskSummary = [
      liquidityUsd < 15000
        ? "Liquidity is still thin enough to move sharply under pressure."
        : "Liquidity depth is healthier than the thinnest new-token pools.",
      volume24h < 10000
        ? "Trading activity is still light, so price discovery may be unstable."
        : "Trading activity suggests the market is at least active enough for live price discovery.",
      priceChange24h < -25
        ? "Recent downside volatility raises execution and momentum risk."
        : priceChange24h > 60
          ? "Recent upside volatility looks aggressive and could mean fast mean reversion."
          : "Recent price movement is active but not extreme."
    ].join(" ");

    const risk = calculateRiskScore({
      liquidityUsd,
      volume24h,
      priceChange24h,
      lpSafetyStatus: "unknown",
      deployerTokenPercent: null,
      top10HolderPercent: holderDistribution?.top10Percent ?? null,
      contractOwnedSupplyPercent: null,
      migrationLikely: launch.launchType === "curve-to-LP migration",
      launchConfidence: launch.confidence
    });

    const marketCapUsd =
      holderDistribution?.supply !== null &&
      holderDistribution?.supply !== undefined &&
      Number.isFinite(priceUsd) &&
      priceUsd > 0
        ? Number((holderDistribution.supply * priceUsd).toFixed(2))
        : null;

    const report = buildAnalystReport({
      symbol: pair.baseToken?.symbol ?? "Unknown",
      liquidityUsd,
      marketCapUsd,
      volume24h,
      priceChange24h,
      dexName,
      riskVerdict: risk.verdict,
      riskReasons: risk.reasons,
      marketRiskSummary:
        holderDistribution !== null
          ? `${marketRiskSummary} Top holder controls about ${holderDistribution.topHolderPercent}% of supply, while the top ten wallets control about ${holderDistribution.top10Percent}%.`
          : marketRiskSummary
    });

    const dataAvailability: string[] = [];

    if (!holderDataAvailable) {
      dataAvailability.push(
        "On-chain holder data unavailable"
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
          pairAddress: pair.pairAddress ?? "Unavailable",
          baseToken: pair.baseToken?.symbol ?? "Unknown",
          quoteToken: pair.quoteToken?.symbol ?? "Unknown",
          priceUsd: Number.isFinite(priceUsd) && priceUsd > 0 ? priceUsd : null,
          marketCapUsd,
          liquidityUsd,
          volume24h,
          priceChange24h,
          poolAgeHours
        },
        activityAnalysis: {
          buys24h,
          sells24h,
          summary:
            buys24h !== null && sells24h !== null
              ? `The pair recorded about ${buys24h} buys and ${sells24h} sells in the last 24 hours.`
              : "Not enough market activity data to verify."
        },
        holderDistribution,
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
