/**
 * Constants and types of the `ui-input` family:  what its element classes (`TextControl`, `UIInput`,
 * `UITextarea`) and its native fallback share.
 * - Pure data, at the bottom of the folder's imports:  only the vocabulary's TYPE, so node can load it
 *   (`yarn site:data`).
 */

import type { inputVocabulary } from "./ui-input.vocabulary.en"

////////////////
// ## Types
////////////////

/** Vocabulary type, for brevity. */
export type Vocabulary = typeof inputVocabulary

/**
 * Vocabulary getters every text control has (`input` and `textarea`), typed once for `TextControl`.
 * - Not `value`:  `TextControl`'s `@controlled` member.
 */
export type CommonAttributes = {
  /** form field name */
  name: string | undefined
  /** hint shown while empty */
  placeholder: string | undefined
  /** `disabled` attribute (a disabled fieldset is `formIsDisabled`) */
  disabled: boolean
  /** shows its value, can't be edited */
  readonly: boolean
  /** takes the full width */
  fluid: boolean
  /** busy:  `<ui-input>` only */
  loading?: boolean
  /** Fomantic validation rules, as set:  one rule, a list, or nothing (`TextControl.validationRules`) */
  rules: unknown
}

/** Where a `<ui-input>`'s joined label sits. */
export type LabelPlace = "start" | "end" | "corner"

/** The part of a `<ui-input>` the fallback touches;  optional, the element may not have upgraded. */
export type InputHost = HTMLElement & {
  /** live value, once set */
  value?: string
}

////////////////
// ## Class words
////////////////

/**
 * `type` of a file input, and its class word (`ui file input`):  script can't set its value, and it submits files.
 */
export const FILE = "file"

/** Class words of a joined label (`ui-input.css`). */
export const LABEL_CLASSES = "ui label"
