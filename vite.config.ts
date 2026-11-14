/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The client never talks to Gemini directly: /api is proxied to the local server,
// which is the only place that reads GEMINI_API_KEY.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { "/api": "http://localhost:8787" },
  },
  test: {
    include: ["src/**/*.test.ts", "shared/**/*.test.ts", "server/**/*.test.ts"],
  },
});
