import { proto } from "$/core"

import { gridVocabulary } from "./grid.vocabulary.en"
import { GridPart } from "./GridPart"

/****************
 * ### `<ui-grid>`
 * A 16-column flex grid:  `<div class="ui … grid" part="grid"><slot></slot></div>` around rows and columns.
 * - `columns="3"` => `three column`;  `columns="equal"` / `equal-width` => `equal width`.
 * - Its HOST is a block and the `ui-grid` size container, unless it sits in another grid or row (then
 *   `display: contents`, like a column).
 ****************/
export class UIGrid extends GridPart<typeof gridVocabulary> {
  @proto static vocabulary = gridVocabulary
}
