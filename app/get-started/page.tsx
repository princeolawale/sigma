import type { Metadata } from "next";
import TokenAnalyzer from "@/components/TokenAnalyzer";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: "Launch App | Sigma",
  description: "Paste a token contract address and run a Sigma risk analysis."
};

export default function GetStartedPage() {
  return (
    <main className="flex min-h-screen flex-col overflow-hidden">
      <SiteHeader />

      <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center px-5 py-14 text-center sm:px-8 sm:py-20">
        <p className="mb-4 inline-flex rounded-full border border-acid/30 bg-acid/10 px-4 py-2 text-sm font-medium text-acid">
          Launch app
        </p>
        <h1 className="max-w-3xl text-5xl font-semibold leading-tight tracking-normal text-white drop-shadow-[0_0_18px_rgba(84,240,178,0.14)] sm:text-7xl">
          Analyze token risk
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
          Drop in a contract address to review liquidity, trading activity, risk
          score, and an AI-powered summary.
        </p>

        <TokenAnalyzer />
      </section>

      <SiteFooter />
    </main>
  );
}
