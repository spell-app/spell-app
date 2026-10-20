import { For, Show } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E, UIT } from "$/ui/core"
import { fieldVocabulary } from "./UIField.en"
import { ERROR, INFO, SUCCESS, WARNING } from "./UIForm.types"

import formCSS from "./UIForm.css?inline"
import fieldCSS from "./UIField.css?inline"

/****************
 * ### `DOMFieldElement`
 * The DOM element of `<ui-field>`:  it adds `showErrors()`, which `<ui-form>` calls
 * to show (or, with `[]`, clear) the field's errors and error state.
 *
 * - No attribute is written, so the author's `state` and `error` stay theirs.
 * - `errors`:  the messages `<ui-form>` asked to show.
 * - `DOMElement` checks its members against the attributes' property names;  neither of these is one.
 * - Above the component:  its `elementSetup` reads this class while the component is defined.
 ****************/
export class DOMFieldElement extends E.DOMElement<UIField> {
  /** Show `messages` as the field's errors (and `error` state);  `[]` clears. */
  showErrors(messages: readonly string[]) {
    this.component?.showErrors(messages)
  }

  /** Messages `<ui-form>` asked to show. */
  @E.untracked
  get errors(): readonly string[] {
    return this.component?.formErrors ?? []
  }

  /**
   * The label it shows, `<ui-form>`'s name for it in a message ("Name must have a value"):  its `label`, else what its
   * kind works out (a `<ui-property>`'s from its schema, or its name).
   */
  @E.untracked
  get shownLabel(): string | undefined {
    return this.component?.labelText
  }

  /** The placeholder `<ui-form>` shows in a control while its things disagree (`mixed`), in the page's language. */
  @E.untracked
  get mixedText(): string | undefined {
    return this.component?.translationForKey("mixed")
  }
}

/****************
 * ### `UIField`
 * The component behind `<ui-field>`:  one field of a form.
 * `<div class="… field" part="field">` holds the label row
 * (`.row`:  the label, then actions, the output, and the info icon with its tip),
 * the control (`.control`, the default slot), then the hint and the errors.
 *
 * - The label row is drawn only when it has something:  `label`, actions, `output` or `description`.
 *   - A field that slots its own `<label for>` with its control has no row, and no `.control` either:
 *     its markup is Fomantic's, as it always was (the static render's too).
 *   - `SlotContent` watches the light children for the rich slots.
 * - It names the control:  a slotted control with no `aria-label` or `aria-labelledby` of its own
 *   gets `aria-label` = `label` (a `<label for>` can't reach across the shadow boundary).
 *   A click on the label focuses it.
 * - The tip:  a CSS tooltip under the info icon, shown on hover and keyboard focus;  the icon is described by it.
 *
 * - Errors:  what `<ui-form>` asked for through `showErrors()`, else `error`.
 *   - Shown as plain lines under the control, with `role="alert"`;  either shows the `error` state.
 *   - Failed validation shows `error` over the author's `state`, and clears back to it.
 *
 * - `apply`, `mixed` and `rules` are read by `<ui-form>`'s binding;  the field shows `mixed` as `:state(mixed)`.
 * - `readonly`:  `:state(readonly)`.
 *
 * - The DOM element is `display: contents` (`UIForm.css`):  the root is the flex item of a `<ui-fields>` row,
 *   which hands it its width and gutter as inherited tokens.
 *   - `.control` has no box either (`display: contents`), so the controls lay out as they always did.
 * - It hands its controls inherited owner tokens (`InputOwnerTokens`):  full width, and its state's colours.
 *
 * - `disabled`:  unusable, the base class's way (`elementSetup.disabled`):
 *   the root `inert`, so the slotted controls can't be used, and `aria-disabled`.
 *   - The root also says `inert` itself, for the static render:  the base class's reaches only a browser.
 * - Always carries `:state(field)`, which is how `<ui-form>` finds a control's field.
 * - SIDE EFFECT:  writes `aria-label` on slotted controls (only ones that had no name).
 ****************/
export class UIField extends E.UIComponent<typeof fieldVocabulary> {
  @E.proto static vocabulary = fieldVocabulary
  // `Partial`:  the property (`UIProperty`) and the editor (`UIPropertyEditor`) extend it
  @E.protoMerged static elementSetup: Partial<E.ElementSetup> = {
    styleSheets: { form: formCSS, field: fieldCSS },
    DOMElement: DOMFieldElement,
    delegatesFocus: false
  } satisfies Partial<E.ElementSetup>

  ////////////////
  // ## The label row
  ////////////////

  /** Light-DOM slot occupancy:  label, description, hint, output, actions. */
  readonly slots = new E.SlotContent(this.domElement)

  /** The label the row shows:  `label`;  a subclass may find another (a property's, from its schema). */
  get labelText(): string | undefined {
    return this.label
  }

  /** The tip the row shows:  `description`;  a subclass may find another. */
  get descriptionText(): string | undefined {
    return this.description
  }

  /** Has a label in the row:  `labelText`, or `slot="label"`. */
  get hasLabel(): boolean {
    return !!this.labelText || this.slots.hasContent(this.slotForName("label"))
  }

  /** Has actions (`slot="actions"`). */
  get hasActions(): boolean {
    return this.slots.hasContent(this.slotForName("actions"))
  }

  /** Has an output:  `output`, or `slot="output"`. */
  get hasOutput(): boolean {
    return !!this.output || this.slots.hasContent(this.slotForName("output"))
  }

  /** Has a tip:  `description`, or `slot="description"`. */
  get hasDescription(): boolean {
    return !!this.descriptionText || this.slots.hasContent(this.slotForName("description"))
  }

  /** Has a hint:  `hint`, or `slot="hint"`. */
  get hasHint(): boolean {
    return !!this.hint || this.slots.hasContent(this.slotForName("hint"))
  }

  /** Draws the label row:  it has something in it. */
  get hasRow(): boolean {
    return this.hasLabel || this.hasActions || this.hasOutput || this.hasDescription
  }

  /** Glyph of the info icon, while there's a tip. */
  readonly infoGlyph = new E.IconGlyph({ owner: this, name: () => (this.hasDescription ? INFO_ICON : undefined) })

  ////////////////
  // ## Errors
  ////////////////

  /** Messages `<ui-form>` asked to show;  `DOMFieldElement.errors` reads them untracked. */
  @E.state accessor formErrors: readonly string[] = []

  /** Error lines shown:  `<ui-form>`'s, else `error`. */
  get errors(): readonly string[] {
    const fromForm = this.formErrors
    if (fromForm.length) return fromForm
    return this.error ? [this.error] : []
  }

  /** Show `messages` (see `DOMFieldElement`). */
  @E.untracked
  showErrors(messages: readonly string[]) {
    const current = this.formErrors
    if (current.length !== messages.length || current.some((message, index) => message !== messages[index])) {
      this.formErrors = [...messages]
    }
  }

  ////////////////
  // ## State and classes
  ////////////////

  /** The state shown:  `error` while there's an error, else the attribute. */
  get shownState(): UIT.FormState | undefined {
    return this.errors.length ? ERROR : this.state
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

  /** `:state(mixed)`:  the things being edited disagree (`mixed`). */
  @E.cssState("mixed")
  get isMixed(): boolean {
    return !!this.mixed
  }

  /** `:state(readonly)`:  `readonly`. */
  @E.cssState("readonly")
  get isReadOnly(): boolean {
    return !!this.readonly
  }

  /** Always `:state(field)`:  how `<ui-form>` finds a control's field. */
  @E.cssState("field")
  get isField(): boolean {
    return true
  }

  protected classValue(name: E.AttributeName<typeof fieldVocabulary>): unknown {
    if (name === "state") return this.shownState
    return super.classValue(name)
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    return (
      <div class={this.rootClass} part={this.partForName("field")} inert={this.disabled}>
        <Show when={this.hasRow} fallback={this.controlSlotElement()}>
          {this.labelRow()}
          <div class={CLASSES.control} part={this.partForName("control")}>
            {this.controlSlotElement()}
          </div>
        </Show>
        <Show when={this.hasHint}>
          <div class={CLASSES.hint} part={this.partForName("hint")}>
            <slot name={this.slotForName("hint")}>{this.hint}</slot>
          </div>
        </Show>
        <Show when={this.errors.length}>
          <div class={CLASSES.error} part={this.partForName("error")} role="alert">
            <For each={this.errors}>{(message) => <div class={UIT.MESSAGE}>{message}</div>}</For>
          </div>
        </Show>
      </div>
    )
  }

  /** The label row:  the label, then (at its far end) actions, the output and the info icon with its tip. */
  private labelRow(): JSX.Element {
    return (
      <div class={CLASSES.row} part={this.partForName("row")}>
        <span class={CLASSES.label} part={this.partForName("label")} onClick={this.onLabelClick}>
          <slot name={this.slotForName("label")}>{this.labelText}</slot>
        </span>
        <Show when={this.hasActions}>
          <span class={CLASSES.actions} part={this.partForName("actions")}>
            <slot name={this.slotForName("actions")} />
          </span>
        </Show>
        <Show when={this.hasOutput}>
          <span class={CLASSES.output} part={this.partForName("output")}>
            <slot name={this.slotForName("output")}>{this.output}</slot>
          </span>
        </Show>
        <Show when={this.hasDescription}>
          <span
            class={CLASSES.info}
            part={this.partForName("info")}
            tabindex="0"
            role="img"
            aria-label={this.translationForKey("info", { label: this.labelText ?? "" })}
            aria-describedby={TIP_ID}
          >
            {this.infoGlyph.svg}
            <span id={TIP_ID} class={CLASSES.tip} part={this.partForName("tip")} role="tooltip">
              <slot name={this.slotForName("description")}>{this.descriptionText}</slot>
            </span>
          </span>
        </Show>
      </div>
    )
  }

  ////////////////
  // ## The control
  ////////////////

  /** The default slot, holding the control(s). */
  private controlSlot?: HTMLSlotElement

  /**
   * The default slot:  in `.control` under a label row, else straight in the field's box.
   * - Straight in the box for a field with no row (one that slots its own `<label>`):
   *   its markup, and the static render's, stay Fomantic's (`.field > label`).
   */
  private controlSlotElement(): JSX.Element {
    return <slot ref={(element) => (this.controlSlot = element)} onSlotChange={this.onControlChange} />
  }

  /** Controls this field named (`aria-label`), so a new `label` renames them and nothing else. */
  private readonly named = new WeakSet<Element>()

  /** A new `label`, once drawn:  rename the controls this field named. */
  @E.onChange("labelText", "isReady")
  protected onLabelChanged(label: string | undefined, isReady: boolean) {
    if (isReady) this.nameControls(label)
  }

  /** The slotted controls changed:  name the new ones. */
  @E.untracked
  private readonly onControlChange = () => {
    this.nameControls(this.labelText)
  }

  /**
   * Give each slotted control without a name of its own `aria-label` = `label`.
   * - A slotted `<label>` is skipped:  it names its control itself.
   * - SIDE EFFECT:  writes the controls' `aria-label`;  only ones this field named before are renamed or cleared.
   */
  private nameControls(label: string | undefined) {
    for (const control of this.controlSlot?.assignedElements() ?? []) {
      if (control.localName === "label") continue
      const hasOwnName = NAMED_ATTRIBUTES.some((name) => control.hasAttribute(name)) && !this.named.has(control)
      if (hasOwnName) continue
      if (label) {
        control.setAttribute("aria-label", label)
        this.named.add(control)
      } else if (this.named.has(control)) {
        control.removeAttribute("aria-label")
        this.named.delete(control)
      }
    }
  }

  /** A click on the label focuses the first control, as a `<label for>` would. */
  private readonly onLabelClick = () => {
    const control = this.controlSlot?.assignedElements().find((element) => element.localName !== "label")
    ;(control as HTMLElement | undefined)?.focus()
  }
}

/** The vocabulary getters, typed (`UIComponent`'s doc). */
export interface UIField extends E.AttributeValues<typeof fieldVocabulary> {}

/** Icon of the tip. */
const INFO_ICON = "circle info"

/** Shadow-root id of the tip, which the info icon is described by. */
const TIP_ID = "tip"

/** A control with one of these has a name of its own:  the field doesn't name it. */
const NAMED_ATTRIBUTES = ["aria-label", "aria-labelledby"] as const

/** Shadow classes, one per part (the vocabulary's part names). */
const CLASSES = {
  row: "row",
  label: "label",
  actions: "actions",
  output: "output",
  info: "info",
  tip: "tip",
  control: "control",
  hint: "hint",
  error: "error prompt"
} as const
