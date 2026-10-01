/**
 * `yarn docs:open <page>`:  show a page in Chrome, reusing its tab (`pages.js` `openInChrome()`).
 * - `<page>` relative to `packages/docs` (or absolute), e.g. `index.html`;  default:  the docs index
 */
import { existsSync } from "node:fs"
import { isAbsolute, join } from "node:path"

import { DOCS, openInChrome } from "./pages.js"

const page = process.argv[2] ?? "index.html"
const file = isAbsolute(page) ? page : join(DOCS, page)
if (!existsSync(file)) {
  console.error(`docs:open:  no page ${page}`)
  process.exit(1)
}
openInChrome(file)
