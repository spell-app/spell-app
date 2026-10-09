import { Definitions, type EpicTag } from "$/epics/definitions"
import { Markup } from "$/epics/markup"

import { PlanMarkup } from "./PlanMarkup"
import { PART_COMMENT, PART_EXT, PART_SOURCE, PARTS_DIR, PlanParts, type PartReader } from "./PlanParts"

/****************
 * ### `EpicParts`
 * A plan doc in `<epic-*>` markup, in PARTS:  the skeleton, `<name>.plan.html`, plus one body file per bulky host,
 * `parts/<id>.html`, with the elements as hosts (`templates/epics/plan-doc.md`, "Parts";  the files and URLs:
 * `PlanParts`).
 * - hosts (`HOSTS`):  an Overview sub-section, a phase, an item with details, the log.  A host's body is every child
 *   but its slotted ones (`slot="title"`):  the title stays in the skeleton, so the line shows without the body
 * - in the skeleton a host carries `source="parts/<id>.html"`, `part-ids` (the ids inside, so a link to one loads the
 *   body first) and `commits` (its body lists commits):  set through `Markup`, never by hand.  No placeholder line:
 *   a `<p>` isn't allowed in a phase or the log, and the element loads its own body (Q12).
 * - a part file:  a one-line comment (`PART_COMMENT`), then the body;  relative URLs rebased to `parts/`
 *   (`PlanParts.rebase()`), as the page's `source` loader reads them back
 * - an instance works on ONE parsed document, IN PLACE.  Reuses `PlanParts`' statics for files and URLs.
 * - used by every write of the tool (`PlanDocFiles.writeDoc()`) and by the one-time converter, which imports it from
 *   here:  the tool loads `$/epics/convert` only for its `convert` command (I5)
 ****************/
export class EpicParts {
  /** The document it splits or assembles. */
  readonly document: Document

  constructor(document: Document) {
    this.document = document
  }

  /**
   * Take every host's body out, leaving the skeleton;  returns the parts, id => text, in page order.
   * - `docName`:  the skeleton's file name, for the parts' comment
   * - a host with no body stays as it is (no part);  `<body data-spell-needs-server>` once there's a part
   */
  split({ docName = "" }: { docName?: string } = {}): Map<string, string> {
    const parts = new Map<string, string>()
    for (const host of this.hosts) {
      const id = host.id
      const body = bodyNodes(host)
      if (parts.has(id) || !body.some(hasContent)) continue
      const box = this.document.createElement("div")
      box.append(...body)
      PlanMarkup.trimWhitespace(box)
      for (const element of box.children) PlanParts.rebase(element, PlanParts.toPart)
      const ids = Array.from(box.querySelectorAll("[id]"), (element) => element.id)
      parts.set(id, `${partComment(id, host.localName, docName)}\n${PlanMarkup.serializeHTML(box.innerHTML)}\n`)
      setMarks(host, {
        source: `${PARTS_DIR}/${id}${PART_EXT}`,
        partIds: ids.length ? ids.join(" ") : undefined,
        commits: Boolean(box.querySelector("epic-commit"))
      })
    }
    if (parts.size) this.document.body?.setAttribute("data-spell-needs-server", "")
    return parts
  }

  /**
   * Put every part's body back into its host (a parsed skeleton), IN PLACE:  the whole doc.  Returns the ids of
   * parts that were missing.
   * - `source`, `part-ids` and `commits` go:  they're the skeleton's
   */
  assemble(readPart: PartReader): string[] {
    const missing: string[] = []
    for (const host of this.document.querySelectorAll("[source]")) {
      if (!host.localName.startsWith("epic-")) continue
      const match = PART_SOURCE.exec(host.getAttribute("source") ?? "")
      if (!match) continue
      setMarks(host, { source: undefined, partIds: undefined, commits: undefined })
      const text = readPart(match[1]!)
      if (text === undefined) {
        missing.push(match[1]!)
        continue
      }
      const template = this.document.createElement("template")
      template.innerHTML = text
      const nodes = Array.from(template.content.childNodes).filter((node) => !isPartComment(node))
      for (const node of nodes) if (node.nodeType === 1) PlanParts.rebase(node as Element, PlanParts.toPage)
      host.append(...nodes)
    }
    return missing
  }

  /** The elements that host a body, in page order. */
  get hosts(): Element[] {
    return Array.from(this.document.querySelectorAll(HOSTS)).filter((host) => /^[\w-]+$/.test(host.id))
  }
}

/** Hosts of a body in a split `<epic-*>` doc. */
const HOSTS = [
  "epic-overview > epic-section[kind='overview-part'][id]",
  "epic-section[kind='phases'] > epic-phase[id]",
  "epic-section > epic-item[id]",
  "epic-page > epic-section[kind='log'][id]"
].join(", ")

/**
 * Set a host's part marks through `Markup.set()`, each only where its tag has it:  a phase and an item list commits,
 * a section doesn't.
 */
function setMarks(host: Element, marks: { source?: string; partIds?: string; commits?: boolean }) {
  const tag = host.localName as EpicTag
  const known = Object.entries(marks).filter(([key]) => Definitions.attribute(tag, key))
  Markup.set(host, Object.fromEntries(known))
}

/** A host's body:  every child but its slotted ones. */
function bodyNodes(host: Element): ChildNode[] {
  return Array.from(host.childNodes).filter((node) => !(node.nodeType === 1 && (node as Element).hasAttribute("slot")))
}

/** Does `node` hold anything:  an element, or text that isn't only whitespace? */
function hasContent(node: Node): boolean {
  return node.nodeType === 1 || (node.nodeType === 3 && Boolean(node.textContent?.trim()))
}

/** The comment a part starts with (`PART_COMMENT`):  whose body it is, and where the rules are. */
function partComment(id: string, tag: string, docName: string): string {
  const what = tag === "epic-item" ? "details" : "body"
  return `<!-- plan-doc part:  #${id}'s ${what}${docName ? ` in ${docName}` : ""}, loaded when it opens (templates/epics/plan-doc.md, "Parts") -->`
}

/** Is `node` a part file's own comment? */
function isPartComment(node: Node): boolean {
  return node.nodeType === 8 && PART_COMMENT.test((node as Comment).data)
}
