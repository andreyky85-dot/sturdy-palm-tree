import type { Metadata } from "next";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Генератор",
  description:
    "Вставьте текст или ссылку на YouTube — получите идеи постов для соцсетей и конспект.",
};

export default function GeneratorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
