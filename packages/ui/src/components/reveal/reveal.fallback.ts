import { NativeFallback, proto } from "$/core"

import { revealVocabulary } from "./reveal.vocabulary.en"

/****************
 * ### `RevealFallback`
 * The element's markup:  `<div part="reveal" class="ui ... reveal" tabindex="0">` holding the visible content box
 * (`slot=visible`, the default slot) and the hidden one (`slot=hidden`), so `reveal.css` still reveals on hover,
 * focus and `active`.
 ****************/
export class RevealFallback extends NativeFallback<typeof revealVocabulary> {
  @proto static vocabulary = revealVocabulary
  @proto static degraded = [
    "skipping the root's tab stop when the content is focusable (always a stop, unless disabled)",
    "the `aria-label` forwarding"
  ]

  protected override build() {
    const disabled = this.flag("disabled")
    const visible = this.create("div", { class: "visible content", part: "visible" })
    visible.append(this.create("slot", { name: "visible" }), this.slot())
    const hidden = this.create(
      "div",
      { class: "hidden content", part: "hidden" },
      this.create("slot", { name: "hidden" })
    )
    const reveal = this.create(
      "div",
      { class: this.classes(), tabindex: disabled ? null : "0", role: disabled ? null : "group" },
      visible,
      hidden
    )
    return [this.decorate(reveal, "reveal")]
  }
}
