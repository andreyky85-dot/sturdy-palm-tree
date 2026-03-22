import { PrismaClient } from "@prisma/client";

/**
 * Единственный экземпляр Prisma в процессе Node (dev hot-reload не плодит соединения).
 * В Edge Runtime этот модуль не использовать — только в Route Handlers / Server Components на Node.
 */
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
