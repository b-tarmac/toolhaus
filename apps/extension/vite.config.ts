import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./manifest.json";
import path from "path";

export default defineConfig({
  plugins: [react(), crx({ manifest })],
  build: {
    rollupOptions: {
      input: {
        popup: "popup/index.html",
        "auth-callback": "auth-callback.html",
      },
    },
  },
  resolve: {
    alias: {
      "@tools": path.resolve(__dirname, "../web/lib/tools"),
    },
  },
});
