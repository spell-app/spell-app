/**
 * `yarn docs:open [page] [--vs]`:  show a page in Chrome, reusing its tab (`pages.js` `openInChrome()`).
 * - `<page>` relative to `packages/docs` (or absolute), e.g. `index.html`;  default:  the docs index
 *   - `.html` and a folder's own page may be left off:  `solid/solid-2` ~== `solid/solid-2.html`,
 *     `server` ~== `server/server.html`
 * - `--vs`:  in VS Code's doc preview instead (the right side bar's "Spell Docs" view, `openInVSCode()`):
 *   `/spell-docs`.  Not run from VS Code:  Chrome anyway.
 */
import { existsSync, statSync } from "node:fs"
import { basename, isAbsolute, join } from "node:path"

import { DOCS, openInChrome, openInVSCode } from "./pages.js"

const args = process.argv.slice(2)
const vs = args.includes("--vs")
const page = args.find((arg) => !arg.startsWith("--")) ?? "index.html"
const file = findPage(page)
if (!file) {
  console.error(`docs:open:  no page ${page}`)
  process.exit(1)
}
if (vs) await openInVSCode(file)
else openInChrome(file)

/** The file `page` names:  as is, plus `.html`, or a folder's own page (`<dir>/<dir>.html`);  `null` if none. */
function findPage(page) {
  const path = isAbsolute(page) ? page : join(DOCS, page)
  for (const each of [path, `${path}.html`, join(path, `${basename(path)}.html`), join(path, "index.html")]) {
    if (existsSync(each) && statSync(each).isFile()) return each
  }
  return null
}
