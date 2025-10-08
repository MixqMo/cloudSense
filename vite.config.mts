// vite.config.mts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    proxy: {
      // /openaq -> https://api.openaq.org/v3/...
      "/openaq": {
        target: "https://api.openaq.org",
        changeOrigin: true,
        secure: true,
        rewrite: (p) => p.replace(/^\/openaq/, "/v3"),
      },
    },
  },
  optimizeDeps: {
    include: [
      "@radix-ui/react-slot",
      "@radix-ui/react-tabs",
      "class-variance-authority",
      "clsx",
      "tailwind-merge",
    ],
  },
});
