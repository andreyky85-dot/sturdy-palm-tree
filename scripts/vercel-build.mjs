#!/usr/bin/env node
/**
 * Сборка для Vercel: единая точка входа с нормализацией строки БД.
 *
 * Зачем: в дашборде Vercel Postgres часто создаёт POSTGRES_URL / POSTGRES_PRISMA_URL,
 * а Prisma в schema.prisma ожидает DATABASE_URL — без неё `prisma migrate deploy` падает с P1012.
 *
 * Как: копируем подходящую переменную в DATABASE_URL для дочерних процессов (generate, migrate, next build).
 *
 * Альтернатива: вручную продублировать DATABASE_URL в Settings → Environment Variables (Production).
 */

import { spawnSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

/** Локально Next.js сам читает .env.local; для этого скрипта подмешиваем файл вручную (не перезаписываем уже заданный env). */
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

function pickDatabaseUrl() {
  const explicit = process.env.DATABASE_URL?.trim();
  if (explicit) return explicit;

  // Типичные имена при подключении Vercel Postgres / Neon из маркетплейса
  const candidates = [
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL,
    process.env.PRISMA_DATABASE_URL,
  ].filter(Boolean);

  const found = candidates.find((s) => String(s).trim().length > 0);
  return found ? String(found).trim() : "";
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

const dbUrl = pickDatabaseUrl();
if (!dbUrl) {
  console.error(
    "\n[vercel-build] Ошибка: не задана строка подключения к PostgreSQL.\n" +
      "  Добавьте в Vercel → Settings → Environment Variables (Production):\n" +
      "    DATABASE_URL = строка из вашей БД (или подключите Vercel Postgres к проекту).\n" +
      "  Если видите только POSTGRES_URL / POSTGRES_PRISMA_URL — либо скрипт подхватит их автоматически,\n" +
      "  либо создайте переменную DATABASE_URL вручную с тем же значением.\n" +
      "  Убедитесь, что переменная отмечена для окружения Production (галочки при создании).\n"
  );
  process.exit(1);
}

const env = { ...process.env, DATABASE_URL: dbUrl };
if (!process.env.DATABASE_URL?.trim()) {
  console.log(
    "[vercel-build] DATABASE_URL не был задан; используется резерв из POSTGRES_* / PRISMA_DATABASE_URL."
  );
}

run("npx", ["prisma", "generate"], env);
run("npx", ["prisma", "migrate", "deploy"], env);
run("npx", ["next", "build"], env);
