import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { viteObfuscateFile } from "vite-plugin-obfuscator";

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
    viteObfuscateFile({
      compact: true,
      // Encode string literals into a Base64 lookup table
      stringArray: true,
      stringArrayEncoding: ["base64"],
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
  ],
  base: "/", // Ensure base path is set for production

  // TF.js and MobileNet are loaded from CDN (window.tf / window.mobilenet) at
  // runtime — no Vite bundling needed, no CJS→ESM conversion issues.
  // compromise is loaded the same way (window.nlp).
  // Nothing to pre-bundle or chunk for these libraries.

  build: {
    outDir: "dist",
    assetsDir: "assets",
    copyPublicDir: true,
    target: "es2020", // modern syntax → smaller transforms, smaller bundles
    reportCompressedSize: false, // skip per-file gzip calculation → faster builds
    rollupOptions: {
      output: {
        // ── Copyright banner prepended to every compiled JS chunk ──────────────
        // Survives inside any stolen dist/ folder. The comment travels with
        // every chunk file (.js) so even downloaded assets are stamped.
        banner: '/*! © 2026 Gaurav Kumar Yadav — All Rights Reserved. Unauthorized use prohibited. https://github.com/ggauravky/Dev-Portfolio/blob/main/LICENSE */',
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
