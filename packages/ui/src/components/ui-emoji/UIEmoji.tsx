import { createEffect, untrack } from "solid-js"
import type { JSX } from "@solidjs/web"

import { Cell, IMG, proto, TRUE, UIElement } from "$/ui/core"

import { emojiVocabulary } from "./ui-emoji.vocabulary.en"
import { EmojiData } from "./EmojiData"
import { EmojiFallback } from "./ui-emoji.fallback"

import emojiCSS from "./ui-emoji.css?inline"

/****************
 * ### `<ui-emoji>`
 * An emoji:  `<span class="ui [size] [keyOnly ...] emoji" part="emoji">😄</span>`.
 * - The glyph is the native Unicode emoji `EmojiData` resolves from `name`, loading that name's data chunk on first
 *   use;  a name already loaded (or `EmojiData.register()`ed) draws in the first frame.  A later `name` wins over
 *   an earlier, slower load.  Unknown:  an empty root with no role (an unnamed `role=img` fails axe).
 * - Accessible name (see the vocabulary):  the character as text by default;  `label="..."` => `role=img` +
 *   `aria-label`;  bare `label` => `aria-hidden`.
 * - `link` is a LOOK:  the emoji takes no focus and fires nothing of its own -- wrap it in a `<button>` / `<a>`.
 ****************/
export class UIEmoji extends UIElement<typeof emojiVocabulary> {
  @proto static vocabulary = emojiVocabulary
  @proto static styles = { emoji: emojiCSS }
  @proto static Fallback = EmojiFallback
  @proto static delegatesFocus = false

  /** The glyph, `undefined` while loading or for an unknown name;  tracked. */
  readonly emoji = new Cell(untrack(() => EmojiData.peek(this.attrs.name)))

  /** `name` last asked for, so a slower earlier load can't win. */
  private request: string | undefined

  constructor(...args: ConstructorParameters<typeof UIElement>) {
    super(...args)
    createEffect(
      () => this.attrs.name,
      (name) => void this.load(name)
    )
  }

  protected hostStates() {
    return { disabled: this.attrs.disabled, loading: this.attrs.loading }
  }

  render(): JSX.Element {
    return (
      <span
        class={this.classes()}
        part={this.part("emoji")}
        role={this.isLabelled() ? IMG : undefined}
        aria-label={this.isLabelled() ? this.attrs.label : undefined}
        aria-hidden={this.attrs.label === "" ? TRUE : undefined}
      >
        {this.emoji.get()}
      </span>
    )
  }

  /** Named by `label` (and there's a glyph to name)?  Tracked. */
  private isLabelled(): boolean {
    return !!this.attrs.label && !!this.emoji.get()
  }

  /** Resolve `name`;  writes only if it is still the latest request. */
  private async load(name: string | undefined) {
    this.request = name
    const emoji = await EmojiData.get(name)
    if (this.request === name) this.emoji.set(emoji)
  }
}
