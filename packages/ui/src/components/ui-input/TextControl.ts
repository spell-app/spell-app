import { createEffect, createMemo, untrack, type Accessor } from "solid-js"
import { isServer } from "@solidjs/web"

import { E, UIT } from "$/ui/core"
import { F } from "$/ui/forms"
import { FILE, type CommonAttributes } from "./ui-input.types"

/****************
 * ### `TextControl`
 * Controller base of `<ui-input>` and `<ui-textarea>`:  a native `<input>` / `<textarea>` in the shadow root whose
 * value, validity and name belong to the HOST.
 * - Value:  `value` is auto-controlled (`Controlled`).  Typing dispatches `ui-input` first;  a handler that re-sets
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
  /** `value`:  host-controlled, or internal (`""`). */
  readonly valueState = this.controlled("value" as E.AttributeName<V>, "" as never)

  /** The person has interacted (see the class doc). */
  readonly isTouched = new E.Cell(false)

  /** The native control's own constraint validation, re-read after updates. */
  readonly nativeValidity = new E.Cell<E.ValidationResult>(VALID)

  /** Host `<label>`s and `aria-label`, as the control's name. */
  readonly labels = new F.ControlLabels(this.formHost)

  /** Host `aria-invalid`, forwarded. */
  readonly ariaInvalid = new E.HostAttribute({ host: this.host, name: UIT.ARIA_INVALID })

  /** The native control. */
  protected control?: HTMLInputElement | HTMLTextAreaElement

  /** Value when the control took focus, to tell whether leaving it is an edit. */
  private focusValue?: string

  /**
   * Native validity merged with the `rules` property's, see the class doc.
   * - `lazy`:  reads subclass hooks.
   */
  override readonly validation: Accessor<E.ValidationResult> = createMemo(
    () => {
      const own = F.FormElement.validator.validate(this.formValue(), this.rules(), {
        label: this.validationLabel(),
        name: this.common.name
      })
      const native = this.nativeValidity.get()
      if (native.valid) return own
      return {
        valid: false,
        errors: [...native.errors, ...own.errors],
        flags: { ...own.flags, ...native.flags },
        message: native.message || own.message
      }
    },
    { lazy: true }
  )

  constructor(...args: ConstructorParameters<typeof F.FormElement>) {
    super(...args)
    this.host.addEventListener("invalid", this.onInvalid)
    this.host.addEventListener("click", this.onHostClick)
  }

  ////////////////
  // ## State
  ////////////////

  /** The attributes both vocabularies declare, typed once for this base. */
  protected get common(): CommonAttributes {
    return this.attrs as unknown as CommonAttributes
  }

  /** Current value. */
  value(): string {
    return String(this.valueState.get() ?? "")
  }

  isDisabled(): boolean {
    return this.common.disabled || this.isFormDisabled.get()
  }

  protected hostStates(): Partial<Record<E.StateName<V>, boolean>> {
    const states = { disabled: this.isDisabled(), fluid: this.common.fluid, loading: !!this.common.loading }
    return states as Partial<Record<E.StateName<V>, boolean>>
  }

  protected classValue(name: E.AttributeName<V>): unknown {
    if (name === "disabled") return this.isDisabled()
    return super.classValue(name)
  }

  /** Focus the native control. */
  focus(options?: FocusOptions) {
    this.control?.focus(options)
  }

  ////////////////
  // ## Form
  ////////////////

  formValue(): E.FieldValue {
    return this.value()
  }

  protected formName(): string | undefined {
    return this.common.name
  }

  /** Back to the `value` ATTRIBUTE (native `defaultValue`);  forgets the interaction. */
  formReset() {
    const attribute = this.definition.attribute("value").attribute
    this.valueState.set((this.host.getAttribute(attribute) ?? "") as never)
    this.isTouched.set(false)
  }

  /** The `rules` property:  one rule, a list, or nothing. */
  protected rules(): E.ValidationRule[] {
    const rules = this.common.rules
    if (rules == null || rules === "") return []
    return (Array.isArray(rules) ? rules : [rules]) as E.ValidationRule[]
  }

  protected validationLabel(): string | undefined {
    return this.labels.name() ?? this.common.placeholder
  }

  protected validationAnchor(): HTMLElement | undefined {
    return this.control
  }

  protected showsInvalid(result: E.ValidationResult): boolean {
    return !result.valid && this.isTouched.get()
  }

  ////////////////
  // ## Wiring
  ////////////////

  /**
   * Adds the value sync (host value => control) and the native-validity reader, both after DOM updates;  `isLoaded()`
   * is tracked because the control only exists once the content renders.
   */
  mount() {
    createEffect(
      () => [this.value(), this.isLoaded()],
      () => this.syncControl()
    )
    createEffect(
      () => [this.value(), this.constraints(), this.isDisabled(), this.common.readonly, this.isLoaded()],
      () => this.readNativeValidity()
    )
    createEffect(
      () => this.isConnected.get(),
      (connected) => {
        if (connected) this.labels.refresh()
      }
    )
    return super.mount()
  }

  /**
   * Constraint attributes the native control carries, e.g. `{ required, pattern }`;  tracked.
   * - Spread onto the control, and read by the validity effect.
   */
  protected abstract constraints(): Record<string, unknown>

  /** ARIA for the control:  name, invalid, busy. */
  protected controlAria() {
    return {
      "aria-label": this.labels.name(),
      "aria-invalid":
        this.ariaInvalid.get() === UIT.TRUE || (this.isTouched.get() && !this.validation().valid) ? UIT.TRUE : undefined
    } as const
  }

  /**
   * Server render only (`$/ui/static`):  what the native control needs to submit without JS -- `name` and the
   * starting `value` -- and the `STATIC_CONTROL` mark;  `{}` in a browser, where the HOST submits
   * (`ElementInternals`) and the effects keep the control in sync.
   */
  protected staticControl(): Record<string, unknown> {
    if (!isServer) return {}
    return { [UIT.STATIC_CONTROL]: "", name: this.common.name, value: this.value() || undefined }
  }

  /** Copy the control's validity into `nativeValidity`. */
  protected readNativeValidity() {
    const control = this.control
    if (!control) return
    const { validity } = control
    const flags: ValidityStateFlags = {}
    for (const flag of NATIVE_FLAGS) if (validity[flag]) flags[flag] = true
    if (validity.valid) {
      if (!untrack(() => this.nativeValidity.get()).valid) this.nativeValidity.set(VALID)
      return
    }
    const message = control.validationMessage
    const errors: E.ValidationError[] = Object.keys(flags).map((flag) => ({
      type: flag,
      ruleValue: undefined,
      message,
      flag: flag as E.ValidityFlag
    }))
    this.nativeValidity.set({ valid: false, errors, flags, message })
  }

  /** The control shows the host's value again, e.g. after a vetoed `ui-input`. */
  protected syncControl() {
    const { control } = this
    const value = untrack(() => this.value())
    // a file input's value can only be cleared from script
    if (!control || control.value === value || (control.type === FILE && value !== "")) return
    control.value = value
  }

  ////////////////
  // ## Handlers
  ////////////////

  /** Typing:  `ui-input` first, then the value (unless a handler took over). */
  protected readonly onInput = (event: Event) => {
    const control = event.currentTarget as HTMLInputElement | HTMLTextAreaElement
    const next = control.value
    const applied = this.valueState.request(next as never, () =>
      this.emit("ui-input" as never, { value: next, originalEvent: event })
    )
    if (!applied) queueMicrotask(() => this.syncControl())
    this.readNativeValidity()
  }

  /** Commit:  `ui-change`;  the person has now interacted. */
  protected readonly onChange = (event: Event) => {
    this.isTouched.set(true)
    this.emit("ui-change" as never, { value: untrack(() => this.value()), originalEvent: event })
  }

  /** Focus:  remember the value, to tell an edit on the way out. */
  protected readonly onFocus = () => {
    this.focusValue = untrack(() => this.value())
  }

  /** Leaving an edited field counts as interaction. */
  protected readonly onBlur = () => {
    if (this.focusValue !== undefined && this.focusValue !== untrack(() => this.value())) this.isTouched.set(true)
    this.focusValue = undefined
  }

  /** A submit or `reportValidity()` found it invalid:  show it. */
  private readonly onInvalid = () => {
    this.isTouched.set(true)
  }

  /**
   * A click aimed at the HOST itself (its `<label for>`, `host.click()`) focuses the control;  clicks from
   * inside the shadow root arrive retargeted and are left alone.
   */
  private readonly onHostClick = (event: MouseEvent) => {
    if (event.composedPath()[0] !== this.host || this.isDisabled()) return
    this.control?.focus()
  }
}

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
