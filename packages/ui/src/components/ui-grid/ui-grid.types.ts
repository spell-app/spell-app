/**
 * What the `ui-grid` family's vocabularies share (`<ui-grid>`, `<ui-row>`, `<ui-column>`).
 * - Pure data, at the bottom of the folder's imports:  imports nothing, so node can load it (`yarn site:data`).
 */

////////////////
// ## Device visibility
////////////////

/** `only`'s targets:  the devices a grid, row or column shows on, by the viewport (Fomantic's `mobile only` ...). */
export const OnlyDevices = ["mobile", "tablet", "computer", "large screen", "widescreen"] as const

/** One of `OnlyDevices`. */
export type OnlyDevice = (typeof OnlyDevices)[number]
