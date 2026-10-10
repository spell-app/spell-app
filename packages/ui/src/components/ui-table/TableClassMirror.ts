import { UIT } from "$/ui/core"

/****************
 * ### `TableClassMirror`
 * Writes an element's Fomantic class string (`ui celled striped table`) onto a LIGHT-DOM `<table>`,
 * so `UITable.css`'s class-grammar rules style it.
 * - Owns only its words:  the author's other classes stay, in their order;  the element's phrase follows them
 *   as one run in grammar order, since phrase selectors (`[class*="very basic"]`) need the words adjacent.
 * - Words the table ALREADY has when first mirrored, and the element emits, count as the element's:
 *   an SSR table carries the element's own words (`class="ui celled table"`), which must go when `celled` does.
 * - Re-applies through a `MutationObserver` on the table's `class`, when a framework rewrites `className`.
 * - Plain DOM, no Solid.
 * - NOTE: letting go of a table (`detach()`) leaves its classes:  it's usually gone from the `<ui-table>` by then,
 *   and an app may have moved it on purpose.
 ****************/
export class TableClassMirror {
  /** Table mirrored onto, if any. */
  private table: HTMLTableElement | undefined

  /** Class string to mirror. */
  private classes = ""

  /** Words on `table` that are the element's, not the author's. */
  private owned = new Set<string>()

  /** Watches `table`'s `class`. */
  private observer: MutationObserver | undefined

  /**
   * Mirror `classes` onto `table`, switching tables when it changed;  `undefined` lets go.
   * - SIDE EFFECT:  writes `table`'s `class` attribute (only when the text changes).
   */
  apply(table: HTMLTableElement | undefined, classes: string) {
    this.classes = classes
    if (table !== this.table) {
      this.detach()
      this.table = table
      if (!table) return
      const current = new Set(TableClassMirror.words(table.getAttribute("class")))
      this.owned = new Set(TableClassMirror.words(classes).filter((word) => current.has(word)))
      // oxlint-disable-next-line spell-ui/no-mutation-observer -- a helper class, watching ANOTHER element (the table)
      this.observer = new MutationObserver(() => this.write())
      this.observer.observe(table, { attributeFilter: ["class"] })
    }
    this.write()
  }

  /** Stop mirroring;  the table keeps its classes. */
  detach() {
    this.observer?.disconnect()
    this.observer = undefined
    this.table = undefined
    this.owned = new Set()
  }

  /** Recompute the table's class text:  author words, then the element's phrase. */
  private write() {
    const table = this.table
    if (!table) return
    const text = table.getAttribute("class") ?? ""
    const author = TableClassMirror.words(text).filter((word) => !this.owned.has(word))
    const ours = TableClassMirror.words(this.classes)
    const mine = new Set(ours)
    const kept = author.filter((word) => !mine.has(word))
    this.owned = new Set(ours.filter((word) => !author.includes(word)))
    // NEVER dedupe `ours`:  a phrase may repeat a word (`head stuck first stuck`, `center aligned top aligned`)
    const next = [...kept, ...ours].join(" ")
    if (next !== text) table.setAttribute("class", next)
  }

  /**
   * `table`'s class text with `classes` mirrored in once:  its author words, then the element's phrase.
   * - For a static server render (`UITable.decorateStatic()`):  no observer, nothing owned yet;  the same text a
   *   first `apply()` writes.
   * - `text` is `getAttribute()`'s:  `null` when absent (a platform boundary).
   * - Static:  one call, nothing to mirror into later.
   */
  static mirrored(text: string | null, classes: string): string {
    const ours = TableClassMirror.words(classes)
    const mine = new Set(ours)
    return [...TableClassMirror.words(text).filter((word) => !mine.has(word)), ...ours].join(" ")
  }

  /** Class words of `text`, in order.  Static:  pure, for `mirrored()` too. */
  private static words(text: string | null): string[] {
    return text ? text.split(UIT.WHITESPACE).filter(Boolean) : []
  }
}
