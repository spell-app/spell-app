import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

import environment from "./src/environment.ts"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "~": environment.srcDir
    }
  },
  server: {
    port: environment.vitePort,
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: `http://${environment.api_server}:${environment.expressPort}`,
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes("/node_modules/react/") || id.includes("/node_modules/react-dom/")) return "vendor"
        }
      }
    }
  },
  define: {
    global: {},
    "process.env": {}
  }
})
