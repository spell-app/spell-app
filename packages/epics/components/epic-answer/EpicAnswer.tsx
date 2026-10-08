import { Show } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"

import { epicAnswerVocabulary } from "./EpicAnswer.en"
import { BODY, EMPTY, HEADER, HEADING_SEPARATOR } from "./EpicAnswer.types"

import answerCSS from "./EpicAnswer.css?inline"

/****************
 * ### `EpicAnswer`
 * The component behind `<epic-answer>`:  an answered question's answer card, after its question and Choices -- a
 * warm card, its heading band `Answer · <title>` (`D7 · <title>` when it keeps an old decision's id, so old `#d7`
 * links land on it:  the id is the DOM element's own), then the answer and why (its light children).
 * - A title with markup:  a `slot="title"` child, in place of `title` (T12).
 * - No children:  the heading alone, a card one band tall.
 ****************/
export class EpicAnswer extends E.UIComponent<typeof epicAnswerVocabulary> {
  @E.proto static vocabulary = epicAnswerVocabulary
  @E.proto static styleSheets = { answer: answerCSS }
  @E.proto static elementSetup = { delegatesFocus: false } satisfies Partial<E.ElementSetup>

  /** Light-DOM slot occupancy:  has it a body? */
  readonly slots = new E.SlotContent(this.domElement)

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
      <div class={this.rootClasses} part={this.partForName("base")}>
        <div class={HEADER} part={this.partForName("header")}>
          <b class={LABEL} part={this.partForName("label")}>
            {this.label}
          </b>
          <Show when={this.hasTitle}>
            {HEADING_SEPARATOR}
            <span class={TITLE} part={this.partForName("title")}>
              <slot name={this.slotForName("title")}>{this.title}</slot>
            </span>
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
export interface EpicAnswer extends E.AttributeValues<typeof epicAnswerVocabulary> {}

/** An old decision's id (`d7`), kept on its answer card:  the card is labelled `D7`, not `Answer`. */
const OLD_DECISION = /^d\d+$/

/** Class names inside the shadow root. */
const LABEL = "label"
const TITLE = "title"
