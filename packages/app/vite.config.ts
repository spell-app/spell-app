import { defineConfig } from "vite-plus"

import { fmtConfig, packageLint } from "../../vite.lint.ts"
import environment from "../spell/src/node/environment.ts"
import { appConfig } from "./vite.shared.ts"

/** Name of the runtime's entry in a build:  `dist/spell-runtime.js` -- see `editor.loadRuntime()`. */
const RUNTIME_ENTRY = "spell-runtime"

/**
 * The editor app:  `yarn start:dev` / `yarn build` => `dist/`.
 * - Plugins, aliases, dedupe and CSS:  `appConfig()`.
 * - `iconPacks`:  `@spell-app/ui`'s built-in icon packs go beside the chunk holding `BuiltInPacks` (`assets/`), where
 *   it looks;  the app's Solid UI draws Fomantic names from them (`$/app/solid`'s `loadUI.ts`).
 * - ONE page, so it bundles its own Solid and `ui`:  `spell-solid.js` is the elements' and the runner's.
 */
export default defineConfig({
  // `vp lint` / `vp fmt`:  the repo root's `vite.lint.ts`
  fmt: fmtConfig,
  lint: packageLint({
    ignorePatterns: ["build", "dist", ".cache", "dist-runner", "dist-element", "static"]
  }),
  ...appConfig({ iconPacks: true }),
  server: {
    port: environment.vitePort,
    host: "0.0.0.0",
    // the page server's:  the API, and the elements' bundles for the demo pages (`appRoutes.ts`)
    proxy: {
      "/api": {
        target: `http://${environment.api_server}:${environment.expressPort}`,
        changeOrigin: true
      },
      "/element": {
        target: `http://${environment.api_server}:${environment.expressPort}`,
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      // the app, and the runtime its programs run on -- its own entry, so it holds ALL of `spellCore`, at a FIXED
      // name for `editor.loadRuntime()` to import.  See `spellRuntime.ts`.
      input: { index: "index.html", [RUNTIME_ENTRY]: "src/runner/spellRuntime.ts" },
      // keep `spell-runtime.js`'s exports by NAME:  it's compiled spell's `@spell/core`
      preserveEntrySignatures: "exports-only",
      output: {
        entryFileNames: (chunk) => (chunk.name === RUNTIME_ENTRY ? `${RUNTIME_ENTRY}.js` : "assets/[name]-[hash].js"),
        // MUST stay on:  rules defined as classes register under their class name (`Rule.instantiate()`),
        // so minifying class names away would silently break every grammar.  See `build.test.ts`.
        keepNames: true
      }
    }
  },
  define: {
    global: {},
    "process.env": {}
  }
})
