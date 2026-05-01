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
  lpSafety: {
    status: string;
    details: string;
    lpTokenAddress: string | null;
    burnedPercent: number | null;
    lockedPercent: number | null;
    deployerHeldPercent: number | null;
  };
  holderRisk: {
    deployerAddress: string;
    deployerTokenPercent: number | null;
    holderCount: number | null;
    topHolderPercent: number | null;
    top10HolderPercent: number | null;
    contractOwnedSupplyPercent: number | null;
    suspiciousWhaleConcentration: string;
    details: string[];
  };
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

function formatPercentOrFallback(value: number | null) {
  return value === null ? "Not enough data to verify." : `${value}%`;
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

function getRiskTone(score: number) {
  if (score >= 75) {
    return {
      label: "Lower Risk",
      color: "text-acid",
      bar: "bg-acid"
    };
  }

  if (score >= 45) {
    return {
      label: "Moderate Risk",
      color: "text-amber-300",
      bar: "bg-amber-300"
    };
  }

  return {
    label: "High Risk",
    color: "text-red-300",
    bar: "bg-red-300"
  };
}

function getLaunchTone(confidence: string) {
  if (confidence === "verified") {
    return "text-acid";
  }

  if (confidence === "likely") {
    return "text-amber-300";
  }

  return "text-slate-300";
}

function Section({
  eyebrow,
  title,
  children,
  className = ""
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 ${className}`}>
      <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan">
        {eyebrow}
      </p>
      <h3 className="mt-3 text-2xl font-semibold text-white">{title}</h3>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function ResultCard({ result }: ResultCardProps) {
  const riskTone = getRiskTone(result.riskScore);
  const liquidityMetrics = [
    {
      label: "DEX",
      value: result.liquidityBreakdown.dexName
    },
    {
      label: "Liquidity",
      value: formatCurrency(result.liquidityBreakdown.liquidityUsd)
    },
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
      label: "Pool Age",
      value: formatAge(result.liquidityBreakdown.poolAgeHours)
    },
    {
      label: "Chain",
      value: result.token.chain
    }
  ];

  return (
    <section className="mt-6 space-y-5">
      <div className="rounded-[1.75rem] border border-white/10 bg-panel/80 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-6">
        <div className="flex flex-col justify-between gap-5 border-b border-white/10 pb-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">
              Token
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-white">
              {result.token.symbol}
            </h2>
            <p className="mt-2 text-sm text-slate-400">{result.token.address}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:min-w-56">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm text-slate-400">Risk Score</p>
                <p className={`mt-1 text-sm font-semibold ${riskTone.color}`}>
                  {result.riskVerdict}
                </p>
              </div>
              <p className="text-4xl font-semibold text-white">
                {result.riskScore}
                <span className="text-base text-slate-400">/100</span>
              </p>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full ${riskTone.bar}`}
                style={{ width: `${result.riskScore}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {liquidityMetrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"
            >
              <p className="text-sm text-slate-400">{metric.label}</p>
              <p
                className={`mt-2 break-words text-xl font-semibold ${
                  metric.valueClass ?? "text-white"
                }`}
              >
                {metric.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <Section
        eyebrow="Launch Intelligence"
        title={result.launchIntelligence.launchType}
        className="bg-[linear-gradient(180deg,rgba(84,240,178,0.08),rgba(255,255,255,0.03))]"
      >
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <p className="text-base leading-7 text-slate-100">
              {result.launchIntelligence.summary}
            </p>
            <p className="text-sm leading-6 text-slate-300">
              {result.launchIntelligence.migrationStatus}
            </p>
            <div className="rounded-2xl border border-white/10 bg-ink/60 p-4">
              <p className={`text-sm font-semibold uppercase tracking-[0.18em] ${getLaunchTone(result.launchIntelligence.confidence)}`}>
                {result.launchIntelligence.confidence}
              </p>
              <div className="mt-3 space-y-2">
                {result.launchIntelligence.indicators.map((indicator) => (
                  <p key={indicator} className="text-sm leading-6 text-slate-300">
                    {indicator}
                  </p>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-ink/60 p-4">
            <p className="text-sm text-slate-400">Migration Detection</p>
            <p className="mt-2 text-lg font-semibold text-white">
              {result.launchIntelligence.migrationStatus}
            </p>
          </div>
        </div>
      </Section>

      <div className="grid gap-5 lg:grid-cols-2">
        <Section eyebrow="Liquidity Breakdown" title="Pool and DEX detail">
          <div className="space-y-4 text-sm leading-6 text-slate-300">
            <div>
              <p className="text-slate-400">Pair Address</p>
              <p className="mt-1 break-all text-white">
                {result.liquidityBreakdown.pairAddress}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-slate-400">Base Token</p>
                <p className="mt-1 text-white">{result.liquidityBreakdown.baseToken}</p>
              </div>
              <div>
                <p className="text-slate-400">Quote Token</p>
                <p className="mt-1 text-white">{result.liquidityBreakdown.quoteToken}</p>
              </div>
            </div>
          </div>
        </Section>

        <Section eyebrow="LP Safety" title={result.lpSafety.status}>
          <div className="space-y-4 text-sm leading-6 text-slate-300">
            <p>{result.lpSafety.details}</p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-ink/60 p-4">
                <p className="text-slate-400">Burned</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {formatPercentOrFallback(result.lpSafety.burnedPercent)}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-ink/60 p-4">
                <p className="text-slate-400">Locked</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {formatPercentOrFallback(result.lpSafety.lockedPercent)}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-ink/60 p-4">
                <p className="text-slate-400">Deployer Held</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {formatPercentOrFallback(result.lpSafety.deployerHeldPercent)}
                </p>
              </div>
            </div>
          </div>
        </Section>
      </div>

      <Section eyebrow="Holder / Deployer Risk" title="Wallet concentration and control">
        <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="space-y-4 rounded-2xl border border-white/10 bg-ink/60 p-4">
            <div>
              <p className="text-sm text-slate-400">Deployer Wallet</p>
              <p className="mt-2 break-all text-sm text-white">
                {result.holderRisk.deployerAddress}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-slate-400">Deployer Supply</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {formatPercentOrFallback(result.holderRisk.deployerTokenPercent)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Holder Count</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {result.holderRisk.holderCount ?? "Not enough data to verify."}
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-sm text-slate-400">Top Wallet</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {formatPercentOrFallback(result.holderRisk.topHolderPercent)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Top 10</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {formatPercentOrFallback(result.holderRisk.top10HolderPercent)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Contract-Owned</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {formatPercentOrFallback(
                    result.holderRisk.contractOwnedSupplyPercent
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-white/10 bg-ink/60 p-4">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
              Risk Notes
            </p>
            {result.holderRisk.details.map((detail) => (
              <p key={detail} className="text-sm leading-6 text-slate-300">
                {detail}
              </p>
            ))}
            <p className="rounded-2xl border border-amber-300/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
              {result.holderRisk.suspiciousWhaleConcentration}
            </p>
          </div>
        </div>
      </Section>

      <Section eyebrow="Final Analyst Report" title={result.riskVerdict}>
        <div className="space-y-5">
          <div className="rounded-2xl border border-white/10 bg-ink/60 p-4">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
              What happened
            </p>
            <p className="mt-3 leading-7 text-slate-100">
              {result.analystReport.whatHappened}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-ink/60 p-4">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
              Why it matters
            </p>
            <p className="mt-3 leading-7 text-slate-100">
              {result.analystReport.whyItMatters}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-ink/60 p-4">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
              What to verify next
            </p>
            <div className="mt-3 space-y-2">
              {result.analystReport.whatToVerifyNext.map((line) => (
                <p key={line} className="text-sm leading-6 text-slate-100">
                  {line}
                </p>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-cyan/20 bg-cyan/10 p-5">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan">
              Final Verdict
            </p>
            <p className="mt-3 leading-7 text-slate-100">
              {result.analystReport.finalVerdict}
            </p>
            <p className="mt-4 rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm font-semibold leading-6 text-red-200">
              <span className="text-red-300">Disclaimer:</span>{" "}
              {RISK_DISCLAIMER}
            </p>
          </div>
        </div>
      </Section>

      {result.dataAvailability.length > 0 ? (
        <Section eyebrow="Data Gaps" title="What still needs verification">
          <div className="space-y-2">
            {result.dataAvailability.map((line) => (
              <p key={line} className="text-sm leading-6 text-slate-300">
                {line}
              </p>
            ))}
          </div>
        </Section>
      ) : null}
    </section>
  );
}
