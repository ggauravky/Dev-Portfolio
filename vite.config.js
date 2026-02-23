import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";

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
  publicDir: "public",
});
