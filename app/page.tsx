import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

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

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col overflow-hidden">
      <SiteHeader />

      <section className="mx-auto flex w-full max-w-6xl flex-col items-center px-5 py-14 text-center sm:px-8 sm:py-20">
        <p className="mb-4 inline-flex rounded-full border border-acid/30 bg-acid/10 px-4 py-2 text-sm font-medium text-acid">
          Crypto risk analysis for everyday investors
        </p>
        <h1 className="max-w-3xl text-5xl font-semibold leading-tight tracking-normal text-white drop-shadow-[0_0_18px_rgba(84,240,178,0.14)] sm:text-7xl">
          AI-Powered Token Risk Analysis
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
          Instantly analyze token risk, liquidity, and trading activity with
          AI-powered insights.
        </p>
        <Link
          href="/get-started"
          className="mt-9 inline-flex min-h-14 items-center justify-center rounded-2xl bg-acid px-7 font-extrabold text-ink transition hover:bg-[#7af7c5] focus:outline-none focus:ring-4 focus:ring-acid/20"
        >
          Launch App
        </Link>
      </section>

      <section id="why-choose-us" className="border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-16">
          <div className="rounded-3xl border border-white/10 bg-ink/50 px-5 py-10 shadow-glow sm:px-8">
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-acid">
                Why Choose Us
              </p>
              <h2 className="mt-3 text-4xl font-semibold leading-tight tracking-normal text-white drop-shadow-[0_0_14px_rgba(84,240,178,0.12)] sm:text-5xl">
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
          <h2 className="mt-3 text-4xl font-semibold leading-tight tracking-normal text-white drop-shadow-[0_0_14px_rgba(91,200,255,0.12)] sm:text-5xl">
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

      <SiteFooter />
    </main>
  );
}
