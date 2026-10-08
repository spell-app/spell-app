import { E, type UIT } from "$/ui/core"
import { tableVocabulary } from "./UITable.vocabulary.en"

/****************
 * ### `TableGrammar`
 * Class strings a table needs besides its own root's:  the shadow `.scroller`'s, and a data-mode cell's.
 * - Scroller:  `ClassBuilder` over the table vocabulary's scroller-shaped attributes (`resizable`,
 *   `attached`, `scrolling`, `overflowing`) with the noun `scroller` and no `ui`, e.g.
 *   `resizable top attached short scrolling scroller`.  Same grammar as the table, so `UITable.css` keys the
 *   scroller on the same phrases (`[class*="very short"]`).
 * - Cell:  a `TableColumn`'s `textAlign` / `width` as Fomantic's cell classes (`right aligned four wide`).
 * - Plain functions of their input, no DOM.
 * - STATIC and instance-free on purpose:  nothing to hold but the one cached builder.
 ****************/
export class TableGrammar {
  /** Scroller class string from `value(name)`, the converted value of each of `SCROLLER_ATTRIBUTES`. */
  static scroller(value: (name: string) => unknown): string {
    const input: Record<string, unknown> = {}
    for (const name of SCROLLER_ATTRIBUTES) input[name] = value(name)
    TableGrammar.builder ??= new E.ClassBuilder({
      ...tableVocabulary,
      noun: SCROLLER_NOUN,
      ui: false,
      attributes: tableVocabulary.attributes.filter(({ name }) => SCROLLER_ATTRIBUTES.includes(name))
    })
    return TableGrammar.builder.build(input)
  }

  /** Does the scroller scroll:  `scrolling` / `overflowing`, in any height? */
  static scrolls(value: (name: string) => unknown): boolean {
    return !!value(SCROLLING) || !!value(OVERFLOWING)
  }

  /**
   * Fomantic cell classes for a data-mode `column`, e.g. `right aligned four wide`;  `""` for none.
   * - An unusable width is dropped silently (no class), like `ClassBuilder`'s.
   */
  static cell(column: UIT.TableColumn): string {
    const { grammar } = E.ClassBuilder
    const words: string[] = []
    if (column.textAlign) words.push(`${column.textAlign} ${grammar.aligned}`)
    // `!= null`:  `columnDefs` is JSON, where an unset width may be `null`
    if (column.width != null) {
      const columns = E.ValueSets.columns(String(column.width))
      const word = columns === undefined ? undefined : E.numberToWord(Math.round(columns))
      if (word) words.push(`${word} ${grammar.wide}`)
    }
    return words.join(" ")
  }

  /**
   * Builds scroller classes:  the table vocabulary narrowed to `SCROLLER_ATTRIBUTES`, noun `scroller`, no `ui`.
   * - Static:  one per page, made on first use.
   */
  private static builder: E.ClassBuilder | undefined
}

/** Scroller attribute that caps the height and scrolls, head and foot stuck. */
const SCROLLING = "scrolling"

/** Scroller attribute that caps the height and scrolls both ways. */
const OVERFLOWING = "overflowing"

/** Canonical names of the table attributes that shape the scroller, in vocabulary order. */
const SCROLLER_ATTRIBUTES: readonly string[] = ["resizable", "attached", SCROLLING, OVERFLOWING]

/** The scroller's noun:  its last class word. */
const SCROLLER_NOUN = "scroller"
