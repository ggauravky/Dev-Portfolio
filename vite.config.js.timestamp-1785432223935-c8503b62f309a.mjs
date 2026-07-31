// vite.config.js
import { defineConfig } from "file:///D:/VsCode/Dev-Portfolio/node_modules/vite/dist/node/index.js";
import react from "file:///D:/VsCode/Dev-Portfolio/node_modules/@vitejs/plugin-react/dist/index.js";
import { visualizer } from "file:///D:/VsCode/Dev-Portfolio/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
import { viteObfuscateFile } from "file:///D:/VsCode/Dev-Portfolio/node_modules/vite-plugin-obfuscator/index.js";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
var BANNER = "/*! \xA9 2026 Gaurav Kumar Yadav \u2014 All Rights Reserved. Unauthorized use prohibited. https://github.com/ggauravky/Dev-Portfolio/blob/main/LICENSE */\n";
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
          if (!content.startsWith("/*!")) {
            writeFileSync(filePath, BANNER + content, "utf8");
          }
        } catch {
        }
      }
    }
  };
}
var vite_config_default = defineConfig({
  plugins: [
    react(),
    visualizer({
      open: false,
      gzipSize: true,
      brotliSize: true,
      filename: "dist/stats.html"
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
      disableConsoleOutput: false,
      // keep our copyright console.log watermark
      log: false
    }),
    // ── Stamp copyright banner AFTER obfuscation ─────────────────────────────
    copyrightBannerPlugin()
  ],
  base: "/",
  // Ensure base path is set for production
  // TF.js and MobileNet are loaded from CDN (window.tf / window.mobilenet) at
  // runtime — no Vite bundling needed, no CJS→ESM conversion issues.
  // compromise is loaded the same way (window.nlp).
  // Nothing to pre-bundle or chunk for these libraries.
  build: {
    outDir: "dist",
    assetsDir: "assets",
    copyPublicDir: true,
    target: "es2020",
    // modern syntax → smaller transforms, smaller bundles
    reportCompressedSize: false,
    // skip per-file gzip calculation → faster builds
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("react") || id.includes("react-dom") || id.includes("react-router-dom")) {
            return "vendor";
          }
          if (id.includes("framer-motion")) {
            return "framer";
          }
          if (id.includes("@vercel/analytics") || id.includes("@vercel/speed-insights")) {
            return "analytics";
          }
        }
      }
    },
    chunkSizeWarningLimit: 1e3
  },
  // ── Build-time author constant ──────────────────────────────────────────────
  // __AUTHOR__ is replaced at compile time with a literal string that gets
  // baked into the bundle — grepping the dist/ for this string confirms origin.
  define: {
    __AUTHOR__: JSON.stringify("Gaurav Kumar Yadav | https://ggauravky.vercel.app | \xA9 2026")
  },
  // Note: console.* stripping removed so the copyright watermark in App.jsx
  // survives into the production bundle. The obfuscator above handles security.
  esbuild: {
    drop: ["debugger"]
  },
  publicDir: "public"
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxWc0NvZGVcXFxcRGV2LVBvcnRmb2xpb1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcVnNDb2RlXFxcXERldi1Qb3J0Zm9saW9cXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L1ZzQ29kZS9EZXYtUG9ydGZvbGlvL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xyXG5pbXBvcnQgeyB2aXN1YWxpemVyIH0gZnJvbSBcInJvbGx1cC1wbHVnaW4tdmlzdWFsaXplclwiO1xyXG5pbXBvcnQgeyB2aXRlT2JmdXNjYXRlRmlsZSB9IGZyb20gXCJ2aXRlLXBsdWdpbi1vYmZ1c2NhdG9yXCI7XHJcbmltcG9ydCB7IHJlYWRGaWxlU3luYywgd3JpdGVGaWxlU3luYyB9IGZyb20gXCJmc1wiO1xyXG5pbXBvcnQgeyBqb2luIH0gZnJvbSBcInBhdGhcIjtcclxuXHJcbi8vIFx1MjUwMFx1MjUwMCBDb3B5cmlnaHQgYmFubmVyIHN0YW1wZWQgb250byBldmVyeSBjb21waWxlZCBKUyBjaHVuayBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcclxuLy8gUnVucyBpbiB3cml0ZUJ1bmRsZSAodHJ1bHkgbGFzdCBzdGVwLCBhZnRlciBvYmZ1c2NhdGlvbikgc28gaXQgaXMgbmV2ZXJcclxuLy8gc3RyaXBwZWQgYnkgdGhlIG9iZnVzY2F0b3IgcGFzcy5cclxuY29uc3QgQkFOTkVSID1cclxuICBcIi8qISBcXHUwMGE5IDIwMjYgR2F1cmF2IEt1bWFyIFlhZGF2IFxcdTIwMTQgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cIiArXHJcbiAgXCIgVW5hdXRob3JpemVkIHVzZSBwcm9oaWJpdGVkLlwiICtcclxuICBcIiBodHRwczovL2dpdGh1Yi5jb20vZ2dhdXJhdmt5L0Rldi1Qb3J0Zm9saW8vYmxvYi9tYWluL0xJQ0VOU0UgKi9cXG5cIjtcclxuXHJcbmZ1bmN0aW9uIGNvcHlyaWdodEJhbm5lclBsdWdpbigpIHtcclxuICByZXR1cm4ge1xyXG4gICAgbmFtZTogXCJjb3B5cmlnaHQtYmFubmVyXCIsXHJcbiAgICBhcHBseTogXCJidWlsZFwiLFxyXG4gICAgZW5mb3JjZTogXCJwb3N0XCIsXHJcbiAgICB3cml0ZUJ1bmRsZShvcHRpb25zLCBidW5kbGUpIHtcclxuICAgICAgY29uc3Qgb3V0RGlyID0gb3B0aW9ucy5kaXIgfHwgXCJkaXN0XCI7XHJcbiAgICAgIGZvciAoY29uc3QgW2ZpbGVOYW1lLCBjaHVua10gb2YgT2JqZWN0LmVudHJpZXMoYnVuZGxlKSkge1xyXG4gICAgICAgIGlmIChjaHVuay50eXBlICE9PSBcImNodW5rXCIpIGNvbnRpbnVlO1xyXG4gICAgICAgIGNvbnN0IGZpbGVQYXRoID0gam9pbihvdXREaXIsIGZpbGVOYW1lKTtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgY29uc3QgY29udGVudCA9IHJlYWRGaWxlU3luYyhmaWxlUGF0aCwgXCJ1dGY4XCIpO1xyXG4gICAgICAgICAgLy8gQXZvaWQgZG91YmxlLXN0YW1waW5nIG9uIGluY3JlbWVudGFsIGJ1aWxkc1xyXG4gICAgICAgICAgaWYgKCFjb250ZW50LnN0YXJ0c1dpdGgoXCIvKiFcIikpIHtcclxuICAgICAgICAgICAgd3JpdGVGaWxlU3luYyhmaWxlUGF0aCwgQkFOTkVSICsgY29udGVudCwgXCJ1dGY4XCIpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgLy8gQ2h1bmsgZmlsZSBtYXkgbm90IGV4aXN0IGluIGNlcnRhaW4gZWRnZSBjYXNlcyBcdTIwMTQgc2tpcCBzYWZlbHlcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgfTtcclxufVxyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICBwbHVnaW5zOiBbXHJcbiAgICByZWFjdCgpLFxyXG4gICAgdmlzdWFsaXplcih7XHJcbiAgICAgIG9wZW46IGZhbHNlLFxyXG4gICAgICBnemlwU2l6ZTogdHJ1ZSxcclxuICAgICAgYnJvdGxpU2l6ZTogdHJ1ZSxcclxuICAgICAgZmlsZW5hbWU6IFwiZGlzdC9zdGF0cy5odG1sXCIsXHJcbiAgICB9KSxcclxuICAgIC8vIFx1MjUwMFx1MjUwMCBKYXZhU2NyaXB0IG9iZnVzY2F0aW9uIChwcm9kdWN0aW9uIGJ1aWxkcyBvbmx5KSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcclxuICAgIC8vIFRyYW5zZm9ybXMgY29tcGlsZWQgSlMgY2h1bmtzIHNvIHZhcmlhYmxlIG5hbWVzLCBzdHJpbmdzLCBhbmQgY29udHJvbFxyXG4gICAgLy8gZmxvdyBiZWNvbWUgdW5yZWFkYWJsZSBcdTIwMTQgbWFraW5nIGNvcHktcGFzdGUgb2YgdGhlIGJ1aWx0IG91dHB1dCB1c2VsZXNzLlxyXG4gICAgLy8gU2NvcGVkIHRvIE9VUiBzb3VyY2UgY2h1bmtzIG9ubHkgKHZlbmRvci9mcmFtZXIgYXJlIGV4Y2x1ZGVkIFx1MjAxNCBvYmZ1c2NhdGluZ1xyXG4gICAgLy8gdGhlbSB3YXN0ZXMgYnVpbGQgdGltZSBhbmQgY2FuIGJyZWFrIHRyZWUtc2hha2luZyBhc3N1bXB0aW9ucykuXHJcbiAgICB2aXRlT2JmdXNjYXRlRmlsZSh7XHJcbiAgICAgIGNvbXBhY3Q6IHRydWUsXHJcbiAgICAgIC8vIEVuY29kZSBzdHJpbmcgbGl0ZXJhbHNcclxuICAgICAgc3RyaW5nQXJyYXk6IHRydWUsXHJcbiAgICAgIHN0cmluZ0FycmF5RW5jb2Rpbmc6IFtdLFxyXG4gICAgICBzdHJpbmdBcnJheUNhbGxzVHJhbnNmb3JtOiB0cnVlLFxyXG4gICAgICBzdHJpbmdBcnJheUluZGV4U2hpZnQ6IHRydWUsXHJcbiAgICAgIHN0cmluZ0FycmF5Um90YXRlOiB0cnVlLFxyXG4gICAgICBzdHJpbmdBcnJheVNodWZmbGU6IHRydWUsXHJcbiAgICAgIHN0cmluZ0FycmF5V3JhcHBlcnNDb3VudDogMixcclxuICAgICAgc3RyaW5nQXJyYXlXcmFwcGVyc0NoYWluZWRDYWxsczogdHJ1ZSxcclxuICAgICAgc3RyaW5nQXJyYXlUaHJlc2hvbGQ6IDAuNzUsXHJcbiAgICAgIC8vIFJlbmFtZSBpZGVudGlmaWVycyB0byBoZXggc2VxdWVuY2VzIChfMHgxYTJiKVxyXG4gICAgICBpZGVudGlmaWVyTmFtZXNHZW5lcmF0b3I6IFwiaGV4YWRlY2ltYWxcIixcclxuICAgICAgLy8gRm9sZCBudW1iZXIgbGl0ZXJhbHMgaW50byBleHByZXNzaW9ucyAoMSBcdTIxOTIgMHgxKVxyXG4gICAgICBudW1iZXJzVG9FeHByZXNzaW9uczogdHJ1ZSxcclxuICAgICAgc2ltcGxpZnk6IHRydWUsXHJcbiAgICAgIC8vIEtlZXAgdGhlc2UgT0ZGIFx1MjAxNCB0aGV5IGVpdGhlciBibG9hdCB0aGUgYnVuZGxlIG9yIGJyZWFrIFJlYWN0XHJcbiAgICAgIGNvbnRyb2xGbG93RmxhdHRlbmluZzogZmFsc2UsXHJcbiAgICAgIGRlYWRDb2RlSW5qZWN0aW9uOiBmYWxzZSxcclxuICAgICAgc2VsZkRlZmVuZGluZzogZmFsc2UsXHJcbiAgICAgIGRlYnVnUHJvdGVjdGlvbjogZmFsc2UsXHJcbiAgICAgIHJlbmFtZUdsb2JhbHM6IGZhbHNlLFxyXG4gICAgICB0cmFuc2Zvcm1PYmplY3RLZXlzOiBmYWxzZSxcclxuICAgICAgdW5pY29kZUVzY2FwZVNlcXVlbmNlOiBmYWxzZSxcclxuICAgICAgZGlzYWJsZUNvbnNvbGVPdXRwdXQ6IGZhbHNlLCAvLyBrZWVwIG91ciBjb3B5cmlnaHQgY29uc29sZS5sb2cgd2F0ZXJtYXJrXHJcbiAgICAgIGxvZzogZmFsc2UsXHJcbiAgICB9KSxcclxuICAgIC8vIFx1MjUwMFx1MjUwMCBTdGFtcCBjb3B5cmlnaHQgYmFubmVyIEFGVEVSIG9iZnVzY2F0aW9uIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxyXG4gICAgY29weXJpZ2h0QmFubmVyUGx1Z2luKCksXHJcbiAgXSxcclxuICBiYXNlOiBcIi9cIiwgLy8gRW5zdXJlIGJhc2UgcGF0aCBpcyBzZXQgZm9yIHByb2R1Y3Rpb25cclxuXHJcbiAgLy8gVEYuanMgYW5kIE1vYmlsZU5ldCBhcmUgbG9hZGVkIGZyb20gQ0ROICh3aW5kb3cudGYgLyB3aW5kb3cubW9iaWxlbmV0KSBhdFxyXG4gIC8vIHJ1bnRpbWUgXHUyMDE0IG5vIFZpdGUgYnVuZGxpbmcgbmVlZGVkLCBubyBDSlNcdTIxOTJFU00gY29udmVyc2lvbiBpc3N1ZXMuXHJcbiAgLy8gY29tcHJvbWlzZSBpcyBsb2FkZWQgdGhlIHNhbWUgd2F5ICh3aW5kb3cubmxwKS5cclxuICAvLyBOb3RoaW5nIHRvIHByZS1idW5kbGUgb3IgY2h1bmsgZm9yIHRoZXNlIGxpYnJhcmllcy5cclxuXHJcbiAgYnVpbGQ6IHtcclxuICAgIG91dERpcjogXCJkaXN0XCIsXHJcbiAgICBhc3NldHNEaXI6IFwiYXNzZXRzXCIsXHJcbiAgICBjb3B5UHVibGljRGlyOiB0cnVlLFxyXG4gICAgdGFyZ2V0OiBcImVzMjAyMFwiLCAvLyBtb2Rlcm4gc3ludGF4IFx1MjE5MiBzbWFsbGVyIHRyYW5zZm9ybXMsIHNtYWxsZXIgYnVuZGxlc1xyXG4gICAgcmVwb3J0Q29tcHJlc3NlZFNpemU6IGZhbHNlLCAvLyBza2lwIHBlci1maWxlIGd6aXAgY2FsY3VsYXRpb24gXHUyMTkyIGZhc3RlciBidWlsZHNcclxuICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgb3V0cHV0OiB7XHJcbiAgICAgICAgbWFudWFsQ2h1bmtzKGlkKSB7XHJcbiAgICAgICAgICAvLyBSZWFjdCBlY29zeXN0ZW0gc2hhcmVkIGFjcm9zcyBhbGwgcm91dGVzXHJcbiAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgIGlkLmluY2x1ZGVzKFwicmVhY3RcIikgfHxcclxuICAgICAgICAgICAgaWQuaW5jbHVkZXMoXCJyZWFjdC1kb21cIikgfHxcclxuICAgICAgICAgICAgaWQuaW5jbHVkZXMoXCJyZWFjdC1yb3V0ZXItZG9tXCIpXHJcbiAgICAgICAgICApIHtcclxuICAgICAgICAgICAgcmV0dXJuIFwidmVuZG9yXCI7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICAvLyBGcmFtZXIgTW90aW9uIFx1MjAxNCBsYXJnZSBhbmltYXRpb24gbGliLCBpc29sYXRlIHRvIGl0cyBvd24gY2h1bmtcclxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcImZyYW1lci1tb3Rpb25cIikpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFwiZnJhbWVyXCI7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICAvLyBWZXJjZWwgZWRnZSBhbmFseXRpY3NcclxuICAgICAgICAgIGlmIChcclxuICAgICAgICAgICAgaWQuaW5jbHVkZXMoXCJAdmVyY2VsL2FuYWx5dGljc1wiKSB8fFxyXG4gICAgICAgICAgICBpZC5pbmNsdWRlcyhcIkB2ZXJjZWwvc3BlZWQtaW5zaWdodHNcIilcclxuICAgICAgICAgICkge1xyXG4gICAgICAgICAgICByZXR1cm4gXCJhbmFseXRpY3NcIjtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogMTAwMCxcclxuICB9LFxyXG5cclxuICAvLyBcdTI1MDBcdTI1MDAgQnVpbGQtdGltZSBhdXRob3IgY29uc3RhbnQgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHJcbiAgLy8gX19BVVRIT1JfXyBpcyByZXBsYWNlZCBhdCBjb21waWxlIHRpbWUgd2l0aCBhIGxpdGVyYWwgc3RyaW5nIHRoYXQgZ2V0c1xyXG4gIC8vIGJha2VkIGludG8gdGhlIGJ1bmRsZSBcdTIwMTQgZ3JlcHBpbmcgdGhlIGRpc3QvIGZvciB0aGlzIHN0cmluZyBjb25maXJtcyBvcmlnaW4uXHJcbiAgZGVmaW5lOiB7XHJcbiAgICBfX0FVVEhPUl9fOiBKU09OLnN0cmluZ2lmeSgnR2F1cmF2IEt1bWFyIFlhZGF2IHwgaHR0cHM6Ly9nZ2F1cmF2a3kudmVyY2VsLmFwcCB8IFx1MDBBOSAyMDI2JyksXHJcbiAgfSxcclxuXHJcbiAgLy8gTm90ZTogY29uc29sZS4qIHN0cmlwcGluZyByZW1vdmVkIHNvIHRoZSBjb3B5cmlnaHQgd2F0ZXJtYXJrIGluIEFwcC5qc3hcclxuICAvLyBzdXJ2aXZlcyBpbnRvIHRoZSBwcm9kdWN0aW9uIGJ1bmRsZS4gVGhlIG9iZnVzY2F0b3IgYWJvdmUgaGFuZGxlcyBzZWN1cml0eS5cclxuICBlc2J1aWxkOiB7XHJcbiAgICBkcm9wOiBbXCJkZWJ1Z2dlclwiXSxcclxuICB9LFxyXG5cclxuICBwdWJsaWNEaXI6IFwicHVibGljXCIsXHJcbn0pO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTZQLFNBQVMsb0JBQW9CO0FBQzFSLE9BQU8sV0FBVztBQUNsQixTQUFTLGtCQUFrQjtBQUMzQixTQUFTLHlCQUF5QjtBQUNsQyxTQUFTLGNBQWMscUJBQXFCO0FBQzVDLFNBQVMsWUFBWTtBQUtyQixJQUFNLFNBQ0o7QUFJRixTQUFTLHdCQUF3QjtBQUMvQixTQUFPO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsSUFDUCxTQUFTO0FBQUEsSUFDVCxZQUFZLFNBQVMsUUFBUTtBQUMzQixZQUFNLFNBQVMsUUFBUSxPQUFPO0FBQzlCLGlCQUFXLENBQUMsVUFBVSxLQUFLLEtBQUssT0FBTyxRQUFRLE1BQU0sR0FBRztBQUN0RCxZQUFJLE1BQU0sU0FBUyxRQUFTO0FBQzVCLGNBQU0sV0FBVyxLQUFLLFFBQVEsUUFBUTtBQUN0QyxZQUFJO0FBQ0YsZ0JBQU0sVUFBVSxhQUFhLFVBQVUsTUFBTTtBQUU3QyxjQUFJLENBQUMsUUFBUSxXQUFXLEtBQUssR0FBRztBQUM5QiwwQkFBYyxVQUFVLFNBQVMsU0FBUyxNQUFNO0FBQUEsVUFDbEQ7QUFBQSxRQUNGLFFBQVE7QUFBQSxRQUVSO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0Y7QUFHQSxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixXQUFXO0FBQUEsTUFDVCxNQUFNO0FBQUEsTUFDTixVQUFVO0FBQUEsTUFDVixZQUFZO0FBQUEsTUFDWixVQUFVO0FBQUEsSUFDWixDQUFDO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBTUQsa0JBQWtCO0FBQUEsTUFDaEIsU0FBUztBQUFBO0FBQUEsTUFFVCxhQUFhO0FBQUEsTUFDYixxQkFBcUIsQ0FBQztBQUFBLE1BQ3RCLDJCQUEyQjtBQUFBLE1BQzNCLHVCQUF1QjtBQUFBLE1BQ3ZCLG1CQUFtQjtBQUFBLE1BQ25CLG9CQUFvQjtBQUFBLE1BQ3BCLDBCQUEwQjtBQUFBLE1BQzFCLGlDQUFpQztBQUFBLE1BQ2pDLHNCQUFzQjtBQUFBO0FBQUEsTUFFdEIsMEJBQTBCO0FBQUE7QUFBQSxNQUUxQixzQkFBc0I7QUFBQSxNQUN0QixVQUFVO0FBQUE7QUFBQSxNQUVWLHVCQUF1QjtBQUFBLE1BQ3ZCLG1CQUFtQjtBQUFBLE1BQ25CLGVBQWU7QUFBQSxNQUNmLGlCQUFpQjtBQUFBLE1BQ2pCLGVBQWU7QUFBQSxNQUNmLHFCQUFxQjtBQUFBLE1BQ3JCLHVCQUF1QjtBQUFBLE1BQ3ZCLHNCQUFzQjtBQUFBO0FBQUEsTUFDdEIsS0FBSztBQUFBLElBQ1AsQ0FBQztBQUFBO0FBQUEsSUFFRCxzQkFBc0I7QUFBQSxFQUN4QjtBQUFBLEVBQ0EsTUFBTTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQU9OLE9BQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxJQUNSLFdBQVc7QUFBQSxJQUNYLGVBQWU7QUFBQSxJQUNmLFFBQVE7QUFBQTtBQUFBLElBQ1Isc0JBQXNCO0FBQUE7QUFBQSxJQUN0QixlQUFlO0FBQUEsTUFDYixRQUFRO0FBQUEsUUFDTixhQUFhLElBQUk7QUFFZixjQUNFLEdBQUcsU0FBUyxPQUFPLEtBQ25CLEdBQUcsU0FBUyxXQUFXLEtBQ3ZCLEdBQUcsU0FBUyxrQkFBa0IsR0FDOUI7QUFDQSxtQkFBTztBQUFBLFVBQ1Q7QUFFQSxjQUFJLEdBQUcsU0FBUyxlQUFlLEdBQUc7QUFDaEMsbUJBQU87QUFBQSxVQUNUO0FBRUEsY0FDRSxHQUFHLFNBQVMsbUJBQW1CLEtBQy9CLEdBQUcsU0FBUyx3QkFBd0IsR0FDcEM7QUFDQSxtQkFBTztBQUFBLFVBQ1Q7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLHVCQUF1QjtBQUFBLEVBQ3pCO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFLQSxRQUFRO0FBQUEsSUFDTixZQUFZLEtBQUssVUFBVSwrREFBNEQ7QUFBQSxFQUN6RjtBQUFBO0FBQUE7QUFBQSxFQUlBLFNBQVM7QUFBQSxJQUNQLE1BQU0sQ0FBQyxVQUFVO0FBQUEsRUFDbkI7QUFBQSxFQUVBLFdBQVc7QUFDYixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
