import { createEffect, untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { Cell, proto, UIElement, type AttributeName, UIT } from "$/ui/core"

import { formVocabulary } from "./ui-form.vocabulary.en"
import { FormFallback } from "./ui-form.fallback"
import { FormFields } from "./FormFields"
import { UIFormHost } from "./UIFormHost"

import formCSS from "./ui-form.css?inline"
import {
  FIELD_SELECTOR,
  ERROR,
  CHANGE,
  BLUR,
  CHANGE_EVENTS,
  RESET,
  FOCUS_OUT,
  BEFORE_UNLOAD,
  FORM,
  type Vocabulary,
  type FieldElement
} from "./ui-form.types"

/****************
 * ### `<ui-form>`
 * A form's look (`<div class="ui … form" part="form"><slot></slot></div>`) and its VALIDATION, over a NATIVE form.
 * - Why not a form of its own:  a form-associated control belongs to the nearest `<form>` ANCESTOR in its own
 *   tree, so a `<form>` in this shadow root would never own the slotted controls, and a custom element can't
 *   BE a form.  So `<ui-form>` works with a light-DOM `<form>`:  one slotted INSIDE it (`<ui-form><form>…`,
 *   preferred), else the one AROUND it (`<form><ui-form>…`).  It never creates or moves one:  frameworks own
 *   that DOM.  Without any, it still validates (`validate()`, `on="blur|change"`), but nothing submits.
 * - SIDE EFFECT:  sets `noValidate` on that form while connected (restored after), so the browser's bubbles
 *   don't pre-empt Fomantic's prompts;  constraint validation still counts -- see `FormFields.errors()`.
 * - Submit (capture, on the form):  every field validates;  invalid => `preventDefault()` +
 *   `stopImmediatePropagation()` (the page's own submit handlers never see an invalid form, as natively),
 *   prompts, the `error` state, `ui-failure`, focus on the first invalid field (`error-focus`);  valid =>
 *   the cancelable `ui-success` (cancelled => no native submission).
 * - Prompts:  each field's first control's `<ui-field>` (`:state(field)`) gets `showErrors()`;  failing controls
 *   get `aria-invalid="true"` (removed when they pass).  A field that shows an error re-validates as it
 *   changes, whatever `on` says.
 * - `ui-valid` / `ui-invalid` fire per field validated;  `values` / `validate()` / `isValid()` / `reset()` /
 *   `clear()` are on the host (`UIFormHost`).
 * - `prevent-leaving`:  a `beforeunload` guard while the values differ from those at connect / reset / success.
 ****************/
export class UIForm extends UIElement<Vocabulary> {
  @proto static vocabulary = formVocabulary
  @proto static styles = { form: formCSS }
  @proto static Host = UIFormHost
  @proto static Fallback = FormFallback
  @proto static delegatesFocus = false

  /** The native form it works with. */
  readonly form = new Cell<HTMLFormElement | null>(null)

  /** The last submit / `validate()` failed:  `error` shows. */
  readonly failed = new Cell(false)

  /** Controls, values, labels, errors. */
  readonly fields = new FormFields(this.host, () => this.form.get())

  /** Fields showing an error now. */
  private readonly shown = new Set<string>()

  /** Values at connect / reset / success, for `prevent-leaving`. */
  private snapshot = ""

  /** Validation deferred to after the controls settle, by field. */
  private readonly pending = new Set<string>()

  ////////////////
  // ## Element hooks
  ////////////////

  protected classValue(name: AttributeName<Vocabulary>): unknown {
    if (name === "state") return this.shownState()
    return super.classValue(name)
  }

  protected hostStates() {
    const state = this.shownState()
    return {
      error: state === ERROR,
      info: state === "info",
      success: state === "success",
      warning: state === "warning",
      loading: this.attrs.loading,
      disabled: this.attrs.disabled,
      root: true
    }
  }

  /** `error` after a failed submit, else the attribute. */
  private shownState() {
    return this.failed.get() ? ERROR : this.attrs.state
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    return (
      <div
        class={this.classes()}
        part={this.part("form")}
        inert={this.attrs.disabled || this.attrs.loading}
        aria-busy={this.attrs.loading ? "true" : undefined}
      >
        <slot />
      </div>
    )
  }

  /** Adds the form discovery, its listeners, and the host's own listeners while connected. */
  mount() {
    createEffect(
      () => this.connected.get(),
      (connected) => {
        if (!connected || isServer) return
        const observer = new MutationObserver(() => this.findForm())
        observer.observe(this.host, { childList: true, subtree: true })
        this.findForm()
        const { host } = this
        for (const type of CHANGE_EVENTS) host.addEventListener(type, this.onChange)
        host.addEventListener(FOCUS_OUT, this.onBlur)
        window.addEventListener(BEFORE_UNLOAD, this.onBeforeUnload)
        queueMicrotask(() => this.takeSnapshot())
        return () => {
          this.form.set(null)
          observer.disconnect()
          for (const type of CHANGE_EVENTS) host.removeEventListener(type, this.onChange)
          host.removeEventListener(FOCUS_OUT, this.onBlur)
          window.removeEventListener(BEFORE_UNLOAD, this.onBeforeUnload)
        }
      }
    )
    createEffect(
      () => this.form.get(),
      (form) => {
        if (!form) return
        const noValidate = form.noValidate
        form.noValidate = true
        form.addEventListener(UIT.SUBMIT, this.onSubmit, { capture: true })
        form.addEventListener(RESET, this.onReset)
        return () => {
          form.noValidate = noValidate
          form.removeEventListener(UIT.SUBMIT, this.onSubmit, { capture: true })
          form.removeEventListener(RESET, this.onReset)
        }
      }
    )
    return super.mount()
  }

  /** The native form:  one inside, else the one around. */
  private findForm() {
    const form = this.host.querySelector(FORM) ?? this.host.parentElement?.closest(FORM) ?? null
    if (form !== untrack(() => this.form.get())) this.form.set(form)
  }

  ////////////////
  // ## API (see `UIFormHost`)
  ////////////////

  /** Validate every field, show the results;  true when all pass. */
  validate(): boolean {
    return !Object.keys(this.validateAll()).length
  }

  /** Validate and show every field, set the failed state;  errors by field. */
  private validateAll(): Record<string, string[]> {
    const errors = this.check(true)
    this.failed.set(!!Object.keys(errors).length)
    return errors
  }

  /** Would every field pass?  Shows nothing. */
  isValid(): boolean {
    return !Object.keys(this.check(false)).length
  }

  /** The native reset, then prompts and states cleared. */
  reset() {
    const form = untrack(() => this.form.get())
    if (form) form.reset()
    else for (const control of this.fields.controls()) UIForm.resetControl(control)
    this.clearShown()
  }

  /** Every control emptied, prompts and states cleared. */
  clear() {
    for (const control of this.fields.controls()) UIForm.clearControl(control)
    this.clearShown()
  }

  /** Every field's value, by name. */
  values(): UIT.FormValues {
    return this.fields.values()
  }

  /** The native form, if any. */
  nativeForm(): HTMLFormElement | null {
    return untrack(() => this.form.get())
  }

  ////////////////
  // ## Validating
  ////////////////

  /**
   * Validate every field;  errors by field.
   * - `show`:  prompts, `aria-invalid` and per-field events;  the first invalid field is focused by the caller.
   */
  private check(show: boolean): Record<string, string[]> {
    const fields = this.fields.fields()
    const values = this.fields.values(fields)
    const labels = this.fields.labels(fields)
    const rules = this.rules()
    const errors: Record<string, string[]> = {}
    for (const field of fields) {
      const messages = this.fields.errors(field, rules, values, labels)
      if (messages.length) errors[field.identifier] = messages
      if (show) this.show(field.identifier, field.controls, messages, values)
    }
    return errors
  }

  /** Validate ONE field now and show it. */
  private checkField(identifier: string) {
    const fields = this.fields.fields()
    const field = fields.find((candidate) => candidate.identifier === identifier)
    if (!field) return
    const values = this.fields.values(fields)
    const messages = this.fields.errors(field, this.rules(), values, this.fields.labels(fields))
    this.show(identifier, field.controls, messages, values)
    if (!this.shown.size && untrack(() => this.failed.get())) this.failed.set(false)
  }

  /** Show `messages` for a field (or clear it), and dispatch `ui-valid` / `ui-invalid`. */
  private show(identifier: string, controls: readonly Element[], messages: string[], values: UIT.FormValues) {
    const field = controls[0]?.closest(FIELD_SELECTOR) as FieldElement | null
    field?.showErrors?.(messages)
    for (const control of controls) {
      if (messages.length) control.setAttribute(UIT.ARIA_INVALID, "true")
      else if (control.getAttribute(UIT.ARIA_INVALID) === "true") control.removeAttribute(UIT.ARIA_INVALID)
    }
    if (messages.length) this.shown.add(identifier)
    else this.shown.delete(identifier)
    const value = values[identifier]
    if (messages.length) {
      const detail: UIT.FormInvalidDetail = { field: identifier, value, errors: messages, values }
      this.emit("ui-invalid", detail)
    } else {
      const detail: UIT.FormValidDetail = { field: identifier, value, values }
      this.emit("ui-valid", detail)
    }
  }

  /** Forget every prompt, `aria-invalid` and the failed state. */
  private clearShown() {
    for (const identifier of this.shown) {
      const field = this.fields.field(identifier)
      if (!field) continue
      ;(field.controls[0]?.closest(FIELD_SELECTOR) as FieldElement | null)?.showErrors?.([])
      for (const control of field.controls) control.removeAttribute(UIT.ARIA_INVALID)
    }
    this.shown.clear()
    this.failed.set(false)
    queueMicrotask(() => this.takeSnapshot())
  }

  /**
   * The `rules` property, as an object.
   * - Read from the HOST property, whose value is stored at once, not from `attrs` (a signal:  a `validate()`
   *   right after `el.rules = …` would see the old rules).
   */
  private rules(): UIT.FormRules | undefined {
    const rules = (this.host as unknown as Record<string, unknown>)[this.definition.attribute("rules").property]
    return rules && typeof rules === "object" && !Array.isArray(rules) ? (rules as UIT.FormRules) : undefined
  }

  /** Validate `identifier` once the controls have settled (their value and validity land on a microtask). */
  private later(identifier: string) {
    if (this.pending.has(identifier)) return
    this.pending.add(identifier)
    setTimeout(() => {
      this.pending.delete(identifier)
      this.checkField(identifier)
    })
  }

  /** Remember the values now. */
  private takeSnapshot() {
    this.snapshot = JSON.stringify(this.fields.values())
  }

  ////////////////
  // ## Handlers
  ////////////////

  /** Submit:  validate everything first, see the class doc. */
  private readonly onSubmit = (event: Event) => {
    const errors = this.validateAll()
    if (Object.keys(errors).length) {
      event.preventDefault()
      event.stopImmediatePropagation()
      const detail: UIT.FormFailureDetail = { values: this.values(), errors, originalEvent: event }
      this.emit("ui-failure", detail)
      if (untrack(() => this.attrs.errorFocus)) this.focusFirst(Object.keys(errors))
      return
    }
    const detail: UIT.FormSuccessDetail = { values: this.values(), originalEvent: event }
    if (!this.emit("ui-success", detail)) event.preventDefault()
    else this.takeSnapshot()
  }

  /** Native reset:  prompts go once the controls have reset. */
  private readonly onReset = () => {
    queueMicrotask(() => this.clearShown())
  }

  /** A control changed:  validate it for `on="change"`, or while it shows an error. */
  private readonly onChange = (event: Event) => {
    const identifier = this.identifierOf(event)
    if (!identifier) return
    if (this.shown.has(identifier) || untrack(() => this.attrs.on) === CHANGE) this.later(identifier)
  }

  /** A control lost focus:  validate it for `on="blur"`. */
  private readonly onBlur = (event: FocusEvent) => {
    if (untrack(() => this.attrs.on) !== BLUR) return
    const identifier = this.identifierOf(event)
    if (identifier) this.later(identifier)
  }

  /** `prevent-leaving`:  ask while the values changed. */
  private readonly onBeforeUnload = (event: BeforeUnloadEvent) => {
    if (!untrack(() => this.attrs.preventLeaving)) return
    if (JSON.stringify(this.fields.values()) === this.snapshot) return
    event.preventDefault()
  }

  /**
   * Field identifier of the control an event came from:  the first control at or above its `target`.
   * - `target` is already retargeted to the form's tree:  typing into a `<ui-input>` gives the `<ui-input>`.
   */
  private identifierOf(event: Event): string | undefined {
    const fields = this.fields.fields()
    for (let node = event.target as Element | null; node && node !== this.host; node = node.parentElement) {
      const field = fields.find((candidate) => candidate.controls.includes(node!))
      if (field) return field.identifier
    }
    return undefined
  }

  /** Focus the first control of the first of `identifiers`, in document order. */
  private focusFirst(identifiers: readonly string[]) {
    const field = this.fields.fields().find((candidate) => identifiers.includes(candidate.identifier))
    ;(field?.controls[0] as HTMLElement | undefined)?.focus()
  }

  /** Put a control back to its starting value (no native form to reset it). */
  private static resetControl(control: Element) {
    if (control instanceof HTMLInputElement) {
      if (control.type === "checkbox" || control.type === "radio") control.checked = control.defaultChecked
      else control.value = control.defaultValue
    } else if (control instanceof HTMLTextAreaElement) control.value = control.defaultValue
    else if (control instanceof HTMLSelectElement) {
      for (const option of control.options) option.selected = option.defaultSelected
    } else (control as { controller?: { formReset?(): void } }).controller?.formReset?.()
  }

  /** Empty a control. */
  private static clearControl(control: Element) {
    if (control instanceof HTMLInputElement) {
      if (control.type === "checkbox" || control.type === "radio") control.checked = false
      else control.value = ""
    } else if (control instanceof HTMLTextAreaElement) control.value = ""
    else if (control instanceof HTMLSelectElement) control.selectedIndex = -1
    else if ((control as { checkable?: string }).checkable)
      (control as unknown as { selected: boolean }).selected = false
    else {
      const host = control as unknown as { value: unknown }
      host.value = Array.isArray(host.value) ? [] : ""
    }
  }
}
