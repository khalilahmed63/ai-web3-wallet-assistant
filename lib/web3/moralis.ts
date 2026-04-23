import type { TokenBalance, WalletData, WalletTransaction } from "@/types/wallet";
import { getRequiredEnv } from "@/lib/utils/env";
import { getWalletDataFromEtherscan } from "@/lib/web3/etherscan";

const MORALIS_BASE_URL = "https://deep-index.moralis.io/api/v2.2";
const DEFAULT_CHAIN = "eth";

interface MoralisTokenBalanceResponse {
  token_address: string;
  symbol: string;
  name: string;
  decimals: string;
  balance: string;
  usd_price?: number;
  usd_value?: number;
}

interface MoralisTransactionsResponse {
  result: Array<{
    hash: string;
    from_address: string;
    to_address: string;
    value: string;
    block_timestamp: string;
  }>;
}

function toFormattedBalance(balance: string, decimals: number): number {
  const parsed = Number(balance);
  if (!Number.isFinite(parsed) || decimals < 0) {
    return 0;
  }
  return parsed / 10 ** decimals;
}

async function moralisFetch<T>(endpoint: string): Promise<T> {
  const apiKey = getRequiredEnv("MORALIS_API_KEY");

  let response: Response;
  try {
    response = await fetch(`${MORALIS_BASE_URL}${endpoint}`, {
      headers: {
        accept: "application/json",
        "X-API-Key": apiKey,
      },
      cache: "no-store",
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Moralis network request failed. Check internet/proxy/firewall access to deep-index.moralis.io. Root cause: ${error.message}`,
      );
    }
    throw new Error(
      "Moralis network request failed. Check internet/proxy/firewall access to deep-index.moralis.io.",
    );
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Moralis request failed (${response.status}): ${body || response.statusText}`,
    );
  }

  return response.json() as Promise<T>;
}

function normalizeTokens(rows: MoralisTokenBalanceResponse[]): TokenBalance[] {
  return rows
    .map((item) => {
      const decimals = Number(item.decimals || 18);
      const balanceFormatted = toFormattedBalance(item.balance, decimals);
      const usdPrice = item.usd_price ?? 0;
      const usdValue = item.usd_value ?? balanceFormatted * usdPrice;

      return {
        tokenAddress: item.token_address,
        symbol: item.symbol || "UNKNOWN",
        name: item.name || "Unknown Token",
        decimals,
        balance: item.balance,
        balanceFormatted,
        usdPrice,
        usdValue,
      };
    })
    .sort((a, b) => b.usdValue - a.usdValue);
}

function normalizeTransactions(rows: MoralisTransactionsResponse["result"]): WalletTransaction[] {
  return rows.map((tx) => ({
    hash: tx.hash,
    fromAddress: tx.from_address,
    toAddress: tx.to_address,
    valueNative: Number(tx.value) / 1e18,
    timestamp: tx.block_timestamp,
  }));
}

export async function getWalletData(address: string): Promise<WalletData> {
  if (!address?.trim()) {
    throw new Error("Wallet address is required.");
  }

  const normalizedAddress = address.trim();

  try {
    const [tokensRaw, txRaw] = await Promise.all([
      moralisFetch<MoralisTokenBalanceResponse[]>(
        `/${normalizedAddress}/erc20?chain=${DEFAULT_CHAIN}`,
      ),
      moralisFetch<MoralisTransactionsResponse>(
        `/${normalizedAddress}?chain=${DEFAULT_CHAIN}&limit=30`,
      ),
    ]);

    const tokens = normalizeTokens(tokensRaw);
    const transactions = normalizeTransactions(txRaw.result ?? []);
    const totalTokenUsdValue = tokens.reduce((sum, token) => sum + token.usdValue, 0);

    return {
      address: normalizedAddress,
      totalTokenUsdValue,
      tokens,
      transactions,
    };
  } catch (error) {
    const isMoralisNetworkError =
      error instanceof Error &&
      (error.message.includes("Moralis network request failed") ||
        error.message.includes("fetch failed"));

    if (isMoralisNetworkError) {
      try {
        return await getWalletDataFromEtherscan(normalizedAddress);
      } catch (fallbackError) {
        if (fallbackError instanceof Error) {
          throw new Error(
            `Failed to fetch wallet data from Moralis and Etherscan fallback: ${fallbackError.message}`,
          );
        }
        throw new Error(
          "Failed to fetch wallet data from Moralis and Etherscan fallback due to an unknown error.",
        );
      }
    }

    if (error instanceof Error) {
      throw new Error(`Failed to fetch wallet data: ${error.message}`);
    }
    throw new Error("Failed to fetch wallet data due to an unknown error.");
  }
}
