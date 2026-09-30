import { proto, type ValidationRule } from "$/core"

import { checkboxVocabulary } from "./checkbox.vocabulary.en"
import { CheckControl } from "./CheckControl"

/****************
 * ### `<ui-checkbox>`
 * A checkbox, `toggle` or `slider`:  `<div class="ui … checkbox" part="checkbox">` around a native
 * `<input type="checkbox" part="control">` and its `<label part="label">` (see `CheckControl`).
 * - Toggles and sliders are `role="switch"`:  on / off, not "checked".
 * - `indeterminate`:  the input's `indeterminate` (a dash, `aria-checked="mixed"`);  the user's click clears it,
 *   as natively, by writing `indeterminate = false` to the host.
 * - `required` => Fomantic's `checked` rule (`valueMissing`).
 ****************/
export class UICheckbox extends CheckControl<typeof checkboxVocabulary> {
  @proto static vocabulary = checkboxVocabulary

  readonly checkable = CHECKBOX

  protected inputType() {
    return CHECKBOX as typeof CHECKBOX
  }

  protected role(): string | undefined {
    return this.attrs.type ? SWITCH : undefined
  }

  protected indeterminate(): boolean {
    return this.attrs.indeterminate
  }

  protected rules(): ValidationRule[] {
    return this.attrs.required ? [REQUIRED_RULE] : []
  }

  protected hostStates() {
    return { ...super.hostStates(), indeterminate: this.attrs.indeterminate }
  }

  /** The user's click ends `indeterminate`. */
  protected chosen() {
    if (this.attrs.indeterminate) (this.host as unknown as { indeterminate: boolean }).indeterminate = false
  }
}

/** Input type, and what a form reads it as. */
const CHECKBOX = "checkbox" as const

/** Role of toggles and sliders. */
const SWITCH = "switch"

/** `required` => Fomantic's `checked`. */
const REQUIRED_RULE: ValidationRule = "checked"
