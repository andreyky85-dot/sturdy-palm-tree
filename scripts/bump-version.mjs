/**
 * Подставляет версию в package.json (поле "version").
 * Запуск: node scripts/bump-version.mjs 1.0.2
 * Или:    npm run release:bump -- 1.0.2
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgPath = path.join(__dirname, "..", "package.json");

const semverOk = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/;
const next = process.argv[2]?.trim();

if (!next || !semverOk.test(next)) {
  console.error("Укажите semver: node scripts/bump-version.mjs 1.0.2");
  process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
const prev = pkg.version;
pkg.version = next;
fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`, "utf8");
console.log(`version: ${prev} → ${next} (${pkgPath})`);
