import type { Migration } from "./migrations.types"

/****************
 * ### `ReaderIsYou`
 * The migration `owen-types-to-you-type`:  "Owen types" becomes "you type" (Owen, 2026-10-11:  "so it's not
 * me-specific").  The pages speak to whoever reads them.
 * - "Owen types ..." at a sentence's start becomes "You type ...", elsewhere "you type ..."
 * - only prose:  never inside a quote of his own words (`<q>`, `<blockquote>`, an `<epic-aside>` of "Owen's words"),
 *   code, or the log (`<epic-event>`), which are records
 * - idempotent:  once no "Owen types" is left, it changes nothing
 ****************/
export class ReaderIsYou implements Migration {
  readonly name = "owen-types-to-you-type"
  readonly description = 'prose says "you type", not "Owen types":  the pages speak to whoever reads them'

  run(document: Document): boolean {
    const walker = document.createTreeWalker(document.body ?? document.documentElement, SHOW_TEXT)
    let changed = false
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const text = node.nodeValue ?? ""
      if (!text.includes(PHRASE) || node.parentElement?.closest(RECORDS)) continue
      node.nodeValue = text.replace(/Owen types/g, (_, offset: number) => {
        const before = text.slice(0, offset)
        const starts = /[.!?:]\s*$/.test(before) || (before.trim() === "" && !hasTextBefore(node))
        return starts ? "You type" : "you type"
      })
      changed = true
    }
    return changed
  }
}

/** The phrase it rewrites. */
const PHRASE = "Owen types"

/** Where "Owen types" is a record, kept as written:  his words quoted, code, the log. */
const RECORDS = 'q, blockquote, code, pre, epic-event, epic-aside[title^="Owen\'s words"], epic-prompt'

/** A text node, from the DOM's `NodeFilter` (linkedom has no global). */
const SHOW_TEXT = 4

/** Are there words before `node` in its parent (a sibling with text):  then a phrase at its start is mid-sentence. */
function hasTextBefore(node: Node): boolean {
  for (let sibling = node.previousSibling; sibling; sibling = sibling.previousSibling) {
    if (sibling.textContent?.trim()) return true
  }
  return false
}
