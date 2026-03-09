import { describe, it, expect } from "vitest";
import { checkUsage, incrementUsage } from "./usage";

describe("checkUsage (no DB)", () => {
  it("always allows usage with zero used and zero limit", async () => {
    const result = await checkUsage("user-1");
    expect(result).toEqual({ allowed: true, used: 0, limit: 0 });
  });
});

describe("incrementUsage (no DB)", () => {
  it("does not throw", async () => {
    await expect(incrementUsage("user-1")).resolves.toBeUndefined();
  });
});
