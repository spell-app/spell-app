import { E } from "$/ui/core"
import { checkboxVocabulary } from "./UICheckbox.en"
import { CheckControl } from "./CheckControl"

/****************
 * ### `UICheckbox`
 * The component behind `<ui-checkbox>`:  a checkbox, `toggle` or `slider`.
 *
 * - Its shadow DOM:  `<div class="ui … checkbox" part="checkbox">` around a native
 *   `<input type="checkbox" part="control">` and its `<label part="label">` (see `CheckControl`).
 * - Toggles and sliders are `role="switch"`:  on / off, not "checked".
 * - `indeterminate`:  the input's `indeterminate` (a dash, `aria-checked="mixed"`).
 *   A click clears it, as natively, by writing `indeterminate = false` to the DOM element.
 * - `required` => Fomantic's `checked` rule (`valueMissing`).
 * - `off-value`:  submitted while unchosen, so a box toggles between two values (`value="open" off-value="closed"`);
 *   a subclass sets both for every element it defines:  `class UIDoor extends UICheckbox {
 *   @E.proto static defaultChosenValue = "open";  @E.proto static defaultUnchosenValue = "closed" }`.
 ****************/
export class UICheckbox extends CheckControl<typeof checkboxVocabulary> {
  /**
   * Submitted while unchosen, when the element has no `off-value`;  left out:  nothing, as a native checkbox.
   * - `@proto`:  a subclass sets its own for every element it defines.
   */
  declare readonly defaultUnchosenValue?: string

  @E.proto static vocabulary = checkboxVocabulary

  readonly checkable = "checkbox"

  protected get inputType(): "checkbox" {
    return "checkbox"
  }

  protected get inputRole(): string | undefined {
    return this.type ? "switch" : undefined
  }

  /** `off-value`, else the class's `defaultUnchosenValue`. */
  get unchosenValue(): string | undefined {
    return this.offValue ?? this.defaultUnchosenValue
  }

  @E.cssState("indeterminate")
  protected get isIndeterminate(): boolean {
    return this.indeterminate
  }

  protected get validationRules(): E.ValidationRule[] {
    return this.required ? [CHECKED_RULE] : []
  }

  /** A click someone made ends `indeterminate` (writes the DOM element's property, so it reflects). */
  protected onChosen() {
    if (this.indeterminate) this.indeterminate = false
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UICheckbox extends E.AttributeValues<typeof checkboxVocabulary> {}

/** `required` => Fomantic's `checked` rule. */
const CHECKED_RULE: E.ValidationRule = "checked"
