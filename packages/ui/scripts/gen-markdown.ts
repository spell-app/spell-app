/**
 * `yarn gen:markdown`:  write `src/components/ui-markdown/md.bundle.js` (+ `.d.ts`, + the `MDBundle.ts` wrapper), the
 * PRE-COMPILED markdown engine (`@spell-app/markdown`, on the parser) `<ui-markdown>` can load.
 * - Run after changing `packages/markdown` (or the parser under it);  the files are committed, so `ui` builds and
 *   tests without building markdown.
 * - Why a bundle:  `ui` NEVER imports `$/markdown`'s source (root `AGENTS.md`, "Overview");  as with spell's
 *   highlighter (`gen-spell.ts`), the generated file is the exception.  The build and the two files beside it:
 *   `browserBundles.ts`, shared with `gen-spell.ts`.
 * - Prints the bundle's size, raw and gzipped:  the markdown epic's P7 measures it against marked + DOMPurify.
 * - Slimmed for the browser at BUNDLE time (I6), so markdown, the parser and util stay as node runs them:  lodash as
 *   ES modules, the browser's entity decoder, no chalk.  88.3 => ~59 kB gzipped.
 */
import path from "node:path"
import { fileURLToPath } from "node:url"

import type { Plugin } from "esbuild"

import { REACT_DOM_STUB, buildBundle, declarationFile, wrapperFile } from "./browserBundles.ts"

/** The yarn script, named in every file it writes. */
const COMMAND = "gen:markdown"

/** Where the bundle goes. */
const OUTPUT = fileURLToPath(new URL("../src/components/ui-markdown/", import.meta.url))

/** The bundle's file name, beside its wrapper. */
const BUNDLE = "md.bundle.js"

/**
 * `lodash` (CommonJS:  every required module ships whole) => `lodash-es` (ES modules:  only what's called), and
 * side-effect free, so a helper nothing calls drops out with its imports.  -11 kB raw (markdown epic, I6).
 */
const LODASH_ES: Plugin = {
  name: "lodash-es",
  setup(builder) {
    builder.onResolve({ filter: /^lodash(\/.*)?$/ }, async (args) => {
      const resolved = await builder.resolve(`lodash-es${args.path.slice("lodash".length).replace(/\.js$/, "")}`, {
        kind: args.kind,
        resolveDir: args.resolveDir
      })
      return { ...resolved, sideEffects: false }
    })
  }
}

/**
 * `entities`' `decodeHTMLStrict()` => the browser's own decoder (a `<textarea>`):  no 52 kB entity table, -23 kB
 * gzipped (I6).  Markdown only ever passes it ONE whole reference (`&amp;`, `&#35;`, `&#x22;`).
 * - NOTE:  the browser also decodes LEGACY names without their `;`, so `&notit;` comes back `¬it;`, where strict
 *   decoding (and the spec) leaves it as written.  A real reference decodes to 1-2 characters and never ends in `;`
 *   but `&semi;` itself, so a result that's longer and ends in `;` is a partial match:  keep the text.
 */
const ENTITIES_SHIM: Plugin = {
  name: "entities-shim",
  setup(builder) {
    builder.onResolve({ filter: /^entities$/ }, () => ({ path: "entities", namespace: "entities-shim" }))
    builder.onLoad({ filter: /.*/, namespace: "entities-shim" }, () => ({
      contents: [
        "let box",
        "export function decodeHTMLStrict(text) {",
        "  box ??= document.createElement('textarea')",
        "  box.innerHTML = text",
        "  const decoded = box.value",
        "  return decoded.length > 1 && decoded.endsWith(';') ? text : decoded",
        "}"
      ].join("\n"),
      loader: "js"
    }))
  }
}

/** `chalk` => no colours:  `$/util`'s `Logger` colours node's console, never the page's.  -5 kB raw (I6). */
const CHALK_STUB: Plugin = {
  name: "chalk-stub",
  setup(builder) {
    builder.onResolve({ filter: /^chalk$/ }, () => ({ path: "chalk", namespace: "chalk-stub" }))
    builder.onLoad({ filter: /.*/, namespace: "chalk-stub" }, () => ({
      // `chalk.red.bold("x")` => "x":  every property is chalk again, and a call joins its arguments
      contents:
        "const chalk = new Proxy(() => {}, { get: () => chalk, apply: (_target, _this, args) => args.join(' ') })\n" +
        "export default chalk",
      loader: "js"
    }))
  }
}

/** The engine's type:  `render()` and its options. */
const ENGINE_TYPE = `{
  render(
    text: string,
    options?: {
      ui?: boolean
      headingIds?: boolean
      headingOffset?: number
      breaks?: boolean
      autolinks?: boolean
      tagfilter?: boolean
    }
  ): { html: string; headings: { level: number; text: string; id: string }[] }
}`

await buildBundle({
  command: COMMAND,
  packageFolder: "markdown",
  entry: "src/browser.ts",
  outfile: path.join(OUTPUT, BUNDLE),
  plugins: [REACT_DOM_STUB, LODASH_ES, ENTITIES_SHIM, CHALK_STUB]
})
declarationFile({
  command: COMMAND,
  file: path.join(OUTPUT, "md.bundle.d.ts"),
  name: "engine",
  doc: "The markdown engine:  `render()` ~== `MD.render()` (`$/markdown`).",
  type: ENGINE_TYPE
})
wrapperFile({
  command: COMMAND,
  file: path.join(OUTPUT, "MDBundle.ts"),
  name: "engine",
  bundle: BUNDLE,
  method: "render"
})
