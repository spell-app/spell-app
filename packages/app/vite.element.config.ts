import { readFileSync } from "fs"
import { fileURLToPath } from "node:url"
import { defineConfig, type Plugin } from "vite"

import environment from "../spell/src/node/environment.ts"
import { appConfig, sharedSolid } from "./vite.shared.ts"

/**
 * Build the `<spell-app>` web component:  `yarn build:element` => `dist-element/`, after `vite.solid.config.ts`.
 * - Two entries:
 *   - `spell-app.js`:  the element, for pages to load -- see `components/spell-app/index.ts`
 *   - `spell-runtime.js`:  what ONE app runs on, loaded afresh per element -- see `spellRuntime.ts`
 * - What both use goes in shared chunks, e.g. React:  so every app's copy of the runtime shares ONE React.
 *   `spellCore` MUST stay in `spell-runtime.js` alone -- pinned by `element.build.test.ts`.
 * - Solid, `ui`'s element core and `@spell-app/ui` are NOT bundled:  they come from `spell-solid.js` /
 *   `spell-ui.js` beside it (`sharedSolid()`), which `<spell-editor>` imports too -- one Solid per page.
 *   `spell-runtime.js` never imports them:  compiled spell runs on React.
 * - Fixed names, no hashes:  the element finds the runtime, styles and scope packs beside itself.
 * - One `spell-app.css`, which the element puts in each shadow root -- see `shadowStyles.ts`.
 * - `static/` is copied in, so Semantic UI and Lato sit beside the bundle --
 *   and the built-in types' scope pack, `spellCore.scopes.js`, see `builtInsPack()`.
 * - And the component pack of both elements, `spell.pack.js`:  see `componentPack()`.
 * - Plugins, aliases, dedupe and CSS:  `appConfig()`, as `vite.config.ts`.  `keepNames` MUST stay on --
 *   see `parser/build.test.ts`.
 */
const shared = appConfig()
export default defineConfig({
  ...shared,
  plugins: [...shared.plugins, sharedSolid(), builtInsPack(), componentPack()],
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
        "spell-app": "components/spell-app/index.ts",
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
 * Copy the built-in types' scope pack, `core`'s `src/spellCore.scopes.js`, beside the bundle --
 * where `<spell-app>` looks for it.  See `LSP.ScopePack`.
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

////////////////
// ## The component pack
////////////////

/** The element families, `packages/app/components/<tag>/`:  each one's barrel is the entry of `<tag>.js`. */
const COMPONENTS = fileURLToPath(new URL("components", import.meta.url))

/**
 * Spell UI's `RootCatalog` (`packages/ui/tools/RootCatalog.ts`), which reads a catalog from vocabularies.
 * - Imported as the build runs, by URL:  a static import would have `tsc -p tsconfig.node.json` check `ui`'s source,
 *   whose `$/ui/...` aliases this config doesn't have.  Node runs its `.ts` files as they are (type stripping).
 */
const ROOT_CATALOG = new URL("../ui/tools/RootCatalog.ts", import.meta.url).href

/** What `RootCatalog` knows of a tag:  `RootCatalogEntry` (its folder, its skeleton). */
type CatalogEntry = { readonly folder: string; readonly skeleton?: unknown }

/** The pack's script, beside the bundle. */
const PACK_FILE = "spell.pack.js"

/** The pack's name (as its file implies:  `ComponentPacks.nameFor()`) and its tags' prefix. */
const PACK = { name: "spell", prefix: "spell-" }

/**
 * Write `spell.pack.js`:  `<spell-app>` and `<spell-editor>` as a Spell UI COMPONENT PACK, which a page with a
 * `<ui-root>` loads through `<ui-components source>`, as the docs' pages load `epics.pack.js`:
 *
 *     <script type="module" src="/element/spell-ui.js"></script>
 *     <ui-root>
 *       <ui-components source="/element/spell.pack.js"></ui-components>
 *       <spell-app project="@examples/Solitaire" toolbar></spell-app>
 *     </ui-root>
 *
 * - A classic script calling `SpellUI.registerPack({ name, prefix, catalog, define })` as it runs:
 *   `spell-ui.js` (`vite.solid.config.ts`) puts `registerPack` there.  Its `catalog` is read from the families'
 *   vocabularies by Spell UI's own `RootCatalog`, as `spell dev pack build` reads a pack's.
 * - Its `define()` imports each family's ES module beside it (`spell-app.js`, `spell-editor.js`):
 *   NOT one script holding them, as `spell dev pack build` makes,
 *   because the elements need what a classic script can't have --
 *   Monaco and the parser as lazy chunks, `spell-runtime.js` loaded afresh per app, React shared between them.
 * - So it works only where Solid and Spell UI are THIS bundle's (`spell-solid.js`, `spell-ui.js`):  NOT on a docs page,
 *   whose bundle brings its own;  two Solids on a page fail silently.
 */
function componentPack(): Plugin {
  return {
    name: "spell-component-pack",
    apply: "build",
    async generateBundle() {
      const { RootCatalog } = (await import(/* @vite-ignore */ ROOT_CATALOG)) as {
        RootCatalog: { read(roots: string[]): Promise<Record<string, CatalogEntry>> }
      }
      const catalog = await RootCatalog.read([COMPONENTS])
      this.emitFile({ type: "asset", fileName: PACK_FILE, source: packSource(catalog) })
    }
  }
}

/** The text of `spell.pack.js`, for `catalog`. */
function packSource(catalog: Record<string, CatalogEntry>): string {
  const folders = [...new Set(Object.values(catalog).map((entry) => entry.folder))].sort()
  const imports = folders.map((folder) => `import(at(${JSON.stringify(`${folder}.js`)}))`)
  return `/* GENERATED -- do not edit:  \`yarn build:element\` (\`componentPack()\`, \`vite.element.config.ts\`) */
/**
 * The \`${PACK.name}\` component pack:  ${Object.keys(catalog)
   .sort()
   .map((tag) => `<${tag}>`)
   .join(", ")}, for a \`<ui-root>\` page:
 * \`<ui-components source=".../${PACK_FILE}">\`.  Its \`define()\` imports each family's module, beside this file.
 */
;(() => {
  const here = document.currentScript.src
  const at = (file) => new URL(file, here).href
  globalThis.SpellUI.registerPack({
    name: ${JSON.stringify(PACK.name)},
    prefix: ${JSON.stringify(PACK.prefix)},
    catalog: ${JSON.stringify(catalog)},
    define: () => Promise.all([${imports.join(", ")}])
  })
})()
`
}
