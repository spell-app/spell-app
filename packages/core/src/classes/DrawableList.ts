import h from "@solidjs/h"

import type { Drawing } from "$/core/drawing"
// Import directly to avoid circular import
import { List } from "./List"

/**
 * `DrawableList`:  a `List` drawn as its own custom element, its items inside it --
 * what `a pile is a drawable list of cards` extends.
 * - Its element holds its items' elements as its CHILDREN, e.g. `<game-pile>` holding `<game-card>`s:
 *   the same shape in a program and in hand-written HTML.
 * - Its `draw()` draws its OUTSIDE, in the element's shadow root, with a `<slot>` where its items show.
 *   By default, just that slot.
 *   - Spell writes that slot `<children/>`, and compiles it to the web's `<slot>`.
 *   - A second, named place, `<children name="header"/>`, is filled by children written `in="header"`
 *     (`slot="header"` on the page).
 *   - The list's own items always go in the unnamed one.
 * - The element comes from `spellCore.defineElement()`, as a `Drawable`'s does.
 * - Everything else as a `List`.
 */
export class DrawableList<T = unknown> extends List<T> {
  /**
   * Its outside, with a `<slot>` where its items show -- just the slot, by default.
   * - Override it, e.g. `to draw a pile:  return <div className="pile"><children/></div>`:
   *   spell's `<children/>` is the web's `<slot>`, compiled to `h("slot")`.
   * - Its items are NOT drawn here:  they're its element's children -- see `spellCore.drawThing()`.
   */
  draw(): Drawing {
    return (h("slot") as unknown as () => Drawing)()
  }
}
