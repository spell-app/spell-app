/**
 * Constants and types of the `ui-brand-composer` family:  what its component and its native fallback share.
 * - Data only:  nothing here runs.
 */

import type { brandComposerVocabulary } from "./UIBrandComposer.vocabulary.en"

/** `brandComposerVocabulary`'s type. */
export type BrandComposerVocabulary = typeof brandComposerVocabulary

/** The class word the component adds after the noun:  `composer brand`. */
export const BRAND = "brand"

/** Class word for `size="large"`. */
export const LARGE = "large"

/** Lines tall without `rows` (the app's Build box). */
export const DEFAULT_ROWS = 3

/** Icon of the Cast button (the original's `fa-solid fa-arrow-right`). */
export const CAST_ICON = "arrow right"

/** Icon the Cast button spins while `casting`. */
export const CASTING_ICON = "circle notch"

/** The key that casts, with Cmd (Apple) or Ctrl. */
export const ENTER = "Enter"

/** `aria-keyshortcuts` of the cast shortcut:  Apple devices, elsewhere. */
export const SHORTCUTS = { apple: "Meta+Enter", other: "Control+Enter" } as const

/** Ids in the shadow root, for `aria-describedby`. */
export const IDS = { hint: "hint" } as const

/** Shadow classes, one per part (the vocabulary's part names), plus the live region. */
export const CLASSES = {
  eyebrow: "eyebrow",
  textarea: "textarea",
  bar: "bar",
  tools: "tools",
  hint: "hint",
  cast: "cast",
  icon: "icon",
  spin: "spin",
  status: "status"
} as const

/** The private token the component writes on the text box:  its `rows`, for its least height. */
export const ROWS_VAR = "--_brand-composer-rows"
