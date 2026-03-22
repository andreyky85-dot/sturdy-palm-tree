import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Аккаунт TextFlow: использование и настройки.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
