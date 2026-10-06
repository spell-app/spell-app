import { createEffect, createMemo, type Accessor } from "solid-js"
import { onFormReset } from "@spell-app/solid-element"

import { E } from "$/ui/core"
// Import directly to avoid circular import
import { FormHost } from "./FormHost"
import { Validator } from "./Validator"

/****************
 * ### `FormElement`
 * Controller base of form-associated components:  form value, validity, reset, fieldset-disabled.
 * - The fork's `formAssociated` option makes the host a form control;  its host class is a `FormHost` (the
 *   form-control API).  Form callbacks arrive as the fork's hooks:  `onFormReset` => `formReset()`,
 *   `onFormDisabled` => `isFormDisabled` (in `UIElement`).
 * - Pushes `formValue()` into `ElementInternals.setFormValue()` -- a `string[]` becomes a `FormData` with one
 *   entry per value, so `new FormData(form).getAll(name)` returns them all -- and `rules()` through `Validator`
 *   into `setValidity()`.
 * - `:state(invalid)` follows `showsInvalid()` (default:  mirrors validity);  the anchor for the browser's bubble is
 *   `validationAnchor()`.
 * - Part of the `forms` entry:  reaches the element core through the `$/ui/core` ENTRY (`E`), never its leaves, or the
 *   build splits what `core` and `forms` share into a third chunk.  `E.UIElement` / `@E.proto` are safe while this
 *   module evaluates:  the core never imports `forms`, so it has always finished loading first.  Its `forms` peers
 *   `FormHost` / `Validator` come directly:  static initializers read them (WWOD §4 › "Circular imports").
 ****************/
export abstract class FormElement<V extends E.ComponentVocabulary = E.ComponentVocabulary> extends E.UIElement<V> {
  /** Host with the form-control API. */
  @E.proto static Host = FormHost
  @E.proto static formAssociated = true

  /**
   * Result of `rules()` against `formValue()`.
   * - `lazy`:  it calls subclass hooks, which read subclass fields that don't exist yet here.
   */
  readonly validation: Accessor<E.ValidationResult> = createMemo(
    () => FormElement.validator.validate(this.formValue(), this.rules(), { label: this.validationLabel() }),
    { lazy: true }
  )

  /** The form host. */
  get formHost(): FormHost {
    return this.host as FormHost
  }

  ////////////////
  // ## Subclass hooks
  ////////////////

  /** Value to submit;  tracked.  `null` / `undefined` submits nothing. */
  abstract formValue(): E.FieldValue

  /** Field name for `FormData` entries of a multi-value control. */
  protected abstract formName(): string | undefined

  /** Restore the starting value (`formResetCallback`). */
  abstract formReset(): void

  /** Validation rules;  default none. */
  protected rules(): E.ValidationRule[] {
    return []
  }

  /** Label used in validation messages. */
  protected validationLabel(): string | undefined {
    return undefined
  }

  /** Element the browser anchors its validation bubble to. */
  protected validationAnchor(): HTMLElement | undefined {
    return undefined
  }

  /**
   * Show `:state(invalid)` for `result`?  Tracked.
   * - Default:  whenever invalid (`:invalid` semantics).  Text and check controls wait for the user, as
   *   `:user-invalid` does.
   */
  protected showsInvalid(result: E.ValidationResult): boolean {
    return !result.valid
  }

  /**
   * What `setFormValue()` gets for `value`;  default `FormElement.submission()`.
   * - A file input overrides it to submit its `File`s.
   */
  protected formSubmission(value: E.FieldValue, name: string | undefined): string | File | FormData | null {
    return FormElement.submission(value, name)
  }

  ////////////////
  // ## Wiring
  ////////////////

  /** Adds the form value / validity effects and the reset hook to `UIElement.mount()`. */
  mount() {
    onFormReset(() => this.formReset())
    createEffect(
      () => this.formSubmission(this.formValue(), this.formName()),
      (submission) => this.formHost.internals.setFormValue(submission)
    )
    createEffect(
      () => ({ result: this.validation(), shown: this.showsInvalid(this.validation()) }),
      ({ result, shown }) => {
        const { internals } = this.formHost
        if (result.valid) internals.setValidity({})
        else internals.setValidity(result.flags, result.message, this.validationAnchor())
        this.host.setState(INVALID_STATE, shown)
      }
    )
    return super.mount()
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
