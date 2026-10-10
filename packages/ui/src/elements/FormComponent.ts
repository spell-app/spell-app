import { E, UIT } from "$/ui/core"
import { F } from "$/ui/forms"
// Import directly to avoid circular import
import { DOMFormControl } from "./DOMFormControl"
import { Validator } from "./Validator"

/****************
 * ### `FormComponent`
 * The base class of the form controls' components (`UIInput`, `UIDropdown`, `UICheckbox` ...):
 * the form value, validity, reset, and a `<fieldset disabled>` around it.
 * - `elementSetup.isAFormControl` makes the DOM element a form control (DOM API `static formAssociated`);
 *   its DOM element class is a `DOMFormControl` (the form-control API).
 * - The browser's form callbacks arrive as methods (`UIComponent`, "Lifecycle"):
 *   a reset as `onFormReset()`, a `<fieldset disabled>` as `formIsDisabled`.
 * - Pushes `formValue` into `ElementInternals.setFormValue()`:
 *   a `string[]` becomes a `FormData` with one entry per value,
 *   so `new FormData(form).getAll(name)` returns them all.
 * - Pushes `validationRules`, through `Validator`, into `setValidity()`.
 * - `:state(invalid)` follows `isShownInvalid`:  at once, or only once someone has interacted (`invalidShows`).
 *   The anchor for the browser's bubble is `validationAnchor`.
 *
 * - What every control gets from here, so it writes none of it:
 *   - `isDisabled`:  its `disabled` attribute, or a disabled fieldset (`isMarkedDisabled`);
 *     the `disabled` class follows it, and `:state(disabled)` (`UIComponent`)
 *   - `isReadOnly`:  `readonly`, with `:state(readonly)`
 *   - `labels` (`ControlLabels`):  what names the DOM element (`<label for>`, `aria-label` ...),
 *     as `accessibleName` for its inner control;  read again each time it connects
 *   - `isTouched`:  someone has interacted;  an `invalid` event (a submit, `reportValidity()`) sets it,
 *     a form reset clears it (`DOMFormControl`)
 *   - `formName`:  `name`
 *   - `validationRules`:  `required` => Fomantic's `notEmpty`
 *   - a click aimed at the DOM element itself (its `<label for>`, its `click()`) calls `activateControl()`
 * - Every form vocabulary has `disabled`, `name` and `required`:  their getters are typed here once (`FormAttributes`).
 *
 * - Part of the `forms` entry:  reaches the element core through the `$/ui/core` ENTRY (`E`), never its leaves,
 *   or the build splits what `core` and `forms` share into a third chunk.
 *   - `E.UIComponent` and the decorators (`@E.proto`, `@E.onChange` ...) are safe while this module evaluates:
 *     the core never imports `forms`, so it has always finished loading first.
 *   - Its `forms` peers `DOMFormControl` / `Validator` come directly:
 *     static initializers read them (WWOD §4 › "Circular imports").
 *   - `ControlLabels` comes through `F`, as only an instance field reads it.
 ****************/
export abstract class FormComponent<V extends E.ComponentVocabulary = E.ComponentVocabulary> extends E.UIComponent<V> {
  @E.protoMerged static elementSetup: Partial<E.ElementSetup> = {
    // with the form-control API
    DOMElement: DOMFormControl,
    isAFormControl: true,
    // each control disables its native control:  still in the accessibility tree, as a disabled control
    disabled: "its own"
  }

  /**
   * The DOM element, as the form control it is (`elementSetup.DOMElement`):  `form`, `validity`, `internals` ...
   * - `declare`, a type only:  the constructor (`UIComponent`) sets it.
   */
  declare readonly domElement: DOMFormControl

  constructor(...args: ConstructorParameters<typeof E.UIComponent>) {
    super(...args)
    // here, not in a field initializer:  TypeScript refuses one reading `domElement`, `declare`d above (TS2729)
    this.labels = new F.ControlLabels(this.domElement)
  }

  ////////////////
  // ## Value
  ////////////////

  /**
   * Hook:  value to submit;  tracked.
   * - `null` / `undefined` submits nothing.
   */
  abstract get formValue(): E.FieldValue

  /** Hook:  field name for `FormData` entries of a multi-value control;  default `name`. */
  protected get formName(): string | undefined {
    return this.name
  }

  /**
   * Hook:  what `setFormValue()` gets for `value`;  default `FormComponent.submission()`.
   * - A file input overrides it to submit its `File`s.
   */
  protected formSubmission(value: E.FieldValue, name: string | undefined): string | File | FormData | null {
    return FormComponent.submission(value, name)
  }

  /** The value (or its name) changed:  hand the submission to the form. */
  @E.onChange("formValue", "formName")
  protected onFormValueChanged(value: E.FieldValue, name: string | undefined) {
    this.domElement.internals.setFormValue(this.formSubmission(value, name))
  }

  /**
   * Hook:  restore the starting value (DOM API `formResetCallback()`);  every form control has one.
   * - `isTouched` is already cleared when it runs (`DOMFormControl`).
   */
  abstract onFormReset(): void

  ////////////////
  // ## Validity
  ////////////////

  /**
   * `validationRules` checked against `validationValue`.
   * - A plain getter for now:  `brand`'s hooks still read `Cell`s and memos, which a `@derived` cache can't see change.
   *   It becomes `@derived` once they read record members (`TextControl`'s override is one already).
   */
  get validation(): E.ValidationResult {
    return FormComponent.validator.validate(this.validationValue, this.validationRules, { label: this.validationLabel })
  }

  /**
   * Hook:  validation rules;  default:  `required` => Fomantic's `notEmpty`, else none.
   * - `notEmpty` checks `validationValue`:  a control with a default it shows before anyone chose
   *   (a slider's `min`, a colour picker's colour) leaves it empty until a value is set.
   * - Not `rules`:  the attribute of `<ui-input>`, `<ui-textarea>` and `<ui-form>`,
   *   whose getter a base member of that name would hide (`UIComponent`'s doc).
   */
  protected get validationRules(): E.ValidationRule[] {
    return this.required ? [UIT.REQUIRED_RULE] : []
  }

  /**
   * Hook:  value `validationRules` check;  tracked.
   * - Default:  `formValue`.
   * - A checkbox checks its chosen state alone:  its `off-value` is submitted, yet never "checked".
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
   * When `:state(invalid)` shows:  `"at once"` (as `:invalid` does), or `"once touched"` (as `:user-invalid` does).
   * - See `@proto static invalidShows`.
   */
  declare readonly invalidShows: E.InvalidTiming

  /**
   * Class setting:  when `:state(invalid)` shows.
   * - Default `"at once"`.
   * - Text and check controls and the rating wait for the person:  `"once touched"`.
   */
  @E.proto static invalidShows: E.InvalidTiming = "at once"

  /**
   * Shown as invalid?  Invalid, and (`invalidShows: "once touched"`) touched;  tracked.
   * - `:state(invalid)`, which every form vocabulary names.
   *   Text and check controls and the rating hand it to their inner control as `aria-invalid`.
   * - Set by `onValidationChanged()`, NOT `@cssState`:
   *   - the one `:state()` render effect also reads a radio's own `selected`,
   *     and a group's validation reads every member's
   *   - so it would draw a frame against a stale membership while the group unchooses the others
   *     (`EFFECT_RELAY_TEAR`, `UICheckbox.test.tsx`)
   */
  get isShownInvalid(): boolean {
    return !this.validation.valid && (this.invalidShows === "at once" || this.isTouched)
  }

  /**
   * The validation changed:  hand the result (and the bubble's anchor) to the form, and show it (`:state(invalid)`).
   */
  @E.onChange("validation", "isShownInvalid")
  protected onValidationChanged(result: E.ValidationResult, isShownInvalid: boolean) {
    const { internals } = this.domElement
    if (result.valid) internals.setValidity({})
    else internals.setValidity(result.flags, result.message, this.validationAnchor)
    this.domElement.setState(INVALID_STATE, isShownInvalid)
  }

  ////////////////
  // ## Interaction
  ////////////////

  /**
   * Has someone interacted with it?
   * - Only then does a `"once touched"` control show `:state(invalid)`.
   * - Set here by an `invalid` event;  a control sets it on its own interactions too (a choice, a committed edit).
   * - Cleared by a form reset, before `onFormReset()` (`DOMFormControl`).
   */
  @E.state accessor isTouched = false

  /** A submit or `reportValidity()` found it invalid:  show it. */
  @E.on("invalid")
  protected onInvalid() {
    this.isTouched = true
  }

  ////////////////
  // ## Name
  ////////////////

  /**
   * What names the DOM element (`<label for>`, a wrapping `<label>`, `aria-label`, `aria-labelledby`),
   * as `labels.accessibleName`:  the name a control hands its inner control (its `<input>`, its group).
   * - Created by the constructor, under the component's owner, as `ControlLabels` needs.
   */
  readonly labels: F.ControlLabels

  /** Connected:  read the labels again (they may be others now). */
  @E.whileConnected
  protected refreshLabels() {
    this.labels.refresh()
  }

  ////////////////
  // ## Disabled
  ////////////////

  /**
   * Disabled by its `disabled` attribute, or by a disabled fieldset / form (`isMarkedDisabled`).
   * - Unusable its own way (`elementSetup.disabled` is `"its own"`):  each control disables its native control,
   *   so it stays in the accessibility tree as a disabled control, where the base class would make it inert.
   */
  get isDisabled(): boolean {
    return this.isMarkedDisabled
  }

  /** The `disabled` class follows `isDisabled`:  a disabled fieldset adds it too. */
  protected classValue(name: E.AttributeName<V>): unknown {
    if (name === "disabled") return this.isDisabled
    return super.classValue(name)
  }

  ////////////////
  // ## Read-only
  ////////////////

  /**
   * Is `readonly` set?  `:state(readonly)`.
   * - It shows its value, can be focused, and is submitted, but people can't change it (unlike `disabled`).
   * - Every form control's vocabulary declares it (`property: "readOnly"`, as the platform's),
   *   each saying what it does there;  `false` where one doesn't.
   * - Each control refuses changes its own way (its native control's `readonly`, a click it ignores ...).
   */
  @E.cssState("readonly")
  get isReadOnly(): boolean {
    return E.Reactive.attributeValue(this, "readonly") === true
  }

  ////////////////
  // ## Activation
  ////////////////

  /**
   * A click aimed at the DOM element itself (its `<label for>`, its `click()`):
   * `activateControl()`, unless disabled.
   * - Clicks from inside the shadow root arrive retargeted, and are left alone.
   */
  @E.on("click")
  protected onDOMElementClick(event: MouseEvent) {
    if (event.composedPath()[0] !== this.domElement || this.isDisabled) return
    this.activateControl()
  }

  /**
   * Hook:  what a click aimed at the DOM element itself does;  default nothing.
   * - A text control focuses its `<input>`, a rating its tab stop, a slider its first thumb.
   * - A checkbox clicks its input, as a native `<label>` does.
   */
  protected activateControl() {}

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
 * The vocabulary getters every form control's vocabulary has, typed once for this base
 * (see "Attributes" in `UIComponent`).
 */
export interface FormComponent<V extends E.ComponentVocabulary = E.ComponentVocabulary> extends FormAttributes {}

/** Getters of the attributes every form vocabulary declares. */
type FormAttributes = {
  /** the `disabled` attribute (a disabled fieldset is `formIsDisabled`) */
  disabled: boolean
  /** the form field's name */
  name: string | undefined
  /**
   * a value is needed
   * - A slider or colour picker set up with no value fails it, though it shows a default (`validationValue`).
   */
  required: boolean
}

/**
 * `:state()` for failed validation.
 * - Every form vocabulary names it `invalid`:  here, not per component, because the base sets it.
 */
const INVALID_STATE = "invalid"
