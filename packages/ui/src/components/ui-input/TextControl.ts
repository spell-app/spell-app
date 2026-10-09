import { untrack } from "solid-js"
import { isServer } from "@solidjs/web"

import { E, UIT } from "$/ui/core"
import { F } from "$/ui/forms"
import { type CommonAttributes } from "./UIInput.types"

/****************
 * ### `TextControl`
 * The base component of `<ui-input>` and `<ui-textarea>`:  a native `<input>` / `<textarea>` in the shadow root,
 * whose value, validity and name belong to the DOM ELEMENT.
 *
 * - `value` is controlled (`@controlled`).
 *   Typing sends `ui-input` first;  a handler that sets `el.value` again wins (the control shows that value).
 *   The ATTRIBUTE is the starting value, which a form reset restores (as a native `defaultValue`);
 *   the property doesn't reflect.
 *
 * - Validity:  the NATIVE control's constraint validation (`required`, `pattern`, `type="email"` ...)
 *   merged with Fomantic `rules` (through `Validator`), into the DOM element's `setValidity()`:
 *   the native flags and message first.
 *   The native side is read again after the DOM updates (an effect's apply) and after each input event.
 *
 * - `:state(invalid)` shows only once the person has interacted (`isTouched`), as `:user-invalid` does:
 *   a committed change, leaving an edited field,
 *   or a submit / `reportValidity()` that found it invalid (the `invalid` event).  A reset clears it.
 *
 * - Its name:  `ControlLabels` hands the DOM element's `<label for>` / `aria-label` to the control
 *   as its `aria-label`.
 * - The DOM element's `aria-invalid` (a `<ui-form>` marks failing fields) is passed on to the control.
 ****************/
export abstract class TextControl<V extends E.ComponentVocabulary = E.ComponentVocabulary> extends F.FormComponent<V> {
  /** The native control. */
  protected control?: HTMLInputElement | HTMLTextAreaElement

  constructor(...args: ConstructorParameters<typeof F.FormComponent>) {
    super(...args)
    this.domElement.addEventListener("invalid", this.onInvalid)
    this.domElement.addEventListener("click", this.onDOMElementClick)
  }

  /** Focus the native control. */
  focus(options?: FocusOptions) {
    this.control?.focus(options)
  }

  ////////////////
  // ## The value
  ////////////////

  /** `value`:  set by the page, or typed in (`""` to start). */
  @E.controlled("value") accessor value = ""

  /** The value when the control took focus, to tell whether leaving it is an edit. */
  private valueAtFocus?: string

  get formValue(): E.FieldValue {
    return this.value
  }

  protected get formName(): string | undefined {
    return this.name
  }

  /** Back to the `value` ATTRIBUTE (native `defaultValue`);  forgets the interaction. */
  onFormReset() {
    this.value = this.attributes.value ?? ""
    this.isTouched = false
  }

  /**
   * The value or the content changed:  the control shows the new value.
   * - `isReady`:  the control only exists once the content renders.
   * - Declared before `onConstraintsChanged()`:  the control holds the new value before its validity is read.
   */
  @E.onChange("value", "isReady")
  protected onValueChanged() {
    this.syncControl()
  }

  /** The control shows `value` again, e.g. after a cancelled `ui-input`. */
  protected syncControl() {
    const { control } = this
    const value = untrack(() => this.value)
    // a file input's value can only be cleared from script
    if (!control || control.value === value || (control.type === "file" && value !== "")) return
    control.value = value
  }

  /** Typing:  `ui-input` first, then the value (unless a handler took over). */
  protected readonly onInput = (event: Event) => {
    const control = event.currentTarget as HTMLInputElement | HTMLTextAreaElement
    const next = control.value
    const applied = this.requestChange("value", next, () =>
      this.send("ui-input" as never, { value: next, originalEvent: event })
    )
    if (!applied) E.afterSolidUpdate(() => this.syncControl())
    this.readNativeValidity()
  }

  /** Commit:  `ui-change`;  the person has now interacted. */
  protected readonly onChange = (event: Event) => {
    this.isTouched = true
    this.send("ui-change" as never, { value: untrack(() => this.value), originalEvent: event })
  }

  /** Focus:  remember the value, to tell an edit on the way out. */
  protected readonly onFocus = () => {
    this.valueAtFocus = untrack(() => this.value)
  }

  /** Leaving an edited field counts as interaction. */
  protected readonly onBlur = () => {
    if (this.valueAtFocus !== undefined && this.valueAtFocus !== untrack(() => this.value)) this.isTouched = true
    this.valueAtFocus = undefined
  }

  ////////////////
  // ## Validity
  ////////////////

  /** The person has interacted (see the class doc). */
  @E.state accessor isTouched = false

  /** The native control's own constraint validation, re-read after updates. */
  @E.state accessor nativeValidity: E.ValidationResult = VALID

  /** Native validity merged with the `rules` property's, see the class doc. */
  @E.derived
  override get validation(): E.ValidationResult {
    const own = F.FormComponent.validator.validate(this.formValue, this.validationRules, {
      label: this.validationLabel,
      name: this.name
    })
    const native = this.nativeValidity
    if (native.valid) return own
    return {
      valid: false,
      errors: [...native.errors, ...own.errors],
      flags: { ...own.flags, ...native.flags },
      message: native.message || own.message
    }
  }

  /** The `rules` property:  one rule, a list, or nothing. */
  protected get validationRules(): E.ValidationRule[] {
    const rules = this.rules
    if (rules == null || rules === "") return []
    return (Array.isArray(rules) ? rules : [rules]) as E.ValidationRule[]
  }

  protected get validationLabel(): string | undefined {
    return this.labels.accessibleName ?? this.placeholder
  }

  protected get validationAnchor(): HTMLElement | undefined {
    return this.control
  }

  protected shouldShowInvalid(result: E.ValidationResult): boolean {
    return !result.valid && this.isTouched
  }

  /**
   * Constraint attributes the native control carries, e.g. `{ required, pattern }`;  tracked.
   * - Spread onto the control, and read by `onConstraintsChanged()`.
   */
  protected abstract get constraints(): Record<string, unknown>

  /**
   * What the native validity depends on changed:  read it again, after the DOM updates.
   * - `constraints` builds a new object on every read, so any change among them counts.
   */
  @E.onChange("value", "constraints", "isDisabled", "readonly", "isReady")
  protected onConstraintsChanged() {
    this.readNativeValidity()
  }

  /** Copy the control's validity into `nativeValidity`. */
  protected readNativeValidity() {
    const control = this.control
    if (!control) return
    const { validity } = control
    const flags: ValidityStateFlags = {}
    for (const flag of NATIVE_FLAGS) if (validity[flag]) flags[flag] = true
    if (validity.valid) {
      if (!untrack(() => this.nativeValidity).valid) this.nativeValidity = VALID
      return
    }
    const message = control.validationMessage
    const errors: E.ValidationError[] = Object.keys(flags).map((flag) => ({
      type: flag,
      ruleValue: undefined,
      message,
      flag: flag as E.ValidityFlag
    }))
    this.nativeValidity = { valid: false, errors, flags, message }
  }

  /** A submit or `reportValidity()` found it invalid:  show it. */
  private readonly onInvalid = () => {
    this.isTouched = true
  }

  ////////////////
  // ## Name and ARIA
  ////////////////

  /** The DOM element's `<label>`s and `aria-label`, as the control's name. */
  readonly labels = new F.ControlLabels(this.domElement)

  /** Connected:  the DOM element's `<label>`s may be others now. */
  @E.onChange("isConnected")
  protected onConnectedChanged(isConnected: boolean) {
    if (isConnected) this.labels.refresh()
  }

  /** The control's ARIA:  its name, and invalid (the DOM element's `aria-invalid`, or shown invalid). */
  protected get controlAria() {
    return {
      "aria-label": this.labels.accessibleName,
      "aria-invalid":
        this.attributes["aria-invalid"] === "true" || (this.isTouched && !this.validation.valid) ? "true" : undefined
    } as const
  }

  /**
   * The native control's extra attributes in a server render (`$/ui/static`).
   * - What it needs to submit without script:  `name` and the starting `value`;  and the `STATIC_CONTROL` mark.
   * - `{}` in a browser, where the DOM element submits (`ElementInternals`)
   *   and the effects keep the control in step.
   */
  protected get staticControl(): Record<string, unknown> {
    if (!isServer) return {}
    return { [UIT.STATIC_CONTROL]: "", name: this.name, value: this.value || undefined }
  }

  ////////////////
  // ## Look and use
  ////////////////

  /** Disabled by its attribute, or by a disabled fieldset;  `:state(disabled)`. */
  @E.cssState("disabled")
  get isDisabled(): boolean {
    return this.disabled || this.formIsDisabled
  }

  /** Takes the full width?  `:state(fluid)`. */
  @E.cssState("fluid")
  get isFluid(): boolean {
    return this.fluid
  }

  /** Busy (`<ui-input loading>`)?  `:state(loading)`. */
  @E.cssState("loading")
  get isLoading(): boolean {
    return !!this.loading
  }

  protected classValue(name: E.AttributeName<V>): unknown {
    if (name === "disabled") return this.isDisabled
    return super.classValue(name)
  }

  /**
   * A click aimed at the DOM element itself (its `<label for>`, its `click()`) focuses the control.
   * - Clicks from inside the shadow root arrive retargeted, and are left alone.
   */
  private readonly onDOMElementClick = (event: MouseEvent) => {
    if (event.composedPath()[0] !== this.domElement || this.isDisabled) return
    this.control?.focus()
  }
}

/** The vocabulary getters both text controls have, typed once for this base. */
export interface TextControl<V extends E.ComponentVocabulary = E.ComponentVocabulary> extends CommonAttributes {}

/** Every Constraint Validation flag the native control may raise (not `customError`:  nothing sets one there). */
const NATIVE_FLAGS: readonly (keyof ValidityStateFlags)[] = [
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
const VALID: E.ValidationResult = { valid: true, errors: [], flags: {}, message: "" }
