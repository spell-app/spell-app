import { onFormReset } from "@spell-app/solid-element"
import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"
// Import directly to avoid circular import
import { FormHost } from "./FormHost"
import { Validator } from "./Validator"

/****************
 * ### `FormElement`
 * Controller base of form-associated components:  form value, validity, reset, fieldset-disabled.
 * - solid-element's `formAssociated` option (`elementSetup.isAFormControl`) makes the host a form control;
 *   its host class is a `FormHost` (the form-control API).
 * - Form callbacks arrive as solid-element's hooks:
 *   `onFormReset` => `onFormReset()`, `onFormDisabled` => `formIsDisabled` (in `UIElement`).
 * - Pushes `formValue` into `ElementInternals.setFormValue()` -- a `string[]` becomes a `FormData` with one
 *   entry per value, so `new FormData(form).getAll(name)` returns them all -- and `rules` through `Validator`
 *   into `setValidity()`.
 * - `:state(invalid)` follows `shouldShowInvalid()` (default:  mirrors validity);  the anchor for the browser's
 *   bubble is `validationAnchor`.
 * - Part of the `forms` entry:  reaches the element core through the `$/ui/core` ENTRY (`E`), never its leaves, or the
 *   build splits what `core` and `forms` share into a third chunk.  `E.UIElement` and the decorators (`@E.proto`,
 *   `@E.onChange` ...) are safe while this module evaluates:  the core never imports `forms`, so it has always
 *   finished loading first.  Its `forms` peers `FormHost` / `Validator` come directly:  static initializers read
 *   them (WWOD §4 › "Circular imports").
 ****************/
export abstract class FormElement<V extends E.ComponentVocabulary = E.ComponentVocabulary> extends E.UIElement<V> {
  @E.proto static elementSetup: Partial<E.ElementSetup> = {
    // with the form-control API
    Host: FormHost,
    isAFormControl: true
  }

  /** The form host. */
  get formHost(): FormHost {
    return this.host as FormHost
  }

  ////////////////
  // ## Value
  ////////////////

  /** Hook:  value to submit;  tracked.  `null` / `undefined` submits nothing. */
  abstract get formValue(): E.FieldValue

  /** Hook:  field name for `FormData` entries of a multi-value control. */
  protected abstract get formName(): string | undefined

  /**
   * Hook:  what `setFormValue()` gets for `value`;  default `FormElement.submission()`.
   * - A file input overrides it to submit its `File`s.
   */
  protected formSubmission(value: E.FieldValue, name: string | undefined): string | File | FormData | null {
    return FormElement.submission(value, name)
  }

  /** The value (or its name) changed:  hand the submission to the form. */
  @E.onChange("formValue", "formName")
  protected onFormValueChanged(value: E.FieldValue, name: string | undefined) {
    this.formHost.internals.setFormValue(this.formSubmission(value, name))
  }

  /** Hook:  restore the starting value (the platform's `formResetCallback`). */
  abstract onFormReset(): void

  ////////////////
  // ## Validity
  ////////////////

  /**
   * `rules` checked against `validationValue`.
   * - A plain getter for now:  `brand`'s hooks still read `Cell`s and memos, which a `@derived` cache can't see
   *   change (`@derived` once they read record members;  `TextControl`'s override is one already).
   */
  get validation(): E.ValidationResult {
    return FormElement.validator.validate(this.validationValue, this.validationRules, { label: this.validationLabel })
  }

  /**
   * Hook:  validation rules;  default none.
   * - Not `rules`:  the attribute of `<ui-input>`, `<ui-textarea>` and `<ui-form>`, whose getter a base member of
   *   that name would hide (`UIElement`'s doc).
   */
  protected get validationRules(): E.ValidationRule[] {
    return []
  }

  /**
   * Hook:  value `rules` check;  tracked.
   * - Default:  `formValue`.  A checkbox checks its chosen state alone:  its `off-value` is submitted, yet never
   *   "checked".
   */
  protected get validationValue(): E.FieldValue {
    return this.formValue
  }

  /** Hook:  label used in validation messages. */
  protected get validationLabel(): string | undefined {
    return undefined
  }

  /** Hook:  element the browser anchors its validation bubble to. */
  protected get validationAnchor(): HTMLElement | undefined {
    return undefined
  }

  /**
   * Hook:  show `:state(invalid)` for `result`?  Tracked.
   * - Default:  whenever invalid (`:invalid` semantics).  Text and check controls wait for the user, as
   *   `:user-invalid` does.
   */
  protected shouldShowInvalid(result: E.ValidationResult): boolean {
    return !result.valid
  }

  /**
   * Shown as invalid?  `:state(invalid)`, which every form vocabulary names.
   * - Set by `onValidationChanged()`, NOT `@cssState`:  the one `:state()` render effect also reads a radio's own
   *   `selected`, and a group's validation reads every member's, so it would draw a frame against a stale membership
   *   while the group unchooses the others (`EFFECT_RELAY_TEAR`, `ui-checkbox.test.tsx`).
   */
  get isShownInvalid(): boolean {
    return this.shouldShowInvalid(this.validation)
  }

  /** The validation changed:  hand the result (and the bubble's anchor) to the form, and show it (`:state(invalid)`). */
  @E.onChange("validation", "isShownInvalid")
  protected onValidationChanged(result: E.ValidationResult, isShownInvalid: boolean) {
    const { internals } = this.formHost
    if (result.valid) internals.setValidity({})
    else internals.setValidity(result.flags, result.message, this.validationAnchor)
    this.host.setState(INVALID_STATE, isShownInvalid)
  }

  ////////////////
  // ## Wiring
  ////////////////

  /** Adds the reset hook to `UIElement.onMount()`. */
  onMount(): JSX.Element {
    onFormReset(() => this.onFormReset())
    return super.onMount()
  }

  ////////////////
  // ## Statics
  ////////////////

  /**
   * Fomantic's rules, for every form control (and `FormFields`, `UIRadio`'s group).
   * - Static:  ONE for the page;  it's stateless, its data on the prototype (`Validator`).
   */
  static validator = new Validator()

  /**
   * What `setFormValue()` takes for `value`:  a string, a `FormData` of one entry per array item, or `null`.
   * - `null`:  the platform's "submit nothing" (`setFormValue()` is a boundary that takes it).
   * - Static:  pure;  `formSubmission()` is the per-element hook over it.
   * - NOTE: a `FormData` needs `name`;  unnamed controls submit nothing anyway.
   */
  static submission(value: E.FieldValue, name: string | undefined): string | FormData | null {
    if (value == null || value === false) return null
    if (!Array.isArray(value)) return String(value)
    if (!name) return null
    const data = new FormData()
    for (const item of value as readonly string[]) data.append(name, item)
    return data
  }
}

/**
 * `:state()` for failed validation.
 * - Every form vocabulary names it `invalid`:  here, not per component, because the base sets it.
 */
const INVALID_STATE = "invalid"
