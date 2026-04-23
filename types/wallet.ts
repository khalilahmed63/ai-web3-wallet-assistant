export type ActivityLevel = "low" | "medium" | "high";

export type BehaviorType = "trader" | "holder" | "farmer";

export interface TokenBalance {
  tokenAddress: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: string;
  balanceFormatted: number;
  usdPrice: number;
  usdValue: number;
}

export interface WalletTransaction {
  hash: string;
  fromAddress: string;
  toAddress: string;
  valueNative: number;
  timestamp: string;
}

export interface WalletData {
  address: string;
  totalTokenUsdValue: number;
  tokens: TokenBalance[];
  transactions: WalletTransaction[];
}

export interface PortfolioSummary {
  totalValue: number;
  topTokens: Array<{
    symbol: string;
    value: number;
    allocationPct: number;
  }>;
}

export interface WalletAnalysis {
  portfolio: PortfolioSummary;
  behaviorType: BehaviorType;
  activityLevel: ActivityLevel;
  keyStats: {
    tokenCount: number;
    transactionCount: number;
    avgTransactionValue: number;
    activeDays: number;
  };
}

export interface WalletInsightsResponse {
  insights: string[];
  riskLevel: "low" | "medium" | "high";
}
