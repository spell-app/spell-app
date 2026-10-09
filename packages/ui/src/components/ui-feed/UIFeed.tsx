import { Dynamic, type JSX } from "@solidjs/web"

import { E } from "$/ui/core"
import { feedVocabulary } from "./UIFeed.en"

import feedCSS from "./UIFeed.css?inline"

/****************
 * ### `UIFeed`
 * The component behind `<ui-feed>`:  an activity feed of `<ui-event>`s,
 * `<ul class="ui ... feed" part="feed" role="list"><slot></slot></ul>`,
 * an `<ol>` when `ordered` (the numbers mean something).
 *
 * - It owns its events and their content parts (`ownsParts`):
 *   each event's DOM element is a `role=listitem` with `:state(in-feed)`,
 *   and the parts inside an event (a part too, so transparent) style themselves `:state(in-feed)`.
 *
 * - `role="list"` is explicit:  `list-style: none` drops list semantics in Safari.
 *
 * - Variations reach the events as inherited private tokens (`--_feed-*`, `UIFeed.css`).
 * - Numbering is CSS counters (`counter-reset` here, `counter-increment` on each event's label),
 *   which cross the shadow boundaries.
 ****************/
export class UIFeed extends E.UIComponent<typeof feedVocabulary> {
  @E.proto static vocabulary = feedVocabulary
  @E.proto static styleSheets = { feed: feedCSS }
  @E.proto static elementSetup = { delegatesFocus: false } satisfies Partial<E.ElementSetup>

  render(): JSX.Element {
    return (
      <Dynamic
        component={this.ordered ? "ol" : "ul"}
        class={this.rootClass}
        part={this.partForName("feed")}
        role="list"
      >
        <slot />
      </Dynamic>
    )
  }
}

/** The vocabulary getters, typed (`UIComponent`'s doc):  `ordered` is public, events read it. */
export interface UIFeed extends E.AttributeValues<typeof feedVocabulary> {}
