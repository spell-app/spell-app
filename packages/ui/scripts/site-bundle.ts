/**
 * `yarn site:bundle`:  build the Spell UI site's bundle, `site/_assets/` (git-ignored), from `site/_src/site.ts`
 * with `vite.site.config.ts`, then report its sizes.
 * - Run by `spell dev bundles build ui-site` (`$/assembler` `Bundle`), which the page server runs when it starts and
 *   the sources changed;  it then records their hash in `site/_assets/.bundle.json`.
 * - Clears `site/_assets/` first (everything but `icon-packs`, the record too), so a removed chunk doesn't linger.
 * - Icon packs:  `site/_assets/icon-packs` is a SYMLINK to `../../src/icons/icon-packs` (~8.7 MB, ~2,200 SVGs), made
 *   here if missing, NOT a copy:  committing the packs twice would double them in every clone.  The page server
 *   follows it;  a static deploy must copy through it (`cp -RL`).
 * - Sizes:  every file but the packs, raw and gzipped;  EAGER is `site.css` + `site.js` and the chunks it imports
 *   statically (what a page loads before any `import()`).
 * - Every component set's pages load this one bundle (`COMPONENT_SETS` in `$/server/page`):  the page server serves it
 *   as each set's `_assets/` (`/components/epics/_assets/`).  The other sets' own build (`site/_assets/sets/`, epic
 *   `epic-workflow` P10) is gone since epic `epic-engine`, which gave Spell UI's pages the component packs too.
 */
import { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, symlinkSync } from "node:fs"
import path from "node:path"
import { gzipSync } from "node:zlib"
import { build } from "vite"

import { SITE_ASSETS } from "../vite.site.config.ts"
import { Terminal } from "../tools/Terminal.ts"

/** The packs link's name inside `_assets/`:  the one entry a rebuild keeps. */
const PACKS_NAME = "icon-packs"

/** The packs link. */
const PACKS = path.join(SITE_ASSETS, PACKS_NAME)

/** Where the packs link points:  relative, so the checkout can move. */
const PACKS_TARGET = "../../src/icons/icon-packs"

/** A static `import ... from "./x.js"` / `import "./x.js"` in minified output (never `import("./x.js")`). */
const STATIC_IMPORT = /(?:^|[;}\n])\s*(?:import|export)(?:[^"'();]*?from)?\s*["'](\.\.?\/[^"']+)["']/g

mkdirSync(SITE_ASSETS, { recursive: true })
for (const entry of readdirSync(SITE_ASSETS)) {
  if (entry !== PACKS_NAME) rmSync(path.join(SITE_ASSETS, entry), { recursive: true, force: true })
}
const started = performance.now()
const configFile = path.resolve(import.meta.dirname, "../vite.site.config.ts")
await build({ configFile })
link(PACKS, PACKS_TARGET)
report((performance.now() - started) / 1000, SITE_ASSETS)

/** Link the icon packs at `packs` (to `target`), unless linked;  throws when the link leads nowhere. */
function link(packs: string, target: string): void {
  if (!existsSync(packs) && !isLink(packs)) symlinkSync(target, packs, "dir")
  if (!statSync(packs).isDirectory()) {
    throw new Error(`site:bundle:  ${packs} doesn't lead to the icon packs;  delete it, and rerun to link it again`)
  }
}

/** Is `file` a symlink (even a broken one)? */
function isLink(file: string): boolean {
  try {
    return lstatSync(file).isSymbolicLink()
  } catch {
    return false
  }
}

/** Print the sizes of the bundle in `folder`:  eager files, totals, the biggest lazy chunks. */
function report(seconds: number, folder: string): void {
  const files = walk(folder).filter((file) => !file.startsWith(`${PACKS_NAME}/`))
  const sizes = files.map((file) => {
    const bytes = readFileSync(path.join(folder, file))
    return { file, raw: bytes.length, gzip: gzipSync(bytes).length }
  })
  const eagerFiles = new Set(["site.css", ...staticGraph(folder, "site.js")])
  const eager = sizes.filter((size) => eagerFiles.has(size.file)).sort((a, b) => b.raw - a.raw)
  Terminal.out(`site bundle (${seconds.toFixed(1)}s):  ${path.relative(process.cwd(), folder)}/`)
  for (const size of eager.slice(0, 4))
    Terminal.out(`  ${size.file.padEnd(28)} ${kb(size.raw).padStart(10)}  gz ${kb(size.gzip)}`)
  Terminal.out(
    `  eager ${kb(sum(eager, "raw"))} (gz ${kb(sum(eager, "gzip"))});  all ${files.length} files ` +
      `${kb(sum(sizes, "raw"))} (gz ${kb(sum(sizes, "gzip"))}), icon packs linked`
  )
  const lazy = sizes.filter((size) => !eager.includes(size)).sort((a, b) => b.raw - a.raw)
  Terminal.out(
    `  biggest lazy:  ${lazy
      .slice(0, 6)
      .map((size) => `${size.file} ${kb(size.raw)}`)
      .join(", ")}`
  )
}

/** `entry` (in `folder`) and every chunk it imports STATICALLY, transitively:  what a page loads before any `import()`. */
function staticGraph(folder: string, entry: string, seen = new Set<string>()): Set<string> {
  if (seen.has(entry)) return seen
  seen.add(entry)
  const code = readFileSync(path.join(folder, entry), "utf8")
  for (const match of code.matchAll(STATIC_IMPORT)) {
    staticGraph(folder, path.posix.join(path.posix.dirname(entry), match[1]!), seen)
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
