/**
 * Loose constants, types and helpers of `<ui-select>`:  its element classes and native fallback import them from here.
 */

import * as UIT from "$/ui/components/components.types"
import type { MenuOption, MenuSeparator, PartName } from "$/ui/core"
import type { selectVocabulary } from "./ui-select.vocabulary.en"

////////////////
// ## UISelect
////////////////

/** SelectVocabulary type, for brevity. */
export type SelectVocabulary = typeof selectVocabulary

/** A header item and the options after it, as one `<optgroup>`. */
export type OptionGroup = {
  header: MenuSeparator
  options: readonly MenuOption[]
}

/** What the `<select>` holds, in order:  options, groups and dividers. */
export type SelectBlock = MenuOption | OptionGroup | MenuSeparator

////////////////
// ## ui-select.fallback
////////////////

/** One option, header or divider, from either source. */
export type Choice = {
  type: "item" | "header" | "divider"
  text: string
  value: string
  disabled: boolean
  selected: boolean
}

/** The parts of a `<ui-select>` the fallback touches;  all optional, the element may not have upgraded. */
export type SelectHost = HTMLElement & {
  value?: UIT.SelectValue | null
  options?: readonly MenuOption[]
}

/** Part names the fallback writes itself (`decorate()` checks only the root's). */
export const PARTS = {
  placeholder: "placeholder",
  group: "group",
  option: "option"
} as const satisfies Record<string, PartName<typeof selectVocabulary>>

/** Flags of the `flag` option attribute, for the element and its native fallback. */
export class SelectFlags {
  /** Flag code => emoji through `UIT.Flags`, as `<ui-flag>` draws it (`fr`, `gb-eng`);  other text unchanged. */
  static emoji(code: string): string {
    return UIT.Flags.emojiFor(code) || code
  }
}

////////////////
// ## UISelect (markup)
////////////////

/** Class words of the markup contract (`ui-select.css`) -- grammar, not attributes, so not in the vocabulary. */
export const PLACEHOLDER = "placeholder"
export const DIVIDER = "divider"
export const IMAGE = "ui avatar image"
export const FLAG = "flag"
