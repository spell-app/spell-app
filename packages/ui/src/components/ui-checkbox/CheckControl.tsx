import { createEffect, untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E, UI, UIT } from "$/ui/core"
import { F } from "$/ui/forms"
import { CheckboxFallback } from "./ui-checkbox.fallback"
import { CheckHost } from "./CheckHost"
import { CHECKBOX, CHECKED, type CheckValues, type CheckVocabulary, type CommonAttributes } from "./ui-checkbox.types"

import checkboxCSS from "./ui-checkbox.css?inline"

/****************
 * ### `CheckControl`
 * Controller base of `<ui-checkbox>` and `<ui-radio>`:  Fomantic's markup -- a native `<input>` (invisible, over the
 * box) and a `<label for>` that draws the box and holds the text -- with the chosen state, value and validity on
 * the HOST.
 * - `selected` is auto-controlled (`isSelected`):  the input's `change` dispatches `ui-change` first;  a handler that
 *   re-sets `el.selected` wins (the input shows the host's state again).  `checked` is its alias:  the host property
 *   (`CheckHost`) and the `checked` ATTRIBUTE, which selects it like markup selects a native checkbox.
 * - Form value:  `chosenValue` while chosen -- `value`, else the class's `defaultChosenValue` (`on`) -- and
 *   `unchosenValue` otherwise (`<ui-checkbox>`'s `off-value`;  none:  nothing);  reset restores the starting state.
 *   - A subclass changes both for every element it defines:  `@E.proto static defaultChosenValue = "open"`
 *     (`defaultUnchosenValue` on `UICheckbox`).
 *   - `required` reads the chosen state only:  an off-value never counts as chosen.
 * - Role comes from the input (checkbox / radio;  `switch` for toggles and sliders), its name from the slotted
 *   label -- else from the host's `<label for>` / `aria-label` (`ControlLabels`), for a `fitted` box.
 * - A click aimed at the HOST (its `<label for>`, `host.click()`) clicks the input.
 * - `readonly`:  clicks are cancelled, so the state never changes;  still submitted.
 * - `:state(invalid)` only after interaction, as `TextControl`.
 ****************/
export abstract class CheckControl<V extends CheckVocabulary = CheckVocabulary>
  extends F.FormElement<V>
  implements CheckValues
{
  /**
   * Submitted while chosen, when the element has no `value`.
   * - `@proto`:  a subclass sets its own for every element it defines.
   */
  declare readonly defaultChosenValue: string

  @E.proto static elementSetup: Partial<E.ElementSetup> = { Fallback: CheckboxFallback, Host: CheckHost }
  @E.proto static styleSheets = { checkbox: checkboxCSS }

  /** Default:  `on`, as a native checkbox. */
  @E.proto static defaultChosenValue = UIT.CHECKBOX_DEFAULT_VALUE

  /** How a form reads it. */
  abstract readonly checkable: "checkbox" | "radio"

  constructor(...args: ConstructorParameters<typeof F.FormElement>) {
    super(...args)
    this.host.addEventListener(CLICK, this.onHostClick)
    this.host.addEventListener(INVALID, this.onInvalid)
    // `checked` in markup selects, a microtask later:  outside the component body, where the host write may notify
    if (this.wasInitiallySelected && !untrack(() => this.selectedProperty)) {
      queueMicrotask(() => (this.isSelected = true))
    }
  }

  ////////////////
  // ## Chosen
  ////////////////

  /**
   * Chosen now?  Tracked;  a write chooses / unchooses it without an event.
   * - The host's `selected` (`selectedProperty`).  Server render:  `checked` in markup counts at once (a browser
   *   applies it a microtask late, and a server host has no property to write).
   */
  @E.cssState("selected")
  get isSelected(): boolean {
    return this.selectedProperty || (isServer && this.wasInitiallySelected)
  }

  set isSelected(selected: boolean) {
    this.selectedProperty = selected
  }

  /** The host's `selected` property (a boolean is always the host's);  a write goes to it. */
  @E.controlled("selected") private accessor selectedProperty = false

  /** Chosen at first, for form reset:  `selected` or `checked` in markup. */
  private readonly wasInitiallySelected = untrack(() => this.selectedProperty || this.attributes[CHECKED] !== null)

  /** Neither on nor off?  Checkbox only;  tracked. */
  protected get isIndeterminate(): boolean {
    return false
  }

  /** The input shows the chosen state (once rendered). */
  @E.onChange("isSelected", "isReady", "isIndeterminate")
  protected onSelectedChanged(isSelected: boolean, _isReady: boolean, isIndeterminate: boolean) {
    if (!this.control) return
    this.control.checked = isSelected
    this.control.indeterminate = isIndeterminate
  }

  /**
   * A transition to `selected` someone made (a click, a key):  `ui-change`, then the host property, unless a handler
   * re-set it.
   * - `detail.value`:  what it stands for after the change -- `chosenValue`, or once unchosen, `unchosenValue` when
   *   there is one.
   * - Returns true when applied.
   */
  choose(selected: boolean, originalEvent?: Event): boolean {
    this.isTouched = true
    const value = (selected ? undefined : this.unchosenValue) ?? this.chosenValue
    // `E.Reactive`'s own:  `requestChange()` names public members only, and `selectedProperty` is private
    const applied = E.Reactive.requestChange(this, "selectedProperty", selected, () =>
      this.send("ui-change" as never, { selected, value, originalEvent })
    )
    if (!applied) queueMicrotask(() => this.control && (this.control.checked = untrack(() => this.isSelected)))
    this.onChosen(applied)
    return applied
  }

  /** After a transition someone made;  checkbox clears `indeterminate`. */
  protected onChosen(_applied: boolean) {}

  /** Adds the `checked` attribute alias:  a LATER edit of it selects (the first is `wasInitiallySelected`'s). */
  onMount() {
    createEffect(
      () => this.attributes[CHECKED],
      (checked) => {
        this.isSelected = checked !== null
      },
      { defer: true }
    )
    return super.onMount()
  }

  ////////////////
  // ## Values
  ////////////////

  /** Submitted while chosen:  `value`, else the class's `defaultChosenValue`;  tracked. */
  get chosenValue(): string {
    return this.value ?? this.defaultChosenValue
  }

  /** Submitted while unchosen;  none ~== nothing (a radio:  always none, its group submits).  Tracked. */
  get unchosenValue(): string | undefined {
    return undefined
  }

  ////////////////
  // ## Disabled
  ////////////////

  /** Can't be used now:  `disabled`, or a disabled fieldset / form;  tracked. */
  @E.cssState("disabled")
  get isDisabled(): boolean {
    return this.disabled || this.formIsDisabled
  }

  protected classValue(name: E.AttributeName<V>): unknown {
    if (name === "disabled") return this.isDisabled
    return super.classValue(name)
  }

  ////////////////
  // ## Label
  ////////////////

  /** Light-DOM slot occupancy:  label text. */
  readonly slots = new E.SlotContent(this.host)

  /** Host `<label>`s and `aria-label`, as the input's name when there's no text. */
  readonly labels = new F.ControlLabels(this.formHost)

  /** Has label text (slot or shorthand)? */
  protected get hasLabelText(): boolean {
    return this.slots.hasContent("") || !!this.label
  }

  /** Connected:  read the host's `<label>`s again. */
  @E.onChange("isConnected")
  protected onConnectedChanged(isConnected: boolean) {
    if (isConnected) this.labels.refresh()
  }

  ////////////////
  // ## Form
  ////////////////

  /** `chosenValue` while chosen, else `unchosenValue`. */
  get formValue(): E.FieldValue {
    return this.isSelected ? this.chosenValue : this.unchosenValue
  }

  /** The chosen state only:  an off-value never satisfies `required`. */
  protected get validationValue(): E.FieldValue {
    return this.isSelected ? this.chosenValue : undefined
  }

  protected get formName(): string | undefined {
    return this.name
  }

  onFormReset() {
    this.isSelected = this.wasInitiallySelected
    this.isTouched = false
  }

  protected get validationLabel(): string | undefined {
    return this.label ?? (this.host.textContent?.trim() || undefined) ?? this.labels.accessibleName ?? this.name
  }

  protected get validationAnchor(): HTMLElement | undefined {
    return this.control
  }

  /** Someone has interacted with it:  only then does it show `:state(invalid)`. */
  @E.state accessor isTouched = false

  protected shouldShowInvalid(result: E.ValidationResult): boolean {
    return !result.valid && this.isTouched
  }

  /** A submit or `reportValidity()` found it invalid:  show it. */
  private readonly onInvalid = () => {
    this.isTouched = true
  }

  ////////////////
  // ## The input
  ////////////////

  /** The native input. */
  protected control?: HTMLInputElement

  /** Id tying the `<label>` to the input. */
  protected inputId = ""

  /** Input `type`. */
  protected abstract get inputType(): "checkbox" | "radio"

  /** The input's tab stop:  `0`, or `-1` for a radio that isn't its group's tab stop. */
  protected get inputTabIndex(): number {
    return 0
  }

  /** `role` override for the input (`switch`);  default the input's own. */
  protected get inputRole(): string | undefined {
    return undefined
  }

  /**
   * Server render only (`$/ui/static`):  what the native input needs to submit without JS -- `name`, `value`,
   * `checked` -- and the `STATIC_CONTROL` mark;  `{}` in a browser, where the HOST submits (`ElementInternals`)
   * and an effect sets `checked`.
   * - `value` left out when it's the native default.
   * - No off-value:  a native box can't submit one, and a hidden input of the same name would send both while
   *   chosen (epic `wwod-spell-ui`, J44).
   */
  protected get staticControl(): Record<string, unknown> {
    if (!isServer) return {}
    const value = this.chosenValue
    return {
      [UIT.STATIC_CONTROL]: "",
      name: this.name,
      value: value === UIT.CHECKBOX_DEFAULT_VALUE ? undefined : value,
      checked: this.isSelected
    }
  }

  render(): JSX.Element {
    // server render:  the host's id, so its `<label for>`s label the input (the flattener moves it there)
    this.inputId = (isServer && this.host.id) || UI.ids.next(ID_PREFIX)
    return (
      <div class={this.rootClasses} part={this.partForName("checkbox" as never)}>
        <input
          ref={(element) => (this.control = element)}
          id={this.inputId}
          type={this.inputType}
          part={this.partForName("control" as never)}
          role={this.inputRole as never}
          tabindex={this.inputTabIndex}
          disabled={this.isDisabled}
          required={this.required}
          aria-readonly={this.readonly && this.inputType === CHECKBOX ? "true" : undefined}
          aria-label={this.hasLabelText ? undefined : this.labels.accessibleName}
          aria-invalid={this.isTouched && !this.validation.valid ? "true" : undefined}
          {...this.staticControl}
          onClick={this.onClick}
          onChange={this.onChange}
          onKeyDown={(event) => this.onKeyDown(event)}
        />
        <label for={this.inputId} part={this.partForName("label" as never)}>
          <slot>{this.label}</slot>
        </label>
      </div>
    )
  }

  /** `readonly`:  cancel the click, so the input never changes. */
  private readonly onClick = (event: MouseEvent) => {
    if (this.readonly) event.preventDefault()
  }

  /** The input changed:  `ui-change` first, then the state (unless a handler took over). */
  private readonly onChange = (event: Event) => {
    const selected = (event.currentTarget as HTMLInputElement).checked
    this.choose(selected, event)
  }

  /** A key on the input:  arrow keys, for radios;  nothing for a checkbox. */
  protected onKeyDown(_event: KeyboardEvent) {}

  /** A click aimed at the HOST itself clicks the input;  retargeted clicks from inside are left alone. */
  private readonly onHostClick = (event: MouseEvent) => {
    if (event.composedPath()[0] !== this.host || this.isDisabled) return
    this.control?.click()
  }

  /** Focus the input. */
  focus(options?: FocusOptions) {
    this.control?.focus(options)
  }
}

/** The attributes both vocabularies declare:  their getters, typed once for this base (`UIElement`'s doc). */
export interface CheckControl<V extends CheckVocabulary = CheckVocabulary> extends CommonAttributes {}

/** `UI.ids` prefix of the input's id. */
const ID_PREFIX = "ui-checkbox"

/** Clicks aimed at the host. */
const CLICK = "click"

/** A submit or `reportValidity()` found it invalid. */
const INVALID = "invalid"
