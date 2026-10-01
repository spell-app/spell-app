import { proto } from "$/ui/core"

import { rowVocabulary } from "./grid.vocabulary.en"
import { GridPart } from "./GridPart"

/****************
 * ### `<ui-row>`
 * A line of columns:  `<div class="ui … row" part="row"><slot></slot></div>`;  re-declares the grid's column
 * tokens for its own columns (`columns`, `divided`, `reversed` ...).
 ****************/
export class UIRow extends GridPart<typeof rowVocabulary> {
  @proto static vocabulary = rowVocabulary
}
