import { createEffect, untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E, UIT } from "$/ui/core"
import { formVocabulary } from "./UIForm.en"
import { FormFields } from "./FormFields"
import type { DOMFieldElement } from "./UIField"
import { ERROR, FIELD_SELECTOR, INFO, SUCCESS, WARNING, type Field } from "./UIForm.types"

import formCSS from "./UIForm.css?inline"

/****************
 * ### `DOMFormElement`
 * The DOM element of `<ui-form>`, as `HTMLFormElement` is `<form>`'s:  it adds the form's script API
 * (`validate()`, `isValid()`, `reset()`, `clear()`, `values`, `nativeForm`), each handed to the component.
 *
 * - Before the component exists, it answers as an empty form:  valid, no values, no native form.
 * - `DOMElement` checks its members against the attributes' property names;  none of these is one.
 * - Above the component:  its `elementSetup` reads this class while the component is defined.
 ****************/
export class DOMFormElement extends E.DOMElement {
  /** Validate every field, show prompts and states;  true when valid. */
  validate(): boolean {
    return this.form?.validate() ?? true
  }

  /** The same verdict as `validate()`, showing nothing. */
  isValid(): boolean {
    return this.form?.isValid() ?? true
  }

  /** The native form's reset (controls back to their starting values), then prompts cleared. */
  reset() {
    this.form?.reset()
  }

  /** Every control emptied (text `""`, checkboxes unchosen), then prompts cleared. */
  clear() {
    this.form?.clear()
  }

  /** Every field's value, by name (Fomantic's `get values`). */
  get values(): UIT.FormValues {
    return this.form?.values ?? {}
  }

  /** The `<form>` it works with, if any. */
  get nativeForm(): HTMLFormElement | undefined {
    return untrack(() => this.form?.nativeForm)
  }

  /** The form's component, once it exists. */
  private get form(): UIForm | undefined {
    return this.component as UIForm | undefined
  }
}

/****************
 * ### `UIForm`
 * The component behind `<ui-form>`:  a form's look, `<div class="ui … form" part="form"><slot></slot></div>`,
 * and its VALIDATION, over a NATIVE form.
 *
 * - Why not a form of its own:  a form-associated control belongs to the nearest `<form>` ANCESTOR in its own tree,
 *   so a `<form>` in this shadow root would never own the slotted controls, and a custom element can't BE a form.
 *   - So `<ui-form>` works with a light-DOM `<form>`:  one slotted INSIDE it (`<ui-form><form>…`, preferred),
 *     else the one AROUND it (`<form><ui-form>…`).
 *   - It never creates or moves one:  frameworks own that DOM.
 *   - Without any, it still validates (`validate()`, `validate-on="blur|change"`), but nothing submits.
 *
 * - SIDE EFFECT:  sets `noValidate` on that form while connected (restored after),
 *   so the browser's bubbles don't pre-empt Fomantic's prompts;
 *   constraint validation still counts (see `FormFields.errors()`).
 *
 * - Submit (in the capture phase, on the form):  every field validates.
 *   - Invalid:  `preventDefault()` and `stopImmediatePropagation()` (the page's own submit handlers never see
 *     an invalid form, as natively), the prompts, the `error` state, `ui-failure`,
 *     and focus on the first invalid field (`error-focus`).
 *   - Valid:  the cancelable `ui-success` (cancelled => no native submission).
 *
 * - Prompts:  each field's first control's `<ui-field>` (`:state(field)`) gets `showErrors()`;
 *   failing controls get `aria-invalid="true"` (removed when they pass).
 *   A field that shows an error validates again as it changes, whatever `validate-on` says.
 *
 * - `ui-valid` / `ui-invalid` fire per field validated.
 * - The script API (`values`, `validate()`, `isValid()`, `reset()`, `clear()`) is the DOM element's, `DOMFormElement`.
 *
 * - `prevent-leaving`:  a `beforeunload` guard while the values differ from those at connect, reset or success.
 *
 * - Static server render (`$/ui/static`):  a `<form>` slotted inside it MERGES into the root,
 *   which becomes `<form class="ui … form">` with the author's attributes (`mergedForm`).
 *   That's Fomantic's own markup, so the form's rules reach its fields and messages,
 *   and the page still submits natively.  A form around it stays as it is.
 ****************/
export class UIForm extends E.UIComponent<typeof formVocabulary> {
  @E.proto static vocabulary = formVocabulary
  @E.proto static styleSheets = { form: formCSS }
  @E.proto static elementSetup = { DOMElement: DOMFormElement, delegatesFocus: false } satisfies Partial<E.ElementSetup>

  /** Controls, values, labels, errors. */
  readonly fields = new FormFields({ domElement: this.domElement, form: () => this.nativeForm })

  /** Fields showing an error now. */
  private readonly fieldsShowingErrors = new Set<string>()

  /** Values at connect / reset / success, for `prevent-leaving`. */
  private savedValues = ""

  /** Validation deferred to after the controls settle, by field. */
  private readonly fieldsAwaitingCheck = new Set<string>()

  /**
   * Server render only:  attributes of the author's `<form>` merged into the root, `undefined` when there's none.
   * - SIDE EFFECT:  unwraps that form in the DOM element's light DOM, so its children fill the root's slot.
   */
  private readonly mergedForm = isServer ? UIForm.unwrapForm(this.domElement) : undefined

  ////////////////
  // ## State and classes
  ////////////////

  /** The last submit / `validate()` failed:  `error` shows. */
  @E.state accessor lastCheckFailed = false

  /** `error` after a failed submit, else the attribute. */
  private get shownState(): UIT.FormState | undefined {
    return this.lastCheckFailed ? ERROR : this.state
  }

  /** `:state(error)`:  the state shown is `error`. */
  @E.cssState("error")
  get isError(): boolean {
    return this.shownState === ERROR
  }

  /** `:state(info)`:  the state shown is `info`. */
  @E.cssState("info")
  get isInfo(): boolean {
    return this.shownState === INFO
  }

  /** `:state(success)`:  the state shown is `success`. */
  @E.cssState("success")
  get isSuccess(): boolean {
    return this.shownState === SUCCESS
  }

  /** `:state(warning)`:  the state shown is `warning`. */
  @E.cssState("warning")
  get isWarning(): boolean {
    return this.shownState === WARNING
  }

  /** Waiting (`loading`):  the root is `inert` and `aria-busy`. */
  @E.cssState("loading")
  get isLoading(): boolean {
    return this.loading
  }

  /**
   * `:state(disabled)` while `disabled`:  the root is `inert`.
   * - Not an `isDisabled` override:  that would make the DOM element swallow clicks too.
   */
  @E.cssState("disabled")
  get looksDisabled(): boolean {
    return this.disabled
  }

  /** Always `:state(root)`. */
  @E.cssState("root")
  get isRoot(): boolean {
    return true
  }

  protected classValue(name: E.AttributeName<typeof formVocabulary>): unknown {
    if (name === "state") return this.shownState
    return super.classValue(name)
  }

  /** `stack-with`'s class (`UIT.StackClasses`):  sets the switch its rows stack by. */
  protected get extraClass(): string | undefined {
    return UIT.StackClasses.classFor(this.stackWith)
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    if (this.mergedForm) return this.formRoot(this.mergedForm)
    return (
      <div
        class={this.rootClass}
        part={this.partForName("form")}
        inert={this.disabled || this.loading}
        aria-busy={this.loading ? "true" : undefined}
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
        class={[this.rootClass, authorClass]}
        part={this.partForName("form")}
        inert={this.disabled || this.loading}
        aria-busy={this.loading ? "true" : undefined}
      >
        <slot />
      </form>
    )
  }

  ////////////////
  // ## The native form
  ////////////////

  /** The native form it works with (`findForm()`). */
  @E.state accessor nativeForm: HTMLFormElement | undefined = undefined

  /**
   * Adds the form discovery, and the DOM element's own listeners, while connected.
   * - Stays an explicit effect:  it watches the DOM (a `MutationObserver`) while connected.
   */
  onMount() {
    createEffect(
      () => this.isConnected,
      (connected) => {
        if (!connected || isServer) return
        const observer = new MutationObserver(() => this.findForm())
        observer.observe(this.domElement, { childList: true, subtree: true })
        this.findForm()
        const { domElement } = this
        for (const type of CHANGE_EVENTS) domElement.addEventListener(type, this.onChange)
        domElement.addEventListener("focusout", this.onFocusOut)
        window.addEventListener("beforeunload", this.onBeforeUnload)
        queueMicrotask(() => this.saveValues())
        return () => {
          this.nativeForm = undefined
          observer.disconnect()
          for (const type of CHANGE_EVENTS) domElement.removeEventListener(type, this.onChange)
          domElement.removeEventListener("focusout", this.onFocusOut)
          window.removeEventListener("beforeunload", this.onBeforeUnload)
        }
      }
    )
    return super.onMount()
  }

  /** The native form:  one inside, else the one around. */
  private findForm() {
    const form = this.domElement.querySelector("form") ?? this.domElement.parentElement?.closest("form") ?? undefined
    if (form !== untrack(() => this.nativeForm)) this.nativeForm = form
  }

  /** A native form to work with:  `noValidate` on, its submit and reset listened to;  all undone when it goes. */
  @E.onChange("nativeForm")
  protected onNativeFormChanged(form: HTMLFormElement | undefined) {
    if (!form) return undefined
    const noValidate = form.noValidate
    form.noValidate = true
    form.addEventListener("submit", this.onSubmit, { capture: true })
    form.addEventListener("reset", this.onReset)
    return () => {
      form.noValidate = noValidate
      form.removeEventListener("submit", this.onSubmit, { capture: true })
      form.removeEventListener("reset", this.onReset)
    }
  }

  ////////////////
  // ## Script API (the DOM element's:  `DOMFormElement`)
  ////////////////

  /** Validate every field, show the results;  true when all pass. */
  validate(): boolean {
    return !Object.keys(this.validateAll()).length
  }

  /** Validate and show every field, set the failed state;  errors by field. */
  private validateAll(): Record<string, string[]> {
    const errors = this.check("show")
    this.lastCheckFailed = !!Object.keys(errors).length
    return errors
  }

  /** Would every field pass?  Shows nothing. */
  isValid(): boolean {
    return !Object.keys(this.check("silently")).length
  }

  /** The native reset, then prompts and states cleared. */
  reset() {
    const form = untrack(() => this.nativeForm)
    if (form) form.reset()
    else for (const control of this.fields.controls()) UIForm.resetControl(control)
    this.clearErrors()
  }

  /** Every control emptied, prompts and states cleared. */
  clear() {
    for (const control of this.fields.controls()) UIForm.clearControl(control)
    this.clearErrors()
  }

  /** Every field's value, by name;  read from the DOM, untracked. */
  get values(): UIT.FormValues {
    return this.fields.values()
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
    const rules = this.formRules
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
    const messages = this.fields.errors({ field, rules: this.formRules, values, labels })
    this.show({ field, messages, values })
    if (!this.fieldsShowingErrors.size && this.lastCheckFailed) this.lastCheckFailed = false
  }

  /** Show `messages` for a field (or clear it), and dispatch `ui-valid` / `ui-invalid`. */
  private show({ field: { identifier, controls }, messages, values }: ShownField) {
    UIForm.fieldElementFor(controls)?.showErrors?.(messages)
    for (const control of controls) {
      if (messages.length) control.setAttribute("aria-invalid", "true")
      else if (control.getAttribute("aria-invalid") === "true") control.removeAttribute("aria-invalid")
    }
    if (messages.length) this.fieldsShowingErrors.add(identifier)
    else this.fieldsShowingErrors.delete(identifier)
    const value = values[identifier]
    if (messages.length) {
      const detail: UIT.FormInvalidDetail = { field: identifier, value, errors: messages, values }
      this.send("ui-invalid", detail)
    } else {
      const detail: UIT.FormValidDetail = { field: identifier, value, values }
      this.send("ui-valid", detail)
    }
  }

  /** Forget every prompt, `aria-invalid` and the failed state. */
  private clearErrors() {
    for (const identifier of this.fieldsShowingErrors) {
      const field = this.fields.field(identifier)
      if (!field) continue
      UIForm.fieldElementFor(field.controls)?.showErrors?.([])
      for (const control of field.controls) control.removeAttribute("aria-invalid")
    }
    this.fieldsShowingErrors.clear()
    this.lastCheckFailed = false
    queueMicrotask(() => this.saveValues())
  }

  /** The `rules` property, as an object;  fresh, so a `validate()` right after `el.rules = …` sees the new rules. */
  private get formRules(): UIT.FormRules | undefined {
    const { rules } = this
    return rules && typeof rules === "object" && !Array.isArray(rules) ? (rules as UIT.FormRules) : undefined
  }

  /** Validate `identifier` once the controls have settled (their value and validity land on a microtask). */
  private checkFieldSoon(identifier: string) {
    if (this.fieldsAwaitingCheck.has(identifier)) return
    this.fieldsAwaitingCheck.add(identifier)
    setTimeout(() => {
      this.fieldsAwaitingCheck.delete(identifier)
      this.checkField(identifier)
    })
  }

  /** Remember the values now. */
  private saveValues() {
    this.savedValues = JSON.stringify(this.values)
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
      const detail: UIT.FormFailureDetail = { values: this.values, errors, originalEvent: event }
      this.send("ui-failure", detail)
      if (untrack(() => this.errorFocus)) this.focusFirst(Object.keys(errors))
      return
    }
    const detail: UIT.FormSuccessDetail = { values: this.values, originalEvent: event }
    if (!this.send("ui-success", detail)) event.preventDefault()
    else this.saveValues()
  }

  /** Native reset:  prompts go once the controls have reset. */
  private readonly onReset = () => {
    queueMicrotask(() => this.clearErrors())
  }

  /** A control changed:  validate it for `validate-on="change"`, or while it shows an error. */
  private readonly onChange = (event: Event) => {
    const identifier = this.identifierFor(event)
    if (!identifier) return
    if (this.fieldsShowingErrors.has(identifier) || untrack(() => this.validateOn) === "change")
      this.checkFieldSoon(identifier)
  }

  /** A control lost focus:  validate it for `validate-on="blur"`. */
  private readonly onFocusOut = (event: FocusEvent) => {
    if (untrack(() => this.validateOn) !== "blur") return
    const identifier = this.identifierFor(event)
    if (identifier) this.checkFieldSoon(identifier)
  }

  /** `prevent-leaving`:  ask while the values changed. */
  private readonly onBeforeUnload = (event: BeforeUnloadEvent) => {
    if (!untrack(() => this.preventLeaving)) return
    if (JSON.stringify(this.values) === this.savedValues) return
    event.preventDefault()
  }

  /**
   * Field identifier of the control an event came from:  the first control at or above its `target`.
   * - `target` is already retargeted to the form's tree:  typing into a `<ui-input>` gives the `<ui-input>`.
   */
  private identifierFor(event: Event): string | undefined {
    const fields = this.fields.fields()
    for (let node = event.target as Element | null; node && node !== this.domElement; node = node.parentElement) {
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
   * Server render:  the author's `<form>`, when it is the DOM element's only element child,
   * unwrapped (its children take its place);  returns its attributes, else `undefined`.
   * - STATIC:  it runs from a field initializer, before the instance is ready, and needs only the DOM element.
   */
  private static unwrapForm(domElement: Element): Record<string, string> | undefined {
    const [form, ...others] = domElement.children
    if (!form || others.length || form.localName !== "form") return undefined
    const attributes = Object.fromEntries([...form.attributes].map(({ name, value }) => [name, value]))
    form.replaceWith(...form.childNodes)
    return attributes
  }

  /**
   * The `<ui-field>` of a field's first control, if any:  where its prompt shows.
   * - STATIC:  pure, reads only the controls.
   */
  private static fieldElementFor(controls: readonly Element[]): DOMFieldElement | undefined {
    return (controls[0]?.closest(FIELD_SELECTOR) as DOMFieldElement | null) ?? undefined
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
    } else (control as { component?: { formReset?(): void } }).component?.formReset?.()
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
      const element = control as unknown as { value: unknown }
      element.value = Array.isArray(element.value) ? [] : ""
    }
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UIForm extends E.AttributeValues<typeof formVocabulary> {}

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
