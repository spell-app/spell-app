import { Show } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"

// the fold pieces every `<epic-*>` fold shares:  their files, not `epic-item`'s barrel (which would define it here)
import { FOLDS, Fold } from "$/epics/components/epic-item/Fold"

import { epicAnswerVocabulary } from "./EpicAnswer.en"
import { BODY, BODY_ID, EMPTY, HEADER, HEADING_SEPARATOR, LABEL_ID, TITLE_ID } from "./EpicAnswer.types"

import answerCSS from "./EpicAnswer.css?inline"
import foldCSS from "$/epics/components/epic-item/Fold.css?inline"

/****************
 * ### `EpicAnswer`
 * The component behind `<epic-answer>`:  an answered question's answer card, after its question and Choices --
 * a warm card, its heading band `Answer · <title>` (`D7 · <title>` when it keeps an old decision's id,
 * so old `#d7` links land on it:  the id is the DOM element's own), then the answer and why (its light children).
 * - A title with markup:  a `slot="title"` child, in place of `title` (T12).
 * - No children:  the heading alone, a card one band tall.
 * - Folds by its band, the chevron first (Owen, 2026-10-08:  everything in a section box folds):  open to start
 *   with;  page state, never written;  folded, the answer is `hidden="until-found"`.
 ****************/
export class EpicAnswer extends E.UIComponent<typeof epicAnswerVocabulary> {
  @E.proto static vocabulary = epicAnswerVocabulary
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

  /** Has it an answer to fold (not just its heading)? */
  get hasBody(): boolean {
    return this.slots.hasContent("")
  }

  /** Its label:  the old decision's id (`D7`), else `Answer`. */
  get label(): string {
    const id = this.id ?? ""
    return OLD_DECISION.test(id) ? id.toUpperCase() : this.translationForKey("answer")
  }

  /** Has a title:  `title`, or a `slot="title"` child (a title with markup, T12). */
  get hasTitle(): boolean {
    return !!this.title || this.slots.hasContent(this.slotForName("title"))
  }

  render(): JSX.Element {
    return (
      <div class={this.rootClass} part={this.partForName("base")}>
        <div ref={this.fold.heading} class={[HEADER, { [FOLDS]: this.hasBody }]} part={this.partForName("header")}>
          <Show when={this.hasBody}>
            {this.fold.button({
              controls: BODY_ID,
              labelledBy: this.hasTitle ? `${LABEL_ID} ${TITLE_ID}` : LABEL_ID,
              part: this.partForName("toggle")
            })}
          </Show>
          <b id={LABEL_ID} class={LABEL} part={this.partForName("label")}>
            {this.label}
          </b>
          <Show when={this.hasTitle}>
            {HEADING_SEPARATOR}
            <span id={TITLE_ID} class={TITLE} part={this.partForName("title")}>
              <slot name={this.slotForName("title")}>{this.title}</slot>
            </span>
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
export interface EpicAnswer extends E.AttributeValues<typeof epicAnswerVocabulary> {}

/** An old decision's id (`d7`), kept on its answer card:  the card is labelled `D7`, not `Answer`. */
const OLD_DECISION = /^d\d+$/

/** Class names inside the shadow root. */
const LABEL = "label"
const TITLE = "title"
