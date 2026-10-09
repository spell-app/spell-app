import { Show } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E, UIT } from "$/ui/core"
import type { UIFeed } from "./UIFeed"
import { eventVocabulary } from "./UIFeedEvent.en"

import feedCSS from "./UIFeed.css?inline"

/****************
 * ### `UIFeedEvent`
 * The component behind `<ui-event>`:  one event of a feed,
 * `<div class="[color] [keyOnly ...] event" part="event">` holding the label box,
 * then the default `<slot>` (a `<ui-content>`).
 *
 * - Named `UIFeedEvent`, not `UIEvent`:  that's the DOM's own `UIEvent` interface.
 *
 * - The label box, `<div class="label" part="label" [data-text]>`:  the `image` shorthand's `<img alt="">`,
 *   the `icon` shorthand's icon box, and the `label` slot;  a `label` text is Fomantic's `data-text` circle.
 *   It's drawn when any of those is set, or when the feed is `ordered` (the number goes there).
 *
 * - A part (`elementSetup.isAPart`, noun `event`, owned by the feed):  transparent to other parts' climbs,
 *   so the content parts inside find the FEED (`:state(in-feed)`).
 *   Its own DOM element is a `role=listitem` with `:state(in-feed)`.
 *
 * - Colour:  an event has no `ui`, so a coloured one adds `ui-<color>` (the utility remap class) for `colors.css`,
 *   as `<ui-item>` does.
 *
 * - `disabled`:  `aria-disabled` on the root, which assistive tech (and axe) apply to the content inside.
 ****************/
export class UIFeedEvent extends E.UIComponent<typeof eventVocabulary> {
  @E.proto static vocabulary = eventVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { feed: feedCSS },
    isAPart: true,
    delegatesFocus: false
  } satisfies Partial<E.ElementSetup>

  /** Feed, if any. */
  readonly context = new E.PartContext({ domElement: this.domElement, noun: this.vocabulary.noun })

  /** Light-DOM slot occupancy. */
  readonly slots = new E.SlotContent(this.domElement)

  /** Glyph of the `icon` shorthand. */
  readonly iconGlyph = new E.IconGlyph({ owner: this, name: () => this.icon })

  ////////////////
  // ## Derived state
  ////////////////

  /** The feed's component.  Tracked. */
  get feed(): UIFeed | undefined {
    return this.context.ownerComponent<UIFeed>()
  }

  /** Renders the label box:  a shorthand, slotted label content, or a number to show.  Tracked. */
  get hasLabel(): boolean {
    return (
      !!(this.icon || this.image || this.label) ||
      this.slots.hasContent(this.slotForName("label")) ||
      !!this.feed?.ordered
    )
  }

  constructor(...args: ConstructorParameters<typeof E.UIComponent>) {
    super(...args)
    const { internals } = this.domElement
    // SIDE EFFECT:  a list item in a feed;
    // a `addElementEffect()`, so a static server render gets the role too (its `<li>`).
    // `null` is `internals.role`'s own "no role" (a platform boundary)
    this.addElementEffect(
      () => (this.context.owner ? "listitem" : null),
      (role) => {
        internals.role = role
      }
    )
  }

  /** `disabled`.  `:state(disabled)`. */
  @E.cssState("disabled")
  get isDisabled(): boolean {
    return this.disabled
  }

  /** `ui-<color>` for a coloured event:  the colour remap (`colors.css`) keys on `.ui.red` / `.ui-red`. */
  protected get extraClass(): string | undefined {
    return this.color ? `${UIT.COLOR_CLASS_PREFIX}${this.color}` : undefined
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    return (
      <div class={this.rootClass} part={this.partForName("event")} aria-disabled={this.disabled ? "true" : undefined}>
        <Show when={this.hasLabel}>
          <div class={UIT.LABEL} part={this.partForName("label")} data-text={this.label || undefined}>
            <Show when={this.image}>
              <img src={this.image} alt="" part={this.partForName("image")} />
            </Show>
            <Show when={this.icon}>
              <span class={UIT.ICON} part={this.partForName("icon")}>
                {this.iconGlyph.svg}
              </span>
            </Show>
            <slot name={this.slotForName("label")} />
          </div>
        </Show>
        <slot />
      </div>
    )
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UIFeedEvent extends E.AttributeValues<typeof eventVocabulary> {}
