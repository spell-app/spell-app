import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"
import { textVocabulary } from "./UIText.en"

import textCSS from "./UIText.css?inline"

/****************
 * ### `UIText`
 * The component behind `<ui-text>`:  inline text in a hue, a status colour or a size.
 *
 * - Its shadow DOM is one span, `<span class="ui … text" part="text">`, around a slot for the text.
 *   The element is `display: contents`:  the span IS the inline box, flowing with the text around it.
 * - `:state(disabled)` is for the page's styles;  `UIText.css` keys on the `disabled` class.
 ****************/
export class UIText extends E.UIComponent<typeof textVocabulary> {
  @E.proto static vocabulary = textVocabulary
  @E.proto static styleSheets = { text: textCSS }
  @E.proto static elementSetup = { delegatesFocus: false } satisfies Partial<E.ElementSetup>

  /**
   * `disabled`:  `:state(disabled)`, for page styling only.
   * - NOT an `isDisabled` override:  that would make the element swallow clicks (`DOMElement`),
   *   and text has nothing to disable.
   */
  @E.cssState("disabled")
  get looksDisabled(): boolean {
    return !!this.disabled
  }

  render(): JSX.Element {
    return (
      <span class={this.rootClass} part={this.partForName("text")}>
        <slot />
      </span>
    )
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UIText extends E.AttributeValues<typeof textVocabulary> {}
