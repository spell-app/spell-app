import { Markup } from "$/epics/markup"

import { COMMIT_URL } from "./convert.types"

import { DocReading, type ElementReading } from "./DocReading"

/****************
 * ### `NewReading`
 * A plan doc in `<epic-*>` markup, read for `ConversionProof`:  its ids, links and visible text, the text the elements
 * draw from their attributes included (an item's `title`, a reply's `from` / `at` / `re` ...).
 * - Reads an ASSEMBLED doc (`EpicParts.assemble()`).
 * - Draws only what the old markup wrote as text:  not a phase's status icon, nor a chip's `Q7` (the old reading
 *   leaves those out too);  the links it draws are the chips' (`#q7`) and the commits' (`<repo>/commit/<sha>`).
 * - Reads attributes through `Markup.read()`:  the definitions say what each one is.
 ****************/
export class NewReading extends DocReading {
  constructor(document: Document) {
    super()
    this.read(document)
  }

  protected unitOf(element: Element): string | undefined {
    if (element.localName === "epic-overview") return "overview"
    if (/^epic-(section|phase|item)$/.test(element.localName) && element.id) return element.id
    if (element.localName === "ui-section" && element.parentElement?.localName === "main" && element.id)
      return element.id
    return undefined
  }

  protected readingOf(element: Element): ElementReading | undefined {
    const tag = element.localName
    if (!tag.startsWith("epic-")) return undefined
    const data = Markup.read(element) as Record<string, string | number | boolean | undefined>
    const text = (key: string) => (typeof data[key] === "string" ? (data[key] as string) : undefined)
    switch (tag) {
      case "epic-page":
      case "epic-item":
      case "epic-option":
      case "epic-answer":
        return { pieces: [text("title")] }
      case "epic-section":
        return { pieces: [data.kind === "overview-part" ? text("title") : undefined] }
      case "epic-overview":
        return { pieces: [text("estimate")] }
      case "epic-phase":
        return { pieces: [text("title"), text("estimate")] }
      case "epic-reply":
        return { pieces: [text("from"), text("at"), text("re")] }
      case "epic-updated":
        // a Plan changes copy (T14):  chrome, as the old box was (`OldReading` skips it)
        if (element.getAttribute("slot") === "changes") return { children: false }
        return { pieces: [text("at")] }
      case "epic-event":
        return { pieces: [shownTime(text("at"))] }
      default:
        return {}
    }
  }

  /** Each item's chip links to it (`#q7`);  each commit to `<repo>/commit/<sha>`, `repo` the page's. */
  protected drawnLinks(document: Document): string[] {
    const links = Array.from(document.querySelectorAll("epic-item[id]"), (item) => `#${item.id}`)
    const repo = document.querySelector("epic-page")?.getAttribute("repo")
    if (repo) {
      for (const commit of document.querySelectorAll("epic-commit[sha]")) {
        const url = `${repo}/commit/${commit.getAttribute("sha")}`
        if (COMMIT_URL.test(url)) links.push(url)
      }
    }
    return links
  }
}

/** A time as `<epic-event>` shows it:  `2026-10-06T08:12-04:00` => `2026-10-06 08:12`;  a bare date as it is. */
function shownTime(at: string | undefined): string | undefined {
  return at?.replace(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}).*$/, "$1 $2")
}
