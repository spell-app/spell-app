import { E } from "spell-ui/core"

/****************
 * ### `Glides`
 * A drawable thing that MOVES glides from where it was on screen to where it lands,
 * e.g. a card played from a tableau onto a foundation.
 *
 * - How (FLIP):
 *   1. just before the move, core asks the page (`core.beforeMove`, set by `installSpellElements()`):
 *      we note where each moving thing's element is (`noteWhereThingsAre()`)
 *   2. the move draws the thing again, in its new list's element:  a NEW element, which tells us it's drawn (`drawn()`)
 *   3. before the next paint, the new element starts where the old one was, and slides home (`glide()`)
 * - The slide is the element's `translate`, not its `transform`:  a pile's layout may rotate its cards (`fanned`),
 *   and `translate` adds to that, where a `transform` would replace it.
 * - None with reduced motion:  the thing just lands.
 * - STATIC and page-wide on purpose:  every runtime copy on a page shares the page's elements.
 * - Knows nothing of core:  core hands it things, and its elements say what they draw.
 ****************/
export class Glides {
  /**
   * Thing `thing` is drawn in `element`, now its latest:  if it was moving, it glides there before the next paint.
   * - SIDE EFFECT:  `element` is the one `noteWhereThingsAre()` measures next time `thing` moves.
   */
  static drawn(thing: object, element: HTMLElement): void {
    Glides.elements.set(thing, element)
    if (Glides.startedAt.has(thing)) E.beforeNextPaint(() => Glides.glide(thing))
  }

  /**
   * Note where each of `things` is on screen, just before it moves -- what `core.beforeMove` calls.
   * - A thing with no element on the page is skipped:  it has nowhere to glide from.
   * - NEVER throws.
   */
  static noteWhereThingsAre(things: unknown[]): void {
    if (Glides.isStill) return
    for (const thing of things) {
      if (!thing || typeof thing !== "object") continue
      const element = Glides.elements.get(thing)
      if (!element?.isConnected) continue
      Glides.startedAt.set(thing, element.getBoundingClientRect())
      // drawn again in the same element (moved within its list):  `drawn()` never hears of it
      E.beforeNextPaint(() => Glides.glide(thing))
    }
  }

  /**
   * Slide `thing`'s element from where it was noted to where it is now.
   * - Once:  the note is used up, so a second call does nothing.
   * - Raised above everything while it slides, so it passes over the piles between.
   */
  private static glide(thing: object): void {
    const from = Glides.startedAt.get(thing)
    const element = Glides.elements.get(thing)
    if (!from || !element?.isConnected) return
    Glides.startedAt.delete(thing)
    const to = element.getBoundingClientRect()
    const dx = from.left - to.left
    const dy = from.top - to.top
    if (!dx && !dy) return
    element.animate(
      [
        { translate: `${dx}px ${dy}px`, zIndex: GLIDING_Z_INDEX },
        { translate: "0 0", zIndex: GLIDING_Z_INDEX }
      ],
      { duration: GLIDE_MS, easing: GLIDE_EASING }
    )
  }

  /** Does the person want no motion?  Then nothing glides. */
  private static get isStill(): boolean {
    return typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches
  }

  /** Each thing's latest element. */
  private static readonly elements = new WeakMap<object, HTMLElement>()

  /** Where each moving thing's element was, noted just before it moved;  gone once it has glided. */
  private static readonly startedAt = new WeakMap<object, DOMRect>()
}

/** How long a slide takes, in milliseconds. */
const GLIDE_MS = 250

/** How it slides:  quickly at first, settling into place. */
const GLIDE_EASING = "cubic-bezier(0.2, 0.7, 0.3, 1)"

/** Above the board while it slides. */
const GLIDING_Z_INDEX = 1000
