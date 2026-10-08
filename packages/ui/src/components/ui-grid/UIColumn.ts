import { E } from "$/ui/core"
import { columnVocabulary } from "./ui-column.vocabulary.en"
import { GridPart } from "./GridPart"

/****************
 * ### `<ui-column>`
 * A cell:  `<div class="ui … column" part="column"><slot></slot></div>`, N of 16 wide.
 * - `width` takes columns (`4`), fractions (`1/4`) or percentages (`25%`) => `four wide`;  `width-mobile`,
 *   `-tablet`, `-computer`, `-large`, `-widescreen` => `four wide mobile` ..., each applied in its GRID width
 *   range.  Without a width it takes its row's or grid's count, else shares the line.
 ****************/
export class UIColumn extends GridPart<typeof columnVocabulary> {
  @E.proto static vocabulary = columnVocabulary
}

/** The vocabulary getters, typed (`UIElement`'s doc). */
export interface UIColumn extends E.AttributeValues<typeof columnVocabulary> {}
