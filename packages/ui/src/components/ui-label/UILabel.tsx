import { Show } from "solid-js"
import { Dynamic, type JSX } from "@solidjs/web"

import { E, UIT } from "$/ui/core"
import { labelVocabulary } from "./UILabel.en"

import labelCSS from "./UILabel.css?inline"
import partsCSS from "$/ui/components/ui-parts/UIParts.css?inline"

/****************
 * ### `UILabel`
 * The component behind `<ui-label>`:  a small tag, badge or count beside other content.
 *
 * - Its shadow DOM is one box, `<span class="ui … label" part="label">` (an `<a>` with `href`), holding, in order:
 *   the `image` `<img>`, the icon box, the default slot, the `detail` shorthand and the `removable` delete button.
 *   - It adds the `icon` class (before the noun) when there's an icon and no text:  the icon centres.
 *
 * - `image` is a string attribute:
 *   - bare (or `""`):  the `image` class, around a slotted `<img>`
 *   - a URL:  the `src` of the label's own `<img class="image" part="image" alt="">`
 *   - `ClassBuilder` writes no class for a string attribute, so the `image` class is added by hand.
 *
 * - `removable`:  a real `<button class="delete icon">`, named by the `remove` text.
 *   A click sends the cancelable `ui-remove`:  the label never removes itself, the page does.
 *
 * - Inside a statistic (an owner of `label`, through `PartContext`), it is that statistic's `.label` PART:
 *   it draws `<div class="label" part="label">`, adopts `UIParts.css` after `UILabel.css`
 *   and sets `:state(in-statistic)`.
 *
 * - The element's `aria-label` moves to the inner box, so an icon-only or corner label has a name.
 ****************/
export class UILabel extends E.UIComponent<typeof labelVocabulary> {
  @E.proto static vocabulary = labelVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { label: labelCSS, parts: partsCSS },
    cssStates: ["active"],
    // `disabled`:  only a look
    disabled: "its own"
  } satisfies Partial<E.ElementSetup>

  /** The owner, when it's a statistic's label. */
  readonly context = new E.PartContext({ domElement: this.domElement, noun: this.vocabulary.noun })

  /** Which of its slots have content in the light DOM. */
  readonly slots = new E.SlotContent(this.domElement)

  /** The glyph of the `icon` shorthand. */
  readonly iconGlyph = new E.IconGlyph({ owner: this, name: () => this.icon })

  /** The glyph of the delete button. */
  readonly deleteGlyph = new E.IconGlyph({ owner: this, name: () => (this.removable ? DELETE_ICON : undefined) })

  /** The element's `aria-label`, moved to the inner box. */
  get ariaLabel(): string | undefined {
    return this.attributes["aria-label"] ?? undefined
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

  @E.cssState("disabled")
  get isDisabled(): boolean {
    return this.disabled
  }

  /** `image` for an image label, `icon` for an icon without text:  words `ClassBuilder` can't emit. */
  protected get extraClass(): string | undefined {
    const extra = [this.image === undefined ? "" : UIT.IMAGE, this.hasIcon && !this.hasText ? UIT.ICON : ""]
    return extra.filter(Boolean).join(" ") || undefined
  }

  /** `UIParts.css` only while a statistic owns it. */
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
        class={this.rootClass}
        part={this.partForName("label")}
        href={this.disabled ? undefined : this.href}
        target={this.href ? this.target : undefined}
        aria-label={this.ariaLabel}
        aria-disabled={this.disabled && this.href ? "true" : undefined}
        role={this.ariaLabel && !this.href ? "img" : undefined}
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

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UILabel extends E.AttributeValues<typeof labelVocabulary> {}

/** The class and part of the `detail` shorthand box. */
const DETAIL = "detail"

/** Classes of the delete button. */
const DELETE_CLASS = "delete icon"

/** Glyph of the delete button (Fomantic's `delete icon`). */
const DELETE_ICON = "xmark"
