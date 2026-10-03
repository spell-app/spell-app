/**
 * Shared constants, types and helpers of the `ui-input` family:  what its element classes, vocabularies and native fallback share.
 * - Runtime-light:  no element code, so every file of the family may import it.
 */

import type { ValidationResult } from "$/ui/core"
import type { inputVocabulary } from "./ui-input.vocabulary.en"

/**
 * Marks the NATIVE control in a static server render (`$/ui/server`), for the flattener:  the host's `id` and ARIA
 * names belong there, so a `<label for>` the host's id labels the control.
 * - TODO: one shared constant (`UIT`) once `StaticFlattener` reads it (seo plan, P3).
 */
export const STATIC_CONTROL = "data-ui-control"

/** Converted attributes every text control has (`input` and `textarea`), see `TextControl.common`. */
export type CommonAttributes = {
  readonly value: string | undefined
  readonly name: string | undefined
  readonly placeholder: string | undefined
  readonly disabled: boolean
  readonly readonly: boolean
  readonly fluid: boolean
  readonly loading?: boolean
  readonly rules: unknown
}

/** Every Constraint Validation flag the native control may raise (not `customError`:  the host never sets one). */
export const NATIVE_FLAGS: readonly (keyof ValidityStateFlags)[] = [
  "valueMissing",
  "typeMismatch",
  "patternMismatch",
  "tooLong",
  "tooShort",
  "rangeUnderflow",
  "rangeOverflow",
  "stepMismatch",
  "badInput"
]

/** A passing result. */
export const VALID: ValidationResult = { valid: true, errors: [], flags: {}, message: "" }

/** Native type whose value script can't set. */
export const FILE_TYPE = "file"

/** Vocabulary type, for brevity. */
export type Vocabulary = typeof inputVocabulary

/** Where a joined label sits. */
export type LabelPlace = "start" | "end" | "corner"

/** Submit type, and the attribute that says it. */
export const TYPE = "type"

/** A disabled custom element (`:disabled` matches form-associated hosts). */
export const DISABLED_PSEUDO = ":disabled"

/**
 * Class words of the markup contract (`ui-input.css`) -- grammar, not attributes, so not in the vocabulary.
 */
export const FILE = "file"
export const LABEL_CLASSES = "ui label"
export const CORNER_LABEL = "ui corner label"
export const LEFT_CORNER_LABEL = "ui left corner label"

/** The part of a `<ui-input>` the fallback touches;  optional, the element may not have upgraded. */
export type InputHost = HTMLElement & { value?: string | null }
