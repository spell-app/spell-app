/**
 * Shared constants, types and helpers of the `ui-items` family:  what its element classes, vocabularies and native fallback share.
 * - Runtime-light:  no element code, so every file of the family may import it.
 */

import type { UIT } from "$/ui/core"

/** What every item gets:  a list item owning its parts, its `image` shorthand a bare `.image`. */
export const ITEM_CONTEXT: UIT.ItemContext = Object.freeze({
  hostRole: "listitem",
  interactive: false,
  current: "page",
  ownsParts: true,
  imageClass: "image"
})
