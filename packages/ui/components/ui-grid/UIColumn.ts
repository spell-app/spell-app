import { E } from "$/ui/core"
import { columnVocabulary } from "./UIColumn.en"
import { GridPart } from "./GridPart"

/****************
 * ### `UIColumn`
 * The component behind `<ui-column>`:  a cell of a grid, N of 16 wide,
 * `<div class="ui … column" part="column"><slot></slot></div>`.
 *
 * - `width` takes columns (`4`), fractions (`1/4`) or percentages (`25%`) => `four wide`.
 * - `width-mobile`, `-tablet`, `-computer`, `-large` and `-widescreen` => `four wide mobile` ...,
 *   each applied in its GRID's width range.
 * - Without a width it takes its row's or grid's count, else shares the line.
 ****************/
export class UIColumn extends GridPart<typeof columnVocabulary> {
  @E.proto static vocabulary = columnVocabulary
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UIColumn extends E.AttributeValues<typeof columnVocabulary> {}
