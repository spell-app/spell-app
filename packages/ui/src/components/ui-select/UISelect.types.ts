/**
 * Constants and types of the `ui-select` family:  what its component (`UISelect`) and its native fallback
 * (`SelectFallback`) share.
 * - Pure data:  types only (`$/ui/core`, the vocabulary), so node can load it (`yarn site:data`).
 * - Its other class words and part names are module constants below the one class that uses them.
 */

import type { E } from "$/ui/core"
import type { selectVocabulary } from "./UISelect.vocabulary.en"

////////////////
// ## Types
////////////////

/** The vocabulary's type, for short. */
export type Vocabulary = typeof selectVocabulary

/** A header item and the options after it, as one `<optgroup>`. */
export type OptionGroup = {
  /** the `header` item:  the group's label */
  header: E.MenuSeparator
  /** the options up to the next header or divider */
  options: readonly E.MenuOption[]
}

/** What the `<select>` holds, in order:  options, groups and dividers. */
export type SelectBlock = E.MenuOption | OptionGroup | E.MenuSeparator

////////////////
// ## Class words
////////////////

/** The class word of the empty first option (the `placeholder` text). */
export const PLACEHOLDER = "placeholder"

/** The class word of a divider (`<hr>`);  also `<ui-item type="divider">`. */
export const DIVIDER = "divider"
