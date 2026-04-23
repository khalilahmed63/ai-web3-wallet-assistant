import type { WalletAnalysis, WalletData } from "@/types/wallet";

function detectBehaviorType(data: WalletData): WalletAnalysis["behaviorType"] {
  const txCount = data.transactions.length;
  const tokenCount = data.tokens.length;
  const hasManySmallPositions = data.tokens.filter((token) => token.usdValue < 250).length > 8;

  if (txCount > 20) {
    return "trader";
  }

  if (hasManySmallPositions || tokenCount > 15) {
    return "farmer";
  }

  return "holder";
}

function detectActivityLevel(txCount: number): WalletAnalysis["activityLevel"] {
  if (txCount <= 5) {
    return "low";
  }
  if (txCount <= 20) {
    return "medium";
  }
  return "high";
}

function countActiveDays(timestamps: string[]): number {
  const daySet = new Set(
    timestamps
      .filter(Boolean)
      .map((timestamp) => new Date(timestamp).toISOString().split("T")[0]),
  );

  return daySet.size;
}

export function analyzeWallet(data: WalletData): WalletAnalysis {
  const totalValue = data.totalTokenUsdValue;
  const txCount = data.transactions.length;
  const totalTxValue = data.transactions.reduce((sum, tx) => sum + tx.valueNative, 0);
  const avgTransactionValue = txCount > 0 ? totalTxValue / txCount : 0;
  const topTokens = data.tokens.slice(0, 5).map((token) => ({
    symbol: token.symbol,
    value: token.usdValue,
    allocationPct: totalValue > 0 ? (token.usdValue / totalValue) * 100 : 0,
  }));

  return {
    portfolio: {
      totalValue,
      topTokens,
    },
    behaviorType: detectBehaviorType(data),
    activityLevel: detectActivityLevel(txCount),
    keyStats: {
      tokenCount: data.tokens.length,
      transactionCount: txCount,
      avgTransactionValue,
      activeDays: countActiveDays(data.transactions.map((tx) => tx.timestamp)),
    },
  };
}
