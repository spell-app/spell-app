import type { JSX } from "@solidjs/web"

import { proto, UIElement } from "$/ui/core"

import { epicChoicesVocabulary } from "./epic-choices.vocabulary.en"
import { EpicChoicesFallback } from "./epic-choices.fallback"
import type { EpicChoicesVocabulary } from "./epic-choices.types"

import choicesCSS from "./epic-choices.css?inline"

/****************
 * ### `<epic-choices>`
 * A question's option cards.
 * - P4:  shows its children through its slots, nothing more;  the cards side by side, folded under Choices once
 *   answered:  P5's
 ****************/
export class EpicChoices extends UIElement<EpicChoicesVocabulary> {
  @proto static vocabulary = epicChoicesVocabulary
  @proto static styles = { choices: choicesCSS }
  @proto static Fallback = EpicChoicesFallback

  render(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part("base")}>
        <slot />
      </div>
    )
  }
}
