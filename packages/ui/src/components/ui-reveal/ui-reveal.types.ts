/**
 * Loose constants, types and helpers of `<ui-reveal>`:  its element classes and native fallback import them from here.
 */

////////////////
// ## UIReveal
////////////////

/** Natively focusable content:  it reveals the reveal itself (`:focus-within`). */
export const FOCUSABLE =
  "a[href], area[href], button:not([disabled]), input:not([disabled], [type=hidden]), select:not([disabled]), " +
  "textarea:not([disabled]), summary, [contenteditable]:not([contenteditable=false]), [tabindex]:not([tabindex='-1'])"

/** Attributes that change what's focusable. */
export const WATCHED = ["href", "disabled", "tabindex", "contenteditable", "type"]

/** Classes of the visible content box. */
export const VISIBLE = "visible content"

/** Classes of the hidden content box. */
export const HIDDEN = "hidden content"
