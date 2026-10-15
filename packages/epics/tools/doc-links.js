/**
 * Link source references in `.html` docs:  one named target per destination, new tab.
 * - see `packages/epics/AGENTS.md`, "Links"
 *
 * Usage (from `packages/epics`):
 *   yarn tsx tools/doc-links.js <folder>/<doc>.html ...           -- add links (idempotent)
 *   yarn tsx tools/doc-links.js --check <folder>/<doc>.html ...   -- verify, exit 1 on problems
 *   ... --root <checkout> ...                                     -- links resolve in that checkout, not this one
 * - This file is the command line, on files, of `$/assembler`'s `Linker` (epic `epic-components`, P7).
 *   - the rules live there:  what becomes a link, how a link gets its target, what `--check` verifies
 *   - shared with the plan-doc tool (`src/tool/`)
 * - `--root`:  for a copy of the pages beside a copy of the code (a dry run of `relocate.js relink`, say)
 *   - version control's ignores are that checkout's, so it should be a git repo with the repo's `.gitignore`
 * - Runs under `tsx`, which maps `$/assembler` through this package's `tsconfig.json`:  plain `node` can't.
 *   - the tools that run it (`update.js`, `pages.js` `tidy()`, goals' check) go through `pages.js` `docLinksRun()`
 * - A component set's pages link as from their SERVED address,
 *   so their links hold at `/worktrees/<w>/components/epics/` too.
 *   - e.g. `packages/epics/docs/`, served at `/components/epics/` (`COMPONENT_SETS` in `$/server/page`)
 *   - their links are written and checked from there (`Linker`'s `served`, `servedDir()`)
 * - NOTE:  ported from `doc-links.py` on 2026-10-03;  makes the same edits to every page.
 */
import { readFileSync, writeFileSync } from "node:fs"
import { basename, dirname, resolve as resolvePath } from "node:path"
import { pathToFileURL } from "node:url"

import { AS } from "$/assembler"
import { COMPONENT_SETS } from "$/server/page/page.types"

import { ROOT } from "./pages.js"

/** The component sets' folders, by their address folder:  `{ "components/epics": "packages/epics/docs" }`. */
const SERVED = Object.fromEntries(COMPONENT_SETS.map((set) => [set.prefix.slice(1), set.dir]))

/**
 * One linker for this checkout (or the command line's `--root`):  its bare-name index is built once per process.
 */
let linker = new AS.Linker(ROOT, { served: SERVED })

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
  const { destinations, problems } = checkText(readFileSync(path, "utf8"), dirname(resolvePath(path)))
  console.log(`${basename(path)}:  ${destinations} destinations, ${problems.length} problems`)
  for (const problem of problems) console.log(`    ${problem}`)
  return !problems.length
}

/** The links of `text` (a page in `docDir`, or served from its address), outside `<pre>`:  `Linker.check()`. */
export function checkText(text, docDir) {
  return linker.check(text, linker.servedDir(docDir))
}

////////////////
// ## Command line
////////////////

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const args = process.argv.slice(2)
  const at = args.indexOf("--root")
  const root = at >= 0 ? args[at + 1] : undefined
  if (root) linker = new AS.Linker(resolvePath(root), { served: SERVED })
  const files = args.filter((arg, i) => !arg.startsWith("--") && !(at >= 0 && i === at + 1))
  if (!files.length) {
    console.error(
      [
        "usage (from packages/epics):",
        "  yarn tsx tools/doc-links.js ../../guides/<folder>/<doc>.html ...      -- add links (idempotent)",
        "  yarn tsx tools/doc-links.js --check ../../guides/<folder>/<doc>.html -- verify, exit 1 on problems",
        "  ... --root <checkout>                                                 -- resolve links in another checkout"
      ].join("\n")
    )
    process.exit(1)
  }
  if (args.includes("--check")) process.exit(files.map(check).every(Boolean) ? 0 : 1)
  for (const file of files) linkify(file)
}
