/**
 * Constants and types of the `ui-input` family:  what its components (`TextControl`, `UIInput`, `UITextarea`)
 * and its native fallback share.
 * - Pure data:  it imports only the vocabulary's TYPE, so node can load it (`yarn site:data`).
 */

import type { inputVocabulary } from "./UIInput.vocabulary.en"

////////////////
// ## Types
////////////////

/** The vocabulary's type, for short. */
export type Vocabulary = typeof inputVocabulary

/**
 * The vocabulary getters every text control has (`<ui-input>` and `<ui-textarea>`), typed once for `TextControl`.
 * - Not `value`:  that's `TextControl`'s `@controlled` member.
 */
export type CommonAttributes = {
  /** the form field's name */
  name: string | undefined
  /** the hint shown while empty */
  placeholder: string | undefined
  /** the `disabled` attribute (a disabled fieldset is `formIsDisabled`) */
  disabled: boolean
  /** shows its value, which can't be edited */
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

////////////////
// ## Class words
////////////////

/**
 * The `type` of a file input, and its class word (`ui file input`).
 * - Script can't set its value, and it submits files.
 */
export const FILE = "file"

/** The class words of a joined label (`UIInput.css`). */
export const LABEL_CLASSES = "ui label"
