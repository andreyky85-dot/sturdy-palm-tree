import { test, expect } from "@playwright/test";

test.describe("Generator page", () => {
  test("redirects guests to login (generator is protected)", async ({ page }) => {
    await page.goto("/generator");
    await expect(page).toHaveURL(/\/login/);
  });
});
