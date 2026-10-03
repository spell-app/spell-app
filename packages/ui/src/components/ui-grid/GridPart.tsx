import type { JSX } from "@solidjs/web"

import { proto, UIElement, type ComponentVocabulary, type PartName } from "$/ui/core"

import { GridFallback } from "./ui-grid.fallback"

import gridCSS from "./ui-grid.css?inline"

/****************
 * ### `GridPart`
 * Base of `<ui-grid>`, `<ui-row>` and `<ui-column>`:  `<div class="ui … <noun>" part="<noun>"><slot></slot></div>`,
 * all three from ONE sheet.
 * - Layout is `ui-grid.css`'s alone, across shadow roots:  rows and columns slotted into a grid or row are
 *   `display: contents` hosts, so each ROOT is the flex item;  the grid and rows hand their columns inherited
 *   `--_grid-*` tokens (count, gutter, dividers ...), and a column's own `N wide` classes win.  The element
 *   only renders the class grammar.
 * - Responsive:  a top-level `<ui-grid>` host is the `ui-grid` size container (`GRID_CONTAINER_NAME`), so
 *   `stackable`, `doubling`, `reversed` and per-device widths follow the space the GRID gets, not the viewport --
 *   unless the grid says `stack-with="page"` (or the page-wide `--ui-stack-with` does):  then the screen's.
 * - Nothing focusable in the shadow root:  no `delegatesFocus`.
 ****************/
export abstract class GridPart<V extends ComponentVocabulary = ComponentVocabulary> extends UIElement<V> {
  @proto static styles = { grid: gridCSS }
  @proto static Fallback = GridFallback
  @proto static delegatesFocus = false

  render(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part(this.vocabulary.noun as PartName<V>)}>
        <slot />
      </div>
    )
  }
}
