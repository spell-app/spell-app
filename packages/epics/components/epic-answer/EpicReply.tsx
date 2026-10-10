import { Show } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"

import { PlanDates } from "$/epics/dates"
// the fold pieces every `<epic-*>` fold shares:  their files, not `epic-item`'s barrel (which would define it here)
import { FOLDS, Fold } from "$/epics/components/epic-item/Fold"

import { epicReplyVocabulary } from "./EpicReply.en"
import { BODY, BODY_ID, DATE, DATED, EMPTY, HEADER, HEADING_SEPARATOR, WHO, WHO_ID } from "./EpicAnswer.types"

import answerCSS from "./EpicAnswer.css?inline"
import foldCSS from "$/epics/components/epic-item/Fold.css?inline"

/****************
 * ### `EpicReply`
 * The component behind `<epic-reply>`:  a reply on an item, after its answer -- a card, its heading band
 * `<from> · re: <re>` with the date (`at`) at its right, `10/7/26 10:50` (each part only when set), then the reply
 * (its light children).
 * - The band is a flex row (`.header.dated`):  the fold chevron, then who and what about on the left, free to wrap;
 *   the date pinned to the right of the TOP line, never wrapping under them, at any width (Owen, 2026-10-08, P13).
 * - Folds by its band (Owen, 2026-10-08:  "Owen/Claude entries in the text should be collapsible"):  open to start
 *   with, as it's what's being read;  page state, never written;  folded, the reply is `hidden="until-found"`.
 * - Claude's (or anyone's but Owen's):  violet, the brand's action colour, apart from the warm answer card.
 * - Owen's (`from="Owen"`):  his ivory, as his note box and answer card (decision Q20).
 ****************/
export class EpicReply extends E.UIComponent<typeof epicReplyVocabulary> {
  @E.proto static vocabulary = epicReplyVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { "epic-fold-button": foldCSS, "epic-answer": answerCSS },
    delegatesFocus: false
  } satisfies Partial<E.ElementSetup>

  /** Light-DOM slot occupancy:  has it a body? */
  readonly slots = new E.SlotContent(this.domElement)

  /** Open or folded:  open to start with. */
  readonly fold = new Fold(() => true)

  /** Unfolded. */
  @E.cssState("open")
  get isOpen(): boolean {
    return this.fold.isOpen()
  }

  /** Has it a reply to fold? */
  get hasBody(): boolean {
    return this.slots.hasContent("")
  }

  /** Its heading's left:  who, about what. */
  get who(): string {
    const { from, re } = this
    return [from, re && this.translationForKey("re", { re })].filter(Boolean).join(HEADING_SEPARATOR)
  }

  /** Its heading's right:  when, as drawn (`10/7/26 10:50`). */
  get date(): string {
    return PlanDates.format(this.at)
  }

  protected get extraClass(): string | undefined {
    return FROM_OWEN.test(this.from ?? "") ? OWEN : undefined
  }

  render(): JSX.Element {
    return (
      <div class={this.rootClass} part={this.partForName("base")}>
        <div
          ref={this.fold.heading}
          class={[HEADER, DATED, { [FOLDS]: this.hasBody }]}
          part={this.partForName("header")}
          hidden={!this.who && !this.date}
        >
          <Show when={this.hasBody}>
            {this.fold.button({ controls: BODY_ID, labelledBy: WHO_ID, part: this.partForName("toggle") })}
          </Show>
          <span id={WHO_ID} class={WHO} part={this.partForName("who")}>
            {this.who}
          </span>
          <Show when={this.date}>
            <time class={DATE} part={this.partForName("date")} datetime={this.at}>
              {this.date}
            </time>
          </Show>
        </div>
        <div
          ref={this.fold.watch}
          id={BODY_ID}
          class={[BODY, { [EMPTY]: !this.hasBody }]}
          part={this.partForName("body")}
          hidden={this.fold.hidden()}
        >
          <slot />
        </div>
      </div>
    )
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface EpicReply extends E.AttributeValues<typeof epicReplyVocabulary> {}

/** A reply Owen wrote (`from="Owen"`):  his ivory, not Claude's violet. */
const FROM_OWEN = /^owen$/i

/** Class word on a reply box:  Owen's. */
const OWEN = "owen"
