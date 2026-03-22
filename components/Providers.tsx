"use client";

import { SessionProvider } from "next-auth/react";

/**
 * Обёртка для клиентских хуков next-auth (useSession и т.д.) на страницах с интерактивом.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider refetchInterval={0}>{children}</SessionProvider>;
}
