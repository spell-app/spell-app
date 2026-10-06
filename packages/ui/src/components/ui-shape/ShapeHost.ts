import { E, type UIT } from "$/ui/core"
import type { UIShape } from "./UIShape"

/****************
 * ### `ShapeHost`
 * Host of `<ui-shape>`:  Fomantic's `.shape('flip up')` / `'set next side'` as METHODS.
 * - Each resolves once its flip has run:  `true` when it showed another side, `false` when there was none to show
 *   (or the element isn't rendered yet).  Flips queue, as Fomantic's.
 * - Each writes `activeIndex` (so it reflects and frameworks see it);  writing `activeIndex` yourself flips too, the
 *   `direction` attribute's way.
 ****************/
export class ShapeHost extends E.UIHost {
  /** Turn `direction` (default the `direction` attribute) to side `index` (default the next one, wrapping). */
  flip(direction?: UIT.ShapeFlip, index?: number): Promise<boolean> {
    return this.shape?.flipTo(direction, index) ?? Promise.resolve(false)
  }

  /** Turn to the next side (wrapping), the `direction` attribute's way. */
  next(): Promise<boolean> {
    return this.flip()
  }

  /** Turn to the previous side (wrapping), the `direction` attribute's way. */
  previous(): Promise<boolean> {
    return this.shape?.flipBy(-1) ?? Promise.resolve(false)
  }

  /** The controller, once rendered. */
  private get shape(): UIShape | undefined {
    return this.controller as UIShape | undefined
  }
}
