/**
 * Loose constants and types of the `ui-dropdown` family:  the words, selectors and shapes its element
 * classes and its native fallback share, lifted out of their files.
 * - Data only:  nothing here runs;  the classes import what they need from `./ui-dropdown.types`.
 */

import type { dropdownVocabulary } from "./ui-dropdown.vocabulary.en"
import type { MenuOption, UIT } from "$/ui/core"

/** Prefix of generated slot names for rich items. */
export const SLOT_PREFIX = "ui-item-"

/** Vocabulary type, for brevity. */
export type Vocabulary = typeof dropdownVocabulary

/** Code point of the regional indicator for `A`. */
export const REGIONAL_A = 0x1f1e6

/** `UI.ids` prefix. */
export const ID_PREFIX = "ui-dropdown"

/** Placeholder in the `addItem` text. */
export const VALUE_PLACEHOLDER = "{value}"

/** Hidden input carrying the value in a static server render:  `type`. */
export const HIDDEN = "hidden"

/**
 * Class words of the markup contract (`ui-dropdown.css`) -- grammar, not attributes, so not in the vocabulary.
 * - NOTE: `active` === chosen, `selected` === highlighted:  Fomantic's meanings.
 */
export const TEXT = "text"
export const DEFAULT = "default"
export const FILTERED = "filtered"
export const MENU = "menu"
export const LEFT = "left"
export const ITEM = "item"

export const SELECTED = "selected"

export const ADDITION = "addition"

/** One option, header or divider, from either source. */
export type Choice = {
  type: "item" | "header" | "divider"
  text: string
  value: string
  disabled: boolean
  selected: boolean
}

/** The parts of a `<ui-dropdown>` the fallback touches;  all optional, the element may not have upgraded. */
export type DropdownHost = HTMLElement & {
  value?: UIT.DropdownValue | null
  options?: readonly MenuOption[]
}
