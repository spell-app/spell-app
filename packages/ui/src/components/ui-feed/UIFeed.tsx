import { Dynamic, type JSX } from "@solidjs/web"

import { proto, UIElement, UIT } from "$/ui/core"

import { feedVocabulary } from "./ui-feed.vocabulary.en"
import { FeedFallback } from "./ui-feed.fallback"
import { OL, UL } from "./ui-feed.types"

import feedCSS from "./ui-feed.css?inline"

/****************
 * ### `<ui-feed>`
 * An activity feed:  `<ul class="ui ... feed" part="feed" role="list"><slot></slot></ul>`, an `<ol>` when
 * `ordered` (the numbers mean something);  its children are `<ui-event>`s.
 * - Owner of its events and their content parts (`ownsParts`):  each event is a `role=listitem` host with
 *   `:state(in-feed)`, and the parts inside an event (a part too, transparent) style themselves `:state(in-feed)`.
 * - `role="list"` explicitly:  `list-style: none` drops list semantics in Safari.
 * - Variations reach the events as inherited private tokens (`--_feed-*`, `ui-feed.css`);  numbering is CSS counters
 *   (`counter-reset` here, `counter-increment` on each event's label), which cross the shadow boundaries.
 ****************/
export class UIFeed extends UIElement<typeof feedVocabulary> {
  @proto static vocabulary = feedVocabulary
  @proto static styles = { feed: feedCSS }
  @proto static Fallback = FeedFallback
  @proto static delegatesFocus = false

  /** Numbered:  every event renders a label box for its number.  Tracked. */
  isOrdered(): boolean {
    return this.attrs.ordered
  }

  render(): JSX.Element {
    return (
      <Dynamic component={this.attrs.ordered ? OL : UL} class={this.classes()} part={this.part("feed")} role={UIT.LIST}>
        <slot />
      </Dynamic>
    )
  }
}
