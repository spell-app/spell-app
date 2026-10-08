/**
 * What `gen-spell.ts` and `gen-markdown.ts` share:  each builds ONE browser bundle of another package's source, which
 * `ui` ships PRE-COMPILED (it NEVER imports that source:  root `AGENTS.md`, "Overview"), and writes two files beside
 * it:
 * - the bundle's declaration (`declarationFile()`), for `tsc`
 * - the wrapper `ui` imports (`wrapperFile()`), anchored to `core`:  why, `gen-spell.ts`
 * - Node only:  imported by those two scripts, never by `src/`.
 */
import { readFileSync, statSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { gzipSync } from "node:zlib"

import { build, type Plugin } from "esbuild"

import { Terminal } from "../tools/Terminal.ts"

import { formatFiles } from "./generatedFiles.ts"

/** The repo root. */
export const REPO = fileURLToPath(new URL("../../../", import.meta.url))

/**
 * `react-dom`, stubbed:  `$/util`'s `Observable` pulls in react-easy-state, whose React platform imports `react-dom`
 * for `unstable_batchedUpdates` alone -- ~127 kB minified that neither bundle ever renders with.  The stub batches by
 * just running the function, as easy-state does without React.
 */
export const REACT_DOM_STUB: Plugin = {
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

/** `packages/<packageFolder>/package.json`'s version:  the bundle's `__PACKAGE_VERSION__`, and its banner's. */
export function versionFor(packageFolder: string): string {
  const file = path.join(REPO, "packages", packageFolder, "package.json")
  return (JSON.parse(readFileSync(file, "utf8")) as { version: string }).version
}

/**
 * Build `entry` (in `packages/<packageFolder>/`, its `$/...` imports resolved by that package's `tsconfig.json`) into
 * ONE minified ES module, `outfile`, and print its size, raw and gzipped.
 * - `platform: "browser"`:  esbuild refuses a node built-in, so a bundle that builds is browser-safe.
 * - `keepNames`:  the parser looks rules (and spell's tokens) up by CLASS NAME (`Rule 'sequence' not found` without
 *   it).
 * - SIDE EFFECT:  overwrites `outfile`.
 */
export async function buildBundle({ command, packageFolder, entry, outfile, plugins }: BundleParams): Promise<void> {
  const version = versionFor(packageFolder)
  await build({
    entryPoints: [path.join(REPO, "packages", packageFolder, entry)],
    outfile,
    bundle: true,
    format: "esm",
    platform: "browser",
    target: "es2022",
    minify: true,
    keepNames: true,
    legalComments: "none",
    tsconfig: path.join(REPO, "packages", packageFolder, "tsconfig.json"),
    define: { "process.env.NODE_ENV": '"production"', __PACKAGE_VERSION__: JSON.stringify(version) },
    plugins,
    banner: { js: generatedHeader(command, `from @spell-app/${packageFolder} ${version}`) },
    logLevel: "warning"
  })
  const kilobytes = (statSync(outfile).size / 1024).toFixed(0)
  const gzipped = (gzipSync(readFileSync(outfile)).length / 1024).toFixed(1)
  Terminal.out(`wrote ${path.relative(REPO, outfile)}:  ${kilobytes} kB, ${gzipped} kB gzipped`)
}

/**
 * Write the bundle's declaration, `file`:  `declare const <name>: <type>`, its default export.
 * - Formatted as `yarn format` would (a no-op where the formatter skips the file, `src/languages/`).
 */
export function declarationFile({ command, file, name, doc, type }: DeclarationParams): void {
  const lines = [generatedHeader(command), ``, `/** ${doc} */`, `declare const ${name}: ${type}`]
  writeFileSync(file, [...lines, `export default ${name}`, ``].join("\n"))
  formatFiles([file])
}

/**
 * Write the wrapper, `file`:  it default-exports the bundle, `./<bundle>`, after checking it has `method()`.
 * - It imports `SourceError` (built into `core.js`) and throws it, so the chunk depends on core:  why, `gen-spell.ts`.
 * - Formatted as `yarn format` would (a no-op where the formatter skips the file, `src/languages/`).
 */
export function wrapperFile({ command, file, name, bundle, method }: WrapperParams): void {
  const lines = [
    generatedHeader(command),
    ``,
    `// Import directly:  \`SourceError\` anchors this chunk to core (see gen-spell.ts)`,
    `import { SourceError } from "$/ui/runtime/runtime.types"`,
    ``,
    `import ${name} from "./${bundle}"`,
    ``,
    `if (typeof ${name}?.${method} !== "function") {`,
    `  throw new SourceError("${path.basename(file)}:  ${bundle} has no ${method}();  run \`yarn ${command}\`", {`,
    `    cause: { kind: "render" }`,
    `  })`,
    `}`,
    ``,
    `export default ${name}`,
    ``
  ]
  writeFileSync(file, lines.join("\n"))
  formatFiles([file])
}

/**
 * The comment every generated file opens with, naming the yarn script and its file:  `gen:spell` runs
 * `scripts/gen-spell.ts` (a script is named for its command:  `packages/ui/AGENTS.md`, "Overview").
 */
function generatedHeader(command: string, from?: string): string {
  const script = `packages/ui/scripts/${command.replace(":", "-")}.ts`
  return `/* GENERATED by \`yarn ${command}\` (${script})${from ? ` ${from}` : ""}:  NEVER edit. */`
}

////////////////
// ## Params
////////////////

/** What every generated file names:  the yarn script that writes it. */
type GeneratedParams = {
  /** the yarn script, e.g. `gen:spell` */
  command: string
}

/** `buildBundle()`'s params. */
export type BundleParams = GeneratedParams & {
  /** the source package's folder under `packages/`, e.g. `spell`:  its tsconfig, version and npm name */
  packageFolder: string
  /** its browser entry, relative to that folder, e.g. `src/highlight/browser.ts` */
  entry: string
  /** where the bundle goes */
  outfile: string
  /** esbuild plugins:  stubs and shims that slim it for the browser */
  plugins: Plugin[]
}

/** `declarationFile()`'s params. */
export type DeclarationParams = GeneratedParams & {
  /** the `.d.ts` file */
  file: string
  /** the bundle's default export's name, e.g. `highlighter` */
  name: string
  /** its docstring's text */
  doc: string
  /** its type, e.g. `{ render(text: string): string }` */
  type: string
}

/** `wrapperFile()`'s params. */
export type WrapperParams = GeneratedParams & {
  /** the wrapper file */
  file: string
  /** the bundle's default export's name, e.g. `engine` */
  name: string
  /** the bundle's file name, beside the wrapper, e.g. `md.bundle.js` */
  bundle: string
  /** the method the bundle MUST have, e.g. `render` */
  method: string
}
