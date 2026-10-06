import { createEffect, untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import {
  Cell,
  HostAttribute,
  proto,
  SlotContent,
  UI,
  type AttributeName,
  type FieldValue,
  type StateName,
  type ValidationResult,
  UIT
} from "$/ui/core"
import { ControlLabels, FormElement } from "$/ui/forms"

import { CheckboxFallback } from "./ui-checkbox.fallback"
import { CheckHost } from "./CheckHost"
import { CHECKBOX, CHECKED, CheckVocabulary, CommonAttributes, DEFAULT_VALUE, ID_PREFIX } from "./ui-checkbox.types"

import checkboxCSS from "./ui-checkbox.css?inline"

/****************
 * ### `CheckControl`
 * Controller base of `<ui-checkbox>` and `<ui-radio>`:  Fomantic's markup -- a native `<input>` (invisible, over the
 * box) and a `<label for>` that draws the box and holds the text -- with the chosen state, value and validity on
 * the HOST.
 * - `selected` is auto-controlled:  the input's `change` dispatches `ui-change` first;  a handler that re-sets
 *   `el.selected` wins (the input shows the host's state again).  `checked` is its alias:  the host property
 *   (`CheckHost`) and the `checked` ATTRIBUTE, which selects it like markup selects a native checkbox.
 * - Form value:  `value` (default `on`) while chosen, nothing otherwise;  reset restores the starting state.
 * - Role comes from the input (checkbox / radio;  `switch` for toggles and sliders), its name from the slotted
 *   label -- else from the host's `<label for>` / `aria-label` (`ControlLabels`), for a `fitted` box.
 * - A click aimed at the HOST (its `<label for>`, `host.click()`) clicks the input.
 * - `readonly`:  clicks are cancelled, so the state never changes;  still submitted.
 * - `:state(invalid)` only after interaction, as `TextControl`.
 ****************/
export abstract class CheckControl<V extends CheckVocabulary = CheckVocabulary> extends FormElement<V> {
  @proto static Host = CheckHost
  @proto static styles = { checkbox: checkboxCSS }
  @proto static Fallback = CheckboxFallback

  /** How a form reads it. */
  abstract readonly checkable: "checkbox" | "radio"

  /** `selected`:  the host's property (a boolean is always controlled, see `Controlled`). */
  readonly selectedState = this.controlled("selected" as AttributeName<V>, false as never)

  /** Light-DOM slot occupancy:  label text. */
  readonly slots = new SlotContent(this.host)

  /** Host `<label>`s and `aria-label`, as the input's name when there's no text. */
  readonly labels = new ControlLabels(this.formHost)

  /** User has interacted. */
  readonly touched = new Cell(false)

  /** Host `checked` attribute, the alias. */
  readonly checkedAttribute = new HostAttribute(this.host, CHECKED)

  /** Chosen at first, for form reset:  `selected` or `checked` in markup. */
  private readonly initial: boolean = untrack(() => !!this.common.selected) || this.host.hasAttribute(CHECKED)

  /** The native input. */
  protected control?: HTMLInputElement

  /** Id tying the `<label>` to the input. */
  protected inputId = ""

  constructor(...args: ConstructorParameters<typeof FormElement>) {
    super(...args)
    this.host.addEventListener("click", this.onHostClick)
    this.host.addEventListener("invalid", this.onInvalid)
    if (this.initial && !untrack(() => this.common.selected)) queueMicrotask(() => this.setSelected(true))
  }

  ////////////////
  // ## State
  ////////////////

  /** The attributes both vocabularies declare, typed once for this base. */
  protected get common(): CommonAttributes {
    return this.attrs as unknown as CommonAttributes
  }

  /**
   * Chosen now?  Tracked.
   * - Server render:  `checked` in markup counts at once (a browser applies it a microtask late).
   */
  isSelected(): boolean {
    return !!this.selectedState.get() || (isServer && this.initial)
  }

  isDisabled(): boolean {
    return this.common.disabled || this.formDisabled.get()
  }

  /** Value submitted while chosen. */
  choiceValue(): string {
    return this.common.value ?? DEFAULT_VALUE
  }

  /** Has label text (slot or shorthand)? */
  protected hasText(): boolean {
    return this.slots.has("") || !!this.common.label
  }

  /** Input `type`. */
  protected abstract inputType(): "checkbox" | "radio"

  /** Tab stop:  `0`, or `-1` for a radio that isn't its group's tab stop. */
  protected tabIndex(): number {
    return 0
  }

  /** `role` override for the input (`switch`);  default the input's own. */
  protected role(): string | undefined {
    return undefined
  }

  /** Write the host's `selected` property (no event), e.g. unchoosing a radio's siblings. */
  setSelected(selected: boolean) {
    this.selectedState.set(selected as never)
  }

  protected classValue(name: AttributeName<V>): unknown {
    if (name === "disabled") return this.isDisabled()
    return super.classValue(name)
  }

  protected hostStates(): Partial<Record<StateName<V>, boolean>> {
    const states = { selected: this.isSelected(), disabled: this.isDisabled() }
    return states as Partial<Record<StateName<V>, boolean>>
  }

  ////////////////
  // ## Form
  ////////////////

  formValue(): FieldValue {
    return this.isSelected() ? this.choiceValue() : null
  }

  protected formName(): string | undefined {
    return this.common.name
  }

  formReset() {
    this.setSelected(this.initial)
    this.touched.set(false)
  }

  protected validationLabel(): string | undefined {
    return this.common.label ?? (this.host.textContent?.trim() || undefined) ?? this.labels.name() ?? this.common.name
  }

  protected validationAnchor(): HTMLElement | undefined {
    return this.control
  }

  protected showsInvalid(result: ValidationResult): boolean {
    return !result.valid && this.touched.get()
  }

  ////////////////
  // ## Rendering
  ////////////////

  /** Adds the input sync (host state => input) and the `checked` attribute alias. */
  mount() {
    createEffect(
      () => [this.isSelected(), this.loaded(), this.indeterminate()] as const,
      ([selected, , indeterminate]) => {
        if (!this.control) return
        this.control.checked = selected
        this.control.indeterminate = indeterminate
      }
    )
    createEffect(
      () => this.checkedAttribute.get(),
      (checked) => this.setSelected(checked !== null),
      { defer: true }
    )
    createEffect(
      () => this.connected.get(),
      (connected) => {
        if (connected) this.labels.refresh()
      }
    )
    return super.mount()
  }

  /** Neither on nor off?  Checkbox only;  tracked. */
  protected indeterminate(): boolean {
    return false
  }

  /**
   * Server render only (`$/ui/static`):  what the native input needs to submit without JS -- `name`, `value`,
   * `checked` -- and the `STATIC_CONTROL` mark;  `{}` in a browser, where the HOST submits (`ElementInternals`)
   * and an effect sets `checked`.
   */
  protected staticControl(): Record<string, unknown> {
    if (!isServer) return {}
    const { name, value } = this.common
    return { [UIT.STATIC_CONTROL]: "", name, value, checked: this.isSelected() }
  }

  render(): JSX.Element {
    // server render:  the host's id, so its `<label for>`s label the input (the flattener moves it there)
    this.inputId = (isServer && this.host.id) || UI.ids.next(ID_PREFIX)
    return (
      <div class={this.classes()} part={this.part("checkbox" as never)}>
        <input
          ref={(element) => (this.control = element)}
          id={this.inputId}
          type={this.inputType()}
          part={this.part("control" as never)}
          role={this.role() as never}
          tabindex={this.tabIndex()}
          disabled={this.isDisabled()}
          required={this.common.required}
          aria-readonly={this.common.readonly && this.inputType() === CHECKBOX ? "true" : undefined}
          aria-label={this.hasText() ? undefined : this.labels.name()}
          aria-invalid={this.touched.get() && !this.validation().valid ? "true" : undefined}
          {...this.staticControl()}
          onClick={this.onClick}
          onChange={this.onChange}
          onKeyDown={this.onKeyDown}
        />
        <label for={this.inputId} part={this.part("label" as never)}>
          <slot>{this.common.label}</slot>
        </label>
      </div>
    )
  }

  ////////////////
  // ## Handlers
  ////////////////

  /** `readonly`:  cancel the click, so the input never changes. */
  private readonly onClick = (event: MouseEvent) => {
    if (this.common.readonly) event.preventDefault()
  }

  /** The input changed:  `ui-change` first, then the state (unless a handler took over). */
  private readonly onChange = (event: Event) => {
    const selected = (event.currentTarget as HTMLInputElement).checked
    this.choose(selected, event)
  }

  /** Arrow keys, for radios;  nothing for a checkbox. */
  protected readonly onKeyDown = (event: KeyboardEvent) => {
    this.keyDown(event)
  }

  /** Key handling hook. */
  protected keyDown(_event: KeyboardEvent) {}

  /**
   * A user transition to `selected`:  `ui-change`, then the host property, unless a handler re-set it.
   * - Returns true when applied.
   */
  choose(selected: boolean, originalEvent?: Event): boolean {
    this.touched.set(true)
    const value = this.choiceValue()
    const applied = this.selectedState.request(selected as never, () =>
      this.emit("ui-change" as never, { selected, value, originalEvent })
    )
    if (!applied) queueMicrotask(() => this.control && (this.control.checked = untrack(() => this.isSelected())))
    this.chosen(applied)
    return applied
  }

  /** After a user transition;  checkbox clears `indeterminate`. */
  protected chosen(_applied: boolean) {}

  /** A submit or `reportValidity()` found it invalid:  show it. */
  private readonly onInvalid = () => {
    this.touched.set(true)
  }

  /** A click aimed at the HOST itself clicks the input;  retargeted clicks from inside are left alone. */
  private readonly onHostClick = (event: MouseEvent) => {
    if (event.composedPath()[0] !== this.host || this.isDisabled()) return
    this.control?.click()
  }

  /** Focus the input. */
  focus(options?: FocusOptions) {
    this.control?.focus(options)
  }
}
