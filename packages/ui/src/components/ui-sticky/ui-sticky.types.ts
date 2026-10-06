/**
 * Constants of the `ui-sticky` family that its element (`UISticky`) and its native fallback (`StickyFallback`) share.
 * - Pure data, at the bottom of the folder's imports:  `import type` only, so node can load it (`yarn site:data`).
 * - The scroll-container / reservation thresholds are `StickyWatch`'s (`$/ui/elements`), shared with
 *   `<ui-section sticky>`.
 */

import type { stickyVocabulary } from "./ui-sticky.vocabulary.en"

/** `<ui-sticky>`'s vocabulary type, for brevity. */
export type StickyVocabulary = typeof stickyVocabulary

////////////////
// ## Inline custom properties
////////////////

/** Private custom property the box reads for `top` (`offset`), inline:  wins over the public token's alias. */
export const OFFSET_PROPERTY = "--_ui-sticky-offset"

/** Private custom property the box reads for `bottom` (`bottom-offset`), inline. */
export const BOTTOM_OFFSET_PROPERTY = "--_ui-sticky-bottom-offset"
