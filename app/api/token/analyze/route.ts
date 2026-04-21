import { NextRequest, NextResponse } from "next/server";
import { generateRiskSummary } from "@/lib/openai";
import { calculateRiskScore } from "@/lib/riskScore";

interface DexscreenerToken {
  symbol?: string;
}

interface DexscreenerPair {
  baseToken?: DexscreenerToken;
  liquidity?: {
    usd?: number;
  };
  volume?: {
    h24?: number;
  };
  priceChange?: {
    h24?: number;
  };
}

interface DexscreenerResponse {
  pairs?: DexscreenerPair[] | null;
}

interface AnalyzeRequestBody {
  address?: string;
}

function getNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function selectBestPair(pairs: DexscreenerPair[]) {
  return [...pairs].sort((first, second) => {
    const firstLiquidity = getNumber(first.liquidity?.usd);
    const secondLiquidity = getNumber(second.liquidity?.usd);
    return secondLiquidity - firstLiquidity;
  })[0];
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

    const dexscreenerResponse = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${encodeURIComponent(
        address
      )}`,
      {
        headers: {
          Accept: "application/json"
        },
        next: {
          revalidate: 30
        }
      }
    );

    if (!dexscreenerResponse.ok) {
      return NextResponse.json(
        { error: "Dexscreener is unavailable. Try again shortly." },
        { status: 502 }
      );
    }

    const tokenData =
      (await dexscreenerResponse.json()) as DexscreenerResponse;
    const pairs = tokenData.pairs ?? [];

    if (pairs.length === 0) {
      return NextResponse.json(
        { error: "No token data found for this contract address." },
        { status: 404 }
      );
    }

    const pair = selectBestPair(pairs);
    const symbol = pair.baseToken?.symbol ?? "Unknown";
    const liquidityUsd = getNumber(pair.liquidity?.usd);
    const volume24h = getNumber(pair.volume?.h24);
    const priceChange24h = getNumber(pair.priceChange?.h24);

    const riskScore = calculateRiskScore({
      liquidityUsd,
      volume24h,
      priceChange24h
    });

    const summary = await generateRiskSummary({
      symbol,
      liquidityUsd,
      volume24h,
      priceChange24h,
      riskScore
    });

    return NextResponse.json({
      data: {
        symbol,
        liquidityUsd,
        volume24h,
        priceChange24h,
        riskScore,
        summary
      }
    });
  } catch (error) {
    const message =
      error instanceof Error && error.message.includes("OPENAI_API_KEY")
        ? "OpenAI API key is not configured."
        : "Unable to analyze token. Please try again.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
