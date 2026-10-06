import { isServer, type JSX } from "@solidjs/web"

import { proto, UIElement, type UIHost } from "$/ui/core"

import { sideVocabulary } from "./ui-side.vocabulary.en"
import { ShapeFallback } from "./ui-shape.fallback"
import { UIShape } from "./UIShape"

import shapeCSS from "./ui-shape.css?inline"
import { SIDE } from "./ui-shape.types"

/****************
 * ### `<ui-side>`
 * One side of a `<ui-shape>` (Fomantic's `.side`):  `<div class="side" part="side"><slot>`.
 * - Passive:  the HOST is the face that turns.  Its shape sets its states (`active`, `inactive`, `animating`,
 *   `leaving`) and, while flipping, its inline `transform` / `top` / `left`;  `ui-shape.css` does the rest.
 * - Outside a working shape (no `inactive` state) every side shows, stacked:  content is never lost.
 * - Server render (`$/ui/static`):  in a `text` shape the root is a `<span>` (`UIShape.serverInline()`).  Which side
 *   shows goes by its states (`data-state`), not the class grammar's `active` class:  that one's rule (states layer)
 *   would beat a cube face's `display: flex`.
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
    if (this.inline()) return this.renderInline()
    return (
      <div class={SIDE} part={this.part("side")}>
        <slot />
      </div>
    )
  }

  /** A side of a `text` shape in a server render (see class docs). */
  private inline(): boolean {
    if (!isServer) return false
    const shape = (this.host.parentElement as UIHost | null)?.controller
    return shape instanceof UIShape && shape.serverInline()
  }

  /** `render()`'s markup as a `<span>` (`inline()`). */
  private renderInline(): JSX.Element {
    return (
      <span class={SIDE} part={this.part("side")}>
        <slot />
      </span>
    )
  }
}
