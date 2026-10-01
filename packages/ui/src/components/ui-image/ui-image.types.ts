/**
 * Shared constants, types and helpers of the `ui-image` family:  what its element classes, vocabularies and native fallback share.
 * - Runtime-light:  no element code, so every file of the family may import it.
 */

/** Host attributes passed to the `<img>` as they are. */
export const NATIVE = ["src", "alt", "width", "height", "loading"] as const
