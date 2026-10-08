import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"
import { textVocabulary } from "./ui-text.vocabulary.en"
import { TextFallback } from "./ui-text.fallback"

import textCSS from "./ui-text.css?inline"

/****************
 * ### `<ui-text>`
 * Inline text in a hue, a status colour or a size:  `<span class="ui ... text" part="text"><slot></slot></span>`.
 * - Host is `display: contents`:  the span IS the inline box, flowing with the text around it.
 * - `:state(disabled)` for page styling;  `ui-text.css` keys on the `disabled` class.
 ****************/
export class UIText extends E.UIElement<typeof textVocabulary> {
  @E.proto static vocabulary = textVocabulary
  @E.proto static styleSheets = { text: textCSS }
  @E.proto static elementSetup = { Fallback: TextFallback, delegatesFocus: false }

  /**
   * `disabled`:  `:state(disabled)`, for page styling only.
   * - NOT an `isDisabled` override:  that would make the host swallow clicks (`UIHost`), and text has nothing to
   *   disable.
   */
  @E.cssState("disabled")
  get looksDisabled(): boolean {
    return !!this.disabled
  }

  render(): JSX.Element {
    return (
      <span class={this.rootClasses} part={this.partForName("text")}>
        <slot />
      </span>
    )
  }
}

/** The vocabulary getters, typed (`UIElement`'s doc). */
export interface UIText extends E.AttributeValues<typeof textVocabulary> {}
