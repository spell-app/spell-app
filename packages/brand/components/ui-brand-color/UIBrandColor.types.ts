/**
 * Loose constants and types of the `ui-brand-color` family, and `<ui-brand-color>`'s JSX type for the elements that
 * draw chips in their shadow roots (`<ui-brand-color-range>`).
 * - Data only:  nothing here runs.
 */

import type { JSX } from "@solidjs/web"

import type { brandColorVocabulary } from "./UIBrandColor.en"

/** `brandColorVocabulary`'s type. */
export type BrandColorVocabulary = typeof brandColorVocabulary

/** What a click copies (`copy`;  bare `copy` ~== `hex`). */
export type CopyFormat = "hex" | "oklch" | "token" | "css"

/** What the chip's label shows (`label`). */
export type ChipLabel = BrandColorVocabulary["attributes"][2]["values"][number]

/** Class word the element adds after the noun:  `color brand`. */
export const BRAND = "brand"

/** Class word of a chip whose `label` shows text:  the AA mark moves to the top corner. */
export const LABELLED = "labelled"

/** Shadow-root id of the details tip, which the chip is described by. */
export const TIP_ID = "tip"

/** Icon shown for a moment after a copy. */
export const COPIED_ICON = "check"

/** How long the chip shows it copied, ms (as the Color Palette page's toast). */
export const COPIED_MS = 1400

/** WCAG AA for normal text. */
export const AA_RATIO = 4.5

/** WCAG AA for large text, icons and borders. */
export const LARGE_RATIO = 3

/** White, as `Palette.ink()` returns it. */
export const WHITE = "#FFFFFF"

/** Shadow classes, one per part. */
export const CLASSES = {
  label: "label",
  mark: "mark",
  copied: "copied",
  status: "status",
  tip: "tip",
  title: "title",
  swatch: "swatch",
  rows: "rows",
  note: "note"
} as const

/** `<ui-brand-color>` in JSX:  HTML attributes, plus any attribute (strings) or `prop:`. */
export type BrandColorJSXAttributes = JSX.HTMLAttributes<HTMLElement> & { [attribute: string]: unknown }

declare module "@solidjs/web/types/jsx.js" {
  namespace JSX {
    interface IntrinsicElements {
      "ui-brand-color": BrandColorJSXAttributes
    }
  }
}
