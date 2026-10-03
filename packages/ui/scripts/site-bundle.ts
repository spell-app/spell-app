/**
 * `yarn site:bundle`:  build the Spell UI site's bundle, `site/_assets/` (COMMITTED), from `site/_src/site.ts`
 * with `vite.site.config.ts`, then report its sizes.
 * - Clears `site/_assets/` first (everything but `icon-packs`), so a removed chunk doesn't linger in git.
 * - Icon packs:  `site/_assets/icon-packs` is a SYMLINK to `../../src/icons/icon-packs` (~8.7 MB, ~2,200 SVGs), made
 *   here if missing, NOT a copy:  committing the packs twice would double them in every clone.  The page server
 *   follows it;  a static deploy must copy through it (`cp -RL`).
 * - Sizes:  every file but the packs, raw and gzipped;  EAGER is `site.css` + `site.js` and the chunks it imports
 *   statically (what a page loads before any `import()`).
 */
import { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, symlinkSync } from "node:fs"
import path from "node:path"
import { gzipSync } from "node:zlib"
import { build } from "vite"

import { SITE_ASSETS } from "../vite.site.config.ts"

/** The packs link inside `_assets/`, and where it points (relative, so the checkout can move). */
const PACKS = path.join(SITE_ASSETS, "icon-packs")
const PACKS_TARGET = "../../src/icons/icon-packs"

/** A static `import ... from "./x.js"` / `import "./x.js"` in minified output (never `import("./x.js")`). */
const STATIC_IMPORT = /(?:^|[;}\n])\s*(?:import|export)(?:[^"'();]*?from)?\s*["'](\.\.?\/[^"']+)["']/g

mkdirSync(SITE_ASSETS, { recursive: true })
for (const entry of readdirSync(SITE_ASSETS)) {
  if (entry !== "icon-packs") rmSync(path.join(SITE_ASSETS, entry), { recursive: true, force: true })
}
const started = performance.now()
await build({ configFile: path.resolve(import.meta.dirname, "../vite.site.config.ts") })
if (!existsSync(PACKS) && !isLink(PACKS)) symlinkSync(PACKS_TARGET, PACKS, "dir")
if (!statSync(PACKS).isDirectory()) throw new Error(`${PACKS} doesn't lead to the icon packs`)
report((performance.now() - started) / 1000)

/** Is `file` a symlink (even a broken one)? */
function isLink(file: string): boolean {
  try {
    return lstatSync(file).isSymbolicLink()
  } catch {
    return false
  }
}

/** Print the bundle's sizes:  eager files, totals, the biggest lazy chunks. */
function report(seconds: number): void {
  const files = walk(SITE_ASSETS).filter((file) => !file.startsWith("icon-packs/"))
  const sizes = files.map((file) => {
    const bytes = readFileSync(path.join(SITE_ASSETS, file))
    return { file, raw: bytes.length, gzip: gzipSync(bytes).length }
  })
  const eagerFiles = new Set(["site.css", ...staticGraph("site.js")])
  const eager = sizes.filter((size) => eagerFiles.has(size.file)).sort((a, b) => b.raw - a.raw)
  console.log(`site bundle (${seconds.toFixed(1)}s):  ${path.relative(process.cwd(), SITE_ASSETS)}/`)
  for (const size of eager.slice(0, 4))
    console.log(`  ${size.file.padEnd(28)} ${kb(size.raw).padStart(10)}  gz ${kb(size.gzip)}`)
  console.log(
    `  eager ${kb(sum(eager, "raw"))} (gz ${kb(sum(eager, "gzip"))});  all ${files.length} files ` +
      `${kb(sum(sizes, "raw"))} (gz ${kb(sum(sizes, "gzip"))}), icon packs linked`
  )
  const lazy = sizes.filter((size) => !eager.includes(size)).sort((a, b) => b.raw - a.raw)
  console.log(
    `  biggest lazy:  ${lazy
      .slice(0, 6)
      .map((size) => `${size.file} ${kb(size.raw)}`)
      .join(", ")}`
  )
}

/** `entry` and every chunk it imports STATICALLY, transitively:  what a page loads before any `import()`. */
function staticGraph(entry: string, seen = new Set<string>()): Set<string> {
  if (seen.has(entry)) return seen
  seen.add(entry)
  const code = readFileSync(path.join(SITE_ASSETS, entry), "utf8")
  for (const match of code.matchAll(STATIC_IMPORT)) {
    staticGraph(path.posix.join(path.posix.dirname(entry), match[1]!), seen)
  }
  return seen
}

/** `bytes` as `12.3 KB`. */
function kb(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} KB`
}

/** Total `key` size of `sizes`. */
function sum(sizes: readonly { raw: number; gzip: number }[], key: "raw" | "gzip"): number {
  return sizes.reduce((total, size) => total + size[key], 0)
}

/** Every file under `folder` (not through the packs link), `/`-separated, relative. */
function walk(folder: string, prefix = ""): string[] {
  return readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
    const relative = `${prefix}${entry.name}`
    if (entry.isSymbolicLink()) return []
    return entry.isDirectory() ? walk(path.join(folder, entry.name), `${relative}/`) : [relative]
  })
}
