/**
 * Shared constants, types and helpers of the `ui-list` family:  what its element classes, vocabularies and native fallback share.
 * - Runtime-light:  no element code, so every file of the family may import it.
 */

/** Root tags. */
export const UL = "ul"
export const OL = "ol"

/** Item roots that can be activated. */
export const INTERACTIVE: ReadonlySet<string> = new Set(["a", "button"])

/** Parent tags (canonical only) that make a list a sub-list. */
export const PARENTS: ReadonlySet<string> = new Set(["ui-item", "ui-list"])

/** Canonical tag of a list, for the outer list's `ordered`. */
export const LIST_TAG = "ui-list"

/** Attribute that numbers the items. */
export const ORDERED = "ordered"
