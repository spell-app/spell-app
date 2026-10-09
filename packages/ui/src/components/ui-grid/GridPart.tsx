import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"

import gridCSS from "./UIGrid.css?inline"

/****************
 * ### `GridPart`
 * The base class of the grid family's components (`UIGrid`, `UIRow`, `UIColumn`):
 * each draws `<div class="ui … <noun>" part="<noun>"><slot></slot></div>`, all three from ONE sheet.
 *
 * - The layout is `UIGrid.css`'s alone, across shadow roots:
 *   rows and columns slotted into a grid or row have `display: contents` DOM elements, so each ROOT is the flex item.
 *   - The grid and rows hand their columns inherited `--_grid-*` tokens (count, gutter, dividers ...),
 *     and a column's own `N wide` classes win.
 *   - The component only draws the class grammar.
 *
 * - Responsive:  a top-level `<ui-grid>`'s DOM element is the `ui-grid` size container (`GRID_CONTAINER_NAME`),
 *   so `stackable`, `doubling`, `reversed` and per-device widths follow the space the GRID gets, not the viewport;
 *   unless the grid says `stack-with="page"` (or the page-wide `--ui-stack-with` does):  then the screen's.
 *
 * - Nothing focusable in the shadow root:  no `delegatesFocus`.
 ****************/
export abstract class GridPart<V extends E.ComponentVocabulary = E.ComponentVocabulary> extends E.UIComponent<V> {
  @E.protoMerged static elementSetup = {
    styleSheets: { grid: gridCSS },
    delegatesFocus: false
  } satisfies Partial<E.ElementSetup>

  render(): JSX.Element {
    return (
      <div class={this.rootClass} part={this.partForName(this.vocabulary.noun as E.PartName<V>)}>
        <slot />
      </div>
    )
  }
}
