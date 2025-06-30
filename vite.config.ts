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
    host: '0.0.0.0',
    proxy: {
      "/api": {
        target: `http://backend-server:${environment.expressPort}`,
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
  define: {
    global: {},
    "process.env": {},
  },
})
