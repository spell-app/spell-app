import { createEffect, untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E, UIT } from "$/ui/core"
import { formVocabulary } from "./ui-form.vocabulary.en"
import { FormFallback } from "./ui-form.fallback"
import { FormFields } from "./FormFields"
import { UIFormHost } from "./UIFormHost"
import { ERROR, FIELD_SELECTOR, StateFlags, type Field, type FieldElement, type Vocabulary } from "./ui-form.types"

import formCSS from "./ui-form.css?inline"

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
 * - Static server render (`$/ui/static`):  a `<form>` slotted inside it MERGES into the root, which becomes
 *   `<form class="ui … form">` with the author's attributes (`mergedForm`):  Fomantic's own markup, so the form's
 *   rules reach its fields and messages, and the page still submits natively.  A form around it stays as it is.
 ****************/
export class UIForm extends E.UIElement<Vocabulary> {
  @E.proto static vocabulary = formVocabulary
  @E.proto static styles = { form: formCSS }
  @E.proto static Host = UIFormHost
  @E.proto static Fallback = FormFallback
  @E.proto static delegatesFocus = false

  /** The native form it works with. */
  readonly form = new E.Cell<HTMLFormElement | undefined>(undefined)

  /** The last submit / `validate()` failed:  `error` shows. */
  readonly hasFailed = new E.Cell(false)

  /** Controls, values, labels, errors. */
  readonly fields = new FormFields({ host: this.host, form: () => this.form.get() })

  /** Fields showing an error now. */
  private readonly shown = new Set<string>()

  /** Values at connect / reset / success, for `prevent-leaving`. */
  private snapshot = ""

  /** Validation deferred to after the controls settle, by field. */
  private readonly pending = new Set<string>()

  /**
   * Server render only:  attributes of the author's `<form>` merged into the root, `undefined` when there's none.
   * - SIDE EFFECT:  unwraps that form in the host's light DOM, so its children fill the root's slot.
   */
  private readonly mergedForm = isServer ? UIForm.unwrapForm(this.host) : undefined

  ////////////////
  // ## Element hooks
  ////////////////

  protected classValue(name: E.AttributeName<Vocabulary>): unknown {
    if (name === "state") return this.shownState()
    return super.classValue(name)
  }

  /** `stack-with`'s class (`UIT.StackClasses`):  sets the switch its rows stack by. */
  protected extraClasses(): string | undefined {
    return UIT.StackClasses.classFor(this.attrs.stackWith)
  }

  protected hostStates() {
    return {
      ...StateFlags.flagsFor(this.shownState()),
      loading: this.attrs.loading,
      disabled: this.attrs.disabled,
      root: true
    }
  }

  /** `error` after a failed submit, else the attribute. */
  private shownState() {
    return this.hasFailed.get() ? ERROR : this.attrs.state
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    if (this.mergedForm) return this.formRoot(this.mergedForm)
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

  /** Server render:  the root as the author's `<form>`, its attributes kept, its class after ours. */
  private formRoot(attributes: Record<string, string>): JSX.Element {
    const { class: authorClass, ...rest } = attributes
    return (
      <form
        {...rest}
        class={[this.classes(), authorClass]}
        part={this.part("form")}
        inert={this.attrs.disabled || this.attrs.loading}
        aria-busy={this.attrs.loading ? "true" : undefined}
      >
        <slot />
      </form>
    )
  }

  /** Adds the form discovery, its listeners, and the host's own listeners while connected. */
  mount() {
    createEffect(
      () => this.isConnected.get(),
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
          this.form.set(undefined)
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
    const form = this.host.querySelector(FORM) ?? this.host.parentElement?.closest(FORM) ?? undefined
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
    const errors = this.check("show")
    this.hasFailed.set(!!Object.keys(errors).length)
    return errors
  }

  /** Would every field pass?  Shows nothing. */
  isValid(): boolean {
    return !Object.keys(this.check("silently")).length
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
  nativeForm(): HTMLFormElement | undefined {
    return untrack(() => this.form.get())
  }

  ////////////////
  // ## Validating
  ////////////////

  /**
   * Validate every field;  errors by field.
   * - `"show"`:  prompts, `aria-invalid` and per-field events too;  the caller focuses the first invalid field.
   * - `"silently"`:  the verdict alone.
   */
  private check(mode: CheckMode): Record<string, string[]> {
    const fields = this.fields.fields()
    const values = this.fields.values(fields)
    const labels = this.fields.labels(fields)
    const rules = this.rules()
    const errors: Record<string, string[]> = {}
    for (const field of fields) {
      const messages = this.fields.errors({ field, rules, values, labels })
      if (messages.length) errors[field.identifier] = messages
      if (mode === "show") this.show({ field, messages, values })
    }
    return errors
  }

  /** Validate ONE field now and show it. */
  private checkField(identifier: string) {
    const fields = this.fields.fields()
    const field = fields.find((candidate) => candidate.identifier === identifier)
    if (!field) return
    const values = this.fields.values(fields)
    const labels = this.fields.labels(fields)
    const messages = this.fields.errors({ field, rules: this.rules(), values, labels })
    this.show({ field, messages, values })
    if (!this.shown.size && untrack(() => this.hasFailed.get())) this.hasFailed.set(false)
  }

  /** Show `messages` for a field (or clear it), and dispatch `ui-valid` / `ui-invalid`. */
  private show({ field: { identifier, controls }, messages, values }: ShownField) {
    UIForm.fieldElementFor(controls)?.showErrors?.(messages)
    for (const control of controls) {
      if (messages.length) control.setAttribute(UIT.ARIA_INVALID, UIT.TRUE)
      else if (control.getAttribute(UIT.ARIA_INVALID) === UIT.TRUE) control.removeAttribute(UIT.ARIA_INVALID)
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
      UIForm.fieldElementFor(field.controls)?.showErrors?.([])
      for (const control of field.controls) control.removeAttribute(UIT.ARIA_INVALID)
    }
    this.shown.clear()
    this.hasFailed.set(false)
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
  private checkFieldSoon(identifier: string) {
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
    const identifier = this.identifierFor(event)
    if (!identifier) return
    if (this.shown.has(identifier) || untrack(() => this.attrs.on) === "change") this.checkFieldSoon(identifier)
  }

  /** A control lost focus:  validate it for `on="blur"`. */
  private readonly onBlur = (event: FocusEvent) => {
    if (untrack(() => this.attrs.on) !== "blur") return
    const identifier = this.identifierFor(event)
    if (identifier) this.checkFieldSoon(identifier)
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
  private identifierFor(event: Event): string | undefined {
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

  /**
   * Server render:  the author's `<form>`, when it is the host's only element child, unwrapped (its children take
   * its place);  returns its attributes, else `undefined`.
   * - STATIC:  it runs from a field initializer, before the instance is ready, and needs only the host.
   */
  private static unwrapForm(host: Element): Record<string, string> | undefined {
    const [form, ...others] = host.children
    if (!form || others.length || form.localName !== FORM) return undefined
    const attributes = Object.fromEntries([...form.attributes].map(({ name, value }) => [name, value]))
    form.replaceWith(...form.childNodes)
    return attributes
  }

  /**
   * The `<ui-field>` of a field's first control, if any:  where its prompt shows.
   * - STATIC:  pure, reads only the controls.
   */
  private static fieldElementFor(controls: readonly Element[]): FieldElement | undefined {
    return (controls[0]?.closest(FIELD_SELECTOR) as FieldElement | null) ?? undefined
  }

  /**
   * Put a control back to its starting value (no native form to reset it).
   * - STATIC:  works on the control alone, no instance state.
   */
  private static resetControl(control: Element) {
    if (control instanceof HTMLInputElement) {
      if (control.type === "checkbox" || control.type === "radio") control.checked = control.defaultChecked
      else control.value = control.defaultValue
    } else if (control instanceof HTMLTextAreaElement) control.value = control.defaultValue
    else if (control instanceof HTMLSelectElement) {
      for (const option of control.options) option.selected = option.defaultSelected
    } else (control as { controller?: { formReset?(): void } }).controller?.formReset?.()
  }

  /**
   * Empty a control.
   * - STATIC:  works on the control alone, no instance state.
   */
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

/** How `UIForm.check()` reports:  `"show"` prompts, states and events, or `"silently"` the verdict alone. */
type CheckMode = "show" | "silently"

/** What `UIForm.show()` shows:  one field's prompts. */
type ShownField = {
  /** The field checked. */
  field: Field
  /** Its prompts;  `[]` clears it. */
  messages: string[]
  /** Every field's value, for the events' `detail`. */
  values: UIT.FormValues
}

/** Events that mean "a control changed":  native ones from light-DOM controls, `ui-*` ones from elements. */
const CHANGE_EVENTS = ["change", "input", "ui-change"] as const

/** A control lost focus (bubbles, unlike `blur`). */
const FOCUS_OUT = "focusout"

/** The native form was reset. */
const RESET = "reset"

/** The page is about to unload, for `prevent-leaving`. */
const BEFORE_UNLOAD = "beforeunload"

/** A native form's tag. */
const FORM = "form"
