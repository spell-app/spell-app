import type { JSX } from "@solidjs/web"

import { proto, UIElement } from "$/ui/core"

import { epicReplyVocabulary } from "./epic-reply.vocabulary.en"
import type { EpicReplyVocabulary } from "./epic-answer.types"

import answerCSS from "./epic-answer.css?inline"

/****************
 * ### `<epic-reply>`
 * A reply card on an item.
 * - P4:  shows its children through its slots, nothing more;  the card and its `<from> · <at> · re: <re>`
 *   heading:  P5's
 ****************/
export class EpicReply extends UIElement<EpicReplyVocabulary> {
  @proto static vocabulary = epicReplyVocabulary
  @proto static styles = { answer: answerCSS }

  render(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part("base")}>
        <slot />
      </div>
    )
  }
}
