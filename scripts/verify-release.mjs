/**
 * Проверяет, что в CHANGELOG.md есть секция ## [версия] для планируемого релиза.
 * Запуск: node scripts/verify-release.mjs [версия]
 * Без аргумента — версия берётся из package.json.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const changelogPath = path.join(root, "CHANGELOG.md");
const pkgPath = path.join(root, "package.json");

let version = process.argv[2]?.trim();
if (!version) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  version = pkg.version;
}

const escaped = version.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const header = new RegExp(`^##\\s*\\[${escaped}\\]`, "m");

if (!fs.existsSync(changelogPath)) {
  console.error("Нет файла CHANGELOG.md");
  process.exit(1);
}

const raw = fs.readFileSync(changelogPath, "utf8");
if (!header.test(raw)) {
  console.error(
    `В CHANGELOG.md нет секции "## [${version}]". Добавьте блок с изменениями перед тегом.`
  );
  process.exit(1);
}

console.log(`OK: CHANGELOG содержит [${version}]`);
