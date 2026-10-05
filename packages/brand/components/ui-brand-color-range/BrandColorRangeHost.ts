import { UIHost } from "$/ui/core"
import type { Scale, Step } from "$/brand"

import { ColorLadder } from "./ColorLadder"
import type { CssFormat, LadderInput } from "./ui-brand-color-range.types"

/****************
 * ### `BrandColorRangeHost`
 * Host base of `<ui-brand-color-range>`:  the ladder as read-only properties and `css()`.
 * - Computed from the host's CURRENT properties (`value`, `anchor`, `vibrancy`, `hueShift`, `name`), not the
 *   controller's memo, so a read straight after a write sees the new ladder (Solid applies writes a microtask late).
 * - NOTE: the fork checks host prototype members against prop names;  none of these is one.
 ****************/
export class BrandColorRangeHost extends UIHost {
  /** Step => `#RRGGBB` (a copy), or `undefined` without a base colour. */
  get scale(): Scale | undefined {
    const ladder = this.ladder()
    return ladder && { ...ladder.scale }
  }

  /** The step the base colour sits at (`anchor="auto"`:  the one picked), or `undefined`. */
  get anchorStep(): Step | undefined {
    return this.ladder()?.anchor
  }

  /** The ladder as CSS custom properties on `:root` (the Chooser's CSS panel), or `""`. */
  css(format: CssFormat = "hex"): string {
    return this.ladder()?.css(format) ?? ""
  }

  /** The ladder the current properties make. */
  private ladder(): ColorLadder | undefined {
    const { value, anchor, vibrancy, hueShift, name } = this as unknown as LadderInput
    return ColorLadder.from({ value, anchor, vibrancy, hueShift, name })
  }
}
