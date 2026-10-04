/**
 * Shared constants, types and helpers of the `ui-form` family:  what its element classes, vocabularies and native fallback share.
 * - Runtime-light:  no element code, so every file of the family may import it.
 */

import type { ValidationRule } from "$/ui/core"
// pure data (vocabularies / types) never import `$/ui/core` by value:  it loads the element layer, which node
// can't (`yarn site:data` / `yarn gen:root` import every vocabulary through tsx:  no `?inline` css, no JSX)
import * as UIT from "$/ui/components/components.types"
import type { formVocabulary } from "./ui-form.vocabulary.en"

/** Host states for the form states, so page CSS (`native.css`) can show messages by them. */
export const STATE_STATES = [
  { name: "error", description: "In the error state (attribute, or failed validation)." },
  { name: "info", description: "In the info state." },
  { name: "success", description: "In the success state." },
  { name: "warning", description: "In the warning state." }
] as const

/** One named field:  its controls, in document order. */
export type Field = {
  /** name (or id) */
  identifier: string
  controls: Element[]
}

/** `FormFieldRules`, normalized. */
export type FieldSpec = {
  rules: ValidationRule[]
  optional: boolean
  depends?: string
  identifier?: string
}

/** Constraint Validation flags a control may raise. */
export const VALIDITY_FLAGS: readonly (keyof ValidityStateFlags)[] = [
  "valueMissing",
  "typeMismatch",
  "patternMismatch",
  "tooLong",
  "tooShort",
  "rangeUnderflow",
  "rangeOverflow",
  "stepMismatch",
  "badInput",
  "customError"
]

/** Native controls. */
export const CONTROL_SELECTOR = "input, select, textarea"

/** A control's `<ui-field>`. */
export const FIELD_SELECTOR = `:state(${UIT.FIELD_HOST_STATE})`

/** Fomantic's old name for `notEmpty`. */
export const EMPTY = "empty"
export const NOT_EMPTY = "notEmpty"

/** Attribute of multi-value elements. */
export const MULTIPLE = "multiple"

/** Attribute a checkable submits, and its native default. */
export const VALUE = "value"
export const DEFAULT_VALUE = "on"

/** Native input types that are buttons, not values. */
export const BUTTON_TYPES = new Set(["submit", "reset", "button", "image"])

/** The validation state. */
export const ERROR = "error"

/** Class words of the prompt (`ui-label.css` + `ui-form.css`). */
export const PROMPT = "ui basic pointing prompt label"
export const INLINE_PROMPT = "ui basic left pointing prompt label"

/** Vocabulary type, for brevity. */
export type Vocabulary = typeof formVocabulary

/** A `<ui-field>` host, as the form uses it. */
export type FieldElement = HTMLElement & { showErrors(messages: readonly string[]): void }

/** `on` values. */
export const CHANGE = "change"
export const BLUR = "blur"

/** Events that mean "a control changed":  native ones from light-DOM controls, `ui-*` ones from elements. */
export const CHANGE_EVENTS = ["change", "input", "ui-change"] as const

/** Other events it listens to. */
export const RESET = "reset"
export const FOCUS_OUT = "focusout"
export const BEFORE_UNLOAD = "beforeunload"

/** A native form. */
export const FORM = "form"

/** What the host asks of its controller (`UIForm`). */
export type FormController = {
  validate(): boolean
  isValid(): boolean
  reset(): void
  clear(): void
  values(): UIT.FormValues
  nativeForm(): HTMLFormElement | null
}
