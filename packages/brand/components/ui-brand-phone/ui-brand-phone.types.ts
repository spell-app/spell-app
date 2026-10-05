/**
 * Loose constants and types of the `ui-brand-phone` family.
 * - Data only:  nothing here runs.
 */

import type { brandPhoneVocabulary } from "./ui-brand-phone.vocabulary.en"

/** `brandPhoneVocabulary`'s type. */
export type BrandPhoneVocabulary = typeof brandPhoneVocabulary

/** The status bar's clock when `time` is absent:  Apple's keynote time. */
export const DEFAULT_TIME = "9:41"

/** The status bar's icons, left to right (Font Awesome 7's names, in Spell UI's default pack). */
export const STATUS_ICONS = {
  signal: "signal",
  wifi: "wifi",
  battery: "battery full"
} as const

/** Shadow classes, one per part (the vocabulary's part names). */
export const CLASSES = {
  status: "status",
  time: "time",
  icons: "icons"
} as const
