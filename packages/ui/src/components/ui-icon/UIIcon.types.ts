/**
 * What the icon family's components share (`UIIcon`, `UIIcons`).
 * - Pure data and one small static class, at the bottom of the folder's imports:
 *   it imports only `UIT`, so node can load it.
 */

////////////////
// ## Accessible name
////////////////

/****************
 * ### `IconLabels`
 * The accessible name an icon gives its DOM element, through `internals`:
 * `label` => `role=img` + `aria-label`;  none => `aria-hidden`, a decorative glyph.
 * - One rule for `<ui-icon>` and `<ui-icons>` (a stacked glyph is ONE image).
 * - STATIC and instance-free:  writes only what it's given.
 ****************/
export class IconLabels {
  /** Name the element whose `internals` these are by `label`, or hide it.  SIDE EFFECT:  writes `internals`. */
  static applyTo(internals: ElementInternals, label: string | undefined) {
    internals.role = label ? "img" : null
    internals.ariaLabel = label ?? null
    internals.ariaHidden = label ? null : "true"
  }
}
