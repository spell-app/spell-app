import { createEffect } from "solid-js"
import type { JSX } from "@solidjs/web"

import { proto, UIElement } from "$/ui/core"

import { emojiSetVocabulary } from "./ui-emoji-set.vocabulary.en"
import { EmojiData } from "./EmojiData"

import emojiSetCSS from "./emoji-set.css?inline"

/****************
 * ### `<ui-emoji-set>`
 * Picks the emoji name set for the page:  `<ui-emoji-set names="fomantic">`.  Renders nothing and is hidden.
 * - The set is `EmojiData`'s, page-wide, one at a time.  `EmojiData` also reads the last `<ui-emoji-set>` in the
 *   document itself at its first lookup, so a page that defines the element late works the same;  connecting one
 *   later calls `EmojiData.use()`, which affects LATER lookups only (emoji already drawn keep their glyph).
 * - NOTE:  no native fallback:  there is nothing to show.
 ****************/
export class UIEmojiSet extends UIElement<typeof emojiSetVocabulary> {
  @proto static vocabulary = emojiSetVocabulary
  @proto static styles = { emojiSet: emojiSetCSS }

  constructor(...args: ConstructorParameters<typeof UIElement>) {
    super(...args)
    createEffect(
      () => this.attrs.names,
      (names) => EmojiData.use(names)
    )
  }

  render(): JSX.Element {
    return null
  }
}
