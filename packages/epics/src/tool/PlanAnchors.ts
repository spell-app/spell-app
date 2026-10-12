/****************
 * ### `PlanAnchors`
 * Where a COMMENT's anchor lands on an epic page read from disk, and where its block went when the page changed:
 * what `links-agree` checks Owen's comments by (epic `epic-workflow`, P8).
 * - an anchor is a block's id, `page`, or `<container id | page>#<kind>-<n>` (`p3#field-2`, phase 3's second field)
 * - the RULES are `packages/docs/tools/BlockAnchors.js`'s, which the page's runtime draws comments by:
 *   the same block kinds, containers and excerpts.  A COPY, because `epics` may not import `docs`;
 *   `packages/docs/tools/migrate.test.ts` checks the two agree on a page, so change both.
 * - only what an epic page holds:  no docs sections, cards or steps
 * - STATIC:  pure, on a parsed document (linkedom or the browser's)
 ****************/
export class PlanAnchors {
  /**
   * The block `anchor` names in `document` and how it was found:  `{ block, how }`.
   * - `exact`:  the block there still starts with `excerpt` (or there's no excerpt to tell);  an id's element
   * - `moved`:  the block there doesn't, but exactly ONE block of that kind on the page does:  that one
   * - `changed`:  none does (its words changed, or several match):  the block there anyway
   * - `gone`:  nothing there:  `block` `null`
   */
  static find(document: Document, anchor: string, excerpt = ""): FoundBlock {
    const main = PlanAnchors.mainOf(document)
    if (anchor === PAGE_ANCHOR) return { block: main, how: "exact" }
    const positional = POSITIONAL.exec(anchor)
    if (!positional) {
      const element = document.getElementById(anchor)
      return element && main.contains(element) ? { block: element, how: "exact" } : { block: null, how: "gone" }
    }
    const [, sectionId, kind, n] = positional
    const section = sectionId === PAGE_ANCHOR ? null : document.getElementById(sectionId!)
    const blocks = PlanAnchors.blocksIn(main)
    const ofKind = blocks.filter((each) => PlanAnchors.kindOf(each) === kind)
    const there = ofKind.filter((each) => PlanAnchors.sectionOf(each, main) === section)[Number(n) - 1]
    const same = (each: Element) => Boolean(excerpt) && PlanAnchors.excerptOf(each) === excerpt
    if (there && (!excerpt || same(there))) return { block: there, how: "exact" }
    const matches = ofKind.filter(same)
    if (matches.length === 1) return { block: matches[0]!, how: "moved" }
    return there ? { block: there, how: "changed" } : { block: null, how: "gone" }
  }

  /** `block`'s anchor:  its `id`, else `<container id | page>#<kind>-<n>`. */
  static anchorOf(block: Element): string {
    if (block.id) return block.id
    const main = PlanAnchors.mainOf(block.ownerDocument)
    const kind = PlanAnchors.kindOf(block)
    const section = PlanAnchors.sectionOf(block, main)
    const peers = PlanAnchors.blocksIn(main).filter(
      (each) => PlanAnchors.kindOf(each) === kind && PlanAnchors.sectionOf(each, main) === section
    )
    return `${section?.id ?? PAGE_ANCHOR}#${kind}-${peers.indexOf(block) + 1}`
  }

  /** `element`'s block kind (`field` ...), or `undefined` when it isn't one of `BLOCK_KINDS`. */
  static kindOf(element: Element): string | undefined {
    return BLOCK_KINDS.find(([, selector]) => element.matches(selector))?.[0]
  }

  /** The major blocks inside `main`, in page order:  the outermost only, but updates count inside any block. */
  static blocksIn(main: Element): Element[] {
    return Array.from(main.querySelectorAll(ANY_BLOCK)).filter((element) => {
      if (element.closest(NOT_CONTENT) || element.closest(NOT_PLAN_TEXT)) return false
      const outer = element.parentElement?.closest(OUTER_BLOCK)
      return !outer || !main.contains(outer) || element.matches(NESTED_BLOCKS)
    })
  }

  /** The nearest container with an id around `block` (never `block` itself), inside `main`;  `null` for none. */
  static sectionOf(block: Element, main: Element): Element | null {
    const section = block.parentElement?.closest(CONTAINERS)
    return section && main.contains(section) ? section : null
  }

  /** `block`'s excerpt:  an item's, phase's or section's title, else its first `EXCERPT_LENGTH` characters. */
  static excerptOf(block: Element): string {
    if (block.matches("epic-item, epic-section, epic-phase")) return PlanAnchors.titleOf(block)
    return PlanAnchors.textOf(block).slice(0, EXCERPT_LENGTH).trim()
  }

  /** `block`'s text as a comment reads it:  white space squashed, a space after each element's text. */
  static textOf(block: Element): string {
    const runs: string[] = []
    const walk = (node: Node) => {
      if (node.nodeType === TEXT_NODE) return void runs.push(node.textContent ?? "")
      if (node.nodeType !== ELEMENT_NODE || (node !== block && (node as Element).matches(NOT_CONTENT))) return
      for (const child of Array.from(node.childNodes)) walk(child)
      runs.push(" ")
    }
    walk(block)
    return squash(runs.join(""))
  }

  /** The page's content root:  its `<main>`, else its body. */
  private static mainOf(document: Document): Element {
    return document.querySelector("main") ?? document.body ?? document.documentElement
  }

  /** A titled block's title, as a reader sees it:  its `header` or `title`, or its title slot's words. */
  private static titleOf(element: Element): string {
    const slotted = Array.from(element.children).find((child) =>
      /^(header|title)$/.test(child.getAttribute("slot") ?? "")
    )
    return squash(element.getAttribute("header") ?? element.getAttribute("title") ?? slotted?.textContent ?? "")
  }
}

/** Where `PlanAnchors.find()` found a comment's block. */
export type FoundBlock = { block: Element | null; how: "exact" | "moved" | "changed" | "gone" }

/** The major blocks of an epic page, by kind:  `[kind, selector]`, the first match naming an element's kind. */
const BLOCK_KINDS: [string, string][] = [
  ["section", "ui-section"],
  ["item", "epic-item"],
  ["field", "epic-field"],
  ["update", "epic-update[at]"],
  ["summary", "epic-summary"],
  ["prose", "epic-section > p, epic-overview > p"],
  ["table", "ui-table, table"],
  ["aside", "ui-accordion.spell-aside, epic-aside"],
  ["code", "ui-accordion.spell-code, ui-code, epic-code, pre"],
  ["message", "ui-message"],
  ["cards", "ui-cards"],
  ["steps", "ui-steps"],
  ["list", "ui-list, ul, ol"]
]

/** What a block's anchor counts from:  the nearest of these with an id. */
const CONTAINERS = "ui-section[id], epic-overview[id], epic-section[id], epic-phase[id], epic-item[id]"

/** The anchor of a comment on the whole page. */
const PAGE_ANCHOR = "page"

/** How much of a block's text its excerpt keeps, in characters. */
const EXCERPT_LENGTH = 80

/** Any major block. */
const ANY_BLOCK = BLOCK_KINDS.map(([, selector]) => selector).join(", ")

/** Blocks that count even inside another block:  updates. */
const NESTED_BLOCKS = "epic-update[at]"

/** A block that holds its own blocks:  every kind but a docs section. */
const OUTER_BLOCK = BLOCK_KINDS.filter(([kind]) => kind !== "section")
  .map(([, selector]) => selector)
  .join(", ")

/** Not the page's own content:  its header, notes, what the runtime adds. */
const NOT_CONTENT = "spell-notes, [data-spell-added], .spell-page-head, ui-sticky.spell-h1, nav, footer"

/** An epic page's parts that aren't its text:  the log, commits, an older doc's plan changes copies. */
const NOT_PLAN_TEXT = "epic-event, epic-commit, epic-updated[slot], [slot='status']"

/** A positional anchor:  `<container id | page>#<kind>-<n>`. */
const POSITIONAL = /^(.+)#([a-z][a-z-]*)-(\d+)$/

/** DOM node types (linkedom has no global `Node`). */
const ELEMENT_NODE = 1
const TEXT_NODE = 3

/** `text` with runs of white space as one space, trimmed. */
function squash(text: string): string {
  return text.replace(/\s+/g, " ").trim()
}
