/**
 * Link source references in `.html` docs:  one named target per destination, new tab.  See `packages/docs/AGENTS.md`
 * "Links".
 * Usage (from `packages/docs`):
 *   yarn tsx tools/doc-links.js <folder>/<doc>.html ...           -- add links (idempotent)
 *   yarn tsx tools/doc-links.js --check <folder>/<doc>.html ...   -- verify, exit 1 on problems
 * - The rules (what becomes a link, how a link gets its target, what `--check` verifies) live in `$/assembler`'s
 *   `Linker` (epic `epic-components`, P7):  shared with the plan-doc tool, which may not import `docs`.  This file is
 *   its command line, on files.
 * - Runs under `tsx`, which maps `$/assembler` through this package's `tsconfig.json`:  plain `node` can't.  The
 *   tools that run it (`update.js`, `pages.js` `tidy()`, goals' check) go through `pages.js` `docLinksRun()`.
 * - NOTE:  ported from `doc-links.py` on 2026-10-03;  makes the same edits to every page.
 */
import { readFileSync, writeFileSync } from "node:fs"
import { basename, dirname, resolve as resolvePath } from "node:path"
import { pathToFileURL } from "node:url"

import { AS } from "$/assembler"

import { ROOT } from "./pages.js"

/** One linker for this checkout:  its bare-name index is built once per process. */
const linker = new AS.Linker(ROOT)

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

/** `text` (a page in `docDir`) with its code spans linked and every link given a target:  `Linker.link()`. */
export function linkText(text, docDir) {
  return linker.link(text, docDir)
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

/** The links of `text` (a page in `docDir`), outside `<pre>`:  `Linker.check()`. */
export function checkText(text, docDir) {
  return linker.check(text, docDir)
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
