import { InMemoryTtlCache } from "@/lib/utils/cache";
import type { TokenBalance, WalletAnalysis } from "@/types/wallet";

export type AnalyzeWalletResponse = {
  address: string;
  analysis: WalletAnalysis;
  tokens: TokenBalance[];
  insights: string[];
  riskLevel: "low" | "medium" | "high";
};

export const walletAnalysisCache = new InMemoryTtlCache<AnalyzeWalletResponse>(
  2 * 60 * 1000,
);
