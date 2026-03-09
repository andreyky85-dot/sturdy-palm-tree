/**
 * Сжимает и обрезает public/og.png до 1200×630 px (OG-формат).
 * Запуск: npm run resize-og  (или node scripts/resize-og.js)
 * Требует: npm install (sharp в devDependencies)
 */

const path = require("path");
const fs = require("fs");

const publicDir = path.join(__dirname, "..", "public");
const inputPath = path.join(publicDir, "og.png");
const outputPath = path.join(publicDir, "og.png");
const tempPath = path.join(publicDir, "og-temp.png");

if (!fs.existsSync(inputPath)) {
  console.error("Файл public/og.png не найден. Сначала поместите туда изображение.");
  process.exit(1);
}

async function run() {
  const sharp = require("sharp");
  await sharp(inputPath)
    .resize(1200, 630, { fit: "cover", position: "center" })
    .png({ quality: 90, compressionLevel: 9 })
    .toFile(tempPath);
  fs.renameSync(tempPath, outputPath);
  console.log("Готово: public/og.png — 1200×630 px, заменён.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
