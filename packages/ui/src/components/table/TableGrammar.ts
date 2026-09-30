import { ClassBuilder, numberToWord, ValueSets, type ComponentVocabulary, type TableColumn } from "$/core"

import { tableVocabulary } from "./table.vocabulary.en"

/****************
 * ### `TableGrammar`
 * Class strings a table needs besides its own root's:  the shadow `.scroller`'s, and a data-mode cell's.
 * - Scroller:  `ClassBuilder` over the table vocabulary's scroller-shaped attributes (`resizable`,
 *   `attached`, `scrolling`, `overflowing`) with the noun `scroller` and no `ui`, e.g.
 *   `resizable top attached short scrolling scroller`.  Same grammar as the table, so `table.css` keys the
 *   scroller on the same phrases (`[class*="very short"]`).
 * - Cell:  a `TableColumn`'s `textAlign` / `width` as Fomantic's cell classes (`right aligned four wide`).
 * - Shared by the element and its native fallback;  plain functions of their input, no DOM.
 ****************/
export class TableGrammar {
  /** Canonical names of the table attributes that shape the scroller, in vocabulary order. */
  static readonly scrollerAttributes: readonly string[] = ["resizable", "attached", "scrolling", "overflowing"]

  /** The scroller's pseudo-vocabulary:  the table's own specs for `scrollerAttributes`. */
  static readonly scrollerVocabulary: ComponentVocabulary = {
    ...tableVocabulary,
    noun: "scroller",
    ui: false,
    attributes: tableVocabulary.attributes.filter(({ name }) => TableGrammar.scrollerAttributes.includes(name))
  }

  /** Builds scroller classes;  made on first use. */
  private static builder: ClassBuilder | undefined

  /** Scroller class string from `value(name)`, the converted value of each of `scrollerAttributes`. */
  static scroller(value: (name: string) => unknown): string {
    const input: Record<string, unknown> = {}
    for (const name of TableGrammar.scrollerAttributes) input[name] = value(name)
    TableGrammar.builder ??= new ClassBuilder(TableGrammar.scrollerVocabulary)
    return TableGrammar.builder.build(input)
  }

  /** Does a scroller class string make it scroll (`scrolling` / `overflowing`, in any height)? */
  static scrolls(value: (name: string) => unknown): boolean {
    return !!value(SCROLLING) || !!value(OVERFLOWING)
  }

  /**
   * Fomantic cell classes for a data-mode `column`, e.g. `right aligned four wide`;  `""` for none.
   * - SIDE EFFECT (dev only):  an unusable width is dropped silently (no class), like `ClassBuilder`'s.
   */
  static cell(column: TableColumn): string {
    const { grammar } = ClassBuilder
    const words: string[] = []
    if (column.textAlign) words.push(`${column.textAlign} ${grammar.aligned}`)
    if (column.width != null) {
      const columns = ValueSets.columns(String(column.width))
      const word = columns === undefined ? undefined : numberToWord(Math.round(columns))
      if (word) words.push(`${word} ${grammar.wide}`)
    }
    return words.join(" ")
  }
}

/** Scroller attributes that make it scroll. */
const SCROLLING = "scrolling"
const OVERFLOWING = "overflowing"
