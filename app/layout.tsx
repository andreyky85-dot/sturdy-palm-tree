import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-geist-sans",
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://contentmultiplier.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Content Multiplier — Turn 1 Video Into 19+ Social Posts in Seconds",
    template: "%s | Content Multiplier",
  },
  description:
    "AI-powered tool that turns one YouTube or TikTok video into 10 Twitter posts, 5 LinkedIn posts, 3 TikTok ideas, and a blog summary. Free tier available. Built for creators and marketers.",
  keywords: [
    "content repurposing",
    "YouTube to social media",
    "TikTok to Twitter",
    "AI content generator",
    "social media automation",
    "video to blog",
    "content multiplier",
    "repurpose video",
  ],
  authors: [{ name: "Content Multiplier" }],
  creator: "Content Multiplier",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Content Multiplier",
    title: "Content Multiplier — Turn 1 Video Into 19+ Social Posts in Seconds",
    description:
      "Paste a video link. Get 10 Twitter posts, 5 LinkedIn posts, 3 TikTok ideas, and a blog summary. AI-powered, one click.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Content Multiplier — One video, many posts",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Content Multiplier — Turn 1 Video Into 19+ Social Posts",
    description: "AI repurposes your video into Twitter, LinkedIn, TikTok & blog content. Free tier.",
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: { canonical: siteUrl },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
