import Image from "next/image";
import TokenAnalyzer from "@/components/TokenAnalyzer";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden">
      <nav className="border-b border-white/10 bg-ink/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="SIGMA"
              width={200}
              height={200}
              priority
              className="w-16 h-16 object-contain"
            />
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
    </main>
  );
}
