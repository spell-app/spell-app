/**
 * Constants and types of the `ui-brand-color-set` family.
 * - Data only:  nothing here runs.
 */

import type { brandColorSetVocabulary } from "./UIBrandColorSet.en"

/** `brandColorSetVocabulary`'s type. */
export type BrandColorSetVocabulary = typeof brandColorSetVocabulary

/** The tag of the chips it holds. */
export const CHIP_TAG = "ui-brand-color"

/** Chip attributes a set reads:  what keys it (`name`, `value`), and what it starts chosen (`selected`). */
export const CHIP_ATTRIBUTES = ["name", "value", "selected"] as const

/** Keys that move between chips, by step;  horizontal ones run backwards right-to-left. */
export const ARROWS: Readonly<Record<string, -1 | 1>> = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 }

/** Keys that choose the focused chip. */
export const CHOOSE_KEYS = new Set(["Enter", " "])

/** One chip, as the set keys it. */
export type SetChip = {
  /** the chip's DOM element */
  readonly chip: HTMLElement
  /** `name`, or `""` */
  readonly name: string
  /** `value` as `#RRGGBB`, or as written when it isn't a colour */
  readonly color: string
  /** has a `selected` attribute */
  readonly selected: boolean
}
