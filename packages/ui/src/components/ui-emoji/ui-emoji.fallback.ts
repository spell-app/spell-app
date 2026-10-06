import { E, UIT } from "$/ui/core"
import { EmojiData } from "./EmojiData"
import { emojiVocabulary } from "./ui-emoji.vocabulary.en"

/****************
 * ### `EmojiFallback`
 * `<span part="emoji" class="ui ... emoji">😄</span>` with the element's accessible-name rules:  the cached glyph
 * at once, or the glyph once `EmojiData` has loaded it (plain DOM, no Solid).
 ****************/
export class EmojiFallback extends E.NativeFallback<typeof emojiVocabulary> {
  @E.proto static vocabulary = emojiVocabulary
  @E.proto static degraded = ["later `name` / `label` changes (read once)"]

  protected override build() {
    const label = this.attr("label")
    const name = this.attr("name")
    const span = this.create("span", { class: this.classes(), "aria-hidden": label === "" ? UIT.TRUE : undefined })
    const set = EmojiData.setFor(this.host)
    const cached = EmojiData.peek(name, set)
    if (cached) show(cached)
    else void EmojiData.get(name, set).then(show)
    return [this.decorate(span, "emoji")]

    /** Put `emoji` in the span, named by `label` when there is one;  nothing for an unknown name. */
    function show(emoji: string | undefined) {
      if (!emoji) return
      span.textContent = emoji
      if (label) {
        span.setAttribute("role", UIT.IMG)
        span.setAttribute(UIT.ARIA_LABEL, label)
      }
    }
  }
}
