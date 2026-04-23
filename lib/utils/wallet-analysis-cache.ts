import { InMemoryTtlCache } from "@/lib/utils/cache";
import type { WalletAnalysis } from "@/types/wallet";

export type AnalyzeWalletResponse = {
  address: string;
  analysis: WalletAnalysis;
  insights: string[];
  riskLevel: "low" | "medium" | "high";
};

export const walletAnalysisCache = new InMemoryTtlCache<AnalyzeWalletResponse>(
  2 * 60 * 1000,
);
