import { NextRequest, NextResponse } from "next/server";
import { detectBestPair, type DexscreenerPair } from "@/lib/dexscreener";
import { calculateRiskScore } from "@/lib/riskScore";
import { generateRiskSummary } from "@/lib/openai";
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

function buildChainLiquidityBreakdown(
  selectedPair: DexscreenerPair,
  pairs: DexscreenerPair[]
) {
  const matchingChainPairs = pairs.filter((pair) => {
    return pair.chainId === selectedPair.chainId;
  });

  const selectedChainPairs =
    matchingChainPairs.length > 0 ? matchingChainPairs : [selectedPair];

  return {
    chainId: selectedPair.chainId ?? "unknown",
    totalLiquidityUsd: Number(
      selectedChainPairs
        .reduce((sum, pair) => sum + getNumber(pair.liquidity?.usd), 0)
        .toFixed(2)
    ),
    topDexName: formatDexName(selectedChainPairs[0]?.dexId),
    topPairAddress: selectedChainPairs[0]?.pairAddress ?? "Unavailable"
  };
}

function buildAnalystReport(input: {
  symbol: string;
  liquidityUsd: number;
  marketCapUsd: number | null;
  volume24h: number;
  priceChange24h: number;
  dexName: string;
  riskReasons: string[];
  penalties: string[];
  summary: string;
}) {
  const whatHappened = `${input.symbol} is currently trading primarily on ${input.dexName} with about $${Math.round(
    input.liquidityUsd
  ).toLocaleString()} of visible liquidity, ${Math.round(
    input.volume24h
  ).toLocaleString()} in 24h volume, and a ${input.priceChange24h >= 0 ? "+" : ""}${input.priceChange24h.toFixed(2)}% move over the last day.${input.marketCapUsd !== null ? ` Estimated market cap sits near $${Math.round(input.marketCapUsd).toLocaleString()}.` : ""}`;

  const whyItMatters = input.summary;

  const whatToVerifyNext = [
    "Track whether liquidity stays stable as volume rotates through the pool.",
    "Watch for abrupt price and activity shifts across the primary trading pair."
  ];

  if (input.penalties.length > 0) {
    whatToVerifyNext.push(`Review current penalties: ${input.penalties.join(", ")}.`);
  }

  const preferredReason = input.riskReasons[0];

  const finalVerdict = input.riskReasons.length
    ? `${preferredReason} Score reflects liquidity, holder concentration, activity, and market structure.`
    : "Score reflects liquidity, holder concentration, activity, and market structure.";

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
    const pair = dexResult.pair;

    if (!pair) {
      return NextResponse.json(
        { error: "No token data found for this contract address." },
        { status: 404 }
      );
    }

    const liquidityUsd = getNumber(pair.liquidity?.usd);
    const volume24h = getNumber(pair.volume?.h24);
    const priceChange24h = getNumber(pair.priceChange?.h24);
    const priceChangeM5 = typeof pair.priceChange?.m5 === "number" ? pair.priceChange.m5 : null;
    const priceChangeH1 = typeof pair.priceChange?.h1 === "number" ? pair.priceChange.h1 : null;
    const priceChangeH6 = typeof pair.priceChange?.h6 === "number" ? pair.priceChange.h6 : null;
    const priceUsd = Number(pair.priceUsd ?? 0);
    const marketCapUsd =
      getNumber(pair.marketCap) > 0
        ? getNumber(pair.marketCap)
        : getNumber(pair.fdv) > 0
          ? getNumber(pair.fdv)
          : null;
    const poolAgeHours = poolAgeHoursFromTimestamp(pair.pairCreatedAt ?? null);
    const dexName = formatDexName(pair.dexId);
    const buys24h = pair.txns?.h24?.buys ?? null;
    const sells24h = pair.txns?.h24?.sells ?? null;
    const chainLiquidity = buildChainLiquidityBreakdown(
      pair,
      dexResult.pairs.length > 0 ? dexResult.pairs : [pair]
    );

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

    const risk = calculateRiskScore({
      symbol: pair.baseToken?.symbol ?? "Unknown",
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
      topHolderPercent: holderDistribution?.topHolderPercent ?? null,
      top10HolderPercent: holderDistribution?.top10Percent ?? null
    });

    const fallbackSummary = `Sigma Score is ${risk.score}/100. ${risk.reasons[0] ?? "The current market structure is mixed and should be monitored."}`;

    let summary = fallbackSummary;
    try {
      if (process.env.OPENAI_API_KEY) {
        summary = await generateRiskSummary({
          symbol: pair.baseToken?.symbol ?? "Unknown",
          liquidityUsd,
          marketCapUsd,
          volume24h,
          priceChange24h,
          riskScore: risk.score,
          breakdown: risk.breakdown,
          penalties: risk.penalties
        });
      }
    } catch {
      summary = fallbackSummary;
    }

    const report = buildAnalystReport({
      symbol: pair.baseToken?.symbol ?? "Unknown",
      liquidityUsd,
      marketCapUsd,
      volume24h,
      priceChange24h,
      dexName,
      riskReasons: risk.reasons,
      penalties: risk.penalties,
      summary
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
          address: pair.baseToken?.address ?? address,
          symbol: pair.baseToken?.symbol ?? "Unknown",
          name: pair.baseToken?.name ?? "Unknown",
          chain: pair.chainId ?? "unknown"
        },
        launchIntelligence: null,
        liquidityBreakdown: {
          dexName,
          pairAddress: pair.pairAddress ?? "Unavailable",
          baseToken: pair.baseToken?.symbol ?? "Unknown",
          quoteToken: pair.quoteToken?.symbol ?? "Unknown",
          priceUsd: Number.isFinite(priceUsd) && priceUsd > 0 ? priceUsd : null,
          marketCapUsd,
          liquidityUsd,
          liquidityBase: getNumber(pair.liquidity?.base),
          liquidityQuote: getNumber(pair.liquidity?.quote),
          chainLiquidityUsd: chainLiquidity.totalLiquidityUsd,
          chainTopDexName: chainLiquidity.topDexName,
          chainTopPairAddress: chainLiquidity.topPairAddress,
          volume24h,
          volumeM5: getNumber(pair.volume?.m5),
          volumeH1: getNumber(pair.volume?.h1),
          volumeH6: getNumber(pair.volume?.h6),
          priceChange24h,
          priceChangeM5: getNumber(pair.priceChange?.m5),
          priceChangeH1: getNumber(pair.priceChange?.h1),
          priceChangeH6: getNumber(pair.priceChange?.h6),
          poolAgeHours
        },
        activityAnalysis: {
          buysM5: pair.txns?.m5?.buys ?? null,
          sellsM5: pair.txns?.m5?.sells ?? null,
          buysH1: pair.txns?.h1?.buys ?? null,
          sellsH1: pair.txns?.h1?.sells ?? null,
          buysH6: pair.txns?.h6?.buys ?? null,
          sellsH6: pair.txns?.h6?.sells ?? null,
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
        riskVerdict: "",
        scoreBreakdown: risk.breakdown,
        scorePenalties: risk.penalties,
        summary,
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
