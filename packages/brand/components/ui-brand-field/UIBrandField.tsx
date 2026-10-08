import { For, Show, createEffect, createMemo, untrack } from "solid-js"
import type { JSX } from "@solidjs/web"

import { IconGlyph, proto, SlotContent, state, UIElement, UIT, type AttributeName } from "$/ui/core"

import { brandFieldVocabulary } from "./ui-brand-field.vocabulary.en"
import { BrandFieldFallback } from "./ui-brand-field.fallback"
import { BrandFieldHost } from "./BrandFieldHost"
import {
  BRAND,
  CLASSES,
  ERROR,
  INFO_ICON,
  NAMED_ATTRIBUTES,
  TIP_ID,
  type BrandFieldVocabulary
} from "./ui-brand-field.types"

import fieldCSS from "./ui-brand-field.css?inline"

/****************
 * ### `<ui-brand-field>`
 * One property of an inspector, or one field of a form:
 * `<div class="brand field" part="field">` > the label row (`.row`:  label, actions, value, info icon + tip), the
 * control (`.control`, the default slot), then help and error text.
 * - Rows without actions, value or info:  their wrappers aren't rendered (`SlotContent` watches the light children).
 * - Names the control:  a slotted control with no `aria-label` / `aria-labelledby` of its own gets `aria-label` =
 *   `label` (a `<label for>` can't reach across the shadow boundary).  A click on the label focuses it.
 * - Errors:  `error`, or what `<ui-form>` asked for through `showErrors()` (the host's), which wins;  either shows the
 *   `error` state.  `<ui-form>` finds the field by `:state(field)`, as a `<ui-field>`.
 * - The info tip:  a CSS tooltip under the icon, shown on hover and keyboard focus;  the icon is described by it.
 *   `info` is the short form, `slot="info"` the rich one (bold words, line breaks).
 * - Actions keep the label row's height:  a pill taller than the row overhangs it, so showing a Reset button never
 *   moves the control.
 * - `disabled` makes the box `inert`.
 * - SIDE EFFECT:  writes `aria-label` on slotted controls (only ones that had no name).
 ****************/
export class UIBrandField extends UIElement<BrandFieldVocabulary> {
  @proto static vocabulary = brandFieldVocabulary
  @proto static styleSheets = { field: fieldCSS }
  @proto static elementSetup = { Fallback: BrandFieldFallback, Host: BrandFieldHost, delegatesFocus: false }

  ////////////////
  // ## State
  ////////////////

  /** Messages `<ui-form>` asked to show;  `BrandFieldHost.errors` reads them untracked. */
  @state accessor formErrors: readonly string[] = []

  /** Light-DOM slot occupancy:  label, actions, value, help. */
  readonly slots = new SlotContent(this.host)

  /** Has an info tip:  `info`, or `slot="info"`. */
  readonly hasInfo = createMemo(() => !!this.attrs.info || this.slots.hasContent(this.slotForName("info")))

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
    return this.attrs.error ? [this.attrs.error] : []
  })

  /** The state shown:  `error` while there's an error, else the attribute. */
  readonly shownState = createMemo(() => (this.errors().length ? ERROR : this.attrs.state))

  readonly hasActions = createMemo(() => this.slots.hasContent(this.slotForName("actions")))
  readonly hasValue = createMemo(() => !!this.attrs.value || this.slots.hasContent(this.slotForName("value")))
  readonly hasHelp = createMemo(() => !!this.attrs.help || this.slots.hasContent(this.slotForName("help")))
  readonly hasLabel = createMemo(() => !!this.attrs.label || this.slots.hasContent(this.slotForName("label")))

  ////////////////
  // ## `<ui-form>`
  ////////////////

  /** Show `messages` (see `BrandFieldHost`). */
  showErrors(messages: readonly string[]) {
    const current = untrack(() => this.formErrors)
    if (current.length !== messages.length || current.some((message, index) => message !== messages[index])) {
      this.formErrors = [...messages]
    }
  }

  ////////////////
  // ## Element hooks
  ////////////////

  protected classValue(name: AttributeName<BrandFieldVocabulary>): unknown {
    if (name === "state") return this.shownState()
    return super.classValue(name)
  }

  protected get extraClasses(): string | undefined {
    return BRAND
  }

  protected cssStates() {
    return { field: true, error: this.shownState() === ERROR, disabled: this.attrs.disabled }
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    this.effects()
    return (
      <div class={this.rootClasses} part={this.partForName("field")} inert={this.attrs.disabled}>
        <Show when={this.hasLabel() || this.hasActions() || this.hasValue() || this.hasInfo()}>{this.renderRow()}</Show>
        <div class={CLASSES.control} part={this.partForName("control")}>
          <slot ref={(element) => (this.controlSlot = element)} onSlotChange={this.onControlChange} />
        </div>
        <Show when={this.hasHelp()}>
          <div class={CLASSES.help} part={this.partForName("help")}>
            <slot name={this.slotForName("help")}>{this.attrs.help}</slot>
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
          <slot name={this.slotForName("label")}>{this.attrs.label}</slot>
        </span>
        <Show when={this.hasActions()}>
          <span class={CLASSES.actions} part={this.partForName("actions")}>
            <slot name={this.slotForName("actions")} />
          </span>
        </Show>
        <Show when={this.hasValue()}>
          <span class={CLASSES.value} part={this.partForName("value")}>
            <slot name={this.slotForName("value")}>{this.attrs.value}</slot>
          </span>
        </Show>
        <Show when={this.hasInfo()}>
          <span
            class={CLASSES.info}
            part={this.partForName("info")}
            tabindex="0"
            role="img"
            aria-label={this.translationForKey("info", { label: this.attrs.label ?? "" })}
            aria-describedby={TIP_ID}
          >
            {this.infoGlyph.svg}
            <span id={TIP_ID} class={CLASSES.tip} part={this.partForName("tip")} role="tooltip">
              <slot name={this.slotForName("info")}>{this.attrs.info}</slot>
            </span>
          </span>
        </Show>
      </div>
    )
  }

  /** A new `label`:  rename the controls this field named. */
  private effects() {
    createEffect(
      () => this.attrs.label,
      (label) => {
        this.nameControls(label)
      }
    )
  }

  ////////////////
  // ## The control
  ////////////////

  /** The slotted controls changed:  name the new ones. */
  private readonly onControlChange = () => {
    this.nameControls(untrack(() => this.attrs.label))
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
        control.setAttribute(UIT.ARIA_LABEL, label)
        this.named.add(control)
      } else if (this.named.has(control)) {
        control.removeAttribute(UIT.ARIA_LABEL)
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
