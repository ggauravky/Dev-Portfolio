
import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, extname, relative } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, "..");

// ─── Copyright text ───────────────────────────────────────────────────────────
const JS_HEADER = `// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

`;

const CSS_HEADER = `/*
 * Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
 * Unauthorized copying, modification, or distribution of this software,
 * via any medium, is strictly prohibited without the express written
 * consent of the author. See LICENSE for details.
 * Source: https://github.com/ggauravky/Dev-Portfolio
 */

`;

// ─── Directories to walk ──────────────────────────────────────────────────────
const DIRS = ["src", "api", "backend", "scripts"];

// Files to skip (this script itself, build artifacts, etc.)
const SKIP_FILES = new Set(["add-copyright.js"]);

// ─── Helpers ──────────────────────────────────────────────────────────────────
// Directories that must never be touched
const SKIP_DIRS = new Set(["node_modules", ".git", "dist", ".vite", "build"]);

function walk(dir) {
  let results = [];
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      results = results.concat(walk(full));
    } else {
      results.push(full);
    }
  }
  return results;
}

function processFile(filePath) {
  const ext = extname(filePath).toLowerCase();
  const fileName = filePath.split(/[\\/]/).pop();

  if (SKIP_FILES.has(fileName)) return "skipped";

  let header;
  if (ext === ".js" || ext === ".jsx") {
    header = JS_HEADER;
  } else if (ext === ".css") {
    header = CSS_HEADER;
  } else {
    return "ignored";
  }

  const content = readFileSync(filePath, "utf8");

  // Skip if already stamped
  if (content.startsWith("// Copyright") || content.startsWith("/*\n * Copyright")) {
    return "already-stamped";
  }

  writeFileSync(filePath, header + content, "utf8");
  return "stamped";
}

// ─── Main ─────────────────────────────────────────────────────────────────────
let stamped = 0;
let alreadyDone = 0;
let ignored = 0;

for (const dir of DIRS) {
  const absDir = join(ROOT, dir);
  let files;
  try {
    files = walk(absDir);
  } catch {
    // Directory may not exist in every environment
    continue;
  }

  for (const file of files) {
    const result = processFile(file);
    const rel = relative(ROOT, file);
    if (result === "stamped") {
      console.log(`  ✓ ${rel}`);
      stamped++;
    } else if (result === "already-stamped") {
      console.log(`  · ${rel}  (already stamped)`);
      alreadyDone++;
    } else if (result === "skipped") {
      console.log(`  - ${rel}  (skipped)`);
    } else {
      ignored++;
    }
  }
}

console.log(`\nDone. Stamped: ${stamped} | Already done: ${alreadyDone} | Ignored: ${ignored}`);
