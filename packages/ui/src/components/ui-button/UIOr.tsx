import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"
import { orVocabulary } from "./ui-or.vocabulary.en"

import buttonCSS from "./ui-button.css?inline"

/****************
 * ### `<ui-or>`
 * The round "or" between two buttons of a group:  `<span class="or" data-text="or">`, text from `UI.i18n`.
 ****************/
export class UIOr extends E.UIElement<typeof orVocabulary> {
  @E.proto static vocabulary = orVocabulary
  @E.proto static styleSheets = { button: buttonCSS }

  /** Always `:state(or)`. */
  @E.cssState("or")
  get isOr(): boolean {
    return true
  }

  render(): JSX.Element {
    return (
      <span
        class={this.rootClasses}
        part={this.partForName("or")}
        data-text={this.text ?? this.translationForKey("or")}
      />
    )
  }
}

/** The vocabulary getters, typed (`UIElement`'s doc). */
export interface UIOr extends E.AttributeValues<typeof orVocabulary> {}
