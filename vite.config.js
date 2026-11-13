import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { viteObfuscateFile } from "vite-plugin-obfuscator";
import routeShells from "./scripts/route-shells.js";
import routeHeads from "./scripts/route-heads.js";

// vite-plugin-obfuscator obfuscates every chunk in the bundle. Pass it a view of
// the bundle without third-party chunks (it mutates the chunk objects in place).
const THIRD_PARTY_CHUNK = /^assets\/vendor-/;
function obfuscateOwnChunks(options) {
  const plugin = viteObfuscateFile(options);
  const transform = plugin.transformIndexHtml.transform;
  plugin.transformIndexHtml.transform = (html, ctx) => {
    if (!ctx?.bundle) return html;
    const bundle = Object.fromEntries(
      Object.entries(ctx.bundle).filter(([name]) => !THIRD_PARTY_CHUNK.test(name)),
    );
    return transform(html, { ...ctx, bundle });
  };
  return plugin;
}
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
    // Pre-JS header shells for /projects and /projects/:slug (D-057).
    routeShells(),
    // Per-route <head> (title, canonical, OG, JSON-LD) prerendered into dist/<route>/index.html.
    routeHeads(),
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
    // Scoped to OUR source chunks only: the plugin has no exclude option, so
    // obfuscateOwnChunks hides the third-party `vendor` chunk from it (it was
    // being obfuscated too, ~2x its gzip size on the critical path, D-056).
    obfuscateOwnChunks({
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
    // One stylesheet, linked in <head>. The obfuscator strips Vite's preload map
    // for dynamic imports, so per-chunk CSS (the app boot chunk, lazy routes)
    // was never loaded; a single file also styles the Home hero shell (D-046).
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React core shared by every route. Only these packages: a loose
          // `includes("react")` also swept lucide-react, radix and scroll-lock
          // into the boot path (D-056).
          if (/[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(id)) {
            return "vendor";
          }
          // framer-motion has no manual chunk: Rollup keeps only what the
          // boot path imports (MotionConfig, LazyMotion, m) and leaves the
          // domMax features and page-only APIs in lazy chunks (D-056).
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
