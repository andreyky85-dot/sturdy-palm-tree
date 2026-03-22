import { existsSync, readFileSync } from "fs";
import path from "path";
import { defineConfig, devices } from "@playwright/test";

/**
 * Подмешиваем .env.local в process.env для оценки runAuthedE2E (Next.js при `npm run dev` читает его сам).
 * Не перезаписываем уже заданные переменные окружения (приоритет у shell/CI).
 */
function loadEnvLocal() {
  const envPath = path.join(__dirname, ".env.local");
  if (!existsSync(envPath)) return;
  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}

loadEnvLocal();

const authStorage = path.join(__dirname, "e2e", ".auth", "user.json");

/** Полный сценарий E2E с логином: см. lib/auth.ts и e2e/auth.setup.ts */
const runAuthedE2E =
  process.env.ENABLE_E2E_CREDENTIALS === "true" &&
  Boolean(process.env.DATABASE_URL?.trim()) &&
  Boolean(process.env.E2E_AUTH_EMAIL?.trim()) &&
  typeof process.env.E2E_AUTH_PASSWORD === "string" &&
  process.env.E2E_AUTH_PASSWORD.length >= 8;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: [/\/auth\.setup\.ts$/, /\/authed\.flow\.spec\.ts$/],
    },
    ...(runAuthedE2E
      ? [
          {
            name: "setup",
            testMatch: /\/auth\.setup\.ts$/,
          },
          {
            name: "chromium-authed",
            dependencies: ["setup"],
            use: {
              ...devices["Desktop Chrome"],
              storageState: authStorage,
            },
            testMatch: /\/authed\.flow\.spec\.ts$/,
          },
        ]
      : []),
  ],
  webServer: process.env.CI
    ? undefined
    : {
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
      },
});
