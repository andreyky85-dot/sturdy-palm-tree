/**
 * Генерирует public/og.png (1200×630) и app/icon.png (32×32) без внешних сервисов — sharp + SVG.
 * Запуск: npm run build-assets
 */

const path = require("path");
const fs = require("fs");

const root = path.join(__dirname, "..");
const publicDir = path.join(root, "public");
const appDir = path.join(root, "app");

const ogSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f172a"/>
      <stop offset="100%" style="stop-color:#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <text x="72" y="220" font-family="Segoe UI, Arial, sans-serif" font-size="76" font-weight="700" fill="#ffffff">TextFlow</text>
  <text x="72" y="310" font-family="Segoe UI, Arial, sans-serif" font-size="34" fill="#94a3b8">Идеи постов из любого текста</text>
  <text x="72" y="420" font-family="Segoe UI, Arial, sans-serif" font-size="24" fill="#64748b">YouTube · Telegram · LinkedIn · X</text>
</svg>`;

const iconSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" rx="8" fill="#0f172a"/>
  <text x="16" y="22" font-family="Segoe UI, Arial, sans-serif" font-size="18" font-weight="700" fill="#ffffff" text-anchor="middle">T</text>
</svg>`;

async function run() {
  const sharp = require("sharp");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  await sharp(Buffer.from(ogSvg)).png({ compressionLevel: 9 }).toFile(path.join(publicDir, "og.png"));

  await sharp(Buffer.from(iconSvg)).png().toFile(path.join(appDir, "icon.png"));

  console.log("OK: public/og.png, app/icon.png");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
