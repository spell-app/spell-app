import { untrack } from "solid-js"
import { isServer } from "@solidjs/web"

import { E, UIT } from "$/ui/core"
import { F } from "$/ui/forms"
import { FILE, type CommonAttributes } from "./ui-input.types"

/****************
 * ### `TextControl`
 * Controller base of `<ui-input>` and `<ui-textarea>`:  a native `<input>` / `<textarea>` in the shadow root whose
 * value, validity and name belong to the HOST.
 * - Value:  `value` is auto-controlled (`@controlled`).  Typing dispatches `ui-input` first;  a handler that re-sets
 *   `el.value` wins (the control shows the host's value again).  The ATTRIBUTE is the starting value, restored
 *   by form reset (native `defaultValue` semantics);  the property doesn't reflect.
 * - Validity:  the NATIVE control's constraint validation (`required`, `pattern`, `type="email"` ...) merged with
 *   Fomantic `rules` through `Validator`, into the host's `setValidity()` -- native flags and message first.
 *   The native side is re-read after the DOM updates (an effect's apply) and after each input event.
 * - `:state(invalid)` only once the person has interacted (`isTouched`):  a committed change, leaving an edited
 *   field, or a submit / `reportValidity()` that found it invalid (`invalid` event) -- `:user-invalid` semantics.
 *   Reset clears it.
 * - Name:  `ControlLabels` hands the host's `<label for>` / `aria-label` to the control as its `aria-label`.
 * - Host `aria-invalid` (a `<ui-form>` marks failing fields) is forwarded to the control.
 ****************/
export abstract class TextControl<V extends E.ComponentVocabulary = E.ComponentVocabulary> extends F.FormElement<V> {
  /** The native control. */
  protected control?: HTMLInputElement | HTMLTextAreaElement

  constructor(...args: ConstructorParameters<typeof F.FormElement>) {
    super(...args)
    this.host.addEventListener("invalid", this.onInvalid)
    this.host.addEventListener("click", this.onHostClick)
  }

  /** Focus the native control. */
  focus(options?: FocusOptions) {
    this.control?.focus(options)
  }

  ////////////////
  // ## The value
  ////////////////

  /** `value`:  host-controlled, or internal (`""`). */
  @E.controlled("value") accessor value = ""

  /** Value when the control took focus, to tell whether leaving it is an edit. */
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
   * The value or the content changed:  the control shows the host's value.  `isReady`:  the control only exists once
   * the content renders.
   * - Declared before `onConstraintsChanged()`:  the control holds the new value before its validity is read.
   */
  @E.onChange("value", "isReady")
  protected onValueChanged() {
    this.syncControl()
  }

  /** The control shows the host's value again, e.g. after a vetoed `ui-input`. */
  protected syncControl() {
    const { control } = this
    const value = untrack(() => this.value)
    // a file input's value can only be cleared from script
    if (!control || control.value === value || (control.type === FILE && value !== "")) return
    control.value = value
  }

  /** Typing:  `ui-input` first, then the value (unless a handler took over). */
  protected readonly onInput = (event: Event) => {
    const control = event.currentTarget as HTMLInputElement | HTMLTextAreaElement
    const next = control.value
    const applied = this.requestChange("value", next, () =>
      this.send("ui-input" as never, { value: next, originalEvent: event })
    )
    if (!applied) queueMicrotask(() => this.syncControl())
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
    const own = F.FormElement.validator.validate(this.formValue, this.validationRules, {
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

  /** Host `<label>`s and `aria-label`, as the control's name. */
  readonly labels = new F.ControlLabels(this.formHost)

  /** Connected:  the host's `<label>`s may be others now. */
  @E.onChange("isConnected")
  protected onConnectedChanged(isConnected: boolean) {
    if (isConnected) this.labels.refresh()
  }

  /** ARIA for the control:  name, invalid (host `aria-invalid`, forwarded, or shown invalid). */
  protected get controlAria() {
    return {
      "aria-label": this.labels.accessibleName,
      "aria-invalid":
        this.attributes[UIT.ARIA_INVALID] === UIT.TRUE || (this.isTouched && !this.validation.valid)
          ? UIT.TRUE
          : undefined
    } as const
  }

  /**
   * Server render only (`$/ui/static`):  what the native control needs to submit without JS -- `name` and the
   * starting `value` -- and the `STATIC_CONTROL` mark;  `{}` in a browser, where the HOST submits
   * (`ElementInternals`) and the effects keep the control in sync.
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
   * A click aimed at the HOST itself (its `<label for>`, `host.click()`) focuses the control;  clicks from
   * inside the shadow root arrive retargeted and are left alone.
   */
  private readonly onHostClick = (event: MouseEvent) => {
    if (event.composedPath()[0] !== this.host || this.isDisabled) return
    this.control?.focus()
  }
}
/** The vocabulary getters both text controls have, typed once for this base. */
export interface TextControl<V extends E.ComponentVocabulary = E.ComponentVocabulary> extends CommonAttributes {}

/** Every Constraint Validation flag the native control may raise (not `customError`:  the host never sets one). */
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
