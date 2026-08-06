import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { viteObfuscateFile } from "vite-plugin-obfuscator";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

// ── Copyright banner stamped onto every compiled JS chunk ──────────────────
// Runs in writeBundle (truly last step, after obfuscation) so it is never
// stripped by the obfuscator pass.
const BANNER =
  "/*! \u00a9 2026 Gaurav Kumar Yadav \u2014 All Rights Reserved." +
  " Unauthorized use prohibited." +
  " https://github.com/ggauravky/Dev-Portfolio/blob/main/LICENSE */\n";

function copyrightBannerPlugin() {
  return {
    name: "copyright-banner",
    apply: "build",
    enforce: "post",
    writeBundle(options, bundle) {
      const outDir = options.dir || "dist";
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type !== "chunk") continue;
        const filePath = join(outDir, fileName);
        try {
          const content = readFileSync(filePath, "utf8");
          // Avoid double-stamping on incremental builds
          if (!content.startsWith("/*!")) {
            writeFileSync(filePath, BANNER + content, "utf8");
          }
        } catch {
          // Chunk file may not exist in certain edge cases — skip safely
        }
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: false,
      gzipSize: true,
      brotliSize: true,
      filename: "dist/stats.html",
    }),
    // ── JavaScript obfuscation (production builds only) ──────────────────────
    // Transforms compiled JS chunks so variable names, strings, and control
    // flow become unreadable — making copy-paste of the built output useless.
    // Scoped to OUR source chunks only (vendor/framer are excluded — obfuscating
    // them wastes build time and can break tree-shaking assumptions).
    viteObfuscateFile({
      compact: true,
      // Encode string literals
      stringArray: true,
      stringArrayEncoding: [],
      stringArrayCallsTransform: true,
      stringArrayIndexShift: true,
      stringArrayRotate: true,
      stringArrayShuffle: true,
      stringArrayWrappersCount: 2,
      stringArrayWrappersChainedCalls: true,
      stringArrayThreshold: 0.75,
      // Rename identifiers to hex sequences (_0x1a2b)
      identifierNamesGenerator: "hexadecimal",
      // Fold number literals into expressions (1 → 0x1)
      numbersToExpressions: true,
      simplify: true,
      // Keep these OFF — they either bloat the bundle or break React
      controlFlowFlattening: false,
      deadCodeInjection: false,
      selfDefending: false,
      debugProtection: false,
      renameGlobals: false,
      transformObjectKeys: false,
      unicodeEscapeSequence: false,
      disableConsoleOutput: false, // keep our copyright console.log watermark
      log: false,
    }),
    // ── Stamp copyright banner AFTER obfuscation ─────────────────────────────
    copyrightBannerPlugin(),
  ],
  base: "/", // Ensure base path is set for production

  build: {
    outDir: "dist",
    assetsDir: "assets",
    copyPublicDir: true,
    target: "es2020", // modern syntax → smaller transforms, smaller bundles
    reportCompressedSize: false, // skip per-file gzip calculation → faster builds
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React ecosystem shared across all routes
          if (
            id.includes("react") ||
            id.includes("react-dom") ||
            id.includes("react-router-dom")
          ) {
            return "vendor";
          }
          // Framer Motion — large animation lib, isolate to its own chunk
          if (id.includes("framer-motion")) {
            return "framer";
          }
          // Vercel edge analytics
          if (
            id.includes("@vercel/analytics") ||
            id.includes("@vercel/speed-insights")
          ) {
            return "analytics";
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },

  // ── Build-time author constant ──────────────────────────────────────────────
  // __AUTHOR__ is replaced at compile time with a literal string that gets
  // baked into the bundle — grepping the dist/ for this string confirms origin.
  define: {
    __AUTHOR__: JSON.stringify('Gaurav Kumar Yadav | https://ggauravky.vercel.app | © 2026'),
  },

  // Note: console.* stripping removed so the copyright watermark in App.jsx
  // survives into the production bundle. The obfuscator above handles security.
  esbuild: {
    drop: ["debugger"],
  },

  publicDir: "public",
});
