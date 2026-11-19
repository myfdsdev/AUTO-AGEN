// Two pages, one per Tauri window: index.html is the settings window ("main"), island.html the island.
import { defineConfig } from "vite";
import { resolve } from "node:path";

const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
  clearScreen: false,
  server: { port: 1420, strictPort: true, host: host || false, watch: { ignored: ["**/src-tauri/**"] } },
  build: {
    target: "chrome110",
    rollupOptions: { input: { main: resolve(__dirname, "index.html"), island: resolve(__dirname, "island.html") } },
  },
});
