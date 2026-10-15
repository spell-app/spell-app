/**
 * `yarn rename:shared --shared <dir> [--dry-run]` (in `packages/brand`):
 * bring the SHARED Brand tab pages up to the brand pack, once, as the branch merges into `main`
 * (epic `people-and-orgs` P18, Q26).
 * - `<dir>`:  the shared `brand/` folder, `/Users/owen/www/spell-app/spell-app-dev/brand` (or a copy, to try it).
 * - In the pages the BRAND owns, and nothing else:
 *   - `index.html`, `compare.html` and `README.md` at the folder's top
 *   - every `*.spell.html` copy in `spell-design-system/` (its top level only)
 *   - NEVER Claude Design's own files:  the `.dc.html` pages, and everything in `spell-design-system/`'s folders
 * - What it renames there:
 *   - tags and words `ui-brand-<x>` => `brand-<x>` (not `<ui-brand-panel>`:  Spell UI's `<ui-panel>` since 2026-10-05,
 *     named only in history)
 *   - tokens `--ui-brand-<x>-*` => `--brand-<x>-*`, private `--_ui-brand-*` => `--_brand-*`
 *   - the composer's event `ui-cast` => `brand-cast` (a pack's own events take its prefix)
 *   - links to the old element pages, relative, from each page's folder;  their link targets alike:
 *     - `components/ui-brand-<x>.html` => the docs set's `/components/brand/brand-<x>.html`
 *     - `components/components.spell.html` => its home, `index.html`
 * - Then deletes the old element pages' folder, `components/`:  they live in `packages/brand/docs/` now.
 * - Idempotent:  a second run finds nothing.
 * - `--dry-run` says what it would do, and changes nothing.
 * - Node only;  imports nothing.
 */
import { existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import path from "node:path"

/** The pages the brand owns at the shared folder's top. */
const TOP_PAGES = ["index.html", "compare.html", "README.md"]

/** The folder of Claude Design's export and the brand's copies beside it. */
const DESIGN_SYSTEM = "spell-design-system"

/** The old element pages' folder, which goes. */
const OLD_PAGES = "components"

/** The renames, in order:  tokens before tags, so `--ui-brand-x` isn't half-renamed. */
const RENAMES: [RegExp, string][] = [
  // links to the old element pages, and their targets (before the tags:  they hold a tag)
  [/href="((?:\.\.\/)*)components\/ui-brand-([\w-]+)\.html/g, 'href="$1../components/brand/brand-$2.html'],
  [/href="((?:\.\.\/)*)components\/components\.spell\.html/g, 'href="$1../components/brand/index.html'],
  [/\bsrc-brand-components-ui-brand-([\w-]+)-html\b/g, "src-components-brand-brand-$1-html"],
  [/\bsrc-brand-components-components-spell-html\b/g, "src-components-brand-index-html"],
  [/--_ui-brand-/g, "--_brand-"],
  [/--ui-brand-/g, "--brand-"],
  [/UIBrand(?!Panel)/g, "Brand"],
  [/(?<![\w-])ui-brand-(?!panel)/g, "brand-"],
  [/(?<![\w-])ui-cast\b/g, "brand-cast"]
]

const args = process.argv.slice(2)
const isDryRun = args.includes("--dry-run")
const shared = args[args.indexOf("--shared") + 1]
if (!args.includes("--shared") || !shared || shared.startsWith("--")) {
  console.error("usage:  yarn rename:shared --shared <the shared brand/ folder> [--dry-run]")
  process.exit(2)
}
const root = path.resolve(shared)
if (!existsSync(path.join(root, DESIGN_SYSTEM))) {
  console.error(`rename:shared:  ${root} isn't the shared brand/ folder (no ${DESIGN_SYSTEM}/ in it)`)
  process.exit(2)
}

let changed = 0
for (const file of ownedPages(root)) {
  const text = readFileSync(file, "utf8")
  let count = 0
  const next = RENAMES.reduce(
    (value, [find, to]) =>
      value.replace(find, (...match) => {
        count++
        return to.replace(/\$(\d)/g, (_, index: string) => String(match[Number(index)]))
      }),
    text
  )
  if (next === text) continue
  changed++
  console.log(`${isDryRun ? "would rename" : "renamed"}  ${count}  in  ${path.relative(root, file)}`)
  if (!isDryRun) writeFileSync(file, next)
}

const old = path.join(root, OLD_PAGES)
if (existsSync(old)) {
  for (const file of readdirSync(old).sort())
    console.log(`${isDryRun ? "would delete" : "deleted"}  ${OLD_PAGES}/${file}`)
  if (!isDryRun) rmSync(old, { recursive: true })
}
console.log(
  `rename:shared:  ${changed} page${changed === 1 ? "" : "s"} ${isDryRun ? "to change" : "changed"} in ${root}`
)

/** The brand's own pages in the shared folder `root`, absolute, sorted:  never Claude Design's. */
function ownedPages(root: string): string[] {
  const top = TOP_PAGES.map((name) => path.join(root, name)).filter((file) => existsSync(file))
  const copies = readdirSync(path.join(root, DESIGN_SYSTEM))
    .filter((name) => name.endsWith(".spell.html"))
    .sort()
    .map((name) => path.join(root, DESIGN_SYSTEM, name))
  return [...top, ...copies]
}
