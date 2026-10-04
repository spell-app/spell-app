/**
 * Shared constants, types and helpers of the `ui-item` family:  what its element classes, vocabularies and native fallback share.
 * - Runtime-light:  no element code, so every file of the family may import it.
 */

/** Root element names. */
export type RootTag = "a" | "button" | "div"

/** `type` values. */
export const DIVIDER = "divider"

/** Prefix of the colour remap class a coloured item adds (`ui-red`). */
export const COLOR_CLASS_PREFIX = "ui-"

/** Root tags. */
export const DIV = "div"

/** Host attribute forwarded to a `<button>` box:  a disclosure item. */
export const ARIA_EXPANDED = "aria-expanded"

/** Role of a divider. */
export const SEPARATOR = "separator"

/** Classes of the `image` shorthand, unless the owner says otherwise:  an avatar, as in Fomantic's list examples. */
export const IMAGE_CLASS = "ui avatar image"

/** Owner tags the fallback recognizes (canonical only), => owner noun. */
export const OWNERS: ReadonlyMap<string, string> = new Map([
  ["ui-list", "list"],
  ["ui-menu", "menu"],
  ["ui-items", "items"]
])

/** Owner nouns whose items are list items. */
export const LIST_OWNERS: ReadonlySet<string> = new Set(["list", "items"])
