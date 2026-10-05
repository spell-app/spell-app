/**
 * Shared constants, types and helpers of the `ui-menu` family:  what its element classes, vocabularies and native fallback share.
 * - Runtime-light:  no element code, so every file of the family may import it.
 */

/** What the menu reads from an item's controller (`UIItem`, not imported:  another family). */
export type ItemController = { attrs: { type?: string }; focusTarget?: HTMLElement }

/** Roles. */
export const MENUBAR = "menubar"
export const MENUITEM = "menuitem"

/** Orientations (`aria-orientation`, roving). */
export const HORIZONTAL = "horizontal"
export const VERTICAL = "vertical"

/** Tags of an interactive item root, and its part. */
export const ITEM_PART = "item"

/** Item `type` in the roving set. */
export const ITEM_TYPE = "item"

/** Item host states. */
export const SELECTED_STATE = ":state(selected)"

/** The `appearance` of a single-choice menu:  it moves `selected` itself. */
export const SEGMENTED = "segmented"

/** What the menu writes on an item host it chooses (`UIItem`'s reflected `selected`). */
export type ChoosableItem = Element & { selected?: boolean }

/** Canonical tag of the generic item (a sub-menu's usual parent in a vertical menu). */
export const ITEM_TAG = "ui-item"
