"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { WalletAnalysis } from "@/types/wallet";

interface AnalyzeWalletApiResponse {
  address: string;
  analysis: WalletAnalysis;
  insights: string[];
  riskLevel: "low" | "medium" | "high";
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function WalletDashboard() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeWalletApiResponse | null>(null);

  const onAnalyze = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/analyze-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });

      const data = (await response.json()) as AnalyzeWalletApiResponse | { error: string };

      if (!response.ok) {
        throw new Error("error" in data ? data.error : "Failed to analyze wallet.");
      }

      setResult(data as AnalyzeWalletApiResponse);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to analyze wallet right now.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[#070b1a]">
      <div className="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-cyan-500/30 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-20 h-80 w-80 rounded-full bg-violet-500/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-fuchsia-500/20 blur-3xl" />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 md:px-8">
        <Card className="relative overflow-hidden border-cyan-300/20 bg-slate-900/55 text-white">
          <div className="absolute -right-14 -top-14 h-36 w-36 rounded-full bg-cyan-400/25 blur-2xl" />
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">AI x Web3 Intelligence</p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight md:text-5xl">
            Wallet signals,
            <span className="bg-gradient-to-r from-cyan-300 to-violet-300 bg-clip-text text-transparent">
              {" "}
              translated for humans
            </span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-slate-300 md:text-base">
            Drop in any wallet address to get portfolio context, behavior patterns, and risk
            signals in seconds.
          </p>
        </Card>

        <Card className="border-slate-300/20 bg-slate-900/45">
          <div className="flex flex-col gap-4 md:flex-row">
            <input
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="Paste wallet address (0x...)"
              className="w-full rounded-2xl border border-slate-600/70 bg-slate-900/75 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-400 focus:border-cyan-400"
            />
            <Button
              onClick={onAnalyze}
              disabled={loading || !address.trim()}
              className="md:min-w-40"
            >
              {loading ? "Analyzing..." : "Analyze Wallet"}
            </Button>
          </div>
          {error && (
            <p className="mt-3 rounded-xl border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-200">
              {error}
            </p>
          )}
        </Card>

        {result && (
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-white">AI Insights</h2>
                <span className="rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-cyan-200">
                  Main Highlight
                </span>
              </div>
              <ul className="mt-4 space-y-3 text-sm text-slate-200">
                {result.insights.map((insight) => (
                  <li
                    key={insight}
                    className="rounded-xl border border-white/10 bg-white/5 p-3 leading-relaxed"
                  >
                    {insight}
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <h2 className="text-lg font-semibold text-white">Key Stats</h2>
              <div className="mt-4 space-y-3 text-sm text-slate-200">
                <p className="flex items-center justify-between gap-4">
                  <span className="text-slate-400">Risk Level</span>
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs uppercase">
                    {result.riskLevel}
                  </span>
                </p>
                <p className="flex items-center justify-between gap-4">
                  <span className="text-slate-400">Behavior</span>
                  <span className="font-medium capitalize">{result.analysis.behaviorType}</span>
                </p>
                <p className="flex items-center justify-between gap-4">
                  <span className="text-slate-400">Activity</span>
                  <span className="font-medium capitalize">{result.analysis.activityLevel}</span>
                </p>
                <p className="flex items-center justify-between gap-4">
                  <span className="text-slate-400">Tokens</span>
                  <span className="font-medium">{result.analysis.keyStats.tokenCount}</span>
                </p>
                <p className="flex items-center justify-between gap-4">
                  <span className="text-slate-400">Transactions</span>
                  <span className="font-medium">{result.analysis.keyStats.transactionCount}</span>
                </p>
              </div>
            </Card>

            <Card className="lg:col-span-3">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <h2 className="text-lg font-semibold text-white">Portfolio Summary</h2>
                <p className="text-sm text-slate-300">
                  Total Value:{" "}
                  <span className="text-base font-semibold text-cyan-300">
                    {formatCurrency(result.analysis.portfolio.totalValue)}
                  </span>
                </p>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {result.analysis.portfolio.topTokens.map((token) => (
                  <div
                    key={token.symbol}
                    className="rounded-2xl border border-white/10 bg-slate-900/45 p-4"
                  >
                    <p className="font-semibold text-white">{token.symbol}</p>
                    <p className="mt-1 text-sm text-slate-300">{formatCurrency(token.value)}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {token.allocationPct.toFixed(1)}% allocation
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
