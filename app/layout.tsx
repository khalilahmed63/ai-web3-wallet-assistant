import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "AI Web3 Wallet Assistant - Wallet Intelligence Dashboard",
    template: "%s | AI Web3 Wallet Assistant",
  },
  description:
    "Analyze crypto wallets with AI-powered insights, portfolio breakdowns, behavior detection, and simple risk analysis.",
  keywords: [
    "AI Web3 wallet assistant",
    "crypto wallet analyzer",
    "wallet behavior analysis",
    "wallet risk analysis",
    "portfolio insights dashboard",
    "on-chain wallet intelligence",
    "Moralis wallet API",
    "Hugging Face AI insights",
    "Web3 analytics dashboard",
    "Next.js Web3 project",
  ],
  authors: [{ name: "Khalil Ahmed", url: "https://www.khalilahmed.dev" }],
  creator: "Khalil Ahmed",
  metadataBase: new URL("https://ai-web3-assistant.vercel.app/"),
  openGraph: {
    title: "AI Web3 Wallet Assistant - Wallet Intelligence Dashboard",
    description:
      "Understand what any wallet does with clear AI-generated insights, behavior patterns, and portfolio summaries.",
    url: "https://ai-web3-assistant.vercel.app/",
    siteName: "AI Web3 Wallet Assistant",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AI Web3 Wallet Assistant Dashboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Web3 Wallet Assistant - Wallet Intelligence Dashboard",
    description:
      "Analyze wallet behavior, risk level, and portfolio insights with a fast modern AI Web3 dashboard.",
    images: ["/screenshots/1.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
