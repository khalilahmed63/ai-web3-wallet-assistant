import type { WalletAnalysis, WalletInsightsResponse } from "@/types/wallet";

const HUGGING_FACE_API_URL =
  "https://api-inference.huggingface.co/models/google/flan-t5-large";

function getRiskLevel(analysis: WalletAnalysis): WalletInsightsResponse["riskLevel"] {
  if (analysis.activityLevel === "high" && analysis.behaviorType === "trader") {
    return "high";
  }
  if (analysis.activityLevel === "low" && analysis.behaviorType === "holder") {
    return "low";
  }
  return "medium";
}

function buildPrompt(analysis: WalletAnalysis): string {
  return [
    "You are a Web3 analyst.",
    "Given wallet data analysis, explain:",
    "1. What this wallet does",
    "2. Its behavior (trader, holder, etc.)",
    "3. Risk level (low, medium, high)",
    "4. Key insights",
    "",
    "Rules:",
    "- Keep it simple",
    "- No technical jargon",
    "- Max 5-6 bullet points",
    "- Sound like a human analyst",
    "",
    "Wallet analysis:",
    JSON.stringify(analysis, null, 2),
  ].join("\n");
}

function normalizeInsights(output: string): string[] {
  return output
    .split("\n")
    .map((line) => line.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 6);
}

function buildFallbackInsights(
  analysis: WalletAnalysis,
  riskLevel: WalletInsightsResponse["riskLevel"],
): string[] {
  const { portfolio, behaviorType, activityLevel, keyStats } = analysis;
  const topToken = portfolio.topTokens[0];

  return [
    `This wallet mostly behaves like a ${behaviorType} with ${activityLevel} activity.`,
    `Estimated portfolio value is around $${portfolio.totalValue.toFixed(0)} with ${keyStats.tokenCount} tracked token positions.`,
    topToken
      ? `${topToken.symbol} appears to be the largest position at about ${topToken.allocationPct.toFixed(1)}% of the portfolio.`
      : "No major token concentration was detected yet.",
    `Recent on-chain activity includes ${keyStats.transactionCount} transactions across ${keyStats.activeDays} active days.`,
    `Overall risk level is ${riskLevel}. This score is based on activity intensity and behavior pattern.`,
  ];
}

export async function generateWalletInsights(
  analysis: WalletAnalysis,
): Promise<WalletInsightsResponse> {
  const riskLevel = getRiskLevel(analysis);
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  let response: Response;

  try {
    response = await fetch(HUGGING_FACE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({
        inputs: buildPrompt(analysis),
        parameters: {
          max_new_tokens: 220,
          temperature: 0.3,
          return_full_text: false,
        },
      }),
    });
  } catch {
    return {
      insights: buildFallbackInsights(analysis, riskLevel),
      riskLevel,
    };
  }

  try {
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(
        `Hugging Face request failed (${response.status}): ${body || response.statusText}`,
      );
    }

    const output = (await response.json()) as
      | Array<{ generated_text?: string }>
      | { generated_text?: string; error?: string };

    if (!Array.isArray(output) && output.error) {
      throw new Error(output.error);
    }

    const text = (
      Array.isArray(output) ? output[0]?.generated_text : output.generated_text
    )?.trim();

    if (!text) {
      throw new Error("Hugging Face returned an empty response.");
    }

    return {
      insights: normalizeInsights(text),
      riskLevel,
    };
  } catch {
    return {
      insights: buildFallbackInsights(analysis, riskLevel),
      riskLevel,
    };
  }
}
