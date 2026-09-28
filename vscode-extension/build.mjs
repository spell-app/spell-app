/**
 * Bundle the extension into `out/extension.js`, with the parser repo's path built in.
 * - `PARSER_ROOT` is the repo this file sits in, so an INSTALLED copy of the extension (which lives in
 *   VS Code's extensions folder, not here) still knows whose language server to run.
 *   Move the repo and you must rebuild, or set `spell.parserRoot`.
 * - `esbuild` is the repo's own, found up the folder tree.
 * - Fails unless our `version` matches the parser repo's -- the two are pinned together.
 */
import { build } from "esbuild"
import { readFileSync } from "fs"
import { dirname, resolve } from "path"
import { fileURLToPath } from "url"

const here = dirname(fileURLToPath(import.meta.url))

// The extension's version is PINNED to the parser's:  release them together.
const { version } = readJson(resolve(here, "package.json"))
const { version: parserVersion } = readJson(resolve(here, "../package.json"))
if (version !== parserVersion) {
  throw new Error(`vscode-extension version ${version} !== parser version ${parserVersion}:  change them together.`)
}

await build({
  entryPoints: [resolve(here, "src/extension.ts")],
  outfile: resolve(here, "out/extension.js"),
  bundle: true,
  platform: "node",
  format: "cjs",
  target: "node20",
  external: ["vscode"],
  sourcemap: true,
  define: { PARSER_ROOT: JSON.stringify(resolve(here, "..")) },
  logLevel: "info"
})

/** Contents of JSON file `path`. */
function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"))
}
