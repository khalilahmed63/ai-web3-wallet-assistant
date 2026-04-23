import type { TokenBalance, WalletData, WalletTransaction } from "@/types/wallet";

const ETHERSCAN_BASE_URL = "https://api.etherscan.io/api";

type EtherscanEnvelope<T> = {
  status: string;
  message: string;
  result: T;
};

type EtherscanTx = {
  hash: string;
  from: string;
  to: string;
  value: string;
  timeStamp: string;
};

type EtherscanTokenTx = {
  tokenName: string;
  tokenSymbol: string;
  tokenDecimal: string;
  contractAddress: string;
  from: string;
  to: string;
  value: string;
};

function parseAmount(value: string, decimals: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || decimals < 0) {
    return 0;
  }
  return parsed / 10 ** decimals;
}

async function etherscanFetch<T>(params: URLSearchParams): Promise<EtherscanEnvelope<T>> {
  const apiKey = process.env.ETHERSCAN_API_KEY?.trim() || "YourApiKeyToken";
  params.set("apikey", apiKey);

  const url = `${ETHERSCAN_BASE_URL}?${params.toString()}`;
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Etherscan request failed (${response.status}): ${body || response.statusText}`,
    );
  }

  return response.json() as Promise<EtherscanEnvelope<T>>;
}

function normalizeTransactions(rows: EtherscanTx[]): WalletTransaction[] {
  return rows.map((tx) => ({
    hash: tx.hash,
    fromAddress: tx.from,
    toAddress: tx.to,
    valueNative: parseAmount(tx.value, 18),
    timestamp: new Date(Number(tx.timeStamp) * 1000).toISOString(),
  }));
}

function normalizeTokenBalances(rows: EtherscanTokenTx[], address: string): TokenBalance[] {
  const lowerAddress = address.toLowerCase();
  const byContract = new Map<
    string,
    {
      name: string;
      symbol: string;
      decimals: number;
      rawBalance: bigint;
    }
  >();
  const zero = BigInt(0);
  const one = BigInt(1);
  const minusOne = BigInt(-1);

  for (const tx of rows) {
    const contract = tx.contractAddress;
    const decimals = Number(tx.tokenDecimal || 18);
    const amount = BigInt(tx.value || "0");
    const direction = tx.to?.toLowerCase() === lowerAddress ? one : minusOne;
    const signedAmount = amount * direction;

    const existing = byContract.get(contract) ?? {
      name: tx.tokenName || "Unknown Token",
      symbol: tx.tokenSymbol || "UNKNOWN",
      decimals,
      rawBalance: zero,
    };

    existing.rawBalance += signedAmount;
    byContract.set(contract, existing);
  }

  return Array.from(byContract.entries())
    .filter(([, token]) => token.rawBalance > zero)
    .map(([contract, token]) => {
      const raw = token.rawBalance.toString();
      return {
        tokenAddress: contract,
        symbol: token.symbol,
        name: token.name,
        decimals: token.decimals,
        balance: raw,
        balanceFormatted: parseAmount(raw, token.decimals),
        usdPrice: 0,
        usdValue: 0,
      };
    })
    .sort((a, b) => b.balanceFormatted - a.balanceFormatted);
}

export async function getWalletDataFromEtherscan(address: string): Promise<WalletData> {
  const [txResp, tokenTxResp] = await Promise.all([
    etherscanFetch<EtherscanTx[]>(
      new URLSearchParams({
        module: "account",
        action: "txlist",
        address,
        startblock: "0",
        endblock: "99999999",
        page: "1",
        offset: "30",
        sort: "desc",
      }),
    ),
    etherscanFetch<EtherscanTokenTx[]>(
      new URLSearchParams({
        module: "account",
        action: "tokentx",
        address,
        startblock: "0",
        endblock: "99999999",
        page: "1",
        offset: "200",
        sort: "desc",
      }),
    ),
  ]);

  const txRows = Array.isArray(txResp.result) ? txResp.result : [];
  const tokenRows = Array.isArray(tokenTxResp.result) ? tokenTxResp.result : [];

  const transactions = normalizeTransactions(txRows);
  const tokens = normalizeTokenBalances(tokenRows, address);

  return {
    address,
    totalTokenUsdValue: 0,
    tokens,
    transactions,
  };
}
