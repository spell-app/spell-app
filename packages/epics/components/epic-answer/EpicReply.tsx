import { Show, createMemo } from "solid-js"
import type { JSX } from "@solidjs/web"

import { proto, SlotContent, UIElement } from "$/ui/core"

import { PlanDates } from "$/epics/dates"

import { epicReplyVocabulary } from "./epic-reply.vocabulary.en"
import {
  BODY,
  DATE,
  DATED,
  EMPTY,
  FROM_OWEN,
  HEADER,
  HEADING_SEPARATOR,
  OWEN,
  WHO,
  type EpicReplyVocabulary
} from "./epic-answer.types"

import answerCSS from "./epic-answer.css?inline"

/****************
 * ### `<epic-reply>`
 * A reply on an item, after its answer:  a card, its heading band `<from> · re: <re>` with the date (`at`) at its
 * right, `10/7/26 10:50` (each part only when set), then the reply (its light children).
 * - The band is a flex row (`.header.dated`):  who and what about on the left, free to wrap;  the date pinned to
 *   the right of the TOP line, never wrapping under them, at any width (Owen, 2026-10-08, P13).
 * - Claude's (or anyone's but Owen's):  violet, the brand's action colour, apart from the warm answer card.
 * - Owen's (`from="Owen"`):  Revisit's orange, as his note on the page.
 ****************/
export class EpicReply extends UIElement<EpicReplyVocabulary> {
  @proto static vocabulary = epicReplyVocabulary
  @proto static styles = { answer: answerCSS }
  @proto static delegatesFocus = false

  /** Light-DOM slot occupancy:  has it a body? */
  readonly slots = new SlotContent(this.host)

  /** Its heading's left:  who, about what. */
  readonly who = createMemo(() => {
    const { from, re } = this.attrs
    return [from, re && this.text("re", { re })].filter(Boolean).join(HEADING_SEPARATOR)
  })

  /** Its heading's right:  when, as drawn (`10/7/26 10:50`). */
  readonly date = createMemo(() => PlanDates.format(this.attrs.at))

  protected extraClasses(): string | undefined {
    return FROM_OWEN.test(this.attrs.from ?? "") ? OWEN : undefined
  }

  render(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part("base")}>
        <div class={[HEADER, DATED]} part={this.part("header")} hidden={!this.who() && !this.date()}>
          <span class={WHO} part={this.part("who")}>
            {this.who()}
          </span>
          <Show when={this.date()}>
            <time class={DATE} part={this.part("date")} datetime={this.attrs.at}>
              {this.date()}
            </time>
          </Show>
        </div>
        <div class={[BODY, { [EMPTY]: !this.slots.has("") }]} part={this.part("body")}>
          <slot />
        </div>
      </div>
    )
  }
}
