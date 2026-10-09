import { createEffect, untrack } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"
import { EmojiData } from "./EmojiData"
import { emojiVocabulary } from "./UIEmoji.en"

import emojiCSS from "./UIEmoji.css?inline"

/****************
 * ### `UIEmoji`
 * The component behind `<ui-emoji>`:  an emoji, drawn as the native Unicode character.
 *
 * - Its shadow DOM is one span, `<span class="ui [size] [keyOnly ...] emoji" part="emoji">😄</span>`.
 *
 * - The glyph is the Unicode emoji `EmojiData` resolves from `name`,
 *   loading that name's data chunk on first use.
 *   - A name already loaded (or `EmojiData.register()`ed) draws in the first frame.
 *   - A later `name` wins over an earlier, slower load.
 *   - An unknown name:  an empty box with no role (an unnamed `role=img` fails axe).
 *
 * - The accessible name (see the vocabulary):  the character, as text, by default;
 *   `label="…"` => `role=img` + `aria-label`;  a bare `label` => `aria-hidden`.
 * - `link` is only a LOOK:  the emoji takes no focus and sends nothing of its own;
 *   wrap it in a `<button>` or `<a>`.
 ****************/
export class UIEmoji extends E.UIComponent<typeof emojiVocabulary> {
  @E.proto static vocabulary = emojiVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { emoji: emojiCSS },
    delegatesFocus: false,
    // `disabled`:  only a look
    disabled: "its own",
    // `loading`:  it spins
    loading: "its own"
  } satisfies Partial<E.ElementSetup>

  /** The glyph, `undefined` while loading or for an unknown name. */
  @E.state accessor emoji: string | undefined = untrack(() =>
    EmojiData.peek(this.name, EmojiData.setFor(this.domElement))
  )

  /** Request counter, so a slower earlier load can't win. */
  private latestRequest = 0

  /**
   * Loads the emoji again when connected (it may have moved under another root) and when any root's settings change.
   * - An explicit effect, not `@E.onChange`:  it also follows a page-wide signal (`RootSettings.generation`).
   */
  constructor(...args: ConstructorParameters<typeof E.UIComponent>) {
    super(...args)
    createEffect(
      () => ({
        name: this.name,
        connected: this.isConnected,
        generation: E.RootSettings.generation
      }),
      ({ name, connected }) => {
        if (connected || !this.latestRequest) void this.load(name)
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

  render(): JSX.Element {
    return (
      <span
        class={this.rootClass}
        part={this.partForName("emoji")}
        role={this.isLabelled ? "img" : undefined}
        aria-label={this.isLabelled ? this.label : undefined}
        aria-hidden={this.label === "" ? "true" : undefined}
      >
        {this.emoji}
      </span>
    )
  }

  /** Named by `label` (and there's a glyph to name)? */
  private get isLabelled(): boolean {
    return !!this.label && !!this.emoji
  }

  /** Resolve `name` in the set this element sees;  writes only if it is still the latest request. */
  @E.untracked
  private async load(name: string | undefined) {
    const request = ++this.latestRequest
    const emoji = await EmojiData.get(name, EmojiData.setFor(this.domElement))
    if (this.latestRequest === request && this.emoji !== emoji) this.emoji = emoji
  }
}
/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UIEmoji extends E.AttributeValues<typeof emojiVocabulary> {}

/**
 * A start tag's `name="..."` attribute, any quoting:  `UIEmoji.preload()` reads the names a page uses from its markup.
 * - Groups 1-3:  the value in double, single or no quotes.
 */
const NAME_ATTRIBUTE = /(?:^|\s)name\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/i
