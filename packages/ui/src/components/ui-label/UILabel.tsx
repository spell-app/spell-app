import { Show } from "solid-js"
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
  @E.proto static styleSheets = { label: labelCSS, parts: partsCSS }
  @E.proto static elementSetup = { Fallback: LabelFallback }

  /** Owner, when it's a statistic's label. */
  readonly context = new E.PartContext({ host: this.host, noun: this.vocabulary.noun })

  /** Light-DOM slot occupancy. */
  readonly slots = new E.SlotContent(this.host)

  /** Glyph of the `icon` shorthand. */
  readonly iconGlyph = new E.IconGlyph({ owner: this, name: () => this.icon })

  /** Glyph of the delete button. */
  readonly deleteGlyph = new E.IconGlyph({ owner: this, name: () => (this.removable ? DELETE_ICON : undefined) })

  /** Host `aria-label`, forwarded to the root. */
  get ariaLabel(): string | undefined {
    return this.attributes[UIT.ARIA_LABEL] ?? undefined
  }

  ////////////////
  // ## Derived state
  ////////////////

  /** Has an icon (shorthand or `icon` slot)? */
  get hasIcon(): boolean {
    return !!this.icon || this.slots.hasContent(this.slotForName("icon"))
  }

  /** Has text (default slot or `detail`)? */
  get hasText(): boolean {
    return this.slots.hasContent("") || !!this.detail
  }

  /** `image` attribute as a URL, or `undefined` when bare (a slotted `<img>`) or absent. */
  get imageSrc(): string | undefined {
    return this.image?.trim() || undefined
  }

  ////////////////
  // ## States and classes
  ////////////////

  /** Highlighted (`active`)? */
  @E.cssState("active")
  get isActive(): boolean {
    return this.active
  }

  @E.cssState("disabled")
  get isDisabled(): boolean {
    return this.disabled
  }

  /** `image` for an image label, `icon` for an icon without text:  words `ClassBuilder` can't emit. */
  protected get extraClasses(): string | undefined {
    const extra = [this.image === undefined ? "" : UIT.IMAGE, this.hasIcon && !this.hasText ? UIT.ICON : ""]
    return extra.filter(Boolean).join(" ") || undefined
  }

  /** `ui-parts.css` only while a statistic owns it. */
  get styleSheetNames(): string[] {
    return this.context.ownerNoun ? ["label", "parts"] : ["label"]
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    return (
      <Show when={this.context.ownerNoun} fallback={this.label()}>
        <div class={this.vocabulary.noun} part={this.partForName("label")}>
          <slot />
        </div>
      </Show>
    )
  }

  /** The standalone label box. */
  private label(): JSX.Element {
    return (
      <Dynamic
        component={this.href ? "a" : "span"}
        class={this.rootClasses}
        part={this.partForName("label")}
        href={this.disabled ? undefined : this.href}
        target={this.href ? this.target : undefined}
        aria-label={this.ariaLabel}
        aria-disabled={this.disabled && this.href ? UIT.TRUE : undefined}
        role={this.ariaLabel && !this.href ? UIT.IMG : undefined}
      >
        <Show when={this.imageSrc}>
          <img class={UIT.IMAGE} part={this.partForName("image")} src={this.imageSrc} alt="" />
        </Show>
        <Show when={this.hasIcon}>
          <span class={UIT.ICON} part={this.partForName("icon")}>
            <slot name={this.slotForName("icon")}>{this.iconGlyph.svg}</slot>
          </span>
        </Show>
        <slot />
        <Show when={this.detail}>
          <span class={DETAIL} part={this.partForName("detail")}>
            {this.detail}
          </span>
        </Show>
        <Show when={this.removable}>
          <button
            type="button"
            class={DELETE_CLASS}
            part={this.partForName("delete")}
            aria-label={this.translationForKey("remove")}
            disabled={this.disabled}
            onClick={this.onRemove}
          >
            {this.deleteGlyph.svg}
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
    this.send("ui-remove", { originalEvent: event })
  }
}

/** The vocabulary getters, typed (`UIElement`'s doc). */
export interface UILabel extends E.AttributeValues<typeof labelVocabulary> {}

/** Classes of the delete button. */
const DELETE_CLASS = "delete icon"

/** Glyph of the delete button (Fomantic's `delete icon`). */
const DELETE_ICON = "xmark"
