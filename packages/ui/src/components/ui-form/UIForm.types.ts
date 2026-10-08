/**
 * The `ui-form` family's loose constants and types:  what its components, its vocabularies and `FormFields` share.
 * - Pure data, at the bottom of the folder's imports:  `import type` only (its vocabularies too:
 *   they value-import this file), `UIT` by value straight from `components.types`, so node can load it
 *   (`yarn site:data`).
 * - A word only ONE class uses sits below that class instead (epic `wwod-spell-ui`, Q18).
 */

import type { E } from "$/ui/core"
import * as UIT from "$/ui/components/components.types"

////////////////
// ## Vocabulary pieces
////////////////

/** The DOM element's states for the form states, so page CSS (`native.css`) can show messages by them. */
export const STATE_STATES = [
  { name: "error", description: "In the error state (attribute, or failed validation)." },
  { name: "info", description: "In the info state." },
  { name: "success", description: "In the success state." },
  { name: "warning", description: "In the warning state." }
] as const

/** When `<ui-form>`'s fields validate (its `validate-on`):  `submit` only, or also as one loses focus / changes. */
export const ValidationTriggers = ["submit", "blur", "change"] as const
/** One of `ValidationTriggers`, e.g. `"blur"`. */
export type ValidationTrigger = (typeof ValidationTriggers)[number]

////////////////
// ## Form states
////////////////

// Each is also the state the DOM element of a form, field or fields carries for it
// (`:state(error)` ...;  `UIT.FormStates`).

/** The validation state:  failed validation shows it over the author's `state`. */
export const ERROR = "error"

/** The `info` state. */
export const INFO = "info"

/** The `success` state. */
export const SUCCESS = "success"

/** The `warning` state. */
export const WARNING = "warning"

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
