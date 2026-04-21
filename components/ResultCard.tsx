export interface TokenAnalysisResult {
  symbol: string;
  liquidityUsd: number;
  volume24h: number;
  priceChange24h: number;
  riskScore: number;
  summary: string;
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

export default function ResultCard({ result }: ResultCardProps) {
  const riskTone = getRiskTone(result.riskScore);
  const metrics = [
    {
      label: "Liquidity USD",
      value: formatCurrency(result.liquidityUsd)
    },
    {
      label: "24h Volume",
      value: formatCurrency(result.volume24h)
    },
    {
      label: "24h Price Change",
      value: formatPercent(result.priceChange24h),
      valueClass:
        result.priceChange24h >= 0 ? "text-acid" : "text-red-300"
    }
  ];

  return (
    <section className="mt-6 rounded-[1.75rem] border border-white/10 bg-panel/80 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-6">
      <div className="flex flex-col justify-between gap-5 border-b border-white/10 pb-5 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">
            Token
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-white">
            {result.symbol}
          </h2>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:min-w-56">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400">Risk Score</p>
              <p className={`mt-1 text-sm font-semibold ${riskTone.color}`}>
                {riskTone.label}
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

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"
          >
            <p className="text-sm text-slate-400">{metric.label}</p>
            <p
              className={`mt-2 break-words text-2xl font-semibold ${
                metric.valueClass ?? "text-white"
              }`}
            >
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-cyan/20 bg-cyan/10 p-5">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan">
          AI Risk Summary
        </p>
        <p className="mt-3 leading-7 text-slate-100">{result.summary}</p>
        <p className="mt-4 rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm font-semibold leading-6 text-red-200">
          <span className="text-red-300">Disclaimer:</span>{" "}
          {RISK_DISCLAIMER}
        </p>
      </div>
    </section>
  );
}
