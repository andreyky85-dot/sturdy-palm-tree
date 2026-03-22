#!/usr/bin/env node
/**
 * Сборка для Vercel: нормализация строки БД перед Prisma и Next.
 *
 * Проблема: Prisma migrate требует DATABASE_URL на этапе Build; Vercel иногда
 * не передаёт переменные из Storage в Build — тогда задают DATABASE_URL вручную
 * или используют PRISMA_BUILD_SKIP_MIGRATE (см. docs/VERCEL_DATABASE_URL.md).
 */

import { spawnSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const DOC_HINT =
  "Подробная инструкция с вариантами A/B: docs/VERCEL_DATABASE_URL.md";

function loadEnvLocal() {
  const p = path.join(root, ".env.local");
  if (!existsSync(p)) return;
  const lines = readFileSync(p, "utf8").split(/\r?\n/);
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

function looksLikePostgresUrl(s) {
  const t = String(s).trim().toLowerCase();
  return t.startsWith("postgresql:") || t.startsWith("postgres:");
}

const URL_KEY_PRIORITY = [
  "DATABASE_URL",
  // Прямое подключение без пулера — часто задают отдельно; migrate с ним надёжнее, чем с pooled URL.
  "DIRECT_URL",
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL",
  "PRISMA_DATABASE_URL",
  "POSTGRES_URL_NON_POOLING",
  "DATABASE_URL_UNPOOLED",
  "NEON_DATABASE_URL",
];

/**
 * Собираем postgresql:// из классических libpq-переменных (PGHOST, PGUSER, …).
 * Альтернатива — один URI в DATABASE_URL; но часть хостингов на Build отдаёт только «разобранные» поля.
 */
function pickDatabaseUrlFromPgComponents() {
  const host = process.env.PGHOST?.trim();
  const database = process.env.PGDATABASE?.trim();
  const user = process.env.PGUSER?.trim();
  if (!host || !database || !user) {
    return { url: "", source: null };
  }
  const password = process.env.PGPASSWORD ?? "";
  const port = (process.env.PGPORT || "5432").trim();
  const sslRaw = process.env.PGSSLMODE?.trim();
  // На Vercel к внешнему Postgres почти всегда нужен TLS; если режим не задан — подстраховываемся.
  const sslmode = sslRaw || (process.env.VERCEL ? "require" : "");
  const userEnc = encodeURIComponent(user);
  const passPart =
    password.length > 0 ? `:${encodeURIComponent(password)}` : "";
  const dbSeg = encodeURIComponent(database);
  const query = sslmode ? `?sslmode=${encodeURIComponent(sslmode)}` : "";
  const url = `postgresql://${userEnc}${passPart}@${host}:${port}/${dbSeg}${query}`;
  return {
    url,
    source: "PGHOST+PGUSER+PGDATABASE+PGPORT(+PGPASSWORD,+PGSSLMODE)",
  };
}

function pickDatabaseUrl() {
  for (const key of URL_KEY_PRIORITY) {
    const v = process.env[key]?.trim();
    if (v && looksLikePostgresUrl(v)) {
      return { url: v, source: key };
    }
  }

  const fromPg = pickDatabaseUrlFromPgComponents();
  if (fromPg.url && looksLikePostgresUrl(fromPg.url)) {
    return fromPg;
  }

  for (const [key, val] of Object.entries(process.env)) {
    if (!val?.trim()) continue;
    if (!looksLikePostgresUrl(val)) continue;
    if (
      /POSTGRES|DATABASE|PRISMA|NEON|SUPABASE/i.test(key) &&
      !/SUPABASE_ANON|SERVICE_ROLE|JWT/i.test(key)
    ) {
      return { url: val.trim(), source: key };
    }
  }

  return { url: "", source: null };
}

function debugRelatedEnvKeys() {
  return Object.keys(process.env)
    .filter(
      (k) =>
        (/POSTGRES|DATABASE|PRISMA|NEON|SUPABASE|SQL/i.test(k) ||
          /^PG(HOST|PORT|USER|PASSWORD|DATABASE|SSLMODE)$/i.test(k)) &&
        !/NEXT_PUBLIC|VERCEL_GIT|VERCEL_URL|VERCEL_ENV|VERCEL_REGION/i.test(k)
    )
    .sort();
}

function run(cmd, args, env) {
  const r = spawnSync(cmd, args, {
    cwd: root,
    env,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (r.status !== 0) {
    process.exit(r.status ?? 1);
  }
}

const skipMigrate =
  process.env.PRISMA_BUILD_SKIP_MIGRATE === "1" ||
  process.env.PRISMA_BUILD_SKIP_MIGRATE === "true";

const { url: dbUrl, source } = pickDatabaseUrl();

if (!dbUrl) {
  const related = debugRelatedEnvKeys();
  const onVercel = Boolean(process.env.VERCEL);
  const vercelEnv = process.env.VERCEL_ENV || "(не задано)";

  if (skipMigrate && onVercel) {
    console.warn(
      "\n[vercel-build] PRISMA_BUILD_SKIP_MIGRATE включён: пропускаем `prisma migrate deploy`.\n" +
        "  Схема БД должна быть применена вручную (см. " +
        DOC_HINT +
        ", раздел «Временный обход»).\n"
    );
    const env = { ...process.env };
    run("npx", ["prisma", "generate"], env);
    run("npx", ["next", "build"], env);
    process.exit(0);
  }

  console.error(
    "\n[vercel-build] Нет строки подключения к PostgreSQL для Prisma migrate.\n"
  );
  if (onVercel) {
    console.error(
      `  Контекст Vercel: VERCEL_ENV=${vercelEnv} (проверьте, что переменная БД включена именно для этого окружения: Production / Preview / Development).\n`
    );
  }
  console.error(
    "  Переменные в окружении со «похожими» именами (только имена, без значений):"
  );
  console.error(
    related.length ? `  ${related.join(", ")}` : "  (нет — БД не видна на этапе Build)"
  );
  console.error(`
  Что сделать:
  1) Откройте в репозитории файл ${DOC_HINT} — там пошагово (Vercel Storage и внешняя БД).
  2) В Vercel: Settings → Environment Variables → добавьте DATABASE_URL или DIRECT_URL (URI postgres://…) для нужного окружения → Redeploy.
     Либо полный набор PGHOST, PGUSER, PGPASSWORD, PGDATABASE (и при необходимости PGPORT, PGSSLMODE=require).

  Временный обход (сборка без миграций): задайте в Vercel переменную PRISMA_BUILD_SKIP_MIGRATE=1
  и после деплоя выполните локально: npx prisma migrate deploy с продовой DATABASE_URL.
  Подробности — в том же docs/VERCEL_DATABASE_URL.md
`);
  process.exit(1);
}

const env = { ...process.env, DATABASE_URL: dbUrl };
if (source && source !== "DATABASE_URL") {
  console.log(`[vercel-build] DATABASE_URL взят из переменной: ${source}`);
}

run("npx", ["prisma", "generate"], env);
run("npx", ["prisma", "migrate", "deploy"], env);
run("npx", ["next", "build"], env);
