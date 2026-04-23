import { NextResponse } from "next/server";
import { walletAnalysisCache } from "@/lib/utils/wallet-analysis-cache";

export async function GET() {
  const stats = walletAnalysisCache.getStats();
  return NextResponse.json(
    {
      cache: {
        name: "wallet-analysis",
        ...stats,
      },
    },
    { status: 200 },
  );
}
