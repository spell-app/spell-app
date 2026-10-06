import { E, UIT } from "$/ui/core"
import { gridVocabulary } from "./ui-grid.vocabulary.en"
import { GridPart } from "./GridPart"

/****************
 * ### `<ui-grid>`
 * A 16-column flex grid:  `<div class="ui … grid" part="grid"><slot></slot></div>` around rows and columns.
 * - `columns="3"` => `three column`;  `columns="equal"` / `equal-width` => `equal width`.
 * - Its HOST is a block and the `ui-grid` size container, unless it sits in another grid or row (then
 *   `display: contents`, like a column).
 * - `stack-with` becomes a private class after the noun (`ui stackable grid stack-with-page`), which the sheet's
 *   range rules key on;  rows and columns follow their grid's range.
 ****************/
export class UIGrid extends GridPart<typeof gridVocabulary> {
  @E.proto static vocabulary = gridVocabulary

  /** `stack-with`'s class (`UIT.StackClasses`). */
  protected extraClasses(): string | undefined {
    return UIT.StackClasses.classFor(this.attrs.stackWith)
  }

  /**
   * `celled` while celled with its outer box (not `internally`).
   * - Why:  the host is a size container (its own formatting context), so that box's outer margin sits on the
   *   HOST, to collapse with the content above as class grammar's does (`ui-grid.css`).
   */
  protected hostStates() {
    return { celled: this.attrs.celled === true }
  }
}
