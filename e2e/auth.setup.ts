import path from "path";
import { test as setup, expect } from "@playwright/test";

/**
 * Сохраняет cookies сессии NextAuth после входа через провайдер `e2e` (см. lib/auth.ts).
 * Требует: ENABLE_E2E_CREDENTIALS=true, E2E_AUTH_*, рабочий DATABASE_URL и миграции Prisma.
 */
const authFile = path.join(__dirname, ".auth", "user.json");

setup("вход тестового пользователя (NextAuth e2e)", async ({ request }) => {
  // Проект `setup` подключается только если playwright.config отметил runAuthedE2E; ниже — страховка.
  const email = process.env.E2E_AUTH_EMAIL?.trim();
  const password = process.env.E2E_AUTH_PASSWORD;
  if (
    process.env.ENABLE_E2E_CREDENTIALS !== "true" ||
    !process.env.DATABASE_URL?.trim() ||
    !email ||
    !password ||
    password.length < 8
  ) {
    throw new Error("[e2e] Некорректная конфигурация E2E-авторизации (см. .env.example).");
  }

  const csrfRes = await request.get("/api/auth/csrf");
  expect(csrfRes.ok(), `csrf: ${csrfRes.status()}`).toBeTruthy();
  const { csrfToken } = (await csrfRes.json()) as { csrfToken: string };

  const baseURL = (process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
  const loginRes = await request.post("/api/auth/callback/e2e", {
    form: {
      csrfToken,
      email,
      password,
      callbackUrl: `${baseURL}/dashboard`,
      json: "true",
    },
  });

  expect(loginRes.ok(), await loginRes.text()).toBeTruthy();
  await request.storageState({ path: authFile });
});
