// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_IMAGES_DIR = path.join(__dirname, "../public/images");
const TARGET_DIRS = ["projects", "blogs"];
const STANDALONE_FILES = ["profile.jpg"];
const WIDTHS = [480, 768, 1200];
const SUPPORTED_EXT = new Set([".png", ".jpg", ".jpeg"]);

const isVariantFile = (fileName) => /-\d+\.(png|jpe?g|webp|avif)$/i.test(fileName);

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const getSourceFiles = () => {
  const sources = [];

  for (const dir of TARGET_DIRS) {
    const fullDir = path.join(PUBLIC_IMAGES_DIR, dir);
    if (!fs.existsSync(fullDir)) continue;

    for (const fileName of fs.readdirSync(fullDir)) {
      const ext = path.extname(fileName).toLowerCase();
      if (!SUPPORTED_EXT.has(ext) || isVariantFile(fileName)) continue;
      sources.push(path.join(fullDir, fileName));
    }
  }

  for (const fileName of STANDALONE_FILES) {
    const fullPath = path.join(PUBLIC_IMAGES_DIR, fileName);
    const ext = path.extname(fileName).toLowerCase();
    if (fs.existsSync(fullPath) && SUPPORTED_EXT.has(ext) && !isVariantFile(fileName)) {
      sources.push(fullPath);
    }
  }

  return sources;
};

const buildVariantPath = (sourcePath, width, format) => {
  const dir = path.dirname(sourcePath);
  const base = path.basename(sourcePath, path.extname(sourcePath));
  return path.join(dir, `${base}-${width}.${format}`);
};

const generateForSource = async (sourcePath) => {
  const image = sharp(sourcePath);
  const metadata = await image.metadata();
  const originalWidth = metadata.width || 0;
  const ext = path.extname(sourcePath).slice(1).toLowerCase();

  const widths = WIDTHS.filter((w) => !originalWidth || w <= originalWidth);
  if (!widths.length && originalWidth) {
    widths.push(originalWidth);
  }

  let created = 0;

  for (const width of widths) {
    const pipeline = sharp(sourcePath).rotate().resize({
      width,
      withoutEnlargement: true,
      fit: "inside",
    });

    const originalOut = buildVariantPath(sourcePath, width, ext === "jpeg" ? "jpg" : ext);
    const webpOut = buildVariantPath(sourcePath, width, "webp");
    const avifOut = buildVariantPath(sourcePath, width, "avif");

    await pipeline.clone().toFile(originalOut);
    await pipeline.clone().webp({ quality: 80 }).toFile(webpOut);
    await pipeline.clone().avif({ quality: 50 }).toFile(avifOut);
    created += 3;
  }

  return created;
};

const run = async () => {
  ensureDir(PUBLIC_IMAGES_DIR);

  const sources = getSourceFiles();
  if (!sources.length) {
    console.log("No source images found for responsive variant generation.");
    return;
  }

  let totalCreated = 0;

  for (const src of sources) {
    const created = await generateForSource(src);
    totalCreated += created;
    console.log(`Generated variants for ${path.relative(PUBLIC_IMAGES_DIR, src)} (${created} files)`);
  }

  console.log(`Responsive image variant generation complete. Files created: ${totalCreated}`);
};

try {
  await run();
} catch (error) {
  console.error("Failed to generate image variants:", error);
  process.exit(1);
}
