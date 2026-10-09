import { For, Show, createEffect, createMemo, untrack } from "solid-js"
import type { JSX } from "@solidjs/web"

import {
  DOMElement,
  IconGlyph,
  proto,
  protoMerged,
  SlotContent,
  state,
  UIComponent,
  untracked,
  type AttributeName,
  type ElementSetup,
  type AttributeValues
} from "$/ui/core"

import { brandFieldVocabulary } from "./UIBrandField.en"

import fieldCSS from "./UIBrandField.css?inline"

/****************
 * ### `DOMBrandFieldElement`
 * The DOM element of `<ui-brand-field>`:  it adds `showErrors()`, which `<ui-form>` calls on the field it finds
 * through `:state(field)`, as on a `<ui-field>` (whose DOM element, `DOMFieldElement`, has the same two members).
 *
 * - `errors`:  the messages `<ui-form>` asked to show.
 * - `DOMElement` checks its members against the attributes' property names;  neither of these is one.
 * - Above the component:  its `elementSetup` reads this class while the component is defined.
 ****************/
export class DOMBrandFieldElement extends DOMElement {
  /** Show `messages` under the control (and the `error` state);  `[]` clears. */
  showErrors(messages: readonly string[]) {
    this.field?.showErrors(messages)
  }

  /** Messages `<ui-form>` asked to show;  untracked. */
  get errors(): readonly string[] {
    return untrack(() => this.field?.formErrors) ?? []
  }

  /** The field's component, once it exists. */
  private get field(): UIBrandField | undefined {
    return this.component as UIBrandField | undefined
  }
}

/****************
 * ### `UIBrandField`
 * The component behind `<ui-brand-field>`:  one property of an inspector, or one field of a form.
 * `<div class="brand field" part="field">` holds the label row
 * (`.row`:  the label, actions, value, and the info icon with its tip),
 * the control (`.control`, the default slot), then help and error text.
 *
 * - A row without actions, value or info doesn't draw their wrappers (`SlotContent` watches the light children).
 *
 * - It names the control:  a slotted control with no `aria-label` or `aria-labelledby` of its own
 *   gets `aria-label` = `label` (a `<label for>` can't reach across the shadow boundary).
 *   A click on the label focuses it.
 *
 * - Errors:  `error`, or what `<ui-form>` asked for through the DOM element's `showErrors()`, which wins;
 *   either shows the `error` state.  `<ui-form>` finds the field by `:state(field)`, as a `<ui-field>`.
 *
 * - The info tip:  a CSS tooltip under the icon, shown on hover and keyboard focus;  the icon is described by it.
 *   `info` is the short form, `slot="info"` the rich one (bold words, line breaks).
 *
 * - Actions keep the label row's height:  a pill taller than the row overhangs it,
 *   so showing a Reset button never moves the control.
 *
 * - `disabled` makes the box `inert`.
 * - SIDE EFFECT:  writes `aria-label` on slotted controls (only ones that had no name).
 ****************/
export class UIBrandField extends UIComponent<typeof brandFieldVocabulary> {
  @proto static vocabulary = brandFieldVocabulary
  @protoMerged static elementSetup = {
    styleSheets: { field: fieldCSS },
    DOMElement: DOMBrandFieldElement,
    delegatesFocus: false
  } satisfies Partial<ElementSetup>

  ////////////////
  // ## State
  ////////////////

  /** Messages `<ui-form>` asked to show;  `DOMBrandFieldElement.errors` reads them untracked. */
  @state accessor formErrors: readonly string[] = []

  /** Light-DOM slot occupancy:  label, actions, value, help. */
  readonly slots = new SlotContent(this.domElement)

  /** Has an info tip:  `info`, or `slot="info"`. */
  readonly hasInfo = createMemo(() => !!this.info || this.slots.hasContent(this.slotForName("info")))

  /** Glyph of the info icon, while there's a tip. */
  readonly infoGlyph = new IconGlyph({ owner: this, name: () => (this.hasInfo() ? INFO_ICON : undefined) })

  /** Controls this field named (`aria-label`), so a new `label` renames them and nothing else. */
  private readonly named = new WeakSet<Element>()

  /** The default slot, holding the control. */
  private controlSlot?: HTMLSlotElement

  ////////////////
  // ## Derived state
  ////////////////

  /** Error messages shown:  `<ui-form>`'s, else `error`. */
  readonly errors = createMemo((): readonly string[] => {
    const fromForm = this.formErrors
    if (fromForm.length) return fromForm
    return this.error ? [this.error] : []
  })

  /** The state shown:  `error` while there's an error, else the attribute. */
  readonly shownState = createMemo(() => (this.errors().length ? ERROR : this.state))

  readonly hasActions = createMemo(() => this.slots.hasContent(this.slotForName("actions")))
  readonly hasValue = createMemo(() => !!this.value || this.slots.hasContent(this.slotForName("value")))
  readonly hasHelp = createMemo(() => !!this.help || this.slots.hasContent(this.slotForName("help")))
  readonly hasLabel = createMemo(() => !!this.label || this.slots.hasContent(this.slotForName("label")))

  ////////////////
  // ## `<ui-form>`
  ////////////////

  /** Show `messages` (see `DOMBrandFieldElement`). */
  @untracked
  showErrors(messages: readonly string[]) {
    const current = this.formErrors
    if (current.length !== messages.length || current.some((message, index) => message !== messages[index])) {
      this.formErrors = [...messages]
    }
  }

  ////////////////
  // ## Element hooks
  ////////////////

  protected classValue(name: AttributeName<typeof brandFieldVocabulary>): unknown {
    if (name === "state") return this.shownState()
    return super.classValue(name)
  }

  protected get extraClass(): string | undefined {
    return BRAND
  }

  protected cssStates() {
    return { field: true, error: this.shownState() === ERROR, disabled: this.disabled }
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    this.effects()
    return (
      <div class={this.rootClass} part={this.partForName("field")} inert={this.disabled}>
        <Show when={this.hasLabel() || this.hasActions() || this.hasValue() || this.hasInfo()}>{this.renderRow()}</Show>
        <div class={CLASSES.control} part={this.partForName("control")}>
          <slot ref={(element) => (this.controlSlot = element)} onSlotChange={this.onControlChange} />
        </div>
        <Show when={this.hasHelp()}>
          <div class={CLASSES.help} part={this.partForName("help")}>
            <slot name={this.slotForName("help")}>{this.help}</slot>
          </div>
        </Show>
        <Show when={this.errors().length}>
          <div class={CLASSES.error} part={this.partForName("error")} role="alert">
            <For each={this.errors()}>{(message) => <div>{message}</div>}</For>
          </div>
        </Show>
      </div>
    )
  }

  /** The label row:  label, then (at its far end) actions, value and the info icon with its tip. */
  private renderRow(): JSX.Element {
    return (
      <div class={CLASSES.row} part={this.partForName("row")}>
        <span class={CLASSES.label} part={this.partForName("label")} onClick={this.onLabelClick}>
          <slot name={this.slotForName("label")}>{this.label}</slot>
        </span>
        <Show when={this.hasActions()}>
          <span class={CLASSES.actions} part={this.partForName("actions")}>
            <slot name={this.slotForName("actions")} />
          </span>
        </Show>
        <Show when={this.hasValue()}>
          <span class={CLASSES.value} part={this.partForName("value")}>
            <slot name={this.slotForName("value")}>{this.value}</slot>
          </span>
        </Show>
        <Show when={this.hasInfo()}>
          <span
            class={CLASSES.info}
            part={this.partForName("info")}
            tabindex="0"
            role="img"
            aria-label={this.translationForKey("info", { label: this.label ?? "" })}
            aria-describedby={TIP_ID}
          >
            {this.infoGlyph.svg}
            <span id={TIP_ID} class={CLASSES.tip} part={this.partForName("tip")} role="tooltip">
              <slot name={this.slotForName("info")}>{this.info}</slot>
            </span>
          </span>
        </Show>
      </div>
    )
  }

  /** A new `label`:  rename the controls this field named. */
  private effects() {
    createEffect(
      () => this.label,
      (label) => {
        this.nameControls(label)
      }
    )
  }

  ////////////////
  // ## The control
  ////////////////

  /** The slotted controls changed:  name the new ones. */
  @untracked
  private readonly onControlChange = () => {
    this.nameControls(this.label)
  }

  /**
   * Give each slotted control without a name of its own `aria-label` = `label`.
   * - SIDE EFFECT:  writes the controls' `aria-label`;  only ones this field named before are renamed or cleared.
   */
  private nameControls(label: string | undefined) {
    for (const control of this.controlSlot?.assignedElements() ?? []) {
      const ownName = NAMED_ATTRIBUTES.some((name) => control.hasAttribute(name)) && !this.named.has(control)
      if (ownName) continue
      if (label) {
        control.setAttribute("aria-label", label)
        this.named.add(control)
      } else if (this.named.has(control)) {
        control.removeAttribute("aria-label")
        this.named.delete(control)
      }
    }
  }

  /** A click on the label focuses the control, as a `<label for>` would. */
  private readonly onLabelClick = () => {
    const control = this.controlSlot?.assignedElements()[0] as HTMLElement | undefined
    control?.focus()
  }
}

export interface UIBrandField extends AttributeValues<typeof brandFieldVocabulary> {}

/** Class word the component adds before the noun:  `brand field`. */
const BRAND = "brand"

/** The `error` state, shown while there's an error message. */
const ERROR = "error"

/** Icon of the info tip. */
const INFO_ICON = "circle info"

/** Shadow-root id of the info tip, which the icon is described by. */
const TIP_ID = "tip"

/** Controls the field names (`aria-label`) when they have no name of their own. */
const NAMED_ATTRIBUTES = ["aria-label", "aria-labelledby"] as const

/** Shadow classes, one per part (the vocabulary's part names). */
const CLASSES = {
  row: "row",
  label: "label",
  actions: "actions",
  value: "value",
  info: "info",
  tip: "tip",
  control: "control",
  help: "help",
  error: "error message"
} as const
