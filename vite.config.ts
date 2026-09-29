import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

import environment from "./src/environment.ts"
import { standardDecorators } from "./vite.decorators.ts"
import { packageVersion } from "./vite.packageVersion.ts"
import { importMap } from "./vite.importMap.ts"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [standardDecorators(), packageVersion(), importMap(), react()],
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
        // MUST stay on:  rules defined as classes register under their class name (`Rule.instantiate()`),
        // so minifying class names away would silently break every grammar.  See `build.test.ts`.
        keepNames: true,
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
