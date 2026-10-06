import { Dynamic, type JSX } from "@solidjs/web"

import { E, UIT } from "$/ui/core"
import { FeedFallback } from "./ui-feed.fallback"
import { feedVocabulary } from "./ui-feed.vocabulary.en"

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
export class UIFeed extends E.UIElement<typeof feedVocabulary> {
  @E.proto static vocabulary = feedVocabulary
  @E.proto static styles = { feed: feedCSS }
  @E.proto static Fallback = FeedFallback
  @E.proto static delegatesFocus = false

  /** Numbered:  every event renders a label box for its number.  Tracked. */
  isOrdered(): boolean {
    return this.attrs.ordered
  }

  render(): JSX.Element {
    return (
      <Dynamic
        component={this.attrs.ordered ? UIT.OL : UIT.UL}
        class={this.classes()}
        part={this.part("feed")}
        role={UIT.LIST}
      >
        <slot />
      </Dynamic>
    )
  }
}
