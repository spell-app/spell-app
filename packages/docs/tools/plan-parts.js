/**
 * A plan doc in PARTS (epic `claude-design`, P3):  a SKELETON, `epics/<name>/<name>.plan.html`, plus one BODY file
 * per bulky section or item, `epics/<name>/parts/<id>.htm`, which the page loads the first time it's opened
 * (`<ui-section source>`, `<ui-accordion source>`).  Rules:  `templates/epics/plan-doc.md`, "Parts".
 * - the skeleton keeps everything a reader or a script needs without a body:  every section, every phase section
 *   (id, status, badge, icon), every item LINE (`<ui-item id data-status ...>` and its `<ui-title>`), the page
 *   header, meta lines, Overview summary and prompt, the log's title
 * - the bodies (`HOSTS`):  each Overview sub-section's, each phase's (`ui-list.plan-phase-body`), each item's
 *   details (its panel's `<ui-content>`), the log's (its feed)
 * - `plan-doc.js` ASSEMBLES a split doc when it reads it (`assembleParts()`), so every `PlanDoc` command works on one
 *   whole document as before, and SPLITS it again when it writes (`splitParts()`):  where each body goes is decided
 *   by rule, every write.  So prose a hand edit put in the skeleton moves into its part on the next command.
 * - a part file holds the body's markup as a fragment, after a one-line comment saying whose it is;  its relative
 *   URLs are relative to the PART (`parts/`), as `SourceMarkup` rewrites them against the `source` it came from.
 *   Assembling rebases them to the page, splitting back (`rebase()`).
 * - why `.htm`, not `.html`:  every page walker (`pages.js` `findPages()`:  the docs index, `docs update`, link
 *   repairs), in this checkout AND in checkouts on older code, takes `.html` files only:  a part is never a page
 * - the skeleton marks each host for the page runtime:  `source`, `data-part-ids` (ids inside the body, so a link to
 *   one loads the body first), `data-commits` (the body lists commits:  the git buttons), and a placeholder line
 *   for pages without the loader (a bundle from before P2, `file://`);  `<body data-spell-needs-server>`
 * - pure DOM in this file's first half (`plan-doc.test.js` drives it);  files and formatting in its second
 */
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs"
import { basename, dirname, join } from "node:path"

import { format } from "vite-plus/fmt"

import { fmtConfig } from "../../../vite.lint.ts"
import { serializeHTML } from "./pages.js"

/** The parts folder, beside the skeleton:  `epics/<name>/parts/`. */
export const PARTS_DIR = "parts"

/** A part file's extension:  not `.html`, so no page walker takes it for a page (see the header). */
export const PART_EXT = ".htm"

/** A part's `source`, as the skeleton writes it:  `parts/<id>.htm`, `id` a section's or item's. */
const PART_SOURCE = /^parts\/([\w-]+)\.htm$/

/** The placeholder line a host shows until its body loads (or always, without the loader):  `placeholder()`. */
const PLACEHOLDER = "plan-part-note"

/** The comment a part file starts with (`partComment()`):  stripped when assembling. */
const PART_COMMENT = /^\s*plan-doc part\b/

/** Attributes the skeleton puts on a host, gone once assembled. */
const HOST_MARKS = ["source", "data-part-ids", "data-commits"]

/** URL attributes `SourceMarkup` rewrites against a body's `source` (`URL_ATTRIBUTES` in `$/ui` elements). */
const URL_ATTRIBUTES = ["href", "src", "action", "poster", "source"]

/**
 * Where bodies live in a split doc, in page order:  which elements host one, and where its nodes sit in the host.
 * - `section`:  an Overview sub-section, a phase, the log:  the body is every child but the slotted ones (icon,
 *   header):  what `SourceBody` replaces with the file's content
 * - `item`:  an item's details panel, `ui-accordion.plan-item`:  the body is its `<ui-content>`'s children
 */
const HOSTS = [
  { kind: "section", selector: "main > ui-section#overview > ui-section[id]" },
  { kind: "section", selector: "main > ui-section#phases > ui-section[data-phase][id]" },
  { kind: "item", selector: ".plan-items > ui-item[id] > ui-accordion.plan-item" },
  { kind: "section", selector: "main > ui-section#log" }
]

////////////////
// ## Assembling and splitting
////////////////

/**
 * Is `document` a split plan doc?  Any host with a part `source`.
 */
export function isSplit(document) {
  return Array.from(document.querySelectorAll("[source]")).some((host) => PART_SOURCE.test(host.getAttribute("source")))
}

/**
 * Put every part's body back into `document` (a parsed skeleton), IN PLACE:  the one-file document `PlanDoc` edits.
 * - `readPart(id)`:  the part file's text, `undefined` when it's missing
 * - a host's own content besides the placeholder (a hand edit, or a checkout on older code writing into the empty
 *   panel, e.g. `commit --item`) is KEPT, after the part's:  nothing is ever dropped (`inline`)
 * - a missing part:  its host keeps what it has (`missing`)
 * - returns `{ split, hosts, missing, inline }`:  `split` whether there were parts at all;  ids in the others
 */
export function assembleParts(document, readPart) {
  const result = { split: false, hosts: [], missing: [], inline: [] }
  for (const host of document.querySelectorAll("[source]")) {
    const match = PART_SOURCE.exec(host.getAttribute("source"))
    if (!match) continue
    result.split = true
    const id = match[1]
    result.hosts.push(id)
    const target = bodyTarget(host, document)
    for (const note of Array.from(target.children)) if (note.classList.contains(PLACEHOLDER)) note.remove()
    const own = bodyNodes(target)
    if (own.some(hasContent)) result.inline.push(id)
    for (const name of HOST_MARKS) host.removeAttribute(name)
    const text = readPart(id)
    if (text === undefined) {
      result.missing.push(id)
      continue
    }
    const nodes = fragmentNodes(document, text).filter((node) => !isPartComment(node))
    for (const node of nodes) if (node.nodeType === 1) rebase(node, (url) => toPage(url))
    const first = own[0] ?? null
    for (const node of nodes) target.insertBefore(node, first)
  }
  if (result.split) document.body?.removeAttribute("data-spell-needs-server")
  return result
}

/**
 * Take every body out of `document` (a whole plan doc), IN PLACE, leaving the skeleton;  returns its parts,
 * `Map<id, html>`, in page order.
 * - each host (`HOSTS`) with a body gets `source="parts/<id>.htm"`, its marks (`data-part-ids`, `data-commits`) and
 *   the placeholder line;  a host with nothing in it stays as it is (no part)
 * - each part:  `partComment()`, then the body's markup, its relative URLs rebased to `parts/` (`rebase()`)
 * - `docName`:  the skeleton's file name, for the parts' comment
 * - a host whose id is taken by an earlier one (a broken doc) keeps its body:  two can't share a file
 * - `<body data-spell-needs-server>`:  `check-spell.js` loads the page from the server, where parts load
 */
export function splitParts(document, { docName = "" } = {}) {
  const parts = new Map()
  for (const { host, id, kind } of partHosts(document)) {
    if (parts.has(id)) continue
    const target = bodyTarget(host, document)
    const nodes = bodyNodes(target)
    if (!nodes.some(hasContent)) continue
    const box = document.createElement("div")
    box.append(...nodes)
    trimEdges(box)
    for (const element of box.children) rebase(element, (url) => toPart(url))
    const ids = Array.from(box.querySelectorAll("[id]"), (element) => element.id)
    const commits = box.querySelector(".plan-commits")
    parts.set(id, `${partComment(id, kind, docName)}\n${serializeHTML(box.innerHTML)}\n`)
    host.setAttribute("source", `${PARTS_DIR}/${id}${PART_EXT}`)
    if (ids.length) host.setAttribute("data-part-ids", ids.join(" "))
    if (commits) host.setAttribute("data-commits", "")
    target.append(placeholder(document, id))
  }
  if (parts.size) document.body?.setAttribute("data-spell-needs-server", "")
  return parts
}

/**
 * The elements of `document` that host a body in a split doc (`HOSTS`), in page order:  `{ host, id, kind }`.
 * - `id`:  the section's, or the item's (the accordion's parent);  only ids fit for a file name (`[\w-]+`)
 */
export function partHosts(document) {
  const found = []
  for (const host of document.querySelectorAll(HOSTS.map((each) => each.selector).join(", "))) {
    const kind = host.localName === "ui-accordion" ? "item" : "section"
    const id = kind === "item" ? host.parentElement.id : host.id
    if (/^[\w-]+$/.test(id)) found.push({ host, id, kind })
  }
  return found
}

/** The file of part `id` of the skeleton at `file`:  `<folder>/parts/<id>.htm`. */
export function partFile(file, id) {
  return join(dirname(file), PARTS_DIR, `${id}${PART_EXT}`)
}

/**
 * Where a host's body goes:  a section itself;  an item panel's `<ui-content>` (made when it has none, as the
 * accordion makes one when its body arrives).
 */
function bodyTarget(host, document) {
  if (host.localName !== "ui-accordion") return host
  const content = host.querySelector(":scope > ui-content")
  if (content) return content
  const made = document.createElement("ui-content")
  host.append(made)
  return made
}

/** A host's body nodes in `target`:  every child but the slotted ones (a section's icon, header) and the placeholder. */
function bodyNodes(target) {
  return Array.from(target.childNodes).filter(
    (node) => !(node.nodeType === 1 && (node.hasAttribute("slot") || node.classList.contains(PLACEHOLDER)))
  )
}

/** Does `node` hold anything:  an element, or text that isn't only whitespace? */
function hasContent(node) {
  return node.nodeType === 1 || (node.nodeType === 3 && node.data.trim() !== "")
}

/** Drop whitespace-only text at both ends of `box`:  oxfmt lays the part out again. */
function trimEdges(box) {
  while (box.firstChild?.nodeType === 3 && !box.firstChild.data.trim()) box.firstChild.remove()
  while (box.lastChild?.nodeType === 3 && !box.lastChild.data.trim()) box.lastChild.remove()
}

/**
 * The line a host shows until its body loads:  with the loader it's replaced at once (the panel stays shut while
 * the body is on its way);  without it (a bundle from before P2, `file://`) it says where the body is.
 * - plain text, no `<code>`:  `doc-links.js` would make a link of it
 */
function placeholder(document, id) {
  const note = document.createElement("p")
  note.className = PLACEHOLDER
  note.textContent = `Loads from ${PARTS_DIR}/${id}${PART_EXT} when opened (needs the page server).`
  return note
}

/** The comment a part file starts with:  whose body it is, and where the rules are. */
function partComment(id, kind, docName) {
  const what = kind === "item" ? "details" : "body"
  return `<!-- plan-doc part:  #${id}'s ${what}${docName ? ` in ${docName}` : ""}, loaded when it opens (templates/epics/plan-doc.md, "Parts") -->`
}

/** Is `node` a part file's own comment (`partComment()`)? */
function isPartComment(node) {
  return node.nodeType === 8 && PART_COMMENT.test(node.data)
}

/** `text` (HTML) parsed as nodes of `document`, not yet inserted. */
function fragmentNodes(document, text) {
  const template = document.createElement("template")
  template.innerHTML = text
  return Array.from(template.content.childNodes)
}

////////////////
// ## URLs
////////////////

/**
 * Rewrite every relative URL in `element` (itself included) with `change`:  `URL_ATTRIBUTES` only, never a `#hash`,
 * an absolute URL (`https:`, `mailto:`), a root path (`/x`) or an empty one.
 */
export function rebase(element, change) {
  for (const node of [element, ...element.querySelectorAll("*")])
    for (const name of URL_ATTRIBUTES) {
      const value = node.getAttribute(name)
      if (value === null || !isRelative(value)) continue
      node.setAttribute(name, change(value))
    }
}

/** A page-relative URL as the part sees it (`parts/` is one folder down):  `../x`;  `parts/y` -> `y`. */
export function toPart(url) {
  return url.startsWith(`${PARTS_DIR}/`) ? url.slice(PARTS_DIR.length + 1) : `../${url}`
}

/** A part-relative URL as the page sees it:  the inverse of `toPart()`. */
export function toPage(url) {
  return url.startsWith("../") ? url.slice(3) : `${PARTS_DIR}/${url}`
}

/** Is `url` relative to the document it's in (not empty, a hash, absolute, or from the root)? */
function isRelative(url) {
  return url !== "" && !url.startsWith("#") && !url.startsWith("/") && !/^[a-z][a-z0-9+.-]*:/i.test(url)
}

////////////////
// ## Files
////////////////

/**
 * The part files of the skeleton at `file`, as a reader for `assembleParts()`:  `id` -> its text, or `undefined`.
 */
export function partReader(file) {
  return (id) => {
    const path = partFile(file, id)
    return existsSync(path) ? readFileSync(path, "utf8") : undefined
  }
}

/** oxfmt's settings, as `vp fmt` reads them from the repo root's `vite.lint.ts` (minus what only the CLI uses). */
const FORMAT = Object.fromEntries(
  Object.entries(fmtConfig).filter(([key]) => !["ignorePatterns", "sortPackageJson"].includes(key))
)

/**
 * `html` formatted as `vp fmt` would format the file at `file` (its extension picks the parser), in this process:
 * no `yarn vp fmt` per write (about 0.5s each).  Throws on a parse error.
 */
export async function formatHTML(file, html) {
  const { code, errors } = await format(basename(file), html, FORMAT)
  if (errors.length) throw new Error(`${basename(file)}:  ${errors.map((error) => error.message).join(";  ")}`)
  return code
}

/**
 * Write each `[file, text]` whose file doesn't already hold `text`, in order, each ATOMICALLY (a temp file beside it,
 * then a rename:  a reader, or the page server's watcher, never sees half a file);  returns the files written.
 * - the temp name ends `.tmp`:  the page server's watcher never reports it (`LiveReload` `IGNORED`)
 * - makes missing folders (`parts/`)
 */
export function writeChanged(outputs) {
  const written = []
  for (const [file, text] of outputs) {
    if (existsSync(file) && readFileSync(file, "utf8") === text) continue
    mkdirSync(dirname(file), { recursive: true })
    const temp = `${file}.${process.pid}.tmp`
    try {
      writeFileSync(temp, text)
      renameSync(temp, file)
    } finally {
      rmSync(temp, { force: true })
    }
    written.push(file)
  }
  return written
}
