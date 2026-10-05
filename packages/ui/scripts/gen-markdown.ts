/**
 * Generates `src/components/ui-markdown/md.bundle.js` (+ `.d.ts`, + the `MDBundle.ts` wrapper):  the PRE-COMPILED
 * markdown engine (`@spell-app/markdown`, on the parser) `<ui-markdown>` can load.
 * - Run with `yarn gen:markdown` after changing `packages/markdown` (or the parser under it);  the files are committed,
 *   so `ui` builds and tests without building markdown.
 * - Why a bundle:  `ui` NEVER imports `$/markdown`'s source (root `AGENTS.md`, "Overview");  as with spell's
 *   highlighter (`gen-spell.ts`, whose shape this copies), the generated file is the exception.
 * - Prints the bundle's size, raw and gzipped:  the markdown epic's P7 measures it against marked + DOMPurify.
 * - Slimmed for the browser at BUNDLE time (I6), so markdown, the parser and util stay as node runs them:  lodash as
 *   ES modules, the browser's entity decoder, no chalk.  88.3 => ~59 kB gzipped.
 */
import { readFileSync, statSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { gzipSync } from "node:zlib"

import { build, type Plugin } from "esbuild"

/** The repo root. */
const REPO = fileURLToPath(new URL("../../../", import.meta.url))

/** Markdown's browser entry, and the tsconfig whose `paths` resolve its `$/...` imports. */
const ENTRY = path.join(REPO, "packages/markdown/src/browser.ts")
const TSCONFIG = path.join(REPO, "packages/markdown/tsconfig.json")

/** Where the bundle goes. */
const OUTPUT = fileURLToPath(new URL("../src/components/ui-markdown/", import.meta.url))

/** Markdown's version, for `__PACKAGE_VERSION__`. */
const VERSION = (
  JSON.parse(readFileSync(path.join(REPO, "packages/markdown/package.json"), "utf8")) as { version: string }
).version

/** `react-dom`, stubbed, as in `gen-spell.ts`:  `$/util` pulls it in for a batching helper nothing here renders with. */
const REACT_DOM_STUB: Plugin = {
  name: "react-dom-stub",
  setup(builder) {
    builder.onResolve({ filter: /^react-dom$/ }, () => ({ path: "react-dom", namespace: "react-dom-stub" }))
    builder.onLoad({ filter: /.*/, namespace: "react-dom-stub" }, () => ({
      contents:
        "export const unstable_batchedUpdates = (fn, ...args) => fn(...args)\nexport default { unstable_batchedUpdates }",
      loader: "js"
    }))
  }
}

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

const outfile = path.join(OUTPUT, "md.bundle.js")
await build({
  entryPoints: [ENTRY],
  outfile,
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "es2022",
  minify: true,
  // rules are looked up by CLASS NAME
  keepNames: true,
  legalComments: "none",
  tsconfig: TSCONFIG,
  define: { "process.env.NODE_ENV": '"production"', __PACKAGE_VERSION__: JSON.stringify(VERSION) },
  plugins: [REACT_DOM_STUB, LODASH_ES, ENTITIES_SHIM, CHALK_STUB],
  banner: {
    js: `/* GENERATED by \`yarn gen:markdown\` (packages/ui/scripts/gen-markdown.ts) from @spell-app/markdown ${VERSION}:  NEVER edit. */`
  },
  logLevel: "warning"
})
writeFileSync(path.join(OUTPUT, "md.bundle.d.ts"), declaration())
writeFileSync(path.join(OUTPUT, "MDBundle.ts"), wrapper())
const bytes = readFileSync(outfile)
console.log(
  `wrote ${path.relative(REPO, outfile)}:  ${(statSync(outfile).size / 1024).toFixed(0)} kB, ` +
    `${(gzipSync(bytes).length / 1024).toFixed(1)} kB gzipped`
)

/** `md.bundle.d.ts`:  the bundle's default export. */
function declaration(): string {
  return [
    `/* GENERATED by \`yarn gen:markdown\` (packages/ui/scripts/gen-markdown.ts):  NEVER edit. */`,
    ``,
    `/** The markdown engine:  \`render()\` ~== \`MD.render()\` (\`$/markdown\`). */`,
    `declare const engine: {`,
    `  render(`,
    `    text: string,`,
    `    options?: { ui?: boolean; headingIds?: boolean; headingOffset?: number; breaks?: boolean; autolinks?: boolean; tagfilter?: boolean }`,
    `  ): { html: string; headings: { level: number; text: string; id: string }[] }`,
    `}`,
    `export default engine`,
    ``
  ].join("\n")
}

/** `MDBundle.ts`:  the chunk `<ui-markdown>` loads, anchored to `core` (see `gen-spell.ts`). */
function wrapper(): string {
  return [
    `/* GENERATED by \`yarn gen:markdown\` (packages/ui/scripts/gen-markdown.ts):  NEVER edit. */`,
    ``,
    `// Import directly:  \`SourceError\` anchors this chunk to core (see gen-spell.ts)`,
    `import { SourceError } from "$/ui/runtime/runtime.types"`,
    ``,
    `import engine from "./md.bundle.js"`,
    ``,
    `if (typeof engine?.render !== "function") {`,
    `  throw new SourceError("render", "md.bundle.js has no render():  run \`yarn gen:markdown\`")`,
    `}`,
    ``,
    `export default engine`,
    ``
  ].join("\n")
}
