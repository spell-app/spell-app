import { createEffect, untrack } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E, UIT } from "$/ui/core"
import { EmojiData } from "./EmojiData"
import { EmojiFallback } from "./ui-emoji.fallback"
import { emojiVocabulary } from "./ui-emoji.vocabulary.en"

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
export class UIEmoji extends E.UIElement<typeof emojiVocabulary> {
  @E.proto static vocabulary = emojiVocabulary
  @E.proto static styles = { emoji: emojiCSS }
  @E.proto static Fallback = EmojiFallback
  @E.proto static delegatesFocus = false

  /** The glyph, `undefined` while loading or for an unknown name;  tracked. */
  readonly emoji = new E.Cell(untrack(() => EmojiData.peek(this.attrs.name, EmojiData.setFor(this.host))))

  /** Request counter, so a slower earlier load can't win. */
  private request = 0

  constructor(...args: ConstructorParameters<typeof E.UIElement>) {
    super(...args)
    // again when connected (it may have moved under another root) and when any root's settings change
    createEffect(
      () => ({
        name: this.attrs.name,
        connected: this.connected.get(),
        generation: E.RootSettings.generation.get()
      }),
      ({ name, connected }) => {
        if (connected || !this.request) void this.load(name)
      }
    )
  }

  /**
   * Load every emoji `html` names (`<ui-emoji name="...">`), so a static server render of it draws them.
   * - MUST be awaited before `StaticRender.fragment(html)` / `page(html)` (`$/ui/static`):  that render is synchronous
   *   and draws only names already loaded (`EmojiData.peek()`);  a browser loads them after first paint instead.
   * - In every name set that ships:  which one an element uses depends on its `<ui-root emoji>`, unknown in markup.
   * - `tag`:  the tag the family is defined under, if not its own.
   * - STATIC:  the server render calls it before any element exists.
   */
  static preload(html: string, tag: string = emojiVocabulary.tag): Promise<void> {
    const names: string[] = []
    for (const [, attributes = ""] of html.matchAll(new RegExp(`<${tag}(\\s[^>]*)?>`, "gi"))) {
      const match = NAME_ATTRIBUTE.exec(attributes)
      const name = match && (match[1] ?? match[2] ?? match[3])
      if (name) names.push(name)
    }
    return EmojiData.preload(names)
  }

  protected hostStates() {
    return { disabled: this.attrs.disabled, loading: this.attrs.loading }
  }

  render(): JSX.Element {
    return (
      <span
        class={this.classes()}
        part={this.part("emoji")}
        role={this.isLabelled() ? UIT.IMG : undefined}
        aria-label={this.isLabelled() ? this.attrs.label : undefined}
        aria-hidden={this.attrs.label === "" ? UIT.TRUE : undefined}
      >
        {this.emoji.get()}
      </span>
    )
  }

  /** Named by `label` (and there's a glyph to name)?  Tracked. */
  private isLabelled(): boolean {
    return !!this.attrs.label && !!this.emoji.get()
  }

  /** Resolve `name` in the set this element sees;  writes only if it is still the latest request. */
  private async load(name: string | undefined) {
    const request = ++this.request
    const emoji = await EmojiData.get(name, EmojiData.setFor(this.host))
    if (this.request === request && untrack(this.emoji.get) !== emoji) this.emoji.set(emoji)
  }
}

/**
 * A start tag's `name="..."` attribute, any quoting:  `UIEmoji.preload()` reads the names a page uses from its markup.
 * - Groups 1-3:  the value in double, single or no quotes.
 */
const NAME_ATTRIBUTE = /(?:^|\s)name\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/i
