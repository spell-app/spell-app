/**
 * Loose constants and types of the `ui-brand-field` family.
 * - Data only:  nothing here runs.
 */

import type { brandFieldVocabulary } from "./ui-brand-field.vocabulary.en"

/** `brandFieldVocabulary`'s type. */
export type BrandFieldVocabulary = typeof brandFieldVocabulary

/** Class word the element adds after the noun:  `field brand`. */
export const BRAND = "brand"

/** The `error` state, shown while there's an error message. */
export const ERROR = "error"

/** Icon of the info tip. */
export const INFO_ICON = "circle info"

/** Shadow-root id of the info tip, which the icon is described by. */
export const TIP_ID = "tip"

/** Controls the field names (`aria-label`) when they have no name of their own. */
export const NAMED_ATTRIBUTES = ["aria-label", "aria-labelledby"] as const

/** Shadow classes, one per part (the vocabulary's part names). */
export const CLASSES = {
  row: "row",
  label: "label",
  actions: "actions",
  value: "value",
  info: "info",
  tip: "tip",
  control: "control",
  help: "help",
  error: "error message"
} as const
