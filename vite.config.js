import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/", // Ensure base path is set for production
  build: {
    outDir: "dist",
    assetsDir: "assets",
    // Copy public folder contents to dist root
    copyPublicDir: true,
  },
  publicDir: "public",
});
