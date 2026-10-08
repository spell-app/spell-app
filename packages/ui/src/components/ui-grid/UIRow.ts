import { E } from "$/ui/core"
import { rowVocabulary } from "./UIRow.vocabulary.en"
import { GridPart } from "./GridPart"

/****************
 * ### `UIRow`
 * The component behind `<ui-row>`:  a line of columns in a grid, `<div class="ui … row"
 * part="row"><slot></slot></div>`.
 *
 * - It declares the grid's column tokens again for its own columns (`columns`, `divided`, `reversed` ...).
 ****************/
export class UIRow extends GridPart<typeof rowVocabulary> {
  @E.proto static vocabulary = rowVocabulary
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UIRow extends E.AttributeValues<typeof rowVocabulary> {}
