import { Show, createMemo } from "solid-js"
import type { JSX } from "@solidjs/web"

import { proto, SlotContent, UIElement } from "$/ui/core"

import { epicAnswerVocabulary } from "./epic-answer.vocabulary.en"
import { EpicAnswerFallback } from "./epic-answer.fallback"
import {
  BODY,
  EMPTY,
  HEADER,
  HEADING_SEPARATOR,
  LABEL,
  OLD_DECISION,
  TITLE,
  type EpicAnswerVocabulary
} from "./epic-answer.types"

import answerCSS from "./epic-answer.css?inline"

/****************
 * ### `<epic-answer>`
 * An answered question's answer card, after its question and Choices:  a warm card, its heading band
 * `Answer · <title>` -- `D7 · <title>` when it keeps an old decision's id, so old `#d7` links land on it (the id is
 * the host's own) -- then the answer and why (its light children).
 * - No children:  the heading alone, a card one band tall.
 ****************/
export class EpicAnswer extends UIElement<EpicAnswerVocabulary> {
  @proto static vocabulary = epicAnswerVocabulary
  @proto static styles = { answer: answerCSS }
  @proto static Fallback = EpicAnswerFallback
  @proto static delegatesFocus = false

  /** Light-DOM slot occupancy:  has it a body? */
  readonly slots = new SlotContent(this.host)

  /** Its label:  the old decision's id (`D7`), else `Answer`. */
  readonly label = createMemo(() => {
    const id = this.attrs.id ?? ""
    return OLD_DECISION.test(id) ? id.toUpperCase() : this.text("answer")
  })

  render(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part("base")}>
        <div class={HEADER} part={this.part("header")}>
          <b class={LABEL} part={this.part("label")}>
            {this.label()}
          </b>
          <Show when={this.attrs.title}>
            {HEADING_SEPARATOR}
            <span class={TITLE} part={this.part("title")}>
              {this.attrs.title}
            </span>
          </Show>
        </div>
        <div class={[BODY, { [EMPTY]: !this.slots.has("") }]} part={this.part("body")}>
          <slot />
        </div>
      </div>
    )
  }
}
