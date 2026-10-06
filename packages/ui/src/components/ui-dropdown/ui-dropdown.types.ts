/**
 * Types of the `ui-dropdown` family:  what its element class, `SlottedItems` and its native fallback share.
 * - Pure data, at the bottom of the folder's imports:  types only (`$/ui/core`, the vocabulary), so node can load it
 *   (`yarn site:data`).
 * - Its class words and ids are module constants below `UIDropdown`, the one class that uses them (epic
 *   `wwod-spell-ui`, Q18).
 */

import type { E, UIT } from "$/ui/core"
import type { dropdownVocabulary } from "./ui-dropdown.vocabulary.en"

////////////////
// ## Element
////////////////

/** Vocabulary type, for brevity. */
export type Vocabulary = typeof dropdownVocabulary

////////////////
// ## Fallback
////////////////

/** One option, header or divider, from either source. */
export type Choice = {
  /** an option, a group header or a divider */
  type: UIT.ItemType
  /** shown text */
  text: string
  /** submitted value */
  value: string
  /** can't be chosen */
  disabled: boolean
  /** chosen by its own `selected` */
  selected: boolean
}

/** The parts of a `<ui-dropdown>` the fallback touches;  all optional, the element may not have upgraded. */
export type DropdownHost = HTMLElement & {
  /** chosen value(s), once set as a property */
  value?: UIT.DropdownValue
  /** the `options` property, once set */
  options?: readonly E.MenuOption[]
}
