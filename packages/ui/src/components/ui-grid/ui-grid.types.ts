/**
 * Shared constants, types and helpers of the `ui-grid` family:  what its element classes, vocabularies and native fallback share.
 * - Runtime-light:  no element code, so every file of the family may import it.
 */

/** `only` targets:  device visibility, by the viewport. */
export const ONLY_DEVICES = ["mobile", "tablet", "computer", "large screen", "widescreen"] as const
