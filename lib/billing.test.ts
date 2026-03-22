import { describe, it, expect, afterEach } from "vitest";
import { isBillingEnabled } from "./billing";

describe("isBillingEnabled", () => {
  const prev = process.env.BILLING_ENABLED;

  afterEach(() => {
    if (prev === undefined) {
      delete process.env.BILLING_ENABLED;
    } else {
      process.env.BILLING_ENABLED = prev;
    }
  });

  it("выключен, если переменная не задана", () => {
    delete process.env.BILLING_ENABLED;
    expect(isBillingEnabled()).toBe(false);
  });

  it("выключен при любом значении кроме ровно true", () => {
    process.env.BILLING_ENABLED = "1";
    expect(isBillingEnabled()).toBe(false);
    process.env.BILLING_ENABLED = "false";
    expect(isBillingEnabled()).toBe(false);
  });

  it("включён только при BILLING_ENABLED=true", () => {
    process.env.BILLING_ENABLED = "true";
    expect(isBillingEnabled()).toBe(true);
  });
});
