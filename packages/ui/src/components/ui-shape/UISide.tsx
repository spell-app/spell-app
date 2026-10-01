import type { JSX } from "@solidjs/web"

import { proto, UIElement } from "$/ui/core"

import { sideVocabulary } from "./ui-side.vocabulary.en"
import { ShapeFallback } from "./ui-shape.fallback"

import shapeCSS from "./ui-shape.css?inline"
import { SIDE } from "./ui-shape.types"

/****************
 * ### `<ui-side>`
 * One side of a `<ui-shape>` (Fomantic's `.side`):  `<div class="side" part="side"><slot>`.
 * - Passive:  the HOST is the face that turns.  Its shape sets its states (`active`, `inactive`, `animating`,
 *   `leaving`) and, while flipping, its inline `transform` / `top` / `left`;  `ui-shape.css` does the rest.
 * - Outside a working shape (no `inactive` state) every side shows, stacked:  content is never lost.
 ****************/
export class UISide extends UIElement<typeof sideVocabulary> {
  @proto static vocabulary = sideVocabulary
  @proto static styles = { shape: shapeCSS }
  @proto static Fallback = ShapeFallback
  @proto static delegatesFocus = false

  protected hostStates() {
    return { side: true }
  }

  render(): JSX.Element {
    return (
      <div class={SIDE} part={this.part("side")}>
        <slot />
      </div>
    )
  }
}
