import { defineConfig } from "vite"

import { appConfig, sharedSolid } from "./vite.shared.ts"

/**
 * Build the page side of a program running elsewhere,
 * e.g. a Python program served by Quart (epic `python-target` P20).
 * - `yarn build:page` builds it into `dist-page/`,
 *   after `vite.solid.config.ts --outDir dist-page` (which empties the folder).
 * - One entry, to a FIXED name, so a page's import map can name it:
 *   `spell-page.js`, the page's `@spell/core` -- see `src/app/runner/spellPage.ts`.
 * - Solid and `spell-ui` come from `spell-solid.js` / `spell-ui.js` beside it (`sharedSolid()`),
 *   as in `dist-runner/`.
 * - `static/` is copied in, so Semantic UI and Lato sit beside it, for the page to link.
 * - Plugins, dedupe and CSS:  `appConfig()`, as `vite.config.ts`.
 *   `keepNames` MUST stay on -- see `parser/build.test.ts`.
 */
const shared = appConfig()
export default defineConfig({
  ...shared,
  plugins: [...shared.plugins, sharedSolid()],
  base: "./",
  publicDir: "static",
  build: {
    chunkSizeWarningLimit: 2000,
    outDir: "dist-page",
    // `vite.solid.config.ts` emptied it
    emptyOutDir: false,
    sourcemap: true,
    cssCodeSplit: false,
    rolldownOptions: {
      input: { "spell-page": "../src/app/runner/spellPage.ts" },
      // keep its exports:  nothing in the bundle imports it, the page's import map names it
      preserveEntrySignatures: "exports-only",
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: (asset) =>
          asset.names?.some((name) => name.endsWith(".css")) ? "spell-page.css" : "[name][extname]",
        keepNames: true
      }
    }
  },
  define: {
    global: {},
    "process.env": {}
  }
})
