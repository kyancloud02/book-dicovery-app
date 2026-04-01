import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    sourcemap: false,
  },
  server: {
    // Proxy /api requests to Vercel dev server during local development
    // Run `vercel dev` instead of `vite` to get edge functions locally
    port: 5173,
  },
});
