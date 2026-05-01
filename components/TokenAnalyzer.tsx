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
      const response = await fetch("/api/analyze", {
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
        className="rounded-[1.75rem] border border-primary/15 bg-white/[0.04] p-4 shadow-glow backdrop-blur-xl sm:p-6"
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
            className="min-h-14 flex-1 rounded-2xl border border-primary/15 bg-ink/80 px-5 text-base text-white outline-none transition placeholder:text-white/40 focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-primary to-teal px-6 font-semibold text-white shadow-teal transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/25 border-t-white" />
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

      <p className="mt-4 text-center text-sm text-white/60">
        Deep forensics scans can take a few extra seconds while SIGMA checks
        market, launch, and holder distribution data.
      </p>

      {result ? <ResultCard result={result} /> : null}
    </div>
  );
}
