import { anchorOf, blocksIn, excerptOf, kindOf, PAGE_ANCHOR, sectionOf, textOf } from "../../tools/BlockAnchors.js"

/****************
 * ### `PlanAnchors`
 * Where a COMMENT's anchor lands on an epic page read from disk, and where its block went when the page changed:
 * what `links-agree` checks Owen's comments by (epic `epic-workflow`, P8).
 * - an anchor is a block's id, `page`, or `<container id | page>#<kind>-<n>` (`p3#field-2`, phase 3's second field)
 * - the RULES are the docs tools' `BlockAnchors.js`, which the page's runtime draws comments by:  the same block
 *   kinds, containers and excerpts, imported (one package since epic `people-and-orgs` P16, no copy)
 * - what's its own:  `find()`, which says HOW it found a block (`exact`, `moved`, `changed`, `gone`), for the
 *   migration's report;  the runtime's `findBlock()` only says whether it's exact
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
    const ofKind = PlanAnchors.blocksIn(main).filter((each) => PlanAnchors.kindOf(each) === kind)
    const there = ofKind.filter((each) => PlanAnchors.sectionOf(each, main) === section)[Number(n) - 1]
    const same = (each: Element) => Boolean(excerpt) && PlanAnchors.excerptOf(each) === excerpt
    if (there && (!excerpt || same(there))) return { block: there, how: "exact" }
    const matches = ofKind.filter(same)
    if (matches.length === 1) return { block: matches[0]!, how: "moved" }
    return there ? { block: there, how: "changed" } : { block: null, how: "gone" }
  }

  /** `block`'s anchor:  its `id`, else `<container id | page>#<kind>-<n>`. */
  static anchorOf(block: Element): string {
    return anchorOf(block, PlanAnchors.mainOf(block.ownerDocument))
  }

  /** `element`'s block kind (`field` ...), or `undefined` when it isn't one of the block kinds. */
  static kindOf(element: Element): string | undefined {
    return kindOf(element)
  }

  /** The major blocks inside `main`, in page order:  the outermost only, but updates count inside any block. */
  static blocksIn(main: Element): Element[] {
    return blocksIn(main)
  }

  /** The nearest container with an id around `block` (never `block` itself), inside `main`;  `null` for none. */
  static sectionOf(block: Element, main: Element): Element | null {
    return sectionOf(block, main)
  }

  /** `block`'s excerpt:  an item's, phase's or section's title, else its first characters. */
  static excerptOf(block: Element): string {
    return excerptOf(block)
  }

  /** `block`'s text as a comment reads it:  white space squashed, a space after each element's text. */
  static textOf(block: Element): string {
    return textOf(block)
  }

  /** The page's content root:  its `<main>`, else its body. */
  private static mainOf(document: Document): Element {
    return document.querySelector("main") ?? document.body ?? document.documentElement
  }
}

/** Where `PlanAnchors.find()` found a comment's block. */
export type FoundBlock = { block: Element | null; how: "exact" | "moved" | "changed" | "gone" }

/** A positional anchor:  `<container id | page>#<kind>-<n>`. */
const POSITIONAL = /^(.+)#([a-z][a-z-]*)-(\d+)$/
