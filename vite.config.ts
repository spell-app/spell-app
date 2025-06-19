import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { resolve } from "path"

import environment from "./src/environment.js"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "~": environment.srcDir,
    },
  },
  server: {
    port: environment.vitePort,
    proxy: {
      "/api": {
        target: `http://localhost:${environment.expressPort}`,
        changeOrigin: true,
      },
    },
  },
  define: {
    global: {},
    "process.env": {},
  },
})
