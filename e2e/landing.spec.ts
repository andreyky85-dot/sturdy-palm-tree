import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test("loads and shows hero, features, pricing, FAQ, footer", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText(/Превратите|текст|постов/i);
    await expect(page.getByRole("link", { name: /Генератор/i }).first()).toBeVisible();
    await expect(page.locator("section#features, [id='features']").first()).toBeVisible();
    await expect(page.locator("section#pricing, [id='pricing']").first()).toBeVisible();
    await expect(page.locator("section#faq, [id='faq']").first()).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
  });

  test("has navigation to generator and login", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /Генератор/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Войти|Google/i }).first()).toBeVisible();
  });
});
