import { Show, createMemo } from "solid-js"
import type { JSX } from "@solidjs/web"

import { proto, SlotContent, UIElement } from "$/ui/core"

import { PlanDates } from "$/epics/dates"
// the card's shape and its dated band are the answer family's:  one card, its fills per element
import { BODY, DATE, DATED, EMPTY, HEADER, WHO } from "$/epics/components/epic-answer/epic-answer.types"

import { epicStatusVocabulary } from "./epic-status.vocabulary.en"
import { EpicStatusFallback } from "./epic-status.fallback"
import { DONE, SUMMARY, SUMMARY_SLOT, type EpicStatusVocabulary } from "./epic-status.types"

import answerCSS from "$/epics/components/epic-answer/epic-answer.css?inline"
import statusCSS from "./epic-status.css?inline"

/****************
 * ### `<epic-status>`
 * Claude's status card on an item (or an Overview sub-section), under Owen's note (P13):  what Claude took his
 * review mark to mean, then that it's done.
 * - Its band:  `Claude • Underway` (orange) or `Claude • Done` (violet) on the left, the date at the right of the
 *   top line (`.header.dated`, as `<epic-reply>`'s):  `done-at` once done, else `at`;  once done, the date's tooltip
 *   says when it was taken
 * - Its body:  the reading (its children), kept as it was when it turns done;  then the summary (`slot="summary"`),
 *   only when there is one
 * - Written by the plan-doc tool (`plan-doc status`, `inbox apply`), never by hand;  a later mark on the same item
 *   adds a new card, the old ones stay
 ****************/
export class EpicStatus extends UIElement<EpicStatusVocabulary> {
  @proto static vocabulary = epicStatusVocabulary
  @proto static styles = { answer: answerCSS, status: statusCSS }
  @proto static Fallback = EpicStatusFallback
  @proto static delegatesFocus = false

  /** Light-DOM slot occupancy:  has it a summary? */
  readonly slots = new SlotContent(this.host)

  /** Done (violet), else underway (orange). */
  readonly isDone = createMemo(() => this.attrs.state === DONE)

  /** When its band says:  `done-at` once done (a card born done has `at` alone), else `at`. */
  readonly when = createMemo(() => (this.isDone() && this.attrs.doneAt) || this.attrs.at)

  /** Its band's right:  `when`, as drawn (`10/8/26 14:34`). */
  readonly date = createMemo(() => PlanDates.format(this.when()))

  /** The date's tooltip once done (`taken 10/8/26 14:20`);  none while underway, or with no `done-at`. */
  readonly dateTip = createMemo(() => {
    const { doneAt, at } = this.attrs
    return this.isDone() && doneAt && at ? this.text("started", { date: PlanDates.format(at) }) : undefined
  })

  protected extraClasses(): string | undefined {
    return this.isDone() ? DONE : "underway"
  }

  protected hostStates() {
    return { underway: !this.isDone(), done: this.isDone() }
  }

  render(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part("base")}>
        <div class={[HEADER, DATED]} part={this.part("header")}>
          <span class={WHO} part={this.part("who")}>
            {this.text(this.isDone() ? "done" : "underway")}
          </span>
          <Show when={this.date()}>
            <time class={DATE} part={this.part("date")} datetime={this.when()} title={this.dateTip()}>
              {this.date()}
            </time>
          </Show>
        </div>
        <div class={[BODY, { [EMPTY]: !this.slots.has("") }]} part={this.part("body")}>
          <slot />
        </div>
        <div class={[BODY, SUMMARY, { [EMPTY]: !this.slots.has(SUMMARY_SLOT) }]} part={this.part("summary")}>
          <slot name={this.slot(SUMMARY_SLOT)} />
        </div>
      </div>
    )
  }
}
