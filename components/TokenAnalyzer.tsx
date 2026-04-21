"use client";

import { FormEvent, useState } from "react";
import ResultCard, { TokenAnalysisResult } from "@/components/ResultCard";

interface AnalyzeResponse {
  data?: TokenAnalysisResult;
  error?: string;
}

export default function TokenAnalyzer() {
  const [address, setAddress] = useState("");
  const [result, setResult] = useState<TokenAnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedAddress = address.trim();
    if (!trimmedAddress) {
      setError("Enter a token contract address to analyze.");
      setResult(null);
      return;
    }

    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/token/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ address: trimmedAddress })
      });

      const payload = (await response.json()) as AnalyzeResponse;

      if (!response.ok || !payload.data) {
        throw new Error(payload.error ?? "Unable to analyze this token.");
      }

      setResult(payload.data);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to analyze this token.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mt-12 w-full max-w-4xl">
      <form
        onSubmit={handleSubmit}
        className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-4 shadow-glow backdrop-blur-xl sm:p-6"
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="contract-address">
            Token contract address
          </label>
          <input
            id="contract-address"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder="Paste token contract address"
            className="min-h-14 flex-1 rounded-2xl border border-white/10 bg-ink/80 px-5 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-acid/70 focus:ring-4 focus:ring-acid/10"
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-acid px-6 font-semibold text-ink transition hover:bg-[#7af7c5] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-ink/25 border-t-ink" />
                Analyzing
              </>
            ) : (
              "Analyze Token"
            )}
          </button>
        </div>

        {error ? (
          <p className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        ) : null}
      </form>

      {result ? <ResultCard result={result} /> : null}
    </div>
  );
}
