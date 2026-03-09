import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test("loads and shows hero, features, pricing, FAQ, footer", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText(/Turn|video|posts/i);
    await expect(page.getByRole("link", { name: /generator|generate/i }).first()).toBeVisible();
    await expect(page.locator("section#features, [id='features']").first()).toBeVisible();
    await expect(page.locator("section#pricing, [id='pricing']").first()).toBeVisible();
    await expect(page.locator("section#faq, [id='faq']").first()).toBeVisible();
    await expect(page.getByRole("contentinfo").or(page.locator("footer"))).toBeVisible();
  });

  test("has navigation to generator and login", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /generator|generate/i }).first()).toBeVisible();
    await expect(
      page.getByRole("link", { name: /sign in|login/i }).first()
    ).toBeVisible();
  });
});
