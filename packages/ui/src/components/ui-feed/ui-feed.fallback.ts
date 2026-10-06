import { E, UIT } from "$/ui/core"
import { eventVocabulary } from "./ui-event.vocabulary.en"
import type { Vocabulary } from "./ui-feed.types"
import { feedVocabulary } from "./ui-feed.vocabulary.en"

/****************
 * ### `FeedFallback`
 * A feed or one of its events without Solid, keyed by the host's tag -- one class for both, as they share
 * `ui-feed.css`.
 * - `<ui-feed>`:  `<ul class="ui ... feed" part="feed" role="list"><slot>` (`<ol>` when `ordered`).
 * - `<ui-event>`:  `<div class="... event" part="event">` holding the label box (the `image` shorthand, a `label`
 *   text as `data-text`, the `label` slot;  also when the parent feed is `ordered`), then the slot;
 *   `role=listitem` on the host inside a `<ui-feed>` parent.
 ****************/
export class FeedFallback extends E.NativeFallback<Vocabulary> {
  @E.proto static vocabularies = [feedVocabulary, eventVocabulary]
  @E.proto static degraded = [
    "the `icon` shorthand's glyph (the event's label box stays empty)",
    "a feed through translated or slotted parents (only a direct `<ui-feed>` parent counts)",
    "the content parts' feed context (`:state(in-feed)`)"
  ]

  protected override build() {
    if (this.vocabulary === feedVocabulary) {
      const tag = this.flag("ordered") ? UIT.OL : UIT.UL
      return [this.decorate(this.create(tag, { class: this.classes(), role: UIT.LIST }, this.slot()), "feed")]
    }
    const parent = this.host.parentElement
    const feed = parent?.localName === feedVocabulary.tag ? parent : undefined
    if (feed && this.internals) this.internals.role = UIT.LISTITEM
    const color = this.attr("color")
    const event = this.create("div", {
      class: this.classes(color ? `${UIT.COLOR_CLASS_PREFIX}${color}` : undefined),
      "aria-disabled": this.flag("disabled") ? UIT.TRUE : undefined
    })
    const image = this.attr("image")
    const text = this.attr("label")
    const isOrdered = E.Converters.boolean(feed?.getAttribute(UIT.ORDERED) ?? null, UIT.ORDERED)
    const hasSlottedLabel = !!this.host.querySelector(`:scope > [slot="${UIT.LABEL}"]`)
    if (image || text || this.attr("icon") || isOrdered || hasSlottedLabel) {
      const label = this.create("div", { class: UIT.LABEL, "data-text": text || undefined })
      if (image) label.append(this.create("img", { src: image, alt: "" }))
      label.append(this.create("slot", { name: UIT.LABEL }))
      event.append(label)
    }
    event.append(this.slot())
    return [this.decorate(event, "event")]
  }
}
