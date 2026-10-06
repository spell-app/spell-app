/**
 * Loose constants, types and helpers of the `ui-form` family:  what its element classes, vocabularies and native
 * fallback share.
 * - Pure data, at the bottom of the folder's imports:  `import type` only (its vocabularies too:  they value-import
 *   this file), `UIT` by value straight from `components.types`, so node can load it (`yarn site:data`).
 * - A word only ONE class uses sits below that class instead (epic `wwod-spell-ui`, Q18).
 */

import type { E } from "$/ui/core"
import * as UIT from "$/ui/components/components.types"
import type { formVocabulary } from "./ui-form.vocabulary.en"

////////////////
// ## Vocabulary pieces
////////////////

/** Host states for the form states, so page CSS (`native.css`) can show messages by them. */
export const STATE_STATES = [
  { name: "error", description: "In the error state (attribute, or failed validation)." },
  { name: "info", description: "In the info state." },
  { name: "success", description: "In the success state." },
  { name: "warning", description: "In the warning state." }
] as const

/** When `<ui-form>`'s fields validate (its `on`):  `submit` only, or also as one loses focus / changes. */
export const ValidationTriggers = ["submit", "blur", "change"] as const
/** One of `ValidationTriggers`, e.g. `"blur"`. */
export type ValidationTrigger = (typeof ValidationTriggers)[number]

////////////////
// ## Form states
////////////////

/** The validation state:  failed validation shows it over the author's `state`. */
export const ERROR = "error"

/**
 * The host states a form, field or fields carry for its `state` (`UIT.FormStates`).
 * - STATIC and instance-free:  one pure helper for three element classes.
 */
export class StateFlags {
  /** `{ error, info, success, warning }`, `true` for `state` alone. */
  static flagsFor(state: string | undefined): Record<UIT.FormState, boolean> {
    return Object.fromEntries(UIT.FormStates.map((it) => [it, it === state])) as Record<UIT.FormState, boolean>
  }
}

////////////////
// ## Fields
////////////////

/** One named field:  its controls, in document order. */
export type Field = {
  /** name (or id) */
  identifier: string
  /** its controls:  one, or several of one name (checkboxes, radios) */
  controls: Element[]
}

/** `UIT.FormFieldRules`, normalized. */
export type FieldSpec = {
  /** every rule, `empty` renamed `notEmpty` */
  rules: E.ValidationRule[]
  /** skip the rules while the field is blank */
  optional: boolean
  /** skip the rules while this other field is blank */
  depends?: string
  /** the field it's for, when its key in `rules` isn't */
  identifier?: string
}

/** A control's `<ui-field>`. */
export const FIELD_SELECTOR = `:state(${UIT.FIELD_HOST_STATE})`

/** A `<ui-field>` host, as the form uses it. */
export type FieldElement = HTMLElement & { showErrors(messages: readonly string[]): void }

////////////////
// ## Host API
////////////////

/** `<ui-form>`'s vocabulary type, for brevity. */
export type Vocabulary = typeof formVocabulary

/** What the host asks of its controller (`UIForm`). */
export type FormController = {
  /** Validate every field, show the results;  true when all pass. */
  validate(): boolean
  /** Would every field pass?  Shows nothing. */
  isValid(): boolean
  /** The native reset, then prompts and states cleared. */
  reset(): void
  /** Every control emptied, prompts and states cleared. */
  clear(): void
  /** Every field's value, by name. */
  values(): UIT.FormValues
  /** The native form it works with, if any. */
  nativeForm(): HTMLFormElement | undefined
}
