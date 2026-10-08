import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"
import { orVocabulary } from "./UIOr.en"

import buttonCSS from "./UIButton.css?inline"

/****************
 * ### `UIOr`
 * The component behind `<ui-or>`:  the round "or" between two buttons of a group.
 *
 * - Its shadow DOM is one box, `<span class="or" data-text="or">`:  the CSS draws the text.
 * - The text is `text`, else the page language's word for "or" (`UI.i18n`).
 ****************/
export class UIOr extends E.UIComponent<typeof orVocabulary> {
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

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UIOr extends E.AttributeValues<typeof orVocabulary> {}
