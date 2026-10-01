/*!
 * @spell-app/solid-element -- MIT licence.
 * A fork of `@solidjs/element` and `component-register` (MIT, (c) Ryan Carniato).
 */

/**
 * `yarn measure`:  size and LOC of this package vs `@solidjs/element` + `component-register`.
 * - Size:  each entry bundled with esbuild, minified, `solid-js` / `@solidjs/*` external, then gzip level 9
 *   (kB = 1000 bytes), as `@spell-app/ui`'s `yarn measure` does.  `import.meta.hot` => `undefined`, as in a production
 *   build.
 * - LOC:  `wc -l` of the sources (tests and `testing.ts` excluded), plus "code" lines (not blank, not comment).
 * - Writes `measure-results.json`.
 */

import { build } from "esbuild"
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { gzipSync } from "node:zlib"

/** Absolute path of a file in this package. */
const here = (path: string) => new URL(`../${path}`, import.meta.url).pathname

const fork = await measure("fork", here("src/index.ts"))
const original = await measure("original", installed("@solidjs/element/dist/index.js"))

const forkSources = readdirSync(here("src"))
  .filter((name) => name.endsWith(".ts") && !name.includes(".test.") && name !== "testing.ts")
  .map((name) => here(`src/${name}`))
const originalSources = [
  installed("@solidjs/element/dist/index.js"),
  installed("component-register/dist/component-register.js")
]

const results = {
  size: { fork, original },
  loc: { fork: lines(forkSources), original: lines(originalSources) }
}
writeFileSync(here("measure-results.json"), JSON.stringify(results, null, 2) + "\n")
console.log(
  [
    "| | min | min + gzip 9 | LOC (all) | LOC (code) |",
    "|---|---:|---:|---:|---:|",
    row("`@solidjs/element` rc.11 + `component-register` 0.8.8", original, results.loc.original),
    row("`@spell-app/solid-element`", fork, results.loc.fork)
  ].join("\n")
)

/**
 * Absolute path of a file inside an installed package:  `node_modules/<path>` here or in any parent folder.
 * - Why:  yarn hoists to the repo root, so this package's own `node_modules` rarely holds it.
 */
function installed(path: string): string {
  for (let folder = dirname(here("package.json")); ; folder = dirname(folder)) {
    const file = join(folder, "node_modules", path)
    if (existsSync(file)) return file
    if (dirname(folder) === folder) throw new Error(`${path} is not installed`)
  }
}

/** Minified and gzipped bytes of `entry`, peers external. */
async function measure(name: string, entry: string) {
  const result = await build({
    entryPoints: [entry],
    bundle: true,
    minify: true,
    format: "esm",
    write: false,
    legalComments: "none",
    external: ["solid-js", "solid-js/*", "@solidjs/*"],
    // as every production build does (Vite replaces it):  the HMR code behind it is dev only
    define: { "import.meta.hot": "undefined" },
    logLevel: "silent"
  })
  const code = result.outputFiles[0]!.contents
  return { name, min: code.length, gzip: gzipSync(code, { level: 9 }).length }
}

/** Total and code lines of `files`. */
function lines(files: string[]) {
  let all = 0
  let code = 0
  for (const file of files) {
    const text = readFileSync(file, "utf8").split("\n")
    if (text.at(-1) === "") text.pop()
    all += text.length
    let comment = false
    for (const raw of text) {
      const line = raw.trim()
      if (comment) {
        if (line.includes("*/")) comment = false
        continue
      }
      if (line.startsWith("/*")) {
        comment = !line.includes("*/")
        continue
      }
      if (line && !line.startsWith("//")) code++
    }
  }
  return { files: files.length, all, code }
}

/** One markdown table row. */
function row(label: string, size: { min: number; gzip: number }, loc: { all: number; code: number }) {
  return `| ${label} | ${(size.min / 1000).toFixed(2)} kB | ${(size.gzip / 1000).toFixed(2)} kB | ${loc.all} | ${loc.code} |`
}
