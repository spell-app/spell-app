/**
 * `yarn build` (in `packages/brand`):  build the brand pages' bundle, `_assets/ui/` (git-ignored), from
 * `src/brand-ui.ts` with `vite.config.ts`, then report its sizes.
 * - Run by `spell dev bundles build brand` (`$/assembler` `Bundle`), which the page server runs when it starts and
 *   the sources changed;  it then records their hash in `_assets/ui/.bundle.json`.
 * - Clears `_assets/ui/` first (everything but `icon-packs`, the record too), so a removed chunk doesn't linger.
 * - Icon packs:  `_assets/ui/icon-packs` is a SYMLINK to Spell UI's packs (`packages/ui/src/icons/icon-packs`), made
 *   here if missing, as Spell UI's site bundle does (`packages/ui/scripts/site-bundle.ts`):  never a second copy.
 * - Fails if the bundle holds two copies of a Solid package (`solid-js`, `@solidjs/web`):  two would split signals
 *   and break every element.  The docs bundle checks the same (`bundle-spell-ui.js` `checkOneSolid()`).
 */
import { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, symlinkSync } from "node:fs"
import path from "node:path"
import { gzipSync } from "node:zlib"
import { build, type Rolldown } from "vite-plus"

import { BRAND_ASSETS } from "../vite.config.ts"

/** The packs link inside `_assets/ui/`, and where it points (relative, so the checkout can move). */
const PACKS = path.join(BRAND_ASSETS, "icon-packs")
const PACKS_TARGET = "../../../ui/src/icons/icon-packs"

/** A Solid package's folder in a module id:  `.../node_modules/solid-js/...`, `.../node_modules/@solidjs/web/...`. */
const SOLID_MODULE = /node_modules\/(solid-js|@solidjs\/[\w-]+)\//

mkdirSync(BRAND_ASSETS, { recursive: true })
for (const entry of readdirSync(BRAND_ASSETS)) {
  if (entry !== "icon-packs") rmSync(path.join(BRAND_ASSETS, entry), { recursive: true, force: true })
}
const started = performance.now()
const output = await build({ configFile: path.resolve(import.meta.dirname, "../vite.config.ts") })
checkOneSolid(output as Rolldown.RolldownOutput)
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

/** Print the bundle's size:  the entry, the total, the biggest chunks. */
function report(seconds: number): void {
  const files = readdirSync(BRAND_ASSETS).filter((file) => file !== "icon-packs" && /\.(js|css)$/.test(file))
  const sizes = files.map((file) => {
    const text = readFileSync(path.join(BRAND_ASSETS, file))
    return { file, raw: text.length, gzip: gzipSync(text).length }
  })
  const total = sizes.reduce((sum, size) => sum + size.raw, 0)
  const gzip = sizes.reduce((sum, size) => sum + size.gzip, 0)
  console.log(`brand bundle (${seconds.toFixed(1)}s):  ${path.relative(process.cwd(), BRAND_ASSETS)}/`)
  for (const size of sizes.filter((size) => size.file.startsWith("brand-ui."))) {
    console.log(`  ${size.file.padEnd(28)} ${kb(size.raw).padStart(10)}  gz ${kb(size.gzip)}`)
  }
  console.log(`  all ${files.length} files ${kb(total)} (gz ${kb(gzip)}), icon packs linked`)
  const biggest = sizes.filter((size) => !size.file.startsWith("brand-ui.")).sort((a, b) => b.raw - a.raw)
  console.log(
    `  biggest chunks:  ${biggest
      .slice(0, 5)
      .map((size) => `${size.file} ${kb(size.raw)}`)
      .join(", ")}`
  )
}

/** Fails if a Solid package was bundled from more than one folder, or `solid-js` not at all. */
function checkOneSolid(result: Rolldown.RolldownOutput): void {
  const copies = new Map<string, Set<string>>()
  for (const chunk of result.output) {
    if (chunk.type !== "chunk") continue
    for (const id of chunk.moduleIds) {
      const match = SOLID_MODULE.exec(id)
      if (!match) continue
      const root = id.slice(0, match.index + match[0].length)
      copies.set(match[1]!, new Set([...(copies.get(match[1]!) ?? []), root]))
    }
  }
  for (const [name, roots] of copies) {
    if (roots.size > 1) throw new Error(`${name} bundled ${roots.size} times:\n  ${[...roots].join("\n  ")}`)
  }
  if (!copies.has("solid-js")) throw new Error("solid-js isn't in the bundle:  check the aliases")
}

/** `bytes` as `12.3 KB`. */
function kb(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} KB`
}
