/**
 * The loose constants and types of the brand flourish family, which `UIBrandFlourish` and `Flourish` share.
 * - Data only:  nothing here runs.
 */

import type { brandFlourishVocabulary } from "./UIBrandFlourish.en"

/** `brandFlourishVocabulary`'s type. */
export type BrandFlourishVocabulary = typeof brandFlourishVocabulary

/** The flourish variants. */
export const VARIANTS = ["swoop", "blobs", "edge-curls", "sparkle-trail", "rising-wave"] as const

/** One flourish variant. */
export type FlourishVariant = (typeof VARIANTS)[number]

/** A point:  `[x, y]`. */
export type Point = [number, number]

/** A flourish's colours (CSS colour text, `var()` allowed) and line weight (px). */
export type FlourishColors = { stroke: string; fill: string; fill2: string; weight: number }

/**
 * Default colours:  the sheet's private aliases (`UIBrandFlourish.css`), which read the public tokens,
 * then the `spell-brand` theme's art roles, then the brand's own values.
 */
export const DEFAULT_COLORS: Omit<FlourishColors, "weight"> = {
  stroke: "var(--_ui-brand-flourish-stroke)",
  fill: "var(--_ui-brand-flourish-fill)",
  fill2: "var(--_ui-brand-flourish-fill-2)"
}

/** Default line weight, px. */
export const DEFAULT_WEIGHT = 1.6

/** Default seed. */
export const DEFAULT_SEED = 7

/** Size before the first measurement (and in a box with no size). */
export const FALLBACK_SIZE = { width: 600, height: 300 } as const
