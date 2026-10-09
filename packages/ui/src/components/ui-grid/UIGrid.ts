import { E, UIT } from "$/ui/core"
import { gridVocabulary } from "./UIGrid.en"
import { GridPart } from "./GridPart"

/****************
 * ### `UIGrid`
 * The component behind `<ui-grid>`:  a 16-column flex grid of rows and columns,
 * `<div class="ui … grid" part="grid"><slot></slot></div>`.
 *
 * - `columns="3"` => `three column`;  `columns="equal"` or `equal-width` => `equal width`.
 * - Its DOM element is a block and the `ui-grid` size container,
 *   unless it sits in another grid or row (then `display: contents`, like a column).
 * - `stack-with` becomes a private class before the noun (`ui stackable stack-with-page grid`),
 *   which the sheet's range rules key on;  rows and columns follow their grid's range.
 ****************/
export class UIGrid extends GridPart<typeof gridVocabulary> {
  @E.proto static vocabulary = gridVocabulary

  /** `stack-with`'s class (`UIT.StackClasses`). */
  protected get extraClass(): string | undefined {
    return UIT.StackClasses.classFor(this.stackWith)
  }

  /**
   * Celled with its outer box (`celled`, not `celled="internally"`):  `:state(celled)`.
   * - Why:  the DOM element is a size container (its own formatting context), so that box's outer margin sits on the
   *   DOM ELEMENT, to collapse with the content above as class grammar's does (`UIGrid.css`).
   */
  @E.cssState("celled")
  get hasOuterCells(): boolean {
    return this.celled === true
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UIGrid extends E.AttributeValues<typeof gridVocabulary> {}
