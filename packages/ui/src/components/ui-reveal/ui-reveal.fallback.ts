import { E, UIT } from "$/ui/core"
import { revealVocabulary } from "./ui-reveal.vocabulary.en"
import { HIDDEN, HIDDEN_CONTENT, VISIBLE_CONTENT } from "./ui-reveal.types"

/****************
 * ### `RevealFallback`
 * The element's markup:  `<div part="reveal" class="ui ... reveal" tabindex="0">` holding the visible content box
 * (`slot=visible`, the default slot) and the hidden one (`slot=hidden`), so `ui-reveal.css` still reveals on hover,
 * focus and `active`.
 ****************/
export class RevealFallback extends E.NativeFallback<typeof revealVocabulary> {
  @E.proto static vocabulary = revealVocabulary
  @E.proto static degraded = [
    "skipping the root's tab stop when the content is focusable (always a stop, unless disabled)",
    "the `aria-label` forwarding"
  ]

  protected override build() {
    const isDisabled = this.flag("disabled")
    const visible = this.create(
      "div",
      { class: VISIBLE_CONTENT, part: UIT.VISIBLE },
      this.create("slot", { name: UIT.VISIBLE }),
      this.slot()
    )
    const hidden = this.create("div", { class: HIDDEN_CONTENT, part: HIDDEN }, this.create("slot", { name: HIDDEN }))
    const reveal = this.create(
      "div",
      { class: this.classes(), tabindex: isDisabled ? undefined : "0", role: isDisabled ? undefined : UIT.GROUP },
      visible,
      hidden
    )
    return [this.decorate(reveal, "reveal")]
  }
}
