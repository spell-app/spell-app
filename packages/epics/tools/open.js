/**
 * `spell dev docs open [page] [--vs | --review]`:  show a page in Chrome, reusing its tab (`pages.js` `openInChrome()`).
 * - `<page>` from the checkout's root, an area, or absolute (`pages.js` `pageFile()`), e.g. `guides/solid/solid-2.html`
 *   or just `solid/solid-2.html`;  default:  the docs home, `pages/index.html`
 *   - `.html` and a folder's own page may be left off:  `solid/solid-2` ~== `guides/solid/solid-2.html`,
 *     `server` ~== `guides/server.html`
 * - `--vs`:  in VS Code's doc preview instead (the right side bar's "Spell Docs" tab, `openInVSCode()`):
 *   `/spell-docs`.  Not run from VS Code:  Chrome anyway.
 * - `--review`:  in the side bar's "Review" tab (`/epic review`), keeping the "Spell Docs" tab's page.  Implies
 *   `--vs`.
 */
import { existsSync, statSync } from "node:fs"
import { basename, join } from "node:path"

import { openInChrome, openInVSCode, pageFile } from "./pages.js"

const args = process.argv.slice(2)
const review = args.includes("--review")
const vs = review || args.includes("--vs")
const page = args.find((arg) => !arg.startsWith("--")) ?? "index.html"
const file = findPage(page)
if (!file) {
  console.error(`docs:open:  no page ${page}`)
  process.exit(1)
}
if (vs) await openInVSCode(file, { view: review ? "review" : "docs" })
else openInChrome(file)

/** The file `page` names:  as is, plus `.html`, or a folder's own page (`<dir>/<dir>.html`);  `null` if none. */
function findPage(page) {
  for (const each of [page, `${page}.html`, join(page, `${basename(page)}.html`), join(page, "index.html")]) {
    const path = pageFile(each)
    if (existsSync(path) && statSync(path).isFile()) return path
  }
  return null
}
