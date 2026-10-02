import { NativeFallback, proto } from "$/ui/core"

import { emojiVocabulary } from "./ui-emoji.vocabulary.en"
import { EmojiData } from "./EmojiData"

/****************
 * ### `EmojiFallback`
 * `<span part="emoji" class="ui ... emoji">😄</span>` with the element's accessible-name rules:  the cached glyph
 * at once, or the glyph once `EmojiData` has loaded it (plain DOM, no Solid).
 ****************/
export class EmojiFallback extends NativeFallback<typeof emojiVocabulary> {
  @proto static vocabulary = emojiVocabulary
  @proto static degraded = ["later `name` / `label` changes (read once)"]

  protected override build() {
    const label = this.attr("label")
    const name = this.attr("name") ?? undefined
    const span = this.create("span", { class: this.classes(), "aria-hidden": label === "" ? "true" : null })
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
        span.setAttribute("role", "img")
        span.setAttribute("aria-label", label)
      }
    }
  }
}
