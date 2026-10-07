import type { JSX } from "@solidjs/web"

import { proto, UIElement } from "$/ui/core"

import { epicAnswerVocabulary } from "./epic-answer.vocabulary.en"
import { EpicAnswerFallback } from "./epic-answer.fallback"
import type { EpicAnswerVocabulary } from "./epic-answer.types"

import answerCSS from "./epic-answer.css?inline"

/****************
 * ### `<epic-answer>`
 * An answered question's answer card.
 * - P4:  shows its children through its slots, nothing more;  the card and its `Answer · <title>` heading:  P5's
 ****************/
export class EpicAnswer extends UIElement<EpicAnswerVocabulary> {
  @proto static vocabulary = epicAnswerVocabulary
  @proto static styles = { answer: answerCSS }
  @proto static Fallback = EpicAnswerFallback

  render(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part("base")}>
        <slot />
      </div>
    )
  }
}
