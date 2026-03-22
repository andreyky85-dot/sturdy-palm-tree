import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-geist-sans",
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://textflow.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "TextFlow — идеи постов из любого текста",
    template: "%s | TextFlow",
  },
  description:
    "TextFlow превращает любой текст в идеи для постов, коротких видео и блога. Вставьте текст — получите готовые форматы для соцсетей.",
  keywords: [
    "генератор постов",
    "идея для поста",
    "контент для соцсетей",
    "ai генератор текста",
    "textflow",
  ],
  authors: [{ name: "TextFlow" }],
  creator: "TextFlow",
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: siteUrl,
    siteName: "TextFlow",
    title: "TextFlow — идеи постов из любого текста",
    description:
      "Вставьте текст и получите идеи для постов, коротких видео и блога. Без лишних настроек.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "TextFlow — идеи постов из любого текста",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TextFlow — идеи постов из любого текста",
    description: "AI превращает ваш текст в контент для соцсетей и блога.",
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
      <body className="min-h-screen font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
