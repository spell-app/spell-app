import { Show, createMemo } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E, UIT } from "$/ui/core"
import type { UIFeed } from "./UIFeed"
import { eventVocabulary } from "./ui-event.vocabulary.en"
import { FeedFallback } from "./ui-feed.fallback"

import feedCSS from "./ui-feed.css?inline"

/****************
 * ### `<ui-event>`
 * One event of a feed:  `<div class="[color] [keyOnly ...] event" part="event">` holding the label box, then the
 * default `<slot>` (a `<ui-content>`).
 * - Named `UIFeedEvent`, not `UIEvent`:  that's the DOM's own `UIEvent` interface.
 * - The label box, `<div class="label" part="label" [data-text]>`:  the `image` shorthand's `<img alt="">`, the
 *   `icon` shorthand's icon box, the `label` slot;  a `label` text is Fomantic's `data-text` circle.  It's rendered
 *   when any of those is set, or when the feed is `ordered` (the number goes there).
 * - A part (`isPart`, noun `event`, owned by the feed):  transparent to other parts' climbs, so the content parts
 *   inside find the FEED (`:state(in-feed)`);  itself a `role=listitem` host with `:state(in-feed)`.
 * - Colour:  an event has no `ui`, so a coloured one adds `ui-<color>` (the utility remap class) for `colors.css`,
 *   as `<ui-item>` does.
 * - `disabled`:  `aria-disabled` on the root, which assistive tech (and axe) apply to the content inside.
 ****************/
export class UIFeedEvent extends E.UIElement<typeof eventVocabulary> {
  @E.proto static vocabulary = eventVocabulary
  @E.proto static styles = { feed: feedCSS }
  @E.proto static Fallback = FeedFallback
  @E.proto static isPart = true
  @E.proto static delegatesFocus = false

  /** Feed, if any. */
  readonly context = new E.PartContext({ host: this.host, noun: this.vocabulary.noun })

  /** Light-DOM slot occupancy. */
  readonly slots = new E.SlotContent(this.host)

  /** Glyph of the `icon` shorthand. */
  readonly glyph = new E.IconGlyph({ owner: this, name: () => this.attrs.icon })

  ////////////////
  // ## Derived state
  ////////////////

  /** The feed's controller.  Tracked. */
  readonly feed = createMemo(() => this.context.ownerController<UIFeed>())

  /** Renders the label box:  a shorthand, slotted label content, or a number to show.  Tracked. */
  readonly hasLabel = createMemo(
    () =>
      !!(this.attrs.icon || this.attrs.image || this.attrs.label) ||
      this.slots.has(this.slot("label")) ||
      !!this.feed()?.isOrdered()
  )

  constructor(...args: ConstructorParameters<typeof E.UIElement>) {
    super(...args)
    const { internals } = this.host
    // SIDE EFFECT:  a list item in a feed;  a host effect, so a static server render gets the role too (its `<li>`).
    // `null` is `internals.role`'s own "no role" (a platform boundary)
    this.hostEffect(
      () => (this.context.owner.get() ? UIT.LISTITEM : null),
      (role) => {
        internals.role = role
      }
    )
  }

  isDisabled(): boolean {
    return this.attrs.disabled
  }

  /** `ui-<color>` for a coloured event:  the colour remap (`colors.css`) keys on `.ui.red` / `.ui-red`. */
  protected extraClasses(): string | undefined {
    return this.attrs.color ? `${UIT.COLOR_CLASS_PREFIX}${this.attrs.color}` : undefined
  }

  protected hostStates() {
    return { disabled: this.attrs.disabled }
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part("event")} aria-disabled={this.attrs.disabled ? UIT.TRUE : undefined}>
        <Show when={this.hasLabel()}>
          <div class={UIT.LABEL} part={this.part("label")} data-text={this.attrs.label || undefined}>
            <Show when={this.attrs.image}>
              <img src={this.attrs.image} alt="" part={this.part("image")} />
            </Show>
            <Show when={this.attrs.icon}>
              <span class={UIT.ICON} part={this.part("icon")}>
                {this.glyph.svg()}
              </span>
            </Show>
            <slot name={this.slot("label")} />
          </div>
        </Show>
        <slot />
      </div>
    )
  }
}
