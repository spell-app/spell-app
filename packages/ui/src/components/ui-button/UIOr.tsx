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
  @E.proto static styles = { button: buttonCSS }

  protected hostStates() {
    return { or: true }
  }

  render(): JSX.Element {
    return <span class={this.classes()} part={this.part("or")} data-text={this.attrs.text ?? this.text("or")} />
  }
}
