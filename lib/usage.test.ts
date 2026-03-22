import { describe, it, expect, vi, beforeEach } from "vitest";
import { getCurrentMonthRangeUtc, FREE_MONTHLY_GENERATION_LIMIT } from "./usage";

vi.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    generation: {
      count: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/db";
import { checkUsage, incrementUsage } from "./usage";

describe("getCurrentMonthRangeUtc", () => {
  it("start раньше endExclusive", () => {
    const { start, endExclusive } = getCurrentMonthRangeUtc();
    expect(start.getTime()).toBeLessThan(endExclusive.getTime());
  });
});

describe("checkUsage (с моком Prisma)", () => {
  beforeEach(() => {
    vi.mocked(prisma.user.findUnique).mockReset();
    vi.mocked(prisma.generation.count).mockReset();
  });

  it("без пользователя — запрещено", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);
    const r = await checkUsage("u1");
    expect(r.allowed).toBe(false);
    expect(r.limit).toBe(FREE_MONTHLY_GENERATION_LIMIT);
  });

  it("PRO — разрешено, лимит 0 в смысле безлимита для UI", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: "u1",
      plan: "PRO",
    } as never);
    vi.mocked(prisma.generation.count).mockResolvedValueOnce(42);
    const r = await checkUsage("u1");
    expect(r.allowed).toBe(true);
    expect(r.used).toBe(42);
    expect(r.limit).toBe(0);
  });

  it("FREE и used < limit — разрешено", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: "u1",
      plan: "FREE",
    } as never);
    vi.mocked(prisma.generation.count).mockResolvedValueOnce(3);
    const r = await checkUsage("u1");
    expect(r.allowed).toBe(true);
    expect(r.used).toBe(3);
    expect(r.limit).toBe(FREE_MONTHLY_GENERATION_LIMIT);
  });

  it("FREE и used >= limit — запрещено", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: "u1",
      plan: "FREE",
    } as never);
    vi.mocked(prisma.generation.count).mockResolvedValueOnce(FREE_MONTHLY_GENERATION_LIMIT);
    const r = await checkUsage("u1");
    expect(r.allowed).toBe(false);
  });
});

describe("incrementUsage", () => {
  beforeEach(() => {
    vi.mocked(prisma.generation.create).mockReset();
  });

  it("создаёт запись Generation", async () => {
    vi.mocked(prisma.generation.create).mockResolvedValueOnce({} as never);
    await incrementUsage("user-1");
    expect(prisma.generation.create).toHaveBeenCalledWith({ data: { userId: "user-1" } });
  });
});
