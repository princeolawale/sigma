import TokenAnalyzer from "@/components/TokenAnalyzer";

const reasons = [
  {
    title: "Instant Risk Signals",
    text: "See liquidity, volume, and price movement translated into a clear risk readout.",
    icon: (
      <path d="M4 13.5 8.5 9l3 3L19 4.5M19 4.5v6M19 4.5h-6M5 19h14" />
    )
  },
  {
    title: "AI-Powered Context",
    text: "Get plain-English summaries that explain what the raw token data may imply.",
    icon: (
      <path d="M12 3l1.35 4.15L17.5 8.5l-4.15 1.35L12 14l-1.35-4.15L6.5 8.5l4.15-1.35L12 3ZM5 14l.75 2.25L8 17l-2.25.75L5 20l-.75-2.25L2 17l2.25-.75L5 14ZM18 13l.9 2.7 2.7.9-2.7.9L18 20l-.9-2.7-2.7-.9 2.7-.9L18 13Z" />
    )
  },
  {
    title: "Built For Speed",
    text: "Paste a contract address and get a focused scan without digging through dashboards.",
    icon: (
      <path d="M13 3 5 14h6l-1 7 8-11h-6l1-7Z" />
    )
  },
  {
    title: "Investor-Friendly",
    text: "Designed for everyday traders who want sharper context before making a move.",
    icon: (
      <path d="M12 21s7-3.5 7-10V5l-7-2-7 2v6c0 6.5 7 10 7 10ZM9.5 11.5l1.75 1.75L15 9.5" />
    )
  }
];

const steps = [
  {
    title: "Paste a token address",
    text: "Start with the contract address you want Sigma to inspect."
  },
  {
    title: "Review the live scan",
    text: "Sigma evaluates key market signals and turns them into a readable profile."
  },
  {
    title: "Use the summary",
    text: "Get a concise AI explanation to support your own research before trading."
  }
];

const socials = [
  {
    name: "X",
    href: "https://x.com/usesigma?s=21",
    label: "Open Sigma on X",
    icon: (
      <path d="M13.74 10.38 21.13 2h-1.75l-6.42 7.28L7.83 2H1.92l7.75 11.02L1.92 21.8h1.75l6.78-7.69 5.42 7.69h5.91l-8.04-11.42Zm-2.4 2.72-.79-1.1L4.31 3.29h2.68l5.05 7.04.78 1.1 6.55 9.14h-2.68l-5.35-7.47Z" />
    )
  },
  {
    name: "Telegram",
    href: "https://t.me/sigmaofficialchat",
    label: "Open Sigma Telegram chat",
    icon: (
      <path d="M21.58 3.32a1.5 1.5 0 0 0-1.55-.22L3.24 9.58c-.72.28-1.18.78-1.22 1.34-.04.56.35 1.07 1.04 1.38l4.3 1.88 1.72 5.31c.22.67.62 1.07 1.12 1.11.43.03.86-.2 1.24-.66l2.25-2.75 4.4 3.26c.44.32.88.43 1.27.32.45-.13.78-.52.94-1.1L22.1 4.82c.18-.7-.01-1.22-.52-1.5ZM8.16 13.1l8.4-5.31-6.52 7.03-.25 2.87-1.05-3.24a1.7 1.7 0 0 0-.58-1.35Zm10.45 5.85-4.5-3.34a1 1 0 0 0-1.37.17l-1.18 1.44.14-1.57 7.07-7.62-1.23 10.72.07.05-.01.04Z" />
    )
  }
];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col overflow-hidden">
      <nav className="sticky top-0 z-30 border-b border-white/10 bg-ink/80 backdrop-blur-xl sm:static">
        <div className="relative mx-auto flex h-20 max-w-6xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="font-serif text-4xl font-bold italic tracking-normal text-white drop-shadow-[0_0_18px_rgba(84,240,178,0.28)] sm:text-5xl">
              Sigma
            </span>
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-slate-300">
              <span className="h-2 w-2 rounded-full bg-acid shadow-[0_0_18px_rgba(84,240,178,0.9)]" />
              Live token intelligence
            </div>
            <div className="flex items-center gap-2">
              {socials.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-slate-300 transition hover:border-acid/50 hover:text-acid focus:outline-none focus:ring-2 focus:ring-acid/60"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="currentColor"
                  >
                    {social.icon}
                  </svg>
                </a>
              ))}
            </div>
          </div>
          <details className="group sm:hidden">
            <summary
              aria-label="Open navigation menu"
              className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white transition hover:border-acid/50 [&::-webkit-details-marker]:hidden"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.8"
              >
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </summary>
            <div className="absolute right-5 top-16 z-20 w-56 rounded-3xl border border-white/10 bg-panel/95 p-3 shadow-glow backdrop-blur-xl">
              <a
                href="#get-started"
                className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/[0.06] hover:text-acid"
              >
                Get Started
              </a>
              <a
                href="#why-choose-us"
                className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/[0.06] hover:text-acid"
              >
                Why Choose Us
              </a>
              <a
                href="#how-it-works"
                className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/[0.06] hover:text-acid"
              >
                How It Works
              </a>
              <div className="my-2 h-px bg-white/10" />
              <div className="grid grid-cols-2 gap-2">
                {socials.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 text-sm font-medium text-slate-200 transition hover:border-acid/40 hover:text-acid"
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="currentColor"
                    >
                      {social.icon}
                    </svg>
                    {social.name}
                  </a>
                ))}
              </div>
            </div>
          </details>
        </div>
      </nav>

      <section
        id="get-started"
        className="mx-auto flex w-full max-w-6xl flex-col items-center px-5 py-14 sm:px-8 sm:py-20"
      >
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

      <section id="why-choose-us" className="border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-16">
          <div className="rounded-3xl border border-white/10 bg-ink/50 px-5 py-10 shadow-glow sm:px-8">
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-acid">
                Why Choose Us
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-normal text-white sm:text-4xl">
                Cleaner signal before the trade
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-400">
                Sigma cuts through noisy token data with fast, readable analysis
                built for confident first-pass decisions.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {reasons.map((reason) => (
                <article
                  key={reason.title}
                  className="group min-h-52 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center transition hover:-translate-y-1 hover:border-acid/40 hover:bg-white/[0.05]"
                >
                  <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-acid/30 bg-acid/10 text-acid transition group-hover:shadow-[0_0_28px_rgba(84,240,178,0.24)]">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                    >
                      {reason.icon}
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    {reason.title}
                  </h3>
                  <p className="mx-auto mt-3 max-w-56 text-sm leading-6 text-slate-400">
                    {reason.text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-acid">
            How It Works
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-normal text-white sm:text-4xl">
            From address to insight in seconds
          </h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <article
              key={step.title}
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-center transition hover:-translate-y-1 hover:border-cyan/40 hover:bg-white/[0.05]"
            >
              <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan/30 bg-cyan/10 text-sm font-semibold text-cyan">
                {index + 1}
              </div>
              <h3 className="text-lg font-semibold text-white">{step.title}</h3>
              <p className="mx-auto mt-3 max-w-64 text-sm leading-6 text-slate-400">
                {step.text}
              </p>
            </article>
          ))}
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
