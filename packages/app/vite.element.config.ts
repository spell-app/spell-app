import { readFileSync } from "fs"
import { defineConfig, type Plugin } from "vite"

import environment from "../spell/src/node/environment.ts"
import { appConfig, sharedSolid } from "./vite.shared.ts"

/**
 * Build the `<spell-app>` web component:  `yarn build:element` => `dist-element/`, after `vite.solid.config.ts`.
 * - Two entries:
 *   - `spell-app.js`:  the element, for pages to load -- see `src/runner/element.ts`
 *   - `spell-runtime.js`:  what ONE app runs on, loaded afresh per element -- see `spellRuntime.ts`
 * - What both use goes in shared chunks, e.g. React:  so every app's copy of the runtime shares ONE React.
 *   `spellCore` MUST stay in `spell-runtime.js` alone -- pinned by `element.build.test.ts`.
 * - Solid, `@spell-app/solid-element` and `@spell-app/ui` are NOT bundled:  they come from `spell-solid.js` /
 *   `spell-ui.js` beside it (`sharedSolid()`), which `<spell-editor>` imports too -- one Solid per page.
 *   `spell-runtime.js` never imports them:  compiled spell runs on React.
 * - Fixed names, no hashes:  the element finds the runtime, styles and scope packs beside itself.
 * - One `spell-app.css`, which the element puts in each shadow root -- see `shadowStyles.ts`.
 * - `static/` is copied in, so Semantic UI and Lato sit beside the bundle -- and the built-in types' scope pack,
 *   `spellCore.scopes.js`, see `builtInsPack()`.
 * - Plugins, aliases, dedupe and CSS:  `appConfig()`, as `vite.config.ts`.  `keepNames` MUST stay on -- see
 *   `parser/build.test.ts`.
 */
const shared = appConfig()
export default defineConfig({
  ...shared,
  plugins: [...shared.plugins, sharedSolid(), builtInsPack()],
  publicDir: "static",
  build: {
    chunkSizeWarningLimit: 2000,
    outDir: "dist-element",
    // `vite.solid.config.ts` emptied it
    emptyOutDir: false,
    sourcemap: true,
    cssCodeSplit: false,
    rolldownOptions: {
      input: {
        "spell-app": "src/runner/element.ts",
        "spell-runtime": "src/runner/spellRuntime.ts"
      },
      // keep `spell-runtime.js`'s exports:  nothing in the bundle imports it, the element loads it by URL
      preserveEntrySignatures: "exports-only",
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: (asset) =>
          asset.names?.some((name) => name.endsWith(".css")) ? "spell-app.css" : "[name][extname]",
        keepNames: true,
        // everything both entries use, in ONE chunk with a name that says so -- NOT e.g. `Button.js`
        codeSplitting: { groups: [{ name: "spell-shared", minShareCount: 2 }] }
      }
    }
  },
  define: {
    global: {},
    "process.env": {}
  }
})

/**
 * Copy the built-in types' scope pack, `core`'s `src/spellCore.scopes.js`, beside the bundle -- where
 * `<spell-app>` looks for it.  See `LSP.ScopePack`.
 */
function builtInsPack(): Plugin {
  return {
    name: "spell-built-ins-pack",
    apply: "build",
    generateBundle() {
      const source = readFileSync(`${environment.spellCoreDir}/spellCore.scopes.js`, "utf8")
      this.emitFile({ type: "asset", fileName: "spellCore.scopes.js", source })
    }
  }
}
