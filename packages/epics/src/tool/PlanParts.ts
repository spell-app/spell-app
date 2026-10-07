import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"

import { AS } from "$/assembler"

import type { PlanDocParts } from "./planDoc.types"

import { PlanMarkup } from "./PlanMarkup"

/****************
 * ### `PlanParts`
 * A plan doc in PARTS (epic `claude-design`, P3):  a SKELETON, `epics/<name>/<name>.plan.html`, plus one BODY file
 * per bulky section or item, `epics/<name>/parts/<id>.htm`, which the page loads the first time it's opened
 * (`<ui-section source>`, `<ui-accordion source>`).  Rules:  `templates/epics/plan-doc.md`, "Parts".
 * - the skeleton keeps everything a reader or a script needs without a body:  every section, every phase section
 *   (id, status, badge, icon), every item LINE (`<ui-item id data-status ...>` and its `<ui-title>`), the page
 *   header, meta lines, Overview summary and prompt, the log's title
 * - the bodies (`HOSTS`):  each Overview sub-section's, each phase's (`ui-list.plan-phase-body`), each item's
 *   details (its panel's `<ui-content>`), the log's (its feed)
 * - the tool ASSEMBLES a split doc when it reads it (`assemble()`), so every `PlanDoc` command works on one whole
 *   document as before, and SPLITS it again when it writes (`split()`):  where each body goes is decided by rule,
 *   every write.  So prose a hand edit put in the skeleton moves into its part on the next command.
 * - a part file holds the body's markup as a fragment, after a one-line comment saying whose it is;  its relative
 *   URLs are relative to the PART (`parts/`), as `SourceMarkup` rewrites them against the `source` it came from.
 *   Assembling rebases them to the page, splitting back (`rebase()`).
 * - why `.htm`, not `.html`:  every page walker (`pages.js` `findPages()`:  the docs index, `docs update`, link
 *   repairs), in this checkout AND in checkouts on older code, takes `.html` files only:  a part is never a page
 * - the skeleton marks each host for the page runtime:  `source`, `data-part-ids` (ids inside the body, so a link to
 *   one loads the body first), `data-commits` (the body lists commits:  the git buttons), and a placeholder line
 *   for pages without the loader (a bundle from before P2, `file://`);  `<body data-spell-needs-server>`
 * - an instance works on ONE parsed (linkedom) document, pure DOM;  the statics at the bottom are files and
 *   formatting
 * - Node only (`node:fs`, oxfmt through `$/assembler`):  NOT in the `$/epics` barrel, imported by path.  Of the
 *   tool, imports `PlanMarkup` (serializing) and the types only, never `PlanDoc`:  `PlanDocFiles` reads and writes
 *   through it.
 * - From `packages/docs/tools/plan-parts.js` (epic `epic-components`, P7), which now forwards here.
 ****************/
export class PlanParts {
  /** the parsed plan doc this works on, IN PLACE:  a skeleton to assemble, or a whole doc to split */
  readonly document: Document

  constructor(document: Document) {
    this.document = document
  }

  ////////////////
  // ## Assembling and splitting
  ////////////////

  /** Is the document a split plan doc?  Any host with a part `source`. */
  get isSplit(): boolean {
    return Array.from(this.document.querySelectorAll("[source]")).some((host) =>
      PART_SOURCE.test(host.getAttribute("source") ?? "")
    )
  }

  /**
   * Put every part's body back into the document (a parsed skeleton), IN PLACE:  the one-file document `PlanDoc`
   * edits.
   * - `readPart(id)`:  the part file's text, `undefined` when it's missing
   * - a host's own content besides the placeholder (a hand edit, or a checkout on older code writing into the empty
   *   panel, e.g. `commit --item`) is KEPT, after the part's:  nothing is ever dropped (`inline`)
   * - a missing part:  its host keeps what it has (`missing`)
   * - returns `{ split, hosts, missing, inline }`:  `split` whether there were parts at all;  ids in the others
   */
  assemble(readPart: PartReader): PlanDocParts {
    const { document } = this
    const result: PlanDocParts = { split: false, hosts: [], missing: [], inline: [] }
    for (const host of document.querySelectorAll("[source]")) {
      const match = PART_SOURCE.exec(host.getAttribute("source") ?? "")
      if (!match) continue
      result.split = true
      const id = match[1]
      result.hosts.push(id)
      const target = this.bodyTarget(host)
      for (const note of Array.from(target.children)) if (note.classList.contains(PLACEHOLDER)) note.remove()
      const own = bodyNodes(target)
      if (own.some(hasContent)) result.inline.push(id)
      for (const name of HOST_MARKS) host.removeAttribute(name)
      const text = readPart(id)
      if (text === undefined) {
        result.missing.push(id)
        continue
      }
      const nodes = this.fragmentNodes(text).filter((node) => !isPartComment(node))
      for (const node of nodes) if (node.nodeType === 1) PlanParts.rebase(node as Element, PlanParts.toPage)
      const first = own[0] ?? null
      for (const node of nodes) target.insertBefore(node, first)
    }
    if (result.split) document.body?.removeAttribute("data-spell-needs-server")
    return result
  }

  /**
   * Take every body out of the document (a whole plan doc), IN PLACE, leaving the skeleton;  returns its parts,
   * `Map<id, html>`, in page order.
   * - each host (`HOSTS`) with a body gets `source="parts/<id>.htm"`, its marks (`data-part-ids`, `data-commits`)
   *   and the placeholder line;  a host with nothing in it stays as it is (no part)
   * - each part:  `partComment()`, then the body's markup, its relative URLs rebased to `parts/` (`rebase()`)
   * - `docName`:  the skeleton's file name, for the parts' comment
   * - a host whose id is taken by an earlier one (a broken doc) keeps its body:  two can't share a file
   * - `<body data-spell-needs-server>`:  `check-spell.js` loads the page from the server, where parts load
   */
  split({ docName = "" }: { docName?: string } = {}): Map<string, string> {
    const { document } = this
    const parts = new Map<string, string>()
    for (const { host, id, kind } of this.hosts) {
      if (parts.has(id)) continue
      const target = this.bodyTarget(host)
      const nodes = bodyNodes(target)
      if (!nodes.some(hasContent)) continue
      const box = document.createElement("div")
      box.append(...nodes)
      trimEdges(box)
      for (const element of box.children) PlanParts.rebase(element, PlanParts.toPart)
      const ids = Array.from(box.querySelectorAll("[id]"), (element) => element.id)
      const commits = box.querySelector(".plan-commits")
      parts.set(id, `${partComment(id, kind, docName)}\n${PlanMarkup.serializeHTML(box.innerHTML)}\n`)
      host.setAttribute("source", `${PARTS_DIR}/${id}${PART_EXT}`)
      if (ids.length) host.setAttribute("data-part-ids", ids.join(" "))
      if (commits) host.setAttribute("data-commits", "")
      target.append(this.placeholder(id))
    }
    if (parts.size) document.body?.setAttribute("data-spell-needs-server", "")
    return parts
  }

  /**
   * The elements of the document that host a body in a split doc (`HOSTS`), in page order:  `{ host, id, kind }`.
   * - `id`:  the section's, or the item's (the accordion's parent);  only ids fit for a file name (`[\w-]+`)
   */
  get hosts(): PartHost[] {
    const found: PartHost[] = []
    for (const host of this.document.querySelectorAll(HOSTS.join(", "))) {
      const kind = host.localName === "ui-accordion" ? "item" : "section"
      const id = kind === "item" ? (host.parentElement?.id ?? "") : host.id
      if (/^[\w-]+$/.test(id)) found.push({ host, id, kind })
    }
    return found
  }

  ////////////////
  // ## Internal
  ////////////////

  /**
   * Where a host's body goes:  a section itself;  an item panel's `<ui-content>` (made when it has none, as the
   * accordion makes one when its body arrives).
   */
  private bodyTarget(host: Element): Element {
    if (host.localName !== "ui-accordion") return host
    const content = host.querySelector(":scope > ui-content")
    if (content) return content
    const made = this.document.createElement("ui-content")
    host.append(made)
    return made
  }

  /**
   * The line a host shows until its body loads:  with the loader it's replaced at once (the panel stays shut while
   * the body is on its way);  without it (a bundle from before P2, `file://`) it says where the body is.
   * - plain text, no `<code>`:  the linker would make a link of it
   */
  private placeholder(id: string): Element {
    const note = this.document.createElement("p")
    note.className = PLACEHOLDER
    note.textContent = `Loads from ${PARTS_DIR}/${id}${PART_EXT} when opened (needs the page server).`
    return note
  }

  /** `text` (HTML) parsed as nodes of the document, not yet inserted. */
  private fragmentNodes(text: string): Node[] {
    const template = this.document.createElement("template")
    template.innerHTML = text
    return Array.from(template.content.childNodes)
  }

  ////////////////
  // ## URLs
  ////////////////

  /**
   * Rewrite every relative URL in `element` (itself included) with `change`:  `URL_ATTRIBUTES` only, never a
   * `#hash`, an absolute URL (`https:`, `mailto:`), a root path (`/x`) or an empty one.
   * - STATIC:  a pure rewrite of any element, no document of its own
   */
  static rebase(element: Element, change: (url: string) => string): void {
    for (const node of [element, ...element.querySelectorAll("*")])
      for (const name of URL_ATTRIBUTES) {
        const value = node.getAttribute(name)
        if (value === null || !isRelative(value)) continue
        node.setAttribute(name, change(value))
      }
  }

  /**
   * A page-relative URL as the part sees it (`parts/` is one folder down):  `../x`;  `parts/y` -> `y`.
   * - STATIC:  pure, and passed on as a callback (`rebase()`)
   */
  static toPart = (url: string): string =>
    url.startsWith(`${PARTS_DIR}/`) ? url.slice(PARTS_DIR.length + 1) : `../${url}`

  /** A part-relative URL as the page sees it:  the inverse of `toPart()`.  STATIC:  as `toPart()`. */
  static toPage = (url: string): string => (url.startsWith("../") ? url.slice(3) : `${PARTS_DIR}/${url}`)

  ////////////////
  // ## Files
  ////////////////

  /**
   * The file of part `id` of the skeleton at `file`:  `<folder>/parts/<id>.htm`.
   * - STATIC, as every file helper here:  they work on paths, not on a parsed document
   */
  static partFile(file: string, id: string): string {
    return join(dirname(file), PARTS_DIR, `${id}${PART_EXT}`)
  }

  /** The part files of the skeleton at `file`, as a reader for `assemble()`:  `id` -> its text, or `undefined`. */
  static reader(file: string): PartReader {
    return (id) => {
      const path = PlanParts.partFile(file, id)
      return existsSync(path) ? readFileSync(path, "utf8") : undefined
    }
  }

  /**
   * `html` formatted as `vp fmt` would format the file at `file` (its extension picks the parser), in this
   * process:  `$/assembler`'s `formatHTML()`.  Throws on a parse error.
   */
  static formatHTML(file: string, html: string): Promise<string> {
    return AS.formatHTML(file, html)
  }

  /**
   * Write each `[file, text]` whose file doesn't already hold `text`, in order, each ATOMICALLY (a temp file beside
   * it, then a rename:  a reader, or the page server's watcher, never sees half a file);  returns the files written.
   * - the temp name ends `.tmp`:  the page server's watcher never reports it (`LiveReload` `IGNORED`)
   * - makes missing folders (`parts/`)
   */
  static writeChanged(outputs: [file: string, text: string][]): string[] {
    const written: string[] = []
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
}

/** One element hosting a body (`PlanParts.hosts`):  the element, its id, and whether it's a section or an item. */
export type PartHost = { host: Element; id: string; kind: PartKind }

/** What a part is the body of:  a `section` (Overview sub-section, phase, log) or an `item`'s details. */
export type PartKind = "section" | "item"

/** Part `id`'s text, `undefined` when there's no such part. */
export type PartReader = (id: string) => string | undefined

/** The parts folder, beside the skeleton:  `epics/<name>/parts/`. */
export const PARTS_DIR = "parts"

/** A part file's extension:  not `.html`, so no page walker takes it for a page (see the class's banner). */
export const PART_EXT = ".htm"

/** A part's `source`, as the skeleton writes it:  `parts/<id>.htm`, `id` a section's or item's. */
const PART_SOURCE = /^parts\/([\w-]+)\.htm$/

/** The class of the placeholder line a host shows until its body loads (or always, without the loader). */
const PLACEHOLDER = "plan-part-note"

/** The comment a part file starts with (`partComment()`):  stripped when assembling. */
const PART_COMMENT = /^\s*plan-doc part\b/

/** Attributes the skeleton puts on a host, gone once assembled. */
const HOST_MARKS = ["source", "data-part-ids", "data-commits"]

/** URL attributes `SourceMarkup` rewrites against a body's `source` (`URL_ATTRIBUTES` in `$/ui` elements). */
const URL_ATTRIBUTES = ["href", "src", "action", "poster", "source"]

/**
 * Where bodies live in a split doc, in page order:  which elements host one.
 * - an Overview sub-section, a phase, the log:  the body is every child but the slotted ones (icon, header):  what
 *   `SourceBody` replaces with the file's content
 * - an item's details panel, `ui-accordion.plan-item`:  the body is its `<ui-content>`'s children
 */
const HOSTS = [
  "main > ui-section#overview > ui-section[id]",
  "main > ui-section#phases > ui-section[data-phase][id]",
  ".plan-items > ui-item[id] > ui-accordion.plan-item",
  "main > ui-section#log"
]

/** A host's body nodes in `target`:  every child but the slotted ones (a section's icon, header) and the placeholder. */
function bodyNodes(target: Element): ChildNode[] {
  return Array.from(target.childNodes).filter(
    (node) =>
      !(
        node.nodeType === 1 &&
        ((node as Element).hasAttribute("slot") || (node as Element).classList.contains(PLACEHOLDER))
      )
  )
}

/** Does `node` hold anything:  an element, or text that isn't only whitespace? */
function hasContent(node: Node): boolean {
  return node.nodeType === 1 || (node.nodeType === 3 && (node as Text).data.trim() !== "")
}

/** Drop whitespace-only text at both ends of `box`:  oxfmt lays the part out again. */
function trimEdges(box: Element): void {
  while (box.firstChild?.nodeType === 3 && !(box.firstChild as Text).data.trim()) box.firstChild.remove()
  while (box.lastChild?.nodeType === 3 && !(box.lastChild as Text).data.trim()) box.lastChild.remove()
}

/** The comment a part file starts with:  whose body it is, and where the rules are. */
function partComment(id: string, kind: PartKind, docName: string): string {
  const what = kind === "item" ? "details" : "body"
  return `<!-- plan-doc part:  #${id}'s ${what}${docName ? ` in ${docName}` : ""}, loaded when it opens (templates/epics/plan-doc.md, "Parts") -->`
}

/** Is `node` a part file's own comment (`partComment()`)? */
function isPartComment(node: Node): boolean {
  return node.nodeType === 8 && PART_COMMENT.test((node as Comment).data)
}

/** Is `url` relative to the document it's in (not empty, a hash, absolute, or from the root)? */
function isRelative(url: string): boolean {
  return url !== "" && !url.startsWith("#") && !url.startsWith("/") && !/^[a-z][a-z0-9+.-]*:/i.test(url)
}
