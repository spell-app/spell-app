/**
 * Types of the `ui-select` family:  what its element class (`UISelect`) and its native fallback (`SelectFallback`)
 * share.
 * - Pure data, at the bottom of the folder's imports:  types only (`$/ui/core`, the vocabulary), so node can load it
 *   (`yarn site:data`).
 * - Its other class words and part names are module constants below the one class that uses them (epic
 *   `wwod-spell-ui`, Q18).
 */

import type { E, UIT } from "$/ui/core"
import type { selectVocabulary } from "./ui-select.vocabulary.en"

////////////////
// ## Element
////////////////

/** Vocabulary type, for brevity. */
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
// ## Markup:  shared by the element and its fallback
////////////////

/** Class word of the empty first option (the `placeholder` text). */
export const PLACEHOLDER = "placeholder"

/** Class word of a divider (`<hr>`);  also `<ui-item type="divider">`. */
export const DIVIDER = "divider"

////////////////
// ## Fallback
////////////////

/** One option, header or divider, from either source. */
export type Choice = {
  /** an option, a group header or a divider */
  type: UIT.ItemType
  /** shown text:  the flag emoji, the text and the description, as a plain select shows them */
  text: string
  /** submitted value */
  value: string
  /** can't be chosen */
  disabled: boolean
  /** chosen by its own `selected` */
  selected: boolean
}

/** The parts of a `<ui-select>` the fallback touches;  all optional, the element may not have upgraded. */
export type SelectHost = HTMLElement & {
  /** chosen value(s), once set as a property */
  value?: UIT.SelectValue
  /** the `options` property, once set */
  options?: readonly E.MenuOption[]
}
