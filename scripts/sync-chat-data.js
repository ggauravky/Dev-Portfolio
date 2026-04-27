// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, "..");

const sourceFile = path.join(rootDir, "data", "portfolioData.json");
const targets = [
  path.join(rootDir, "backend", "data", "portfolioData.json"),
  path.join(rootDir, "public", "data", "portfolioData.json"),
  path.join(rootDir, "api", "data", "portfolioData.json"),
];

const readSource = () => {
  if (!fs.existsSync(sourceFile)) {
    throw new Error(`Source file not found: ${sourceFile}`);
  }
  return fs.readFileSync(sourceFile, "utf8");
};

const validateJson = (raw) => {
  try {
    JSON.parse(raw);
  } catch (error) {
    throw new Error(`Invalid JSON in source file: ${error.message}`);
  }
};

const writeTarget = (targetFile, raw) => {
  const targetDir = path.dirname(targetFile);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  fs.writeFileSync(targetFile, raw, "utf8");
};

try {
  const raw = readSource();
  validateJson(raw);

  for (const target of targets) {
    writeTarget(target, raw);
  }

  console.log("Chat data sync complete.");
  console.log(`Source: ${sourceFile}`);
  for (const target of targets) {
    console.log(`Target: ${target}`);
  }
} catch (error) {
  console.error(`Chat data sync failed: ${error.message}`);
  process.exit(1);
}
