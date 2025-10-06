import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Config mínima + alias @ → src
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
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
