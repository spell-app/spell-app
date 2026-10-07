import type { JSX } from "@solidjs/web"

import { proto, UIElement } from "$/ui/core"

import { epicMoreVocabulary } from "./epic-more.vocabulary.en"
import type { EpicMoreVocabulary } from "./epic-answer.types"

import answerCSS from "./epic-answer.css?inline"

/****************
 * ### `<epic-more>`
 * The More Details card on an item.
 * - P4:  shows its children through its slots, nothing more;  the white, open, foldable card:  P5's
 ****************/
export class EpicMore extends UIElement<EpicMoreVocabulary> {
  @proto static vocabulary = epicMoreVocabulary
  @proto static styles = { answer: answerCSS }

  render(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part("base")}>
        <slot />
      </div>
    )
  }
}
