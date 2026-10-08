import { Show } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"

import { PlanDates } from "$/epics/dates"

import { epicReplyVocabulary } from "./EpicReply.en"
import { BODY, DATE, DATED, EMPTY, HEADER, HEADING_SEPARATOR, WHO } from "./EpicAnswer.types"

import answerCSS from "./EpicAnswer.css?inline"

/****************
 * ### `EpicReply`
 * The component behind `<epic-reply>`:  a reply on an item, after its answer -- a card, its heading band
 * `<from> · re: <re>` with the date (`at`) at its right, `10/7/26 10:50` (each part only when set), then the reply
 * (its light children).
 * - The band is a flex row (`.header.dated`):  who and what about on the left, free to wrap;  the date pinned to
 *   the right of the TOP line, never wrapping under them, at any width (Owen, 2026-10-08, P13).
 * - Claude's (or anyone's but Owen's):  violet, the brand's action colour, apart from the warm answer card.
 * - Owen's (`from="Owen"`):  Revisit's orange, as his note on the page.
 ****************/
export class EpicReply extends E.UIComponent<typeof epicReplyVocabulary> {
  @E.proto static vocabulary = epicReplyVocabulary
  @E.proto static styleSheets = { answer: answerCSS }
  @E.proto static elementSetup = { delegatesFocus: false } satisfies Partial<E.ElementSetup>

  /** Light-DOM slot occupancy:  has it a body? */
  readonly slots = new E.SlotContent(this.domElement)

  /** Its heading's left:  who, about what. */
  get who(): string {
    const { from, re } = this
    return [from, re && this.translationForKey("re", { re })].filter(Boolean).join(HEADING_SEPARATOR)
  }

  /** Its heading's right:  when, as drawn (`10/7/26 10:50`). */
  get date(): string {
    return PlanDates.format(this.at)
  }

  protected get extraClasses(): string | undefined {
    return FROM_OWEN.test(this.from ?? "") ? OWEN : undefined
  }

  render(): JSX.Element {
    return (
      <div class={this.rootClasses} part={this.partForName("base")}>
        <div class={[HEADER, DATED]} part={this.partForName("header")} hidden={!this.who && !this.date}>
          <span class={WHO} part={this.partForName("who")}>
            {this.who}
          </span>
          <Show when={this.date}>
            <time class={DATE} part={this.partForName("date")} datetime={this.at}>
              {this.date}
            </time>
          </Show>
        </div>
        <div class={[BODY, { [EMPTY]: !this.slots.hasContent("") }]} part={this.partForName("body")}>
          <slot />
        </div>
      </div>
    )
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface EpicReply extends E.AttributeValues<typeof epicReplyVocabulary> {}

/** A reply Owen wrote (`from="Owen"`):  his note's orange, not Claude's violet. */
const FROM_OWEN = /^owen$/i

/** Class word on a reply box:  Owen's. */
const OWEN = "owen"
