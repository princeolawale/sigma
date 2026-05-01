"use client";

import { useEffect, useMemo, useState } from "react";

export interface TokenAnalysisResult {
  token: {
    address: string;
    symbol: string;
    name: string;
    chain: string;
  };
  launchIntelligence: {
    launchType: string;
    confidence: string;
    summary: string;
    migrationStatus: string;
    indicators: string[];
  } | null;
  liquidityBreakdown: {
    dexName: string;
    pairAddress: string;
    baseToken: string;
    quoteToken: string;
    priceUsd: number | null;
    marketCapUsd: number | null;
    liquidityUsd: number;
    liquidityBase: number;
    liquidityQuote: number;
    chainLiquidityUsd: number;
    chainTopDexName: string;
    chainTopPairAddress: string;
    volume24h: number;
    volumeM5: number;
    volumeH1: number;
    volumeH6: number;
    priceChange24h: number;
    priceChangeM5: number;
    priceChangeH1: number;
    priceChangeH6: number;
    poolAgeHours: number | null;
  };
  activityAnalysis: {
    buysM5: number | null;
    sellsM5: number | null;
    buysH1: number | null;
    sellsH1: number | null;
    buysH6: number | null;
    sellsH6: number | null;
    buys24h: number | null;
    sells24h: number | null;
    summary: string;
  };
  holderDistribution: {
    holderCount: number;
    topHolderPercent: number;
    top10Percent: number;
    supply: number | null;
  } | null;
  analystReport: {
    whatHappened: string;
    whyItMatters: string;
    whatToVerifyNext: string[];
    finalVerdict: string;
  };
  riskScore: number;
  riskVerdict: string;
  scoreBreakdown: {
    liquidity: number;
    marketCap: number;
    holders: number;
    activity: number;
    pressure: number;
    volatility: number;
    pool: number;
    security: number;
  };
  scorePenalties: string[];
  summary: string;
  dataAvailability: string[];
}

interface ResultCardProps {
  result: TokenAnalysisResult;
}

type SignalTone = "positive" | "warning" | "danger" | "neutral";

interface SignalItem {
  key: string;
  tone: SignalTone;
  title: string;
  text: string;
}

const RISK_DISCLAIMER =
  "Crypto is risky. Always do your own research; this is not financial advice.";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

function formatCompactCurrency(value: number | null) {
  if (value === null || !Number.isFinite(value)) {
    return "-";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);
}

function formatPrice(value: number | null) {
  if (value === null || !Number.isFinite(value) || value <= 0) {
    return "-";
  }

  if (value >= 1) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 4
    }).format(value);
  }

  return `$${value.toPrecision(4)}`;
}

function formatPercent(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function formatAddress(address: string) {
  if (!address || address.length <= 12) {
    return address;
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatAge(hours: number | null) {
  if (hours === null) {
    return "-";
  }

  if (hours < 24) {
    return `${hours.toFixed(1)}h`;
  }

  return `${(hours / 24).toFixed(1)}d`;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function pickVariant(variants: string[], seed: number) {
  return variants[Math.abs(seed) % variants.length] ?? variants[0];
}

function getRiskTone(score: number) {
  if (score >= 85) {
    return {
      color: "text-acid",
      bar: "bg-acid",
      border: "border-acid/30",
      glow: "shadow-success"
    };
  }

  if (score >= 70) {
    return {
      color: "text-warning",
      bar: "bg-warning",
      border: "border-warning/30",
      glow: "shadow-[0_18px_44px_rgba(245,197,66,0.12)]"
    };
  }

  if (score >= 50) {
    return {
      color: "text-orange-400",
      bar: "bg-orange-400",
      border: "border-orange-400/30",
      glow: "shadow-[0_18px_44px_rgba(251,146,60,0.14)]"
    };
  }

  return {
    color: "text-danger",
    bar: "bg-danger",
    border: "border-danger/30",
    glow: "shadow-[0_18px_44px_rgba(255,92,92,0.12)]"
  };
}

function getLiquidityTone(liquidityUsd: number) {
  if (liquidityUsd >= 250000) {
    return "text-acid";
  }

  if (liquidityUsd >= 50000) {
    return "text-warning";
  }

  if (liquidityUsd >= 15000) {
    return "text-teal";
  }

  return "text-danger";
}

function getActivityTone(buys: number | null, sells: number | null) {
  if (buys === null || sells === null) {
    return null;
  }

  if (buys > sells) {
    return "text-acid";
  }

  if (sells > buys) {
    return "text-danger";
  }

  return "text-white";
}

function getHolderTone(value: number, warningThreshold: number, dangerThreshold: number) {
  if (value > dangerThreshold) {
    return "text-danger";
  }

  if (value > warningThreshold) {
    return "text-warning";
  }

  return "text-acid";
}

function toneClasses(tone: SignalTone) {
  switch (tone) {
    case "positive":
      return {
        border: "border-acid/20",
        text: "text-acid",
        bg: "bg-acid/8"
      };
    case "warning":
      return {
        border: "border-warning/20",
        text: "text-warning",
        bg: "bg-warning/8"
      };
    case "danger":
      return {
        border: "border-danger/20",
        text: "text-danger",
        bg: "bg-danger/8"
      };
    default:
      return {
        border: "border-primary/15",
        text: "text-teal",
        bg: "bg-white/[0.02]"
      };
  }
}

function buildRiskSignals(result: TokenAnalysisResult): SignalItem[] {
  const signals: SignalItem[] = [];
  const { liquidityUsd, volume24h, priceChange24h, marketCapUsd } =
    result.liquidityBreakdown;
  const holderDistribution = result.holderDistribution;
  const absoluteMove = Math.abs(priceChange24h);
  const buyCount = result.activityAnalysis.buys24h;
  const sellCount = result.activityAnalysis.sells24h;

  const liquidityVariants = {
    strong: [
      "Deep enough liquidity to absorb more normal trading flow.",
      "Liquidity looks healthy for active market participation.",
      "Pool depth is sturdier than the typical thin launch pool.",
      "Liquidity is giving this market decent execution room."
    ],
    moderate: [
      "Liquidity is usable, but larger orders can still move price.",
      "Pool depth is workable, though slippage can show up fast.",
      "Liquidity sits in the middle range and needs position sizing discipline.",
      "There is enough depth to trade, but it is not especially thick."
    ],
    weak: [
      "Thin liquidity can turn even modest selling into a sharp move.",
      "Pool depth is light, so exits may get messy under pressure.",
      "Liquidity is fragile here and slippage risk is elevated.",
      "This market still looks thin enough for fast air pockets."
    ]
  };

  if (liquidityUsd >= 250000) {
    signals.push({
      key: "liquidity",
      tone: "positive",
      title: "Liquidity",
      text: pickVariant(liquidityVariants.strong, Math.round(liquidityUsd))
    });
  } else if (liquidityUsd >= 15000) {
    signals.push({
      key: "liquidity",
      tone: liquidityUsd >= 50000 ? "warning" : "neutral",
      title: "Liquidity",
      text: pickVariant(liquidityVariants.moderate, Math.round(liquidityUsd / 1000))
    });
  } else {
    signals.push({
      key: "liquidity",
      tone: "danger",
      title: "Liquidity",
      text: pickVariant(liquidityVariants.weak, Math.round(liquidityUsd / 100))
    });
  }

  const activityVariants = {
    active: [
      "Trading flow is live enough for cleaner price discovery.",
      "Volume is supporting a more active market tape.",
      "The pair is seeing enough turnover to keep price discovery moving.",
      "Activity is healthy enough that the market is not completely dormant."
    ],
    moderate: [
      "Volume is present, but the tape still needs watching.",
      "There is some turnover here, though the market is not especially busy.",
      "Activity is real but not yet strong enough to call robust.",
      "Volume is middling, so conviction is still developing."
    ],
    weak: [
      "Light activity can make price action easier to distort.",
      "Low turnover leaves this pair more vulnerable to chop and spoofy moves.",
      "Volume is still thin, so signals can be less trustworthy.",
      "The tape is quiet enough that one-sided flow can move it fast."
    ]
  };

  if (volume24h >= 100000) {
    signals.push({
      key: "volume",
      tone: "positive",
      title: "Volume",
      text: pickVariant(activityVariants.active, Math.round(volume24h / 1000))
    });
  } else if (volume24h >= 10000) {
    signals.push({
      key: "volume",
      tone: "neutral",
      title: "Volume",
      text: pickVariant(activityVariants.moderate, Math.round(volume24h / 1000))
    });
  } else {
    signals.push({
      key: "volume",
      tone: "warning",
      title: "Volume",
      text: pickVariant(activityVariants.weak, Math.round(volume24h))
    });
  }

  const volatilityVariants = {
    calm: [
      "Price movement is active but still inside a more manageable range.",
      "The recent move is noticeable without looking extreme.",
      "Volatility is present, but it has not blown out yet."
    ],
    hot: [
      "Price is moving fast enough that entries and exits need tighter discipline.",
      "Momentum is elevated here, so chase risk is real.",
      "This tape is getting hot and can snap back quickly.",
      "Volatility is running hotter than a steady market likes."
    ],
    severe: [
      "This is high-volatility price action and can reverse hard.",
      "The tape is stretched enough to make execution risk meaningful.",
      "Extreme movement is in play here, so size matters a lot.",
      "This is a sharp move environment, not a sleepy one."
    ]
  };

  if (absoluteMove >= 60) {
    signals.push({
      key: "volatility",
      tone: "danger",
      title: "Volatility",
      text: pickVariant(volatilityVariants.severe, Math.round(absoluteMove))
    });
  } else if (absoluteMove >= 20) {
    signals.push({
      key: "volatility",
      tone: "warning",
      title: "Volatility",
      text: pickVariant(volatilityVariants.hot, Math.round(absoluteMove))
    });
  } else {
    signals.push({
      key: "volatility",
      tone: "neutral",
      title: "Volatility",
      text: pickVariant(volatilityVariants.calm, Math.round(absoluteMove))
    });
  }

  if (buyCount !== null && sellCount !== null) {
    const activitySkew = buyCount - sellCount;
    if (activitySkew > 0) {
      signals.push({
        key: "flow",
        tone: "positive",
        title: "Order Flow",
        text: pickVariant(
          [
            "Buy pressure is ahead of sells right now.",
            "The tape is leaning more bid than offered.",
            "Recent flow has more buyers than sellers.",
            "Buying activity is outpacing selling for now."
          ],
          activitySkew
        )
      });
    } else if (activitySkew < 0) {
      signals.push({
        key: "flow",
        tone: "danger",
        title: "Order Flow",
        text: pickVariant(
          [
            "Sell pressure is leading the tape at the moment.",
            "Sellers are doing more of the work right now.",
            "Recent flow is heavier on the sell side.",
            "The pair is leaning offered rather than bid."
          ],
          Math.abs(activitySkew)
        )
      });
    } else {
      signals.push({
        key: "flow",
        tone: "neutral",
        title: "Order Flow",
        text: "Buy and sell counts are relatively balanced."
      });
    }
  }

  signals.push({
    key: "market-cap",
    tone: marketCapUsd === null ? "neutral" : marketCapUsd >= 50000000 ? "positive" : "neutral",
    title: "Market Cap",
    text:
      marketCapUsd === null
        ? "Market cap: -"
        : `Estimated market cap is ${formatCompactCurrency(marketCapUsd)}.`
  });

  if (holderDistribution) {
    const { topHolderPercent, top10Percent } = holderDistribution;

    if (topHolderPercent > 10) {
      signals.push({
        key: "top-holder-high",
        tone: "danger",
        title: "Top Holder Risk",
        text: `High risk: one wallet controls ${topHolderPercent}% of supply. A wallet holding more than 5% can be a dump risk. Confirm whether this wallet is locked, a team wallet, LP/contract wallet, or exchange wallet.`
      });
    } else if (topHolderPercent > 5) {
      signals.push({
        key: "top-holder-warning",
        tone: "warning",
        title: "Top Holder Risk",
        text: `One wallet controls ${topHolderPercent}% of supply. A wallet holding more than 5% can be a dump risk. Confirm whether this wallet is locked, a team wallet, LP/contract wallet, or exchange wallet.`
      });
    }

    if (top10Percent > 50) {
      signals.push({
        key: "top10-high",
        tone: "danger",
        title: "Holder Concentration",
        text: pickVariant(
          [
            `High concentration: the top ten wallets hold ${top10Percent}% of supply.`,
            `Top-ten concentration is heavy at ${top10Percent}% of supply.`,
            `The top ten wallets control ${top10Percent}% here, which is a real concentration risk.`
          ],
          Math.round(top10Percent)
        )
      });
    } else if (top10Percent > 30) {
      signals.push({
        key: "top10-warning",
        tone: "warning",
        title: "Holder Concentration",
        text: pickVariant(
          [
            `The top ten wallets hold ${top10Percent}% of supply, so concentration deserves monitoring.`,
            `Top-ten ownership is notable at ${top10Percent}% of supply.`,
            `Concentration is building: the top ten wallets control ${top10Percent}%.`
          ],
          Math.round(top10Percent)
        )
      });
    }
  }

  return signals;
}

function CopyButton({
  label,
  value,
  copiedKey,
  onCopy
}: {
  label: string;
  value: string;
  copiedKey: string | null;
  onCopy: (key: string, value: string) => void;
}) {
  const isCopied = copiedKey === value;

  return (
    <button
      type="button"
      onClick={() => onCopy(value, value)}
      aria-label={`Copy ${label}`}
      className="inline-flex h-8 items-center justify-center rounded-xl border border-primary/15 bg-white/[0.03] px-2.5 text-white/65 transition hover:border-teal/40 hover:text-teal focus:outline-none focus:ring-2 focus:ring-primary/40"
    >
      {isCopied ? (
        <span className="text-xs font-medium text-teal">Copied</span>
      ) : (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        >
          <rect x="9" y="9" width="10" height="10" rx="2" />
          <path d="M5 15V7a2 2 0 0 1 2-2h8" />
        </svg>
      )}
    </button>
  );
}

function Section({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[1.5rem] border border-primary/15 bg-white/[0.03] p-3.5 sm:p-5">
      <h3 className="text-base font-semibold text-white sm:text-xl">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function ResultCard({ result }: ResultCardProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!copiedKey) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setCopiedKey(null);
    }, 1400);

    return () => window.clearTimeout(timeout);
  }, [copiedKey]);

  const riskTone = getRiskTone(result.riskScore);
  const liquidityTone = getLiquidityTone(result.liquidityBreakdown.liquidityUsd);
  const buyTone = getActivityTone(
    result.activityAnalysis.buys24h,
    result.activityAnalysis.sells24h
  );
  const sellTone = getActivityTone(
    result.activityAnalysis.sells24h,
    result.activityAnalysis.buys24h
  );
  const signals = useMemo(() => buildRiskSignals(result), [result]);

  async function handleCopy(key: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
    } catch {
      setCopiedKey(null);
    }
  }

  const marketOverview = [
    {
      label: "Token",
      value: result.token.symbol
    },
    {
      label: "Price",
      value: formatPrice(result.liquidityBreakdown.priceUsd)
    },
    {
      label: "Market Cap",
      value: formatCompactCurrency(result.liquidityBreakdown.marketCapUsd),
      valueClass:
        result.liquidityBreakdown.marketCapUsd === null ? "text-white/60" : "text-white"
    },
    {
      label: "Chain",
      value: result.token.chain
    },
    {
      label: "Pool Age",
      value: formatAge(result.liquidityBreakdown.poolAgeHours)
    }
  ];

  const liquidityMetrics = [
    {
      label: "DEX",
      value: result.liquidityBreakdown.dexName
    },
    {
      label: "Base / Quote",
      value: `${result.liquidityBreakdown.baseToken} / ${result.liquidityBreakdown.quoteToken}`
    },
    {
      label: "Liquidity",
      value: formatCurrency(result.liquidityBreakdown.liquidityUsd),
      valueClass: liquidityTone
    }
  ];

  const activityMetrics = [
    {
      label: "24h Volume",
      value: formatCurrency(result.liquidityBreakdown.volume24h)
    },
    {
      label: "24h Price Change",
      value: formatPercent(result.liquidityBreakdown.priceChange24h),
      valueClass:
        result.liquidityBreakdown.priceChange24h >= 0
          ? "text-acid"
          : "text-danger"
    },
    {
      label: "24H Buys",
      value:
        result.activityAnalysis.buys24h === null
          ? "-"
          : String(result.activityAnalysis.buys24h),
      valueClass: buyTone ?? "text-white"
    },
    {
      label: "24H Sells",
      value:
        result.activityAnalysis.sells24h === null
          ? "-"
          : String(result.activityAnalysis.sells24h),
      valueClass: sellTone ?? "text-white"
    }
  ];

  return (
    <section className="mt-6 space-y-4 sm:space-y-5">
      <div className="rounded-[1.5rem] border border-primary/15 bg-panel/85 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-5">
        <div className="flex flex-col gap-4 border-b border-primary/10 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/50">
              Sigma Analysis
            </p>
            <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-teal">
              Market data: Dexscreener
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
              {result.token.symbol}
            </h2>
            <div className="mt-2 flex max-w-full items-center justify-center gap-2 sm:justify-start">
              <p className="result-wrap min-w-0 text-center text-sm text-white/60 sm:text-left">
                {formatAddress(result.token.address)}
              </p>
              <CopyButton
                label="token contract address"
                value={result.token.address}
                copiedKey={copiedKey}
                onCopy={handleCopy}
              />
            </div>
          </div>

          <div
            className={`rounded-2xl border bg-white/[0.04] p-4 sm:min-w-52 ${riskTone.border} ${riskTone.glow}`}
          >
            <p className="text-sm text-white/60">Sigma Score</p>
            <p className={`mt-2 text-2xl font-semibold ${riskTone.color}`}>
              {result.riskScore}/100
            </p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full ${riskTone.bar}`}
                style={{ width: `${result.riskScore}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {marketOverview.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-primary/15 bg-white/[0.035] p-3 sm:p-4"
            >
              <p className="text-xs uppercase tracking-[0.14em] text-white/50">
                {item.label}
              </p>
              <p
                className={`result-wrap mt-2 text-lg font-semibold sm:text-xl ${
                  item.valueClass ?? "text-white"
                }`}
              >
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <Section title="Liquidity Breakdown">
        <div className="grid gap-3 sm:grid-cols-2">
          {liquidityMetrics.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-primary/15 bg-ink/60 p-3 sm:p-4"
            >
              <p className="text-xs uppercase tracking-[0.14em] text-white/50">
                {item.label}
              </p>
              <p
                className={`result-wrap mt-2 text-base font-semibold sm:text-lg ${
                  item.valueClass ?? "text-white"
                }`}
              >
                {item.value}
              </p>
            </div>
          ))}
          <div className="rounded-2xl border border-primary/15 bg-ink/60 p-3 sm:p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-white/50">
              Chain Liquidity
            </p>
            <p className="mt-2 text-base font-semibold text-white sm:text-lg">
              {formatCurrency(result.liquidityBreakdown.chainLiquidityUsd)}
            </p>
          </div>
          <div className="rounded-2xl border border-primary/15 bg-ink/60 p-3 sm:p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-white/50">
              Chain Top DEX
            </p>
            <p className="mt-2 text-base font-semibold text-white sm:text-lg">
              {result.liquidityBreakdown.chainTopDexName}
            </p>
          </div>
          <div className="rounded-2xl border border-primary/15 bg-ink/60 p-3 sm:p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-white/50">
              Pair
            </p>
            <div className="mt-2 flex max-w-full items-center justify-center gap-2 sm:justify-start">
              <p className="result-wrap min-w-0 text-center text-base font-semibold text-white sm:text-left sm:text-lg">
                {formatAddress(result.liquidityBreakdown.pairAddress)}
              </p>
              <CopyButton
                label="pair address"
                value={result.liquidityBreakdown.pairAddress}
                copiedKey={copiedKey}
                onCopy={handleCopy}
              />
            </div>
          </div>
        </div>
      </Section>

      {result.holderDistribution ? (
        <Section title="Holder Distribution">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.16em] text-teal">
            Holder data: Moralis
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-primary/15 bg-ink/60 p-3 sm:p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-white/50">
                Holder Count
              </p>
              <p className="mt-2 text-base font-semibold text-white sm:text-lg">
                {formatNumber(result.holderDistribution.holderCount)}
              </p>
            </div>
            <div className="rounded-2xl border border-primary/15 bg-ink/60 p-3 sm:p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-white/50">
                Top Holder
              </p>
              <p
                className={`mt-2 text-base font-semibold sm:text-lg ${getHolderTone(
                  result.holderDistribution.topHolderPercent,
                  5,
                  10
                )}`}
              >
                {result.holderDistribution.topHolderPercent}%
              </p>
            </div>
            <div className="rounded-2xl border border-primary/15 bg-ink/60 p-3 sm:p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-white/50">
                Top 10 Holders
              </p>
              <p
                className={`mt-2 text-base font-semibold sm:text-lg ${getHolderTone(
                  result.holderDistribution.top10Percent,
                  30,
                  50
                )}`}
              >
                {result.holderDistribution.top10Percent}%
              </p>
            </div>
            {result.holderDistribution.supply !== null ? (
              <div className="rounded-2xl border border-primary/15 bg-ink/60 p-3 sm:p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-white/50">
                  Supply
                </p>
                <p className="result-wrap mt-2 text-base font-semibold text-white sm:text-lg">
                  {formatNumber(result.holderDistribution.supply)}
                </p>
              </div>
            ) : null}
          </div>
        </Section>
      ) : null}

      <Section title="Activity Analysis">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {activityMetrics.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-primary/15 bg-ink/60 p-3 sm:p-4"
            >
              <p className="text-xs uppercase tracking-[0.14em] text-white/50">
                {item.label}
              </p>
              <p
                className={`result-wrap mt-2 text-base font-semibold sm:text-lg ${
                  item.valueClass ?? "text-white"
                }`}
              >
                {item.value}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm leading-6 text-white/70">
          {result.activityAnalysis.summary}
        </p>
      </Section>

      <Section title="Risk Signals">
        <div className="space-y-3">
          {signals.map((signal) => {
            const tone = toneClasses(signal.tone);

            return (
              <div
                key={signal.key}
                className={`rounded-2xl border ${tone.border} ${tone.bg} p-3 sm:p-4`}
              >
                <p className={`text-sm font-semibold ${tone.text}`}>
                  {signal.title}
                </p>
                <p className="mt-2 text-sm leading-6 text-white/78 sm:text-base sm:leading-7">
                  {signal.text}
                </p>
              </div>
            );
          })}
        </div>
      </Section>

      <Section title="Final Verdict">
        <div className="space-y-4">
          <p className="text-sm leading-6 text-white/88 sm:text-base sm:leading-7">
            {result.summary}
          </p>
          <p className="text-sm leading-6 text-white/70 sm:text-base sm:leading-7">
            {result.analystReport.finalVerdict}
          </p>
          <div className="space-y-2">
            {result.analystReport.whatToVerifyNext.map((line) => (
              <p key={line} className="text-sm leading-6 text-white/70">
                {line}
              </p>
            ))}
          </div>
        </div>
      </Section>

      <p className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-xs leading-5 text-red-200 sm:text-sm">
        <span className="font-semibold text-red-300">Disclaimer:</span>{" "}
        {RISK_DISCLAIMER}
      </p>
    </section>
  );
}
