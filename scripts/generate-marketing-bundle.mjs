/**
 * Собирает черновики постов для релиза из шаблонов + фрагмента CHANGELOG.
 * Запуск: node scripts/generate-marketing-bundle.mjs <версия>
 * Пример: node scripts/generate-marketing-bundle.mjs 1.0.1
 *
 * Переменные окружения:
 *   SITE_URL — базовый URL продукта (по умолчанию https://textflow.app)
 *   GITHUB_WORKSPACE — в Actions уже задан; корень репозитория
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const changelogPath = path.join(root, "CHANGELOG.md");
const templatesDir = path.join(root, "marketing", "templates");
const bundleRoot = path.join(root, "marketing", "bundle");

/**
 * Вырезает из CHANGELOG блок для версии вида ## [1.2.3] до следующего ## или конца файла.
 * Возвращает null, если секция не найдена.
 */
function extractChangelogSection(raw, version) {
  const escaped = version.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const header = new RegExp(`^##\\s*\\[${escaped}\\][^\\n]*\\n`, "m");
  const match = raw.match(header);
  if (!match || match.index === undefined) {
    return null;
  }
  const start = match.index + match[0].length;
  const rest = raw.slice(start);
  const next = rest.search(/^##\s*\[/m);
  const body = (next === -1 ? rest : rest.slice(0, next)).trim();
  return body.length ? body : null;
}

function substitute(template, vars) {
  let out = template;
  for (const [key, value] of Object.entries(vars)) {
    out = out.split(`{{${key}}}`).join(value);
  }
  return out;
}

function main() {
  const version = process.argv[2]?.trim();
  const semverOk = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/;
  if (!version || !semverOk.test(version)) {
    console.error(
      "Укажите semver: node scripts/generate-marketing-bundle.mjs 1.0.1  (допустим суффикс, напр. 1.0.0-beta.1)"
    );
    process.exit(1);
  }

  const rawSite = process.env.SITE_URL?.trim();
  const siteUrl = (rawSite && rawSite.length > 0 ? rawSite : "https://textflow.app").replace(/\/$/, "");
  const dateIso = new Date().toISOString().slice(0, 10);

  let releaseNotes =
    "См. список изменений в репозитории и в приложенном CHANGELOG.";
  if (fs.existsSync(changelogPath)) {
    const raw = fs.readFileSync(changelogPath, "utf8");
    const section = extractChangelogSection(raw, version);
    if (section) {
      releaseNotes = section;
    }
  }

  const vars = {
    VERSION: version,
    DATE_ISO: dateIso,
    RELEASE_NOTES: releaseNotes,
    SITE_URL: siteUrl,
  };

  const names = ["twitter.md", "linkedin.md", "telegram.md"];
  const outDir = path.join(bundleRoot, version);
  fs.mkdirSync(outDir, { recursive: true });

  for (const name of names) {
    const tplPath = path.join(templatesDir, name);
    if (!fs.existsSync(tplPath)) {
      console.error("Нет шаблона:", tplPath);
      process.exit(1);
    }
    const tpl = fs.readFileSync(tplPath, "utf8");
    const filled = substitute(tpl, vars);
    fs.writeFileSync(path.join(outDir, name), filled, "utf8");
  }

  // Текст для тела GitHub Release (markdown)
  const releaseBody = `# TextFlow ${version} (${dateIso})\n\n${releaseNotes}\n\n---\n\nЧерновики для соцсетей: см. архив \`textflow-marketing-${version}.zip\` в этом релизе.`;
  fs.writeFileSync(path.join(root, "release_notes.md"), releaseBody, "utf8");

  console.log("OK:", outDir);
  console.log("OK: release_notes.md");
}

main();
