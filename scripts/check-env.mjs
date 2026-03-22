#!/usr/bin/env node
/**
 * Проверка заполненности переменных окружения по группам (локально: читает .env.local, не перезаписывает уже заданные в shell).
 * Не выводит значения секретов — только факты «задано / пусто» и подсказки.
 * Запуск: node scripts/check-env.mjs   |   npm run check:env
 */

import { existsSync, readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

/** Простой разбор .env.local (без экспорта в shell процессов выше). */
function loadDotEnvFile(filePath) {
  if (!existsSync(filePath)) return {};
  const out = {};
  const lines = readFileSync(filePath, "utf8").split(/\r?\n/);
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
    out[key] = val;
  }
  return out;
}

const fileEnv = loadDotEnvFile(path.join(root, ".env.local"));
/** Приоритет: process.env (уже выставлен), иначе значение из .env.local */
function get(name) {
  const v = process.env[name];
  if (v !== undefined && v !== "") return v;
  const f = fileEnv[name];
  return f !== undefined && f !== "" ? f : "";
}

function ok(name) {
  return Boolean(get(name)?.trim());
}

function line(label, satisfied, hint) {
  const mark = satisfied ? "✓" : "—";
  return `  ${mark} ${label}${hint && !satisfied ? ` → ${hint}` : ""}`;
}

const nextAuthSecret = get("NEXTAUTH_SECRET");
const secretLenOk = nextAuthSecret.length >= 32;

const groups = [
  {
    title: "Сборка Next.js (как в GitHub Actions CI)",
    rows: [
      [
        "NEXTAUTH_SECRET (≥32 символов)",
        secretLenOk,
        "сгенерируйте: openssl rand -base64 32",
      ],
      ["NEXTAUTH_URL", ok("NEXTAUTH_URL"), "например http://localhost:3000"],
      ["NEXT_PUBLIC_APP_URL", ok("NEXT_PUBLIC_APP_URL"), "как NEXTAUTH_URL локально"],
      ["GOOGLE_CLIENT_ID", ok("GOOGLE_CLIENT_ID"), "OAuth в Google Cloud Console"],
      ["GOOGLE_CLIENT_SECRET", ok("GOOGLE_CLIENT_SECRET"), "пара к CLIENT_ID"],
    ],
  },
  {
    title: "База данных (аккаунт, лимиты, /api/me)",
    rows: [
      [
        "DATABASE_URL",
        ok("DATABASE_URL"),
        "Neon / Supabase / Docker Postgres; без БД вход и лимиты не работают",
      ],
    ],
  },
  {
    title: "Генерация через OpenAI (платный API по использованию)",
    rows: [
      [
        "OPENAI_API_KEY",
        ok("OPENAI_API_KEY"),
        "без ключа включён шаблонный режим ответа (см. lib/openai.ts)",
      ],
    ],
  },
  {
    title: "Платежи Stripe (по умолчанию выключены)",
    rows: [
      [
        "BILLING_ENABLED=true + ключи Stripe",
        get("BILLING_ENABLED") === "true"
          ? ok("STRIPE_SECRET_KEY") &&
            ok("STRIPE_WEBHOOK_SECRET") &&
            ok("STRIPE_PRO_PRICE_ID")
          : true,
        get("BILLING_ENABLED") === "true"
          ? "нужны STRIPE_* для реальных списаний"
          : "оставьте false или не задавайте — списаний не будет",
      ],
    ],
  },
  {
    title: "Rate limit по IP (опционально)",
    rows: [
      [
        "UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN",
        ok("UPSTASH_REDIS_REST_URL") && ok("UPSTASH_REDIS_REST_TOKEN"),
        "без пары лимит на /api/generate отключён",
      ],
    ],
  },
  {
    title: "E2E с логином без Google (только локально / CI, не Vercel)",
    rows: [
      (() => {
        const e2eOn = get("ENABLE_E2E_CREDENTIALS") === "true";
        const e2eOk =
          e2eOn &&
          ok("E2E_AUTH_EMAIL") &&
          get("E2E_AUTH_PASSWORD").length >= 8;
        return [
          "ENABLE_E2E_CREDENTIALS + E2E_AUTH_EMAIL + E2E_AUTH_PASSWORD",
          !e2eOn || e2eOk,
          !e2eOn
            ? "не включено — норма для обычной разработки"
            : "см. .env.example; на Vercel флаг E2E запрещён в коде auth",
        ];
      })(),
    ],
  },
];

console.log("TextFlow — проверка переменных окружения (значения не показываются)\n");
if (existsSync(path.join(root, ".env.local"))) {
  console.log("Источник: process.env + .env.local\n");
} else {
  console.log("Источник: только process.env (.env.local не найден)\n");
}

for (const g of groups) {
  console.log(g.title);
  for (const [label, sat, hint] of g.rows) {
    console.log(line(label, sat, hint));
  }
  console.log("");
}

const buildReady =
  secretLenOk &&
  ok("NEXTAUTH_URL") &&
  ok("NEXT_PUBLIC_APP_URL") &&
  ok("GOOGLE_CLIENT_ID") &&
  ok("GOOGLE_CLIENT_SECRET");

console.log(
  buildReady
    ? "Итог: для `npm run build` достаточно переменных уровня CI (или заполните недостающие).\n"
    : "Итог: для локального `npm run build` добавьте недостающие строки в .env.local (см. .env.example).\n"
);
