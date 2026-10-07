import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"

import { AS } from "$/assembler"

import type { PlanDocParts } from "./planDoc.types"

/****************
 * ### `PlanParts`
 * A plan doc in PARTS (epic `claude-design`, P3):  a SKELETON, `epics/<name>/<name>.plan.html`, plus one BODY file
 * per bulky section or item, `epics/<name>/parts/<id>.htm`, which the page loads the first time it's opened.  Rules:
 * `PLAN-DOC.md` beside this, "Parts".
 * - the statics are the parts' FILES and URLS, whichever markup:  where a part lives (`partFile()`), reading one
 *   (`reader()`), rebasing a body's relative URLs to `parts/` and back (`rebase()`), formatting and writing
 *   (`formatHTML()`, `writeChanged()`).  `EpicParts` beside this splits and assembles an `<epic-*>` doc on
 *   them;  so does the converter.
 * - an instance ASSEMBLES a skeleton in the OLD markup (`ui-section[source]`, `ui-accordion.plan-item[source]`):  for
 *   `OldPlanReader` and the converter.  REFACTOR: drop the instance half after the switch (P12):  no doc is in the
 *   old markup then.  (Its `split()` went with the tool's old layout code, P8:  the tool writes `<epic-*>` docs only.)
 * - why `.htm`, not `.html`:  every page walker (`pages.js` `findPages()`:  the docs index, `docs update`, link
 *   repairs), in this checkout AND in checkouts on older code, takes `.html` files only:  a part is never a page
 * - Node only (`node:fs`, oxfmt through `$/assembler`):  NOT in the `$/epics` barrel, imported by path.
 ****************/
export class PlanParts {
  /** the parsed plan doc this works on, IN PLACE:  a skeleton to assemble */
  readonly document: Document

  constructor(document: Document) {
    this.document = document
  }

  /**
   * Put every part's body back into the document (a parsed OLD-markup skeleton), IN PLACE.
   * - `readPart(id)`:  the part file's text, `undefined` when it's missing
   * - a host's own content besides the placeholder (a hand edit, or a checkout on older code writing into the empty
   *   panel) is KEPT, after the part's:  nothing is ever dropped (`inline`)
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
      const id = match[1]!
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

  /** The part files of the skeleton at `file`, as a reader:  `id` -> its text, or `undefined`. */
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

/** Part `id`'s text, `undefined` when there's no such part. */
export type PartReader = (id: string) => string | undefined

/** The parts folder, beside the skeleton:  `epics/<name>/parts/`. */
export const PARTS_DIR = "parts"

/** A part file's extension:  not `.html`, so no page walker takes it for a page (see the class's banner). */
export const PART_EXT = ".htm"

/** A part's `source`, as a skeleton writes it:  `parts/<id>.htm`, `id` a section's or item's. */
export const PART_SOURCE = /^parts\/([\w-]+)\.htm$/

/** The class of the placeholder line an old-markup host shows until its body loads. */
const PLACEHOLDER = "plan-part-note"

/** The comment a part file starts with:  stripped when assembling. */
const PART_COMMENT = /^\s*plan-doc part\b/

/** Attributes an old-markup skeleton puts on a host, gone once assembled. */
const HOST_MARKS = ["source", "data-part-ids", "data-commits"]

/** URL attributes `SourceMarkup` rewrites against a body's `source` (`URL_ATTRIBUTES` in `$/ui` elements). */
const URL_ATTRIBUTES = ["href", "src", "action", "poster", "source"]

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

/** Is `node` a part file's own comment? */
function isPartComment(node: Node): boolean {
  return node.nodeType === 8 && PART_COMMENT.test((node as Comment).data)
}

/** Is `url` relative to the document it's in (not empty, a hash, absolute, or from the root)? */
function isRelative(url: string): boolean {
  return url !== "" && !url.startsWith("#") && !url.startsWith("/") && !/^[a-z][a-z0-9+.-]*:/i.test(url)
}
