import { isServer, type JSX } from "@solidjs/web"

import { E } from "$/ui/core"
import { UIShape } from "./UIShape"
import { ShapeFallback } from "./ui-shape.fallback"
import { SIDE } from "./ui-shape.types"
import { sideVocabulary } from "./ui-side.vocabulary.en"

import shapeCSS from "./ui-shape.css?inline"

/****************
 * ### `<ui-side>`
 * One side of a `<ui-shape>` (Fomantic's `.side`):  `<div class="side" part="side"><slot>`.
 * - Passive:  the HOST is the face that turns.  Its shape sets its states (`active`, `inactive`, `animating`,
 *   `leaving`) and, while flipping, its inline `transform` / `top` / `left`;  `ui-shape.css` does the rest.
 * - Outside a working shape (no `inactive` state) every side shows, stacked:  content is never lost.
 * - Server render (`$/ui/static`):  in a `text` shape the root is a `<span>` (`UIShape.isServerInline()`).  Which
 *   side shows goes by its states (`data-state`), not the class grammar's `active` class:  that one's rule (states
 *   layer) would beat a cube face's `display: flex`.
 ****************/
export class UISide extends E.UIElement<typeof sideVocabulary> {
  @E.proto static vocabulary = sideVocabulary
  @E.proto static styles = { shape: shapeCSS }
  @E.proto static Fallback = ShapeFallback
  @E.proto static delegatesFocus = false

  protected hostStates() {
    return { side: true }
  }

  render(): JSX.Element {
    if (this.isInline()) return this.inlineSide()
    return (
      <div class={SIDE} part={this.part("side")}>
        <slot />
      </div>
    )
  }

  /** A side of a `text` shape in a server render (see class docs). */
  private isInline(): boolean {
    if (!isServer) return false
    // `parentElement` is the platform's:  `null` at the top
    const shape = (this.host.parentElement as E.UIHost | null)?.controller
    return shape instanceof UIShape && shape.isServerInline()
  }

  /** `render()`'s markup as a `<span>` (`isInline()`). */
  private inlineSide(): JSX.Element {
    return (
      <span class={SIDE} part={this.part("side")}>
        <slot />
      </span>
    )
  }
}
