import { E } from "$/ui/core"
import { checkboxVocabulary } from "./ui-checkbox.vocabulary.en"
import { CheckControl } from "./CheckControl"
import { CHECKBOX, SWITCH } from "./ui-checkbox.types"

/****************
 * ### `<ui-checkbox>`
 * A checkbox, `toggle` or `slider`:  `<div class="ui … checkbox" part="checkbox">` around a native
 * `<input type="checkbox" part="control">` and its `<label part="label">` (see `CheckControl`).
 * - Toggles and sliders are `role="switch"`:  on / off, not "checked".
 * - `indeterminate`:  the input's `indeterminate` (a dash, `aria-checked="mixed"`);  a click clears it, as
 *   natively, by writing `indeterminate = false` to the host.
 * - `required` => Fomantic's `checked` rule (`valueMissing`).
 * - `off-value`:  submitted while unchosen, so a box toggles between two values (`value="open" off-value="closed"`);
 *   a subclass sets both for every element it defines:
 *   `class UIDoor extends UICheckbox { @E.proto static onValue = "open";  @E.proto static offValue = "closed" }`.
 ****************/
export class UICheckbox extends CheckControl<typeof checkboxVocabulary> {
  /**
   * Submitted while unchosen, when the element has no `off-value`;  left out:  nothing, as a native checkbox.
   * - `@proto`:  a subclass sets its own for every element it defines.
   */
  declare readonly offValue?: string

  @E.proto static vocabulary = checkboxVocabulary

  readonly checkable = CHECKBOX

  protected inputType(): typeof CHECKBOX {
    return CHECKBOX
  }

  protected role(): string | undefined {
    return this.attrs.type ? SWITCH : undefined
  }

  /** `off-value`, else the class's `offValue`. */
  unchosenValue(): string | undefined {
    return this.attrs.offValue ?? this.offValue
  }

  protected indeterminate(): boolean {
    return this.attrs.indeterminate
  }

  protected rules(): E.ValidationRule[] {
    return this.attrs.required ? [CHECKED_RULE] : []
  }

  protected hostStates() {
    return { ...super.hostStates(), indeterminate: this.attrs.indeterminate }
  }

  /** A click someone made ends `indeterminate`. */
  protected chosen() {
    if (this.attrs.indeterminate) (this.host as unknown as { indeterminate: boolean }).indeterminate = false
  }
}

/** `required` => Fomantic's `checked` rule. */
const CHECKED_RULE: E.ValidationRule = "checked"
