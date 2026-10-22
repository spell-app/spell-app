import { defineConfig } from "vite-plus"

import { fmtConfig, packageLint } from "spell-kit/toolchain/lint"
import environment from "spell-app/spaces/server/node/environment"
import { TOP_REPO, appConfig } from "./vite.shared.ts"

/** Name of the runtime's entry in a build:  `dist/spell-runtime.js` -- see `editor.loadRuntime()`. */
const RUNTIME_ENTRY = "spell-runtime"

/**
 * The editor app:  `yarn start:dev` / `yarn build` => `dist/`.
 * - Plugins, dedupe and CSS:  `appConfig()`.
 * - `iconPacks`:  `spell-ui`'s built-in icon packs go beside the chunk holding `BuiltInPacks` (`assets/`), where
 *   it looks;  the app's Solid UI draws Fomantic names from them (`spell-app/app/solid`'s `loadUI.ts`).
 * - ONE page, so it bundles its own Solid and `ui`:  `spell-solid.js` is the elements' and the runner's.
 */
export default defineConfig({
  // `vp lint` / `vp fmt`:  the repo root's `vite.lint.ts`
  fmt: fmtConfig,
  lint: packageLint({
    name: "app",
    ignorePatterns: ["build", "dist", ".cache", "dist-runner", "dist-element", "static"]
  }),
  ...appConfig({ iconPacks: true }),
  server: {
    // every repo's files, beside spell-app (`appConfig()`'s, which this `server` replaces)
    fs: { allow: [TOP_REPO] },
    port: environment.vitePort,
    host: "0.0.0.0",
    // the page server's:  the API, a project's files, and the elements' bundles for the demo pages (`appRoutes.ts`)
    proxy: {
      "/api": {
        target: `http://${environment.api_server}:${environment.expressPort}`,
        changeOrigin: true
      },
      // a project's files, by their URL:  `/spaces/<project>/<file>` (`SP.SpellUrls`)
      "/spaces": {
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
      // the app, and the runtime its programs run on -- its own entry, so it holds ALL of `core`, at a FIXED
      // name for `editor.loadRuntime()` to import.  See `spellRuntime.ts`.
      input: { index: "index.html", [RUNTIME_ENTRY]: "../src/app/runner/spellRuntime.ts" },
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
