import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

import environment from "./src/environment.ts"
import { standardDecorators } from "./vite.decorators.ts"
import { spellVersion } from "./vite.spellVersion.ts"

/**
 * Build the runner bundle for the VS Code extension's "Run Project" webview:  `yarn build:runner`.
 * - One entry, `src/app/runner/main.tsx`, to FIXED names `dist-runner/runner.js` + `runner.css`,
 *   so the extension's webview HTML can name them.
 * - One file, no chunks:  the webview loads just what its HTML names.
 * - Semantic UI + Lato are NOT bundled:  the webview loads them straight from `static/`.
 * - Plugins, alias and `define` as `vite.config.ts`.  `keepNames` MUST stay on -- see `parser/build.test.ts`.
 */
export default defineConfig({
  plugins: [standardDecorators(), spellVersion(), react()],
  resolve: {
    alias: {
      "~": environment.srcDir
    }
  },
  build: {
    chunkSizeWarningLimit: 1000,
    outDir: "dist-runner",
    emptyOutDir: true,
    sourcemap: true,
    rolldownOptions: {
      input: "src/app/runner/main.tsx",
      output: {
        entryFileNames: "runner.js",
        assetFileNames: "runner[extname]",
        codeSplitting: false,
        keepNames: true
      }
    }
  },
  define: {
    global: {},
    "process.env": {}
  }
})
