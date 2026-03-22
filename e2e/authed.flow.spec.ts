import { test, expect } from "@playwright/test";

test.describe("Авторизованный пользователь", () => {
  test("дашборд показывает блок аккаунта", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole("heading", { name: "Аккаунт" })).toBeVisible({ timeout: 20_000 });
  });

  test("генератор открывается без редиректа на логин", async ({ page }) => {
    await page.goto("/generator");
    await expect(page).toHaveURL(/\/generator/);
    await expect(page).not.toHaveURL(/\/login/);
  });
});
