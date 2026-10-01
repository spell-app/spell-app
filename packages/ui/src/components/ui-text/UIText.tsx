import type { JSX } from "@solidjs/web"

import { proto, UIElement } from "$/ui/core"

import { textVocabulary } from "./ui-text.vocabulary.en"
import { TextFallback } from "./ui-text.fallback"

import textCSS from "./ui-text.css?inline"

/****************
 * ### `<ui-text>`
 * Inline text in a hue, a status colour or a size:  `<span class="ui … text" part="text"><slot></slot></span>`.
 * - Host is `display: contents`:  the span IS the inline box, flowing with the text around it.
 * - `:state(disabled)` for page styling;  `ui-text.css` keys on the `disabled` class.
 ****************/
export class UIText extends UIElement<typeof textVocabulary> {
  @proto static vocabulary = textVocabulary
  @proto static styles = { text: textCSS }
  @proto static Fallback = TextFallback
  @proto static delegatesFocus = false

  protected hostStates() {
    return { disabled: this.attrs.disabled }
  }

  render(): JSX.Element {
    return (
      <span class={this.classes()} part={this.part("text")}>
        <slot />
      </span>
    )
  }
}
