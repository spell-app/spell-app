/**
 * `yarn tsx tools/bundle-experiment.ts <entry.ts> [<out.js>]` (from `packages/docs`):  a guide's own live elements as
 * ONE classic script, built from a TypeScript entry in the guide's `experiments/` folder.
 *
 *     yarn tsx tools/bundle-experiment.ts ../../guides/custom-elements/experiments/custom-elements.entry.ts
 *
 * - What it's for:  a page that teaches with WORKING elements of its own (the custom elements guide's
 *   `<ui-counter>`) loads the script right after `spell-ui.js`;  the elements it defines extend the page's own
 *   Spell UI, so they work like any `<ui-*>` there.
 * - `<out.js>`:  default, the entry's name with `.bundle.js` for `.entry.ts`, beside it.
 * - Built as a component pack's script is (`spell dev pack build`, `packages/cli/src/dev/packBuild.ts`):
 *   - Vite, on Spell UI's `baseConfig()`:  decorators BEFORE Solid, Solid's JSX, Lightning CSS
 *   - one minified IIFE, banner first, saying how it was built
 *   - every `PACK_MODULES` specifier (`solid-js`, `@solidjs/web`, `$/ui/core`, `$/ui/forms`) left external,
 *     read from `globalThis.SpellUI.packModules`:  the page's one Solid and one Spell UI core
 * - Unlike a pack:
 *   - no `<ui-root>` catalog, no `registerPack()`:  the entry defines its tags itself, as the script runs
 *   - it may import Spell UI's DOC-ONLY families (`$/ui/docs-components/<family>`, e.g. `<ui-docs-inspector>`),
 *     bundled from this checkout's source;  any other `$/ui/...` module, Solid or `@spell-app/...` import fails
 * - Why not in `spell-ui.js`:  that bundle is built from `ui`'s `dist/`, which has no docs families;  and only the
 *   page that needs these pays for them.
 * - The entry lives in SHARED content, which has no `node_modules`:  `$/ui/docs-components/...` resolves to THIS
 *   checkout's `packages/ui/src/` by alias, so the script is built from the branch that runs this.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { basename, dirname, join, relative, resolve } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

import { parseArgs } from "./pages.js"

/** `packages/docs`. */
const DOCS = resolve(dirname(fileURLToPath(import.meta.url)), "..")

/** `packages/ui`:  its Vite config (`baseConfig()`) and the docs families' source. */
const UI_DIR = join(DOCS, "../ui")

/**
 * The modules a script SHARES with the page instead of bundling:  each read from
 * `globalThis.SpellUI.packModules[<specifier>]` (the docs bundle's, `spell-ui.entry.js`).
 * - The same list as the pack build's `PACK_MODULES` (`packages/cli/src/dev/packBuild.ts`):  keep them in step.
 *   Not imported from there:  `packBuild.ts` reaches `$/util`'s barrel, which this package's `tsc` can't check.
 */
const PACK_MODULES = ["solid-js", "@solidjs/web", "$/ui/core", "$/ui/forms"]

/** Imports bundled from `ui`'s source:  the doc-only families and what they import of `ui` beyond the core. */
const UI_SOURCE = /^\$\/ui\/(docs-components|components\/components\.types)(\/|$)/

/** Imports the page must share, never bundled:  Spell UI, Solid, our other packages (as `packBuild.ts`). */
const SHARED_IMPORT = /^\$\/ui(\/|$)|^solid-js(\/|$)|^@solidjs\/|^@spell-app\//

const { positional } = parseArgs(process.argv.slice(2))
const entry = positional[0] ? resolve(positional[0]) : ""
if (!entry.endsWith(".ts") || !existsSync(entry)) {
  console.error("usage:  yarn tsx tools/bundle-experiment.ts <entry.ts> [<out.js>]")
  process.exit(1)
}
const out = resolve(positional[1] ?? entry.replace(/(\.entry)?\.ts$/, ".bundle.js"))
await bundle(entry, out)
console.log(`wrote ${relative(process.cwd(), out)}`)

/**
 * Build `entry` into `out`.
 * - In this process, through Vite's API;  `configFile: false`, as the pack build.
 */
async function bundle(entry: string, out: string) {
  const { build } = await import("vite-plus")
  const config = pathToFileURL(join(UI_DIR, "vite.config.ts")).href
  const { baseConfig } = (await import(config)) as { baseConfig: () => Record<string, any> }
  const base = baseConfig()
  await build({
    ...base,
    configFile: false,
    root: dirname(entry),
    logLevel: "warn",
    publicDir: false,
    resolve: {
      ...base.resolve,
      alias: [{ find: /^\$\/ui\//, replacement: `${join(UI_DIR, "src")}/` }]
    },
    build: {
      outDir: dirname(out),
      emptyOutDir: false,
      sourcemap: false,
      minify: true,
      target: "esnext",
      reportCompressedSize: false,
      lib: { entry, formats: ["iife"], name: "SpellExperiment", fileName: () => basename(out) },
      rolldownOptions: {
        external: (id: string) => {
          if (PACK_MODULES.includes(id)) return true
          if (SHARED_IMPORT.test(id) && !UI_SOURCE.test(id)) {
            throw new Error(
              `bundle-experiment:  '${id}' can't be shared with the page;  import from ` +
                `${PACK_MODULES.map((it) => `'${it}'`).join(", ")}, or a doc-only family ('$/ui/docs-components/<family>')`
            )
          }
          return false
        },
        output: {
          // custom element class names are read by dev-time warnings (see ui's `vite.config.ts`)
          keepNames: true,
          globals: (id: string) => `globalThis.SpellUI.packModules[${JSON.stringify(id)}]`
        }
      }
    }
  })
  // The banner goes on AFTER the build:  the minifier drops `output.banner`'s comment
  const command = `yarn tsx tools/bundle-experiment.ts ${relative(DOCS, entry)}`
  const banner = `/* GENERATED -- do not edit:  \`${command}\` (from packages/docs) */`
  writeFileSync(out, `${banner}\n${readFileSync(out, "utf8")}`)
}
