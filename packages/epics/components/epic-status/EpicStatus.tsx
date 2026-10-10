import { Show } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"

import { PlanDates } from "$/epics/dates"
// the card's shape and its dated band are the answer family's:  one card, its fills per element
import { BODY, BODY_ID, DATE, DATED, EMPTY, HEADER, WHO, WHO_ID } from "$/epics/components/epic-answer/EpicAnswer.types"
// the fold pieces every `<epic-*>` fold shares:  their files, not `epic-item`'s barrel (which would define it here)
import { FOLDS, Fold } from "$/epics/components/epic-item/Fold"
import { FoldButton } from "$/epics/components/epic-item/FoldButton"

import { epicStatusVocabulary } from "./EpicStatus.en"

import answerCSS from "$/epics/components/epic-answer/EpicAnswer.css?inline"
import foldCSS from "$/epics/components/epic-item/FoldButton.css?inline"
import statusCSS from "./EpicStatus.css?inline"

/****************
 * ### `EpicStatus`
 * The component behind `<epic-status>`:  Claude's status card on an item (or an Overview sub-section), under Owen's
 * note (P13) -- what Claude took his review mark to mean, then that it's done, or noted.
 * - Its band:  the fold chevron, then on the left
 *   - `Claude • Underway` (blue):  Claude is on it
 *   - `Claude • Done` (green):  work was done (an answer written, code changed, a phase built)
 *   - `Claude • Noted` (a calm outline, no fill):  Claude only RECORDED what Owen chose (a pick, a todo made or
 *     queued), so it never reads as work done (Owen, 2026-10-10)
 * - the date at the right of the top line (`.header.dated`, as `EpicReply`'s):  `done-at` once finished, else `at`;
 *   once finished, the date's tooltip says when it was taken
 * - Its body:  the reading (its children), kept as it was when it turns done;
 *   then the summary (`slot="summary"`), only when there is one
 * - Folds by its band, reading and summary together (Owen, 2026-10-08:  everything in a section box folds):
 *   open to start with;  page state, never written;  folded, `hidden="until-found"`
 * - Written by the plan-doc tool (`plan-doc status`, `inbox apply`), never by hand;  a later mark on the same item
 *   adds a new card, the old ones stay
 ****************/
export class EpicStatus extends E.UIComponent<typeof epicStatusVocabulary> {
  @E.proto static vocabulary = epicStatusVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { "epic-fold-button": foldCSS, "epic-answer": answerCSS, "epic-status": statusCSS },
    delegatesFocus: false
  } satisfies Partial<E.ElementSetup>

  /** Light-DOM slot occupancy:  has it a reading, a summary? */
  readonly slots = new E.SlotContent(this.domElement)

  /** Open or folded:  open to start with (Owen, 2026-10-08:  everything in a section box folds). */
  readonly fold = new Fold(() => true)

  /** Unfolded. */
  @E.cssState("open")
  get isOpen(): boolean {
    return this.fold.isOpen()
  }

  /** Has it a reading or a summary to fold? */
  get hasBody(): boolean {
    return this.slots.hasContent("") || this.slots.hasContent(this.slotForName(SUMMARY_SLOT))
  }

  /** Done (green):  work was done. */
  @E.cssState("done")
  get isDone(): boolean {
    return this.state === DONE
  }

  /** Noted (a calm outline):  Claude recorded what Owen chose, nothing more yet. */
  @E.cssState("noted")
  get isNoted(): boolean {
    return this.state === NOTED
  }

  /** Finished:  done or noted;  its band dated `done-at`. */
  get isFinished(): boolean {
    return this.isDone || this.isNoted
  }

  /** Underway (blue):  any `state` but `done` or `noted`, none too. */
  @E.cssState("underway")
  get isUnderway(): boolean {
    return !this.isFinished
  }

  /** When its band says:  `done-at` once finished (a card born so has `at` alone), else `at`. */
  get when(): string | undefined {
    return (this.isFinished && this.doneAt) || this.at
  }

  /** Its band's right:  `when`, as drawn (`10/8/26 14:34`). */
  get date(): string {
    return PlanDates.format(this.when)
  }

  /** The date's tooltip once finished (`taken 10/8/26 14:20`);  none while underway, or with no `done-at`. */
  get dateTip(): string | undefined {
    const { doneAt, at } = this
    return this.isFinished && doneAt && at
      ? this.translationForKey("started", { date: PlanDates.format(at) })
      : undefined
  }

  protected get extraClass(): string | undefined {
    return this.isDone ? DONE : this.isNoted ? NOTED : UNDERWAY
  }

  render(): JSX.Element {
    return (
      <div class={this.rootClass} part={this.partForName("base")}>
        <div
          ref={this.fold.heading}
          class={[HEADER, DATED, { [FOLDS]: this.hasBody }]}
          part={this.partForName("header")}
        >
          <Show when={this.hasBody}>
            <FoldButton fold={this.fold} controls={BODY_ID} labelledBy={WHO_ID} part={this.partForName("toggle")} />
          </Show>
          <span id={WHO_ID} class={WHO} part={this.partForName("who")}>
            {this.translationForKey(this.isDone ? "done" : this.isNoted ? "noted" : "underway")}
          </span>
          <Show when={this.date}>
            <time class={DATE} part={this.partForName("date")} datetime={this.when} title={this.dateTip}>
              {this.date}
            </time>
          </Show>
        </div>
        {/* the reading and the summary fold together */}
        <div ref={this.fold.watch} id={BODY_ID} class={FOLDED} hidden={this.fold.hidden()}>
          <div class={[BODY, { [EMPTY]: !this.slots.hasContent("") }]} part={this.partForName("body")}>
            <slot />
          </div>
          <div
            class={[BODY, SUMMARY, { [EMPTY]: !this.slots.hasContent(this.slotForName(SUMMARY_SLOT)) }]}
            part={this.partForName("summary")}
          >
            <slot name={this.slotForName(SUMMARY_SLOT)} />
          </div>
        </div>
      </div>
    )
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface EpicStatus extends E.AttributeValues<typeof epicStatusVocabulary> {}

/** `state` of a card whose work was done, and its class word:  green, its date `done-at`. */
const DONE = "done"

/** `state` of a card that only RECORDED Owen's choice, and its class word:  a calm outline, its date `done-at`. */
const NOTED = "noted"

/** Class word of a card Claude is still on:  blue. */
const UNDERWAY = "underway"

/** The summary's slot (`<p slot="summary">`), under the reading. */
const SUMMARY_SLOT = "summary"

/** Class names inside the shadow root, beside the card's (`EpicAnswer.types`' `HEADER`, `DATED` ...). */
const SUMMARY = "summary"
/** The box the band folds:  the reading and the summary. */
const FOLDED = "folded"
