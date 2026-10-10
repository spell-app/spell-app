import { isServer, type JSX } from "@solidjs/web"

import { E, UI, UIT } from "$/ui/core"
import { F } from "$/ui/forms"
import { CheckboxFallback } from "./UICheckbox.fallback"
import { type CheckVocabulary, type CommonAttributes } from "./UICheckbox.types"

import checkboxCSS from "./UICheckbox.css?inline"

/****************
 * ### `DOMCheckElement`
 * The DOM element of `<ui-checkbox>` and `<ui-radio>`:  a form control's DOM element (`DOMFormControl`),
 * plus `checked` as another name for `selected`.
 *
 * - `selected` is the word for "chosen" on every `ui-*` element;  checkbox and radio also accept `checked`.
 * - `checked` is a property here, not a vocabulary attribute:  `el.checked = true` sets `el.selected`.
 *   The `checked` ATTRIBUTE in markup is read by the component, as a native checkbox reads its own.
 * - `checkable` tells `<ui-form>` how to read the value (`"checkbox"` / `"radio"`) without importing this family;
 *   `chosenValue` / `unchosenValue` what it submits, with the class defaults no attribute shows.
 * - `DOMElement` refuses a member named like an attribute's property:  none of these names is one.
 * - Above the component:  its `elementSetup` reads this class while the component is defined.
 ****************/
export class DOMCheckElement extends F.DOMFormControl<CheckControl> {
  /** Another name for `selected`. */
  get checked(): boolean {
    return !!(this as unknown as { selected?: boolean }).selected
  }

  set checked(value: boolean) {
    ;(this as unknown as { selected?: boolean }).selected = value
  }

  /** How a form reads it:  `"radio"` for `<ui-radio>`, else `"checkbox"`. */
  get checkable(): CheckControl["checkable"] {
    return this.component?.checkable ?? "checkbox"
  }

  /** Submitted while chosen:  `value`, else its class's `defaultChosenValue`;  none before its component exists. */
  get chosenValue(): string | undefined {
    return this.component?.chosenValue
  }

  /** Submitted while unchosen:  `off-value`, else its class's `defaultUnchosenValue`;  none ~== nothing. */
  get unchosenValue(): string | undefined {
    return this.component?.unchosenValue
  }
}

/****************
 * ### `CheckControl`
 * The base component of `<ui-checkbox>` and `<ui-radio>`, in Fomantic's markup:
 * a native `<input>` (invisible, over the box) and a `<label for>` that draws the box and holds the text.
 * The chosen state, value and validity belong to the DOM element.
 *
 * - `selected` is controlled (`isSelected`):  the input's `change` sends `ui-change` first;
 *   a handler that sets `el.selected` again wins (the input shows that state).
 *   - `checked` is another name for it:  the DOM element's property (`DOMCheckElement`),
 *     and the `checked` ATTRIBUTE, which selects it as markup selects a native checkbox.
 *
 * - The form value:  `chosenValue` while chosen (`value`, else the class's `defaultChosenValue`, `on`),
 *   and `unchosenValue` otherwise (`<ui-checkbox>`'s `off-value`;  none:  nothing).
 *   - A form reset restores the starting state.
 *   - A subclass changes both for every element it defines:
 *     `@E.proto static defaultChosenValue = "open"` (`defaultUnchosenValue` on `UICheckbox`).
 *   - `required` reads the chosen state only:  an off-value never counts as chosen.
 *
 * - Its role comes from the input (checkbox / radio;  `switch` for toggles and sliders).
 *   Its name comes from the slotted label, else (for a `fitted` box)
 *   from the DOM element's `<label for>` / `aria-label` (`ControlLabels`).
 * - A click aimed at the DOM element itself (its `<label for>`, its `click()`) clicks the input.
 * - `readonly`:  clicks are cancelled, so the state never changes;  it's still submitted.
 * - `:state(invalid)` shows only after interaction, as in `TextControl`.
 ****************/
export abstract class CheckControl<V extends CheckVocabulary = CheckVocabulary> extends F.FormComponent<V> {
  /**
   * Submitted while chosen, when the element has no `value`.
   * - `@proto`:  a subclass sets its own for every element it defines.
   */
  declare readonly defaultChosenValue: string

  @E.protoMerged static elementSetup: Partial<E.ElementSetup> = {
    styleSheets: { checkbox: checkboxCSS },
    Fallback: CheckboxFallback,
    DOMElement: DOMCheckElement
  }

  /** Default:  `on`, as a native checkbox. */
  @E.proto static defaultChosenValue = "on"

  /** Shows `:state(invalid)` only after interaction, as in `TextControl`. */
  @E.proto static invalidShows: E.InvalidTiming = "once touched"

  /** How a form reads it. */
  abstract readonly checkable: "checkbox" | "radio"

  constructor(...args: ConstructorParameters<typeof F.FormComponent>) {
    super(...args)
    // `checked` in markup selects, a microtask later:
    // outside the component's body, where the write to the DOM element may notify
    if (this.wasInitiallySelected && !this.selectedProperty) {
      E.afterSolidUpdate(() => (this.isSelected = true))
    }
  }

  ////////////////
  // ## Chosen
  ////////////////

  /**
   * Chosen now?  Tracked;  a write chooses / unchooses it without an event.
   * - The DOM element's `selected` (`selectedProperty`).
   * - In a server render, `checked` in markup counts at once:
   *   a browser applies it a microtask late, and a server's DOM element has no property to write.
   */
  @E.cssState("selected")
  get isSelected(): boolean {
    return this.selectedProperty || (isServer && this.wasInitiallySelected)
  }

  set isSelected(selected: boolean) {
    this.selectedProperty = selected
  }

  /** The DOM element's `selected` property (a boolean is always the DOM element's);  a write goes to it. */
  @E.controlled("selected") private accessor selectedProperty = false

  /** Chosen at first, for form reset:  `selected` or `checked` in markup. */
  private readonly wasInitiallySelected = this.selectedProperty || this.attributes["checked"] !== null

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
   * Someone chose or unchose it (a click, a key):
   * send `ui-change`, then set the DOM element's property, unless a handler set it first.
   * - `detail.value`:  what it stands for after the change:
   *   `chosenValue`, or once unchosen, `unchosenValue` when there is one.
   * - Returns true when applied.
   */
  choose(selected: boolean, originalEvent?: Event): boolean {
    this.isTouched = true
    const value = (selected ? undefined : this.unchosenValue) ?? this.chosenValue
    // `E.Reactive`'s own:  `requestChange()` names public members only, and `selectedProperty` is private
    const applied = E.Reactive.requestChange(this, "selectedProperty", selected, () =>
      this.send("ui-change" as never, { selected, value, originalEvent })
    )
    if (!applied) E.afterSolidUpdate(() => this.control && (this.control.checked = this.isSelected))
    this.onChosen(applied)
    return applied
  }

  /** After a transition someone made;  checkbox clears `indeterminate`. */
  protected onChosen(_applied: boolean) {}

  /** The `checked` attribute alias:  a LATER edit of it selects (the first is `wasInitiallySelected`'s). */
  @E.onChange("checkedAttribute", { defer: true })
  protected onCheckedAttributeChanged(checked: string | null) {
    this.isSelected = checked !== null
  }

  /** The `checked` attribute's text (`null`:  absent):  a member, so `@E.onChange` can follow it. */
  protected get checkedAttribute(): string | null {
    return this.attributes["checked"]
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
  // ## Label
  ////////////////

  /** Which slots have light-DOM children:  the label text. */
  readonly slots = new E.SlotContent(this.domElement)

  /** Has label text (slot or shorthand)?  Else `labels` names the input. */
  protected get hasLabelText(): boolean {
    return this.slots.hasContent("") || !!this.label
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

  onFormReset() {
    this.isSelected = this.wasInitiallySelected
  }

  protected get validationLabel(): string | undefined {
    return this.label ?? (this.domElement.textContent?.trim() || undefined) ?? this.labels.accessibleName ?? this.name
  }

  protected get validationAnchor(): HTMLElement | undefined {
    return this.control
  }

  ////////////////
  // ## The input
  ////////////////

  /** The native input. */
  protected control?: HTMLInputElement

  /** The id tying the `<label>` to the input. */
  protected inputId = ""

  /** The input's `type`. */
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
   * The native input's extra attributes in a server render (`$/ui/static`).
   * - What it needs to submit without script:  `name`, `value`, `checked`;  and the `STATIC_CONTROL` mark.
   * - `{}` in a browser, where the DOM element submits (`ElementInternals`) and an effect sets `checked`.
   * - `value` left out when it's the native default.
   * - No off-value:  a native box can't submit one,
   *   and a hidden input of the same name would send both while chosen (epic `wwod-spell-ui`, J44).
   */
  protected get staticControl(): Record<string, unknown> {
    if (!isServer) return {}
    const value = this.chosenValue
    return {
      [UIT.STATIC_CONTROL]: "",
      name: this.name,
      value: value === "on" ? undefined : value,
      checked: this.isSelected
    }
  }

  render(): JSX.Element {
    // server render:  the DOM element's id, so its `<label for>`s label the input (the flattener moves it there)
    this.inputId = (isServer && this.domElement.id) || UI.ids.next(ID_PREFIX)
    return (
      <div class={this.rootClass} part={this.partForName("checkbox" as never)}>
        <input
          ref={(element) => (this.control = element)}
          id={this.inputId}
          type={this.inputType}
          part={this.partForName("control" as never)}
          role={this.inputRole as never}
          tabindex={this.inputTabIndex}
          disabled={this.isDisabled}
          required={this.required}
          aria-readonly={this.readonly && this.inputType === "checkbox" ? "true" : undefined}
          aria-label={this.hasLabelText ? undefined : this.labels.accessibleName}
          aria-invalid={this.isShownInvalid ? "true" : undefined}
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

  /** A click aimed at the DOM element itself clicks the input. */
  protected activateControl() {
    this.control?.click()
  }

  /** Focus the input. */
  focus(options?: FocusOptions) {
    this.control?.focus(options)
  }
}

/**
 * The attributes both vocabularies declare:  their getters, typed once for this base
 * (see "Attributes" in `UIComponent`).
 */
export interface CheckControl<V extends CheckVocabulary = CheckVocabulary> extends CommonAttributes {}

/** `UI.ids` prefix of the input's id. */
const ID_PREFIX = "ui-checkbox"
