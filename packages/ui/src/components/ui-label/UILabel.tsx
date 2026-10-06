import { Show, createMemo } from "solid-js"
import { Dynamic, type JSX } from "@solidjs/web"

import { E, UIT } from "$/ui/core"
import { LabelFallback } from "./ui-label.fallback"
import { DETAIL } from "./ui-label.types"
import { labelVocabulary } from "./ui-label.vocabulary.en"

import labelCSS from "./ui-label.css?inline"
import partsCSS from "$/ui/components/ui-parts/ui-parts.css?inline"

/****************
 * ### `<ui-label>`
 * A label:  `<span class="ui … label" part="label">` (`<a>` with `href`) holding, in order, the `image` `<img>`,
 * the icon box, the default slot, the `detail` shorthand and the `removable` delete button.
 * - `icon` class (after the noun) when there's an icon and no text:  the icon centres.
 * - `image`:  a string attribute.  Present (bare / `""`) => class `image` around a slotted `<img>`;  a non-empty
 *   value is the `src` of the label's own `<img class="image" part="image" alt="">`.  `ClassBuilder` emits
 *   nothing for a string kind, so the `image` class goes in as an extra.
 * - `removable`:  a real `<button class="delete icon">` named by the `remove` text;  a click dispatches the
 *   cancelable `ui-remove` -- the label never removes itself, the page does.
 * - Inside a statistic (an owner of `label`, `PartContext`) it is that statistic's `.label` PART:  it renders
 *   `<div class="label" part="label">`, adopts `ui-parts.css` after `ui-label.css` and sets `:state(in-statistic)`.
 * - Host `aria-label` is forwarded to the root, so an icon-only or corner label has a name.
 ****************/
export class UILabel extends E.UIElement<typeof labelVocabulary> {
  @E.proto static vocabulary = labelVocabulary
  @E.proto static styles = { label: labelCSS, parts: partsCSS }
  @E.proto static Fallback = LabelFallback

  /** Owner, when it's a statistic's label. */
  readonly context = new E.PartContext({ host: this.host, noun: this.vocabulary.noun })

  /** Light-DOM slot occupancy. */
  readonly slots = new E.SlotContent(this.host)

  /** Glyph of the `icon` shorthand. */
  readonly glyph = new E.IconGlyph({ owner: this, name: () => this.attrs.icon })

  /** Glyph of the delete button. */
  readonly deleteGlyph = new E.IconGlyph({ owner: this, name: () => (this.attrs.removable ? DELETE_ICON : undefined) })

  /** Host `aria-label`, forwarded to the root. */
  readonly ariaLabel = new E.HostAttribute({ host: this.host, name: UIT.ARIA_LABEL })

  ////////////////
  // ## Derived state
  ////////////////

  /** Has an icon (shorthand or `icon` slot)? */
  readonly hasIcon = createMemo(() => !!this.attrs.icon || this.slots.has(this.slot("icon")))

  /** Has text (default slot or `detail`)? */
  readonly hasText = createMemo(() => this.slots.has("") || !!this.attrs.detail)

  /** `image` attribute as a URL, or `undefined` when bare (a slotted `<img>`) or absent. */
  readonly imageSrc = createMemo(() => this.attrs.image?.trim() || undefined)

  ////////////////
  // ## Element hooks
  ////////////////

  isDisabled(): boolean {
    return this.attrs.disabled
  }

  /** `image` for an image label, `icon` for an icon without text:  words `ClassBuilder` can't emit. */
  protected extraClasses(): string | undefined {
    const extra = [this.attrs.image === undefined ? "" : UIT.IMAGE, this.hasIcon() && !this.hasText() ? UIT.ICON : ""]
    return extra.filter(Boolean).join(" ") || undefined
  }

  protected hostStates() {
    return { active: this.attrs.active, disabled: this.attrs.disabled }
  }

  /** `ui-parts.css` only while a statistic owns it. */
  protected sheetNames(): string[] {
    return this.context.ownerNoun() ? ["label", "parts"] : ["label"]
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    return (
      <Show when={this.context.ownerNoun()} fallback={this.label()}>
        <div class={this.vocabulary.noun} part={this.part("label")}>
          <slot />
        </div>
      </Show>
    )
  }

  /** The standalone label box. */
  private label(): JSX.Element {
    return (
      <Dynamic
        component={this.attrs.href ? "a" : "span"}
        class={this.classes()}
        part={this.part("label")}
        href={this.attrs.disabled ? undefined : this.attrs.href}
        target={this.attrs.href ? this.attrs.target : undefined}
        aria-label={this.ariaLabel.get()}
        aria-disabled={this.attrs.disabled && this.attrs.href ? UIT.TRUE : undefined}
        role={this.ariaLabel.get() && !this.attrs.href ? UIT.IMG : undefined}
      >
        <Show when={this.imageSrc()}>
          <img class={UIT.IMAGE} part={this.part("image")} src={this.imageSrc()} alt="" />
        </Show>
        <Show when={this.hasIcon()}>
          <span class={UIT.ICON} part={this.part("icon")}>
            <slot name={this.slot("icon")}>{this.glyph.svg()}</slot>
          </span>
        </Show>
        <slot />
        <Show when={this.attrs.detail}>
          <span class={DETAIL} part={this.part("detail")}>
            {this.attrs.detail}
          </span>
        </Show>
        <Show when={this.attrs.removable}>
          <button
            type="button"
            class={DELETE_CLASS}
            part={this.part("delete")}
            aria-label={this.text("remove")}
            disabled={this.attrs.disabled}
            onClick={this.onRemove}
          >
            {this.deleteGlyph.svg()}
          </button>
        </Show>
      </Dynamic>
    )
  }

  ////////////////
  // ## Behaviour
  ////////////////

  /** Delete button:  announce;  the page removes the label (or cancels). */
  private readonly onRemove = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    this.emit("ui-remove", { originalEvent: event })
  }
}

/** Classes of the delete button. */
const DELETE_CLASS = "delete icon"

/** Glyph of the delete button (Fomantic's `delete icon`). */
const DELETE_ICON = "xmark"
