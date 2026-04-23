import { NextResponse } from "next/server";
import { z } from "zod";
import { isAddress } from "viem";
import { generateWalletInsights } from "@/lib/ai/huggingface";
import { analyzeWallet } from "@/lib/ai/wallet-analysis";
import {
  walletAnalysisCache,
  type AnalyzeWalletResponse,
} from "@/lib/utils/wallet-analysis-cache";
import { getWalletData } from "@/lib/web3/moralis";

const analyzeWalletSchema = z.object({
  address: z.string().trim().min(1, "Wallet address is required."),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = analyzeWalletSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request payload." },
        { status: 400 },
      );
    }

    const address = parsed.data.address;

    if (!isAddress(address)) {
      return NextResponse.json(
        { error: "Invalid EVM wallet address format." },
        { status: 400 },
      );
    }

    const cacheKey = address.toLowerCase();
    const cachedResponse = walletAnalysisCache.get(cacheKey);

    if (cachedResponse) {
      return NextResponse.json(cachedResponse, {
        status: 200,
        headers: {
          "x-cache": "HIT",
        },
      });
    }

    const walletData = await getWalletData(address);
    const analysis = analyzeWallet(walletData);
    const aiResponse = await generateWalletInsights(analysis);
    const payload: AnalyzeWalletResponse = {
      address,
      analysis,
      insights: aiResponse.insights,
      riskLevel: aiResponse.riskLevel,
    };

    walletAnalysisCache.set(cacheKey, payload);

    return NextResponse.json(payload, {
      status: 200,
      headers: {
        "x-cache": "MISS",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error occurred.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
