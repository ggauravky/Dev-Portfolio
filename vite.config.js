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
  build: {
    outDir: "dist",
    assetsDir: "assets",
    // Copy public folder contents to dist root
    copyPublicDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          analytics: ["@vercel/analytics"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  publicDir: "public",
});
