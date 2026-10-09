import { PART_COMMENT, PART_SOURCE, PlanParts, type PartReader } from "$/epics/tool/PlanParts"
import type { PlanDocParts } from "$/epics/tool/planDoc.types"

/****************
 * ### `OldParts`
 * A plan doc in the OLD markup, in parts:  its skeleton's hosts (`ui-section[source]`, `ui-accordion.plan-item[source]`)
 * each load a body, `parts/<id>.html`.  The first pass (`Converter`) assembles such a doc before converting it.
 * - the files and URLs are `PlanParts`';  an `<epic-*>` doc's parts are `EpicParts`'
 * - `.html` parts only:  a doc split before Q12 (`parts/<id>.htm`) needs its parts renamed first
 * - works on ONE parsed document, IN PLACE.
 * - Moved here from `PlanParts` (epic `epic-components` P15):  the plan-doc tool reads no old doc any more.
 ****************/
export class OldParts {
  /** The parsed plan doc this works on, IN PLACE:  a skeleton to assemble. */
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
}

/** The class of the placeholder line an old-markup host shows until its body loads. */
const PLACEHOLDER = "plan-part-note"

/** Attributes an old-markup skeleton puts on a host, gone once assembled. */
const HOST_MARKS = ["source", "data-part-ids", "data-commits"]

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
