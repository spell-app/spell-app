import { defineConfig } from "vite"

import { appConfig, sharedSolid } from "./vite.shared.ts"

/**
 * Build the runner bundle for the VS Code extension's "Run Project" webview:  `yarn build:runner`, after
 * `vite.solid.config.ts --outDir dist-runner` (which empties the folder).
 * - Two entries, to FIXED names, so the extension's webview HTML can name them:
 *   - `runner.js` (+ `runner.css`):  the runner, from `src/runner/main.tsx`
 *   - `spell-runtime.js`:  what programs run on, which the runner loads a copy of -- see `spellRuntime.ts`
 * - What both use goes in ONE shared chunk.  `spellCore` MUST stay in `spell-runtime.js` alone --
 *   pinned by `element.build.test.ts`.  As `vite.element.config.ts`, which builds `<spell-app>`.
 * - Solid, `@spell-app/solid-element` and `@spell-app/ui` come from `spell-solid.js` / `spell-ui.js` beside it
 *   (`sharedSolid()`), as in `dist-element/`:  one layout, one pin.
 * - Semantic UI + Lato are NOT bundled:  the webview loads them straight from `static/`.
 * - Plugins, aliases, dedupe and CSS:  `appConfig()`, as `vite.config.ts`.  `keepNames` MUST stay on -- see
 *   `parser/build.test.ts`.
 */
const shared = appConfig()
export default defineConfig({
  ...shared,
  plugins: [...shared.plugins, sharedSolid()],
  build: {
    chunkSizeWarningLimit: 1000,
    outDir: "dist-runner",
    // `vite.solid.config.ts` emptied it
    emptyOutDir: false,
    sourcemap: true,
    cssCodeSplit: false,
    rolldownOptions: {
      input: {
        runner: "src/runner/main.tsx",
        "spell-runtime": "src/runner/spellRuntime.ts"
      },
      // keep `spell-runtime.js`'s exports:  nothing in the bundle imports it, the runner loads it by URL
      preserveEntrySignatures: "exports-only",
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: (asset) =>
          asset.names?.some((name) => name.endsWith(".css")) ? "runner.css" : "[name][extname]",
        keepNames: true,
        codeSplitting: { groups: [{ name: "spell-shared", minShareCount: 2 }] }
      }
    }
  },
  define: {
    global: {},
    "process.env": {}
  }
})
