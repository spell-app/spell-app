import { Converters, NativeFallback, proto, UIT } from "$/ui/core"

import { eventVocabulary } from "./ui-event.vocabulary.en"
import { feedVocabulary } from "./ui-feed.vocabulary.en"
import { LABEL, ORDERED, Vocabulary } from "./ui-feed.types"

/****************
 * ### `FeedFallback`
 * A feed or one of its events without Solid, keyed by the host's tag -- one class for both, as they share
 * `ui-feed.css`.
 * - `<ui-feed>`:  `<ul class="ui ... feed" part="feed" role="list"><slot>` (`<ol>` when `ordered`).
 * - `<ui-event>`:  `<div class="... event" part="event">` holding the label box (the `image` shorthand, a `label`
 *   text as `data-text`, the `label` slot;  also when the parent feed is `ordered`), then the slot;
 *   `role=listitem` on the host inside a `<ui-feed>` parent.
 ****************/
export class FeedFallback extends NativeFallback<Vocabulary> {
  @proto static vocabularies = [feedVocabulary, eventVocabulary]
  @proto static degraded = [
    "the `icon` shorthand's glyph (the event's label box stays empty)",
    "a feed through translated or slotted parents (only a direct `<ui-feed>` parent counts)",
    "the content parts' feed context (`:state(in-feed)`)"
  ]

  protected override build() {
    if (this.vocabulary === feedVocabulary) {
      const tag = this.flag("ordered") ? "ol" : "ul"
      return [this.decorate(this.create(tag, { class: this.classes(), role: UIT.LIST }, this.slot()), "feed")]
    }
    const feed = this.host.parentElement?.localName === feedVocabulary.tag ? this.host.parentElement : null
    if (feed && this.internals) this.internals.role = UIT.LISTITEM
    const color = this.attr("color")
    const event = this.create("div", {
      class: this.classes(color ? `ui-${color}` : undefined),
      "aria-disabled": this.flag("disabled") ? UIT.TRUE : null
    })
    const image = this.attr("image")
    const text = this.attr("label")
    const ordered = Converters.boolean(feed?.getAttribute(ORDERED) ?? null, ORDERED)
    if (image || text || this.attr("icon") || ordered || this.host.querySelector(`:scope > [slot="${LABEL}"]`)) {
      const label = this.create("div", { class: LABEL, "data-text": text || null })
      if (image) label.append(this.create("img", { src: image, alt: "" }))
      label.append(this.create("slot", { name: LABEL }))
      event.append(label)
    }
    event.append(this.slot())
    return [this.decorate(event, "event")]
  }
}
