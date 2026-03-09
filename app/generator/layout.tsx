import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Generate content",
  description:
    "Paste a YouTube video URL and get 10 Twitter posts, 5 LinkedIn posts, 3 TikTok ideas, and a blog summary.",
};

export default function GeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
