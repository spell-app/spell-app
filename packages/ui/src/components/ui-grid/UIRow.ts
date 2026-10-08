import { E } from "$/ui/core"
import { rowVocabulary } from "./ui-row.vocabulary.en"
import { GridPart } from "./GridPart"

/****************
 * ### `<ui-row>`
 * A line of columns:  `<div class="ui … row" part="row"><slot></slot></div>`;  re-declares the grid's column
 * tokens for its own columns (`columns`, `divided`, `reversed` ...).
 ****************/
export class UIRow extends GridPart<typeof rowVocabulary> {
  @E.proto static vocabulary = rowVocabulary
}

/** The vocabulary getters, typed (`UIElement`'s doc). */
export interface UIRow extends E.AttributeValues<typeof rowVocabulary> {}
