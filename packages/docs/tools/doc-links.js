/**
 * Link source references in `.html` docs:  one named target per destination, new tab.  See `packages/docs/AGENTS.md`
 * "Links".
 * Usage (from `packages/docs`):
 *   yarn tsx tools/doc-links.js <folder>/<doc>.html ...           -- add links (idempotent)
 *   yarn tsx tools/doc-links.js --check <folder>/<doc>.html ...   -- verify, exit 1 on problems
 * - The rules (what becomes a link, how a link gets its target, what `--check` verifies) live in `$/assembler`'s
 *   `Linker` (epic `epic-components`, P7):  shared with the `epic` tool, which may not import `docs`.  This file is
 *   its command line, on files.
 * - Runs under `tsx`, which maps `$/assembler` through this package's `tsconfig.json`:  plain `node` can't.  The
 *   tools that run it (`update.js`, `pages.js` `tidy()`, goals' check) go through `pages.js` `docLinksRun()`.
 * - A component set's pages (`packages/epic-components/`, served at `/epic-ui/`:  `COMPONENT_SETS` in
 *   `$/server/page`) link as from their SERVED address, so their links hold at `/worktrees/<w>/epic-ui/` too:  their
 *   links are written and checked from there (`Linker`'s `served`, `servedDir()`).
 * - `--check` also checks short addresses (`href="SAGA:/..."`) and `<epic-link>`s, which `Linker` leaves alone:
 *   the epics tool's `EpicTargets` knows the sagas (epic `epic-workflow` P15).
 * - NOTE:  ported from `doc-links.py` on 2026-10-03;  makes the same edits to every page.
 */
import { readFileSync, writeFileSync } from "node:fs"
import { basename, dirname, relative, resolve as resolvePath } from "node:path"
import { pathToFileURL } from "node:url"

import { AS } from "$/assembler"
import { EpicTargets } from "$/epics/tool/EpicTargets"
import { COMPONENT_SETS } from "$/server/page/page.types"

import { ROOT } from "./pages.js"

/** The component sets' folders, by the address folder each is served at:  `{ "epic-ui": "packages/epic-components" }`. */
const SERVED = Object.fromEntries(COMPONENT_SETS.map((set) => [set.prefix.slice(1), set.dir]))

/** One linker for this checkout:  its bare-name index is built once per process. */
const linker = new AS.Linker(ROOT, { served: SERVED })

/** What short addresses and `<epic-link>`s find in this checkout (epic `epic-workflow` P15):  the sagas, pages, ids. */
const targets = new EpicTargets(ROOT)

////////////////
// ## Linking
////////////////

/**
 * Link the code spans of the page at `path` and target its links, IN PLACE;  prints a summary line, then each
 * unresolved path-like span on its own line (they may hold `, `).
 * - SIDE EFFECT:  always rewrites the file, changed or not
 */
export function linkify(path) {
  const { text, linked, unresolved } = linkText(readFileSync(path, "utf8"), dirname(resolvePath(path)))
  writeFileSync(path, text)
  console.log(`${basename(path)}:  linked ${linked} code spans, ${unresolved.length} unresolved path-like`)
  for (const span of unresolved) console.log(`    ${span}`)
}

/**
 * `text` (a page in `docDir`) with its code spans linked and every link given a target:  `Linker.link()`.
 * - a component set's page:  from its served address (`servedDir()`)
 */
export function linkText(text, docDir) {
  return linker.link(text, linker.servedDir(docDir))
}

////////////////
// ## Checking
////////////////

/** Check the page at `path`;  prints a summary line, then each problem.  Returns whether it passed. */
export function check(path) {
  const { destinations, problems } = checkText(readFileSync(path, "utf8"), dirname(resolvePath(path)), path)
  console.log(`${basename(path)}:  ${destinations} destinations, ${problems.length} problems`)
  for (const problem of problems) console.log(`    ${problem}`)
  return !problems.length
}

/**
 * The links of `text` (a page in `docDir`, or served from its address), outside `<pre>`:  `Linker.check()`;
 * then its short addresses and `<epic-link>`s (`EpicTargets.problemsIn()`):  a saga, page or id that isn't there,
 * an epic under a saga it doesn't name.
 * - `file`:  the page's own file, for links into the page itself (`<epic-link item="T3">`)
 */
export function checkText(text, docDir, file) {
  const checked = linker.check(text, linker.servedDir(docDir))
  const page = file && relative(ROOT, resolvePath(file))
  return { ...checked, problems: [...checked.problems, ...targets.problemsIn(text, page)] }
}

////////////////
// ## Command line
////////////////

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const args = process.argv.slice(2)
  const files = args.filter((arg) => !arg.startsWith("--"))
  if (!files.length) {
    console.error(
      [
        "usage (from packages/docs):",
        "  yarn tsx tools/doc-links.js ../../guides/<folder>/<doc>.html ...      -- add links (idempotent)",
        "  yarn tsx tools/doc-links.js --check ../../guides/<folder>/<doc>.html -- verify, exit 1 on problems"
      ].join("\n")
    )
    process.exit(1)
  }
  if (args.includes("--check")) process.exit(files.map(check).every(Boolean) ? 0 : 1)
  for (const file of files) linkify(file)
}
