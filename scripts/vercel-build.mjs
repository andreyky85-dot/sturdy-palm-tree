#!/usr/bin/env node
/**
 * Сборка для Vercel: нормализация строки БД перед Prisma и Next.
 *
 * Проблема: Prisma требует DATABASE_URL; Vercel Storage может выставить POSTGRES_*,
 * а иногда на этапе Build переменные из Storage вообще не попадают в окружение —
 * тогда строку нужно добавить вручную в Project → Environment Variables.
 */

import { spawnSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

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

/**
 * Порядок имён — от более подходящих для Prisma migrate к запасным.
 * Neon / Supabase иногда дают свои имена; ищем и по ним.
 */
const URL_KEY_PRIORITY = [
  "DATABASE_URL",
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL",
  "PRISMA_DATABASE_URL",
  "POSTGRES_URL_NON_POOLING",
  "DATABASE_URL_UNPOOLED",
  "NEON_DATABASE_URL",
];

function pickDatabaseUrl() {
  for (const key of URL_KEY_PRIORITY) {
    const v = process.env[key]?.trim();
    if (v && looksLikePostgresUrl(v)) {
      return { url: v, source: key };
    }
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

/** В лог — только имена, без значений (секреты не светим). */
function debugRelatedEnvKeys() {
  return Object.keys(process.env)
    .filter(
      (k) =>
        /POSTGRES|DATABASE|PRISMA|NEON|SUPABASE|SQL/i.test(k) &&
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

const { url: dbUrl, source } = pickDatabaseUrl();

if (!dbUrl) {
  const related = debugRelatedEnvKeys();
  console.error(
    "\n[vercel-build] Нет строки подключения к PostgreSQL для Prisma migrate.\n"
  );
  console.error(
    "  Переменные в окружении со «похожими» именами (только имена, без значений):"
  );
  console.error(
    related.length ? `  ${related.join(", ")}` : "  (нет — БД не видна на этапе Build)"
  );
  console.error(`
  Что сделать в Vercel:
  1) Project → Storage → ваша Postgres → скопируйте connection string (или вкладка .env).
  2) Project → Settings → Environment Variables → Add:
     Name: DATABASE_URL
     Value: вставьте строку (начинается с postgres:// или postgresql://)
     Environments: включите Production (и Preview, если нужно).
  3) Если переменная помечена как доступная только в Runtime — для migrate на сборке
     она недоступна; задайте DATABASE_URL явно для всех нужных сред / снимите ограничение.
  4) Сохраните и сделайте Redeploy.
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
