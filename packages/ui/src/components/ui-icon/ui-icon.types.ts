/**
 * What the `ui-icon` family's elements share (`<ui-icon>`, `<ui-icons>`).
 * - Pure data and one small static class, at the bottom of the folder's imports:  imports only `UIT`, so node can
 *   load it.
 */

import * as UIT from "$/ui/components/components.types"

////////////////
// ## Accessible name
////////////////

/****************
 * ### `IconLabels`
 * The accessible name an icon gives its HOST, through internals:  `label` => `role=img` + `aria-label`;  none =>
 * `aria-hidden`, a decorative glyph.
 * - One rule for `<ui-icon>` and `<ui-icons>` (a stacked glyph is ONE image).
 * - STATIC and instance-free:  writes only what it's given.
 ****************/
export class IconLabels {
  /** Name the host whose `internals` these are by `label`, or hide it.  SIDE EFFECT:  writes `internals`. */
  static applyTo(internals: ElementInternals, label: string | undefined) {
    internals.role = label ? UIT.IMG : null
    internals.ariaLabel = label ?? null
    internals.ariaHidden = label ? null : UIT.TRUE
  }
}
