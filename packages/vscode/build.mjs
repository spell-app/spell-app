/**
 * Bundle the extension into `out/extension.js`, with the spell monorepo's path built in.
 * - `REPO_ROOT` is the monorepo this file sits in, so an INSTALLED copy of the extension (which lives in
 *   VS Code's extensions folder, not here) still knows whose language server to run.
 *   Move the monorepo and you must rebuild, or set `spell.parserRoot`.
 * - `esbuild` is the repo's own, found up the folder tree.
 * - Fails unless our `version` matches `spell`'s -- the two are pinned together.
 * - SIDE EFFECT: also builds `app`'s runner bundle, `dist-runner/`, for "Run Project".
 */
import { build } from "esbuild"
import { execSync } from "child_process"
import { readFileSync } from "fs"
import { dirname, resolve } from "path"
import { fileURLToPath } from "url"

const here = dirname(fileURLToPath(import.meta.url))

// The extension's version is PINNED to spell's:  release them together.
const { version } = readJson(resolve(here, "package.json"))
const { version: parserVersion } = readJson(resolve(here, "../spell/package.json"))
if (version !== parserVersion) {
  throw new Error(`vscode extension version ${version} !== spell version ${parserVersion}:  change them together.`)
}

// "Run Project"'s webview code lives in `app` -- see `RunnerPanel.ts`.
execSync("yarn build:runner", { cwd: resolve(here, "../app"), stdio: "inherit" })

await build({
  entryPoints: [resolve(here, "src/extension.ts")],
  outfile: resolve(here, "out/extension.js"),
  bundle: true,
  platform: "node",
  format: "cjs",
  target: "node20",
  external: ["vscode"],
  sourcemap: true,
  define: { REPO_ROOT: JSON.stringify(resolve(here, "../..")) },
  logLevel: "info"
})

/** Contents of JSON file `path`. */
function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"))
}
