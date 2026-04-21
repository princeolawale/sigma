import TokenAnalyzer from "@/components/TokenAnalyzer";

const reasons = [
  {
    title: "Instant Risk Signals",
    text: "See liquidity, volume, and price movement translated into a clear risk readout."
  },
  {
    title: "AI-Powered Context",
    text: "Get plain-English summaries that explain what the raw token data may imply."
  },
  {
    title: "Built For Speed",
    text: "Paste a contract address and get a focused scan without digging through dashboards."
  },
  {
    title: "Investor-Friendly",
    text: "Designed for everyday traders who want sharper context before making a move."
  }
];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col overflow-hidden">
      <nav className="border-b border-white/10 bg-ink/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="font-serif text-4xl font-bold italic tracking-normal text-white drop-shadow-[0_0_18px_rgba(84,240,178,0.28)] sm:text-5xl">
              Sigma
            </span>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-slate-300 sm:flex">
            <span className="h-2 w-2 rounded-full bg-acid shadow-[0_0_18px_rgba(84,240,178,0.9)]" />
            Live token intelligence
          </div>
        </div>
      </nav>

      <section className="mx-auto flex w-full max-w-6xl flex-col items-center px-5 py-14 sm:px-8 sm:py-20">
        <div className="max-w-3xl text-center">
          <p className="mb-4 inline-flex rounded-full border border-acid/30 bg-acid/10 px-4 py-2 text-sm font-medium text-acid">
            Crypto risk analysis for everyday investors
          </p>
          <h1 className="text-4xl font-semibold tracking-normal text-white sm:text-6xl">
            AI-Powered Token Risk Analysis
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            Instantly analyze token risk, liquidity, and trading activity with
            AI-powered insights.
          </p>
        </div>

        <TokenAnalyzer />
      </section>

      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-16">
          <div className="mb-9 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-acid">
                Why Choose Us
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-normal text-white sm:text-4xl">
                Cleaner signal before the trade
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-400 sm:text-right">
              Sigma cuts through noisy token data with fast, readable analysis
              built for confident first-pass decisions.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {reasons.map((reason, index) => (
              <article
                key={reason.title}
                className="group min-h-48 border border-white/10 bg-ink/60 p-5 transition hover:-translate-y-1 hover:border-acid/40 hover:bg-white/[0.04]"
              >
                <div className="mb-7 flex h-10 w-10 items-center justify-center border border-acid/30 bg-acid/10 text-sm font-semibold text-acid">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <h3 className="text-lg font-semibold text-white">
                  {reason.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {reason.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="mt-auto border-t border-white/10 bg-ink/70">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-5 py-8 text-center sm:px-8">
          <p className="text-sm text-slate-400">2026 Sigma. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <a
              href="https://x.com/usesigma?s=21"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open Sigma on X"
              className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-slate-300 transition hover:border-acid/50 hover:text-acid focus:outline-none focus:ring-2 focus:ring-acid/60"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="currentColor"
              >
                <path d="M13.74 10.38 21.13 2h-1.75l-6.42 7.28L7.83 2H1.92l7.75 11.02L1.92 21.8h1.75l6.78-7.69 5.42 7.69h5.91l-8.04-11.42Zm-2.4 2.72-.79-1.1L4.31 3.29h2.68l5.05 7.04.78 1.1 6.55 9.14h-2.68l-5.35-7.47Z" />
              </svg>
            </a>
            <a
              href="https://t.me/sigmaofficialchat"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open Sigma Telegram chat"
              className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-slate-300 transition hover:border-acid/50 hover:text-acid focus:outline-none focus:ring-2 focus:ring-acid/60"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="currentColor"
              >
                <path d="M21.58 3.32a1.5 1.5 0 0 0-1.55-.22L3.24 9.58c-.72.28-1.18.78-1.22 1.34-.04.56.35 1.07 1.04 1.38l4.3 1.88 1.72 5.31c.22.67.62 1.07 1.12 1.11.43.03.86-.2 1.24-.66l2.25-2.75 4.4 3.26c.44.32.88.43 1.27.32.45-.13.78-.52.94-1.1L22.1 4.82c.18-.7-.01-1.22-.52-1.5ZM8.16 13.1l8.4-5.31-6.52 7.03-.25 2.87-1.05-3.24a1.7 1.7 0 0 0-.58-1.35Zm10.45 5.85-4.5-3.34a1 1 0 0 0-1.37.17l-1.18 1.44.14-1.57 7.07-7.62-1.23 10.72.07.05-.01.04Z" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
