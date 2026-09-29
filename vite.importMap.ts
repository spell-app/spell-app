import type { Plugin } from "vite"

import { SPELL_CORE_MODULE } from "./src/spellCore/spellCore.types.ts"
import { SPELL_PROJECT_MODULE } from "./src/languages/spell/spell.types.ts"

/** Name of `spellCore`'s own entry in a build:  `dist/spell-core.js`. */
const SPELL_CORE_ENTRY = "spell-core"

/**
 * Put an import map in the page, so compiled spell's `import`s resolve -- compiled spell uses NO globals:
 *   `import { spellCore, Thing } from "@spell/core"`
 *   `import { Card } from "@spell/project/@system:library:cards"`
 * - `@spell/core` => the SAME `spellCore` module the app uses:  a second copy would be a second `RUNTIME`.
 *   - dev:  `/src/spellCore/index.ts`, which vite serves, as it does for the app's own `~/spellCore` imports
 *   - build:  its own entry, `spell-core.js` -- a FIXED name, and its exports kept by name, so the map can say
 *     where it is and compiled code can import from it.  The app's chunks import it too.
 * - `@spell/project/` => the server's `/api/projects/compiled/`, which answers a project's compiled JS.
 * - Import maps also apply to `blob:` modules -- NOT to the VS Code runner's webview, which has no map;  see
 *   `runCompiled()` in `src/app/runner/VSCodeRunner.tsx`.
 * - MUST be used by `vite.config.ts`.  NOT `vitest.config.ts`:  tests never run compiled output in a page.
 */
export function importMap(): Plugin {
  let base = "/"
  let isBuild = false
  return {
    name: "spell-import-map",
    config(_config, { command }) {
      if (command !== "build") return
      return {
        build: {
          rollupOptions: {
            input: { index: "index.html", [SPELL_CORE_ENTRY]: "src/spellCore/index.ts" },
            // keep `spell-core.js`'s exports by NAME -- compiled spell imports them
            preserveEntrySignatures: "exports-only",
            output: {
              entryFileNames: (chunk) =>
                chunk.name === SPELL_CORE_ENTRY ? `${SPELL_CORE_ENTRY}.js` : "assets/[name]-[hash].js"
            }
          }
        }
      }
    },
    configResolved(config) {
      base = config.base
      isBuild = config.command === "build"
    },
    transformIndexHtml() {
      const imports = {
        [SPELL_CORE_MODULE]: isBuild ? `${base}${SPELL_CORE_ENTRY}.js` : `${base}src/spellCore/index.ts`,
        [SPELL_PROJECT_MODULE]: `${base}api/projects/compiled/`
      }
      // FIRST in <head>:  an import map must precede every module script
      return [
        { tag: "script", attrs: { type: "importmap" }, children: JSON.stringify({ imports }), injectTo: "head-prepend" }
      ]
    }
  }
}
