import { createMemo } from "solid-js"
import type { JSX } from "@solidjs/web"

import { proto, SlotContent, UIElement } from "$/ui/core"

import { epicReplyVocabulary } from "./epic-reply.vocabulary.en"
import { BODY, EMPTY, FROM_OWEN, HEADER, HEADING_SEPARATOR, OWEN, type EpicReplyVocabulary } from "./epic-answer.types"

import answerCSS from "./epic-answer.css?inline"

/****************
 * ### `<epic-reply>`
 * A reply on an item, after its answer:  a card, its heading band `<from> · <at> · re: <re>` (each part only when
 * set), then the reply (its light children).
 * - Claude's (or anyone's but Owen's):  violet, the brand's action colour, apart from the warm answer card.
 * - Owen's (`from="Owen"`):  Revisit's orange, as his note on the page.
 ****************/
export class EpicReply extends UIElement<EpicReplyVocabulary> {
  @proto static vocabulary = epicReplyVocabulary
  @proto static styles = { answer: answerCSS }
  @proto static delegatesFocus = false

  /** Light-DOM slot occupancy:  has it a body? */
  readonly slots = new SlotContent(this.host)

  /** Its heading:  who, when, about what. */
  readonly heading = createMemo(() => {
    const { from, at, re } = this.attrs
    return [from, at, re && this.text("re", { re })].filter(Boolean).join(HEADING_SEPARATOR)
  })

  protected extraClasses(): string | undefined {
    return FROM_OWEN.test(this.attrs.from ?? "") ? OWEN : undefined
  }

  render(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part("base")}>
        <div class={HEADER} part={this.part("header")} hidden={!this.heading()}>
          {this.heading()}
        </div>
        <div class={[BODY, { [EMPTY]: !this.slots.has("") }]} part={this.part("body")}>
          <slot />
        </div>
      </div>
    )
  }
}
