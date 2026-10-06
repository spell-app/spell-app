/**
 * Constants of the `ui-card` family that its element (`UICard`) and its native fallback (`CardFallback`) share.
 * - Pure data, at the bottom of the folder's imports:  imports only `UIT`, so node can load it (`yarn site:data`).
 */

import * as UIT from "$/ui/components/components.types"

////////////////
// ## Shorthands
////////////////

/** The `meta` shorthand:  its attribute, part noun and class word. */
export const META = "meta"

/** The `extra` shorthand:  its attribute, part noun and class word. */
export const EXTRA = "extra"

/** Shorthands drawn in the card's content block, in order. */
export const ContentShorthands = [UIT.HEADER, META, UIT.DESCRIPTION] as const

////////////////
// ## Roots
////////////////

/** Root tag of a card without `href`:  a self-contained composition (a link card's is `UIT.ANCHOR_TAG`). */
export const ARTICLE = "article"
