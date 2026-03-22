import { prisma } from "@/lib/db";

/** Лимит бесплатного тарифа за календарный месяц (UTC), совпадает с описанием на лендинге */
export const FREE_MONTHLY_GENERATION_LIMIT = 5;

/**
 * Границы текущего календарного месяца в UTC — предсказуемый подсчёт без TZ-сюрпризов на сервере.
 * O(1) по времени и памяти.
 */
export function getCurrentMonthRangeUtc(): { start: Date; endExclusive: Date } {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  const start = new Date(Date.UTC(y, m, 1, 0, 0, 0, 0));
  const endExclusive = new Date(Date.UTC(y, m + 1, 1, 0, 0, 0, 0));
  return { start, endExclusive };
}

export async function checkUsage(userId: string): Promise<{
  allowed: boolean;
  used: number;
  limit: number;
}> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return { allowed: false, used: 0, limit: FREE_MONTHLY_GENERATION_LIMIT };
  }

  if (user.plan === "PRO") {
    const { start, endExclusive } = getCurrentMonthRangeUtc();
    const used = await prisma.generation.count({
      where: { userId, createdAt: { gte: start, lt: endExclusive } },
    });
    return { allowed: true, used, limit: 0 };
  }

  const { start, endExclusive } = getCurrentMonthRangeUtc();
  const used = await prisma.generation.count({
    where: { userId, createdAt: { gte: start, lt: endExclusive } },
  });
  const limit = FREE_MONTHLY_GENERATION_LIMIT;
  return { allowed: used < limit, used, limit };
}

export async function incrementUsage(userId: string): Promise<void> {
  await prisma.generation.create({ data: { userId } });
}

/** Данные для дашборда: один запрос user + count за месяц */
export async function getUsageSnapshotForUser(userId: string): Promise<{
  used: number;
  limit: number;
  plan: string;
  hasBilling: boolean;
} | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, stripeCustomerId: true },
  });
  if (!user) {
    return null;
  }
  const { start, endExclusive } = getCurrentMonthRangeUtc();
  const used = await prisma.generation.count({
    where: { userId, createdAt: { gte: start, lt: endExclusive } },
  });
  const limit = user.plan === "PRO" ? 0 : FREE_MONTHLY_GENERATION_LIMIT;
  return {
    used,
    limit,
    plan: user.plan,
    hasBilling: Boolean(user.stripeCustomerId),
  };
}
