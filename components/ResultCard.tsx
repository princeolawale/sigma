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
  };
  liquidityBreakdown: {
    dexName: string;
    pairAddress: string;
    baseToken: string;
    quoteToken: string;
    liquidityUsd: number;
    volume24h: number;
    priceChange24h: number;
    poolAgeHours: number | null;
  };
  activityAnalysis: {
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
  summary: string;
  dataAvailability: string[];
}

interface ResultCardProps {
  result: TokenAnalysisResult;
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
    return "Not enough data to verify.";
  }

  if (hours < 24) {
    return `${hours.toFixed(1)}h`;
  }

  return `${(hours / 24).toFixed(1)}d`;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function getRiskTone(score: number) {
  if (score >= 75) {
    return {
      color: "text-acid",
      bar: "bg-acid"
    };
  }

  if (score >= 45) {
    return {
      color: "text-amber-300",
      bar: "bg-amber-300"
    };
  }

  return {
    color: "text-red-300",
    bar: "bg-red-300"
  };
}

function getLaunchText(result: TokenAnalysisResult) {
  const age = result.liquidityBreakdown.poolAgeHours;
  const stronglyInferred =
    result.launchIntelligence.confidence !== "unknown" &&
    result.launchIntelligence.launchType !== "unknown launch type";

  if (stronglyInferred) {
    return result.launchIntelligence.summary;
  }

  if (age !== null && age < 72) {
    return "Recent pool detected.";
  }

  if (age !== null) {
    return "Standard DEX trading detected.";
  }

  return "Launch type cannot be verified from market data alone.";
}

function Section({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 sm:p-5">
      <h3 className="text-lg font-semibold text-white sm:text-xl">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function ResultCard({ result }: ResultCardProps) {
  const riskTone = getRiskTone(result.riskScore);
  const marketOverview = [
    {
      label: "Token",
      value: result.token.symbol
    },
    {
      label: "Chain",
      value: result.token.chain
    },
    {
      label: "Pool Age",
      value: formatAge(result.liquidityBreakdown.poolAgeHours)
    },
    {
      label: "Risk Score",
      value: `${result.riskScore}/100`,
      valueClass: riskTone.color
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
      value: formatCurrency(result.liquidityBreakdown.liquidityUsd)
    },
    {
      label: "Pair",
      value: formatAddress(result.liquidityBreakdown.pairAddress)
    }
  ];

  const riskSignals = [
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
          : "text-red-300"
    },
    {
      label: "Buys",
      value:
        result.activityAnalysis.buys24h === null
          ? "Not enough data"
          : String(result.activityAnalysis.buys24h)
    },
    {
      label: "Sells",
      value:
        result.activityAnalysis.sells24h === null
          ? "Not enough data"
          : String(result.activityAnalysis.sells24h)
    }
  ];

  return (
    <section className="mt-6 space-y-4 sm:space-y-5">
      <div className="rounded-[1.5rem] border border-white/10 bg-panel/80 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-5">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              Sigma Analysis
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
              {result.token.symbol}
            </h2>
            <p className="result-wrap mt-2 text-sm text-slate-400">
              {formatAddress(result.token.address)}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:min-w-52">
            <p className="text-sm text-slate-400">Final Verdict</p>
            <p className={`mt-2 text-xl font-semibold ${riskTone.color}`}>
              {result.riskVerdict}
            </p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full ${riskTone.bar}`}
                style={{ width: `${result.riskScore}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {marketOverview.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/10 bg-white/[0.035] p-3 sm:p-4"
            >
              <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
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
              className="rounded-2xl border border-white/10 bg-ink/60 p-3 sm:p-4"
            >
              <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
                {item.label}
              </p>
              <p className="result-wrap mt-2 text-base font-semibold text-white sm:text-lg">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Activity Analysis">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {riskSignals.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/10 bg-ink/60 p-3 sm:p-4"
            >
              <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
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
        <p className="mt-4 text-sm leading-6 text-slate-300">
          {result.activityAnalysis.summary}
        </p>
      </Section>

      <Section title="Launch Insight">
        <p className="text-sm leading-6 text-slate-100 sm:text-base sm:leading-7">
          {getLaunchText(result)}
        </p>
      </Section>

      <Section title="Risk Signals">
        <div className="space-y-3">
          <p className="text-sm leading-6 text-slate-100 sm:text-base sm:leading-7">
            {result.analystReport.whatHappened}
          </p>
          <p className="text-sm leading-6 text-slate-300 sm:text-base sm:leading-7">
            {result.analystReport.whyItMatters}
          </p>
        </div>
      </Section>

      {result.holderDistribution ? (
        <Section title="Holder Distribution">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-ink/60 p-3 sm:p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
                Holder Count
              </p>
              <p className="mt-2 text-base font-semibold text-white sm:text-lg">
                {formatNumber(result.holderDistribution.holderCount)}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-ink/60 p-3 sm:p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
                Top Holder
              </p>
              <p className="mt-2 text-base font-semibold text-white sm:text-lg">
                {result.holderDistribution.topHolderPercent}%
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-ink/60 p-3 sm:p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
                Top 10 Holders
              </p>
              <p className="mt-2 text-base font-semibold text-white sm:text-lg">
                {result.holderDistribution.top10Percent}%
              </p>
            </div>
            {result.holderDistribution.supply !== null ? (
              <div className="rounded-2xl border border-white/10 bg-ink/60 p-3 sm:p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
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

      <Section title="Final Verdict">
        <div className="space-y-4">
          <p className="text-sm leading-6 text-slate-100 sm:text-base sm:leading-7">
            {result.analystReport.finalVerdict}
          </p>
          <div className="space-y-2">
            {result.analystReport.whatToVerifyNext.map((line) => (
              <p key={line} className="text-sm leading-6 text-slate-300">
                {line}
              </p>
            ))}
          </div>
        </div>
      </Section>

      {result.dataAvailability.length > 0 ? (
        <Section title="Data Gaps">
          <p className="text-sm leading-6 text-slate-300">
            On-chain holder data unavailable.
          </p>
        </Section>
      ) : null}

      <p className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-xs leading-5 text-red-200 sm:text-sm">
        <span className="font-semibold text-red-300">Disclaimer:</span>{" "}
        {RISK_DISCLAIMER}
      </p>
    </section>
  );
}
