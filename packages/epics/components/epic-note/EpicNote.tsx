import { Show } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"

import { epicNoteVocabulary } from "./EpicNote.en"

import noteCSS from "./EpicNote.css?inline"

/****************
 * ### `EpicNote`
 * The component behind `<epic-note>`:  a small note in prose, older prose's hand-written UPDATE / DONE message as an
 * element -- a card headed by its label (`UPDATE`, `DONE`), then `title`, its children inside.
 * - Colours by `state`, one meaning each (decision Q20):  `update` orange, changed since you looked;  `done` green,
 *   decided or done.
 * - Never folded, never removed by the tool:  unlike `<epic-update>`, it isn't tied to a phase.
 * - The DOM element's own `title` would be a browser tooltip over the whole note:  the card's EMPTY `title` stops it
 *   there (T8).
 ****************/
export class EpicNote extends E.UIComponent<typeof epicNoteVocabulary> {
  @E.proto static vocabulary = epicNoteVocabulary
  @E.proto static styleSheets = { "epic-note": noteCSS }
  @E.proto static elementSetup = { delegatesFocus: false } satisfies Partial<E.ElementSetup>

  /** Light-DOM slot occupancy:  has it a body? */
  readonly slots = new E.SlotContent(this.domElement)

  /** Is it a DONE note?  Anything else reads as an UPDATE. */
  get isDone(): boolean {
    return this.state === DONE
  }

  protected get extraClasses(): string | undefined {
    return this.isDone ? DONE : UPDATE
  }

  render(): JSX.Element {
    return (
      <div class={this.rootClasses} part={this.partForName("base")} title="">
        <div class={HEADER} part={this.partForName("header")}>
          <span class={LABEL} part={this.partForName("label")}>
            {this.translationForKey(this.isDone ? "done" : "update")}
          </span>
          <Show when={this.title}>
            {(title) => (
              <>
                {SEPARATOR}
                <span class={TITLE}>{title()}</span>
              </>
            )}
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
export interface EpicNote extends E.AttributeValues<typeof epicNoteVocabulary> {}

/** `state`'s values, which are also the card's classes. */
const UPDATE = "update"
const DONE = "done"

/** Between the label and the title. */
const SEPARATOR = " · "

/** Classes of the shadow markup. */
const HEADER = "header"
const LABEL = "label"
const TITLE = "title"
const BODY = "body"
const EMPTY = "empty"
