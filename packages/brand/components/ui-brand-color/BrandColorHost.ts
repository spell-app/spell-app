import { Cell, UIHost } from "$/ui/core"

/****************
 * ### `BrandColorHost`
 * Host base of `<ui-brand-color>`:  `choice`, which a selectable `<ui-brand-color-set>` sets on the chips it holds.
 * - A choice is a RADIO:  the host takes the role, the checked state and the name (internals), and the set moves
 *   focus between hosts (roving `tabindex`);  the chip inside draws no button or image of its own, and ignores
 *   `copy`, so nothing interactive nests in the radio.
 * - On the HOST, not the controller:  the set may reach a chip before it has rendered.
 * - NOTE: the fork checks host prototype members against prop names;  `choice` is no attribute.
 ****************/
export class BrandColorHost extends UIHost {
  /** Is this chip one choice of a selectable set?  Written by the set;  tracked. */
  readonly choice = new Cell(false)
}
