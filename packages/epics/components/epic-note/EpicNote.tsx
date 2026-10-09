import { Show } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"

// the fold pieces every `<epic-*>` fold shares:  their files, not `epic-item`'s barrel (which would define it here)
import { FOLDS, Fold } from "$/epics/components/epic-item/Fold"
import { FoldButton } from "$/epics/components/epic-item/FoldButton"

import { epicNoteVocabulary } from "./EpicNote.en"

import noteCSS from "./EpicNote.css?inline"
import foldCSS from "$/epics/components/epic-item/FoldButton.css?inline"

/****************
 * ### `EpicNote`
 * The component behind `<epic-note>`:  a small note in prose, older prose's hand-written UPDATE / DONE message as an
 * element -- a card headed by its label (`UPDATE`, `DONE`), then `title`, its children inside.
 * - Colours by `state`, one meaning each (decision Q20):  `update` orange, changed since you looked;  `done` green,
 *   decided or done.
 * - Never removed by the tool:  unlike `<epic-update>`, it isn't tied to a phase.
 * - Folds by its heading, the chevron first (Owen, 2026-10-08:  everything in a section box folds):  open to start
 *   with;  page state, never written;  folded, the note is `hidden="until-found"`.
 * - The DOM element's own `title` would be a browser tooltip over the whole note:  the card's EMPTY `title` stops it
 *   there (T8).
 ****************/
export class EpicNote extends E.UIComponent<typeof epicNoteVocabulary> {
  @E.proto static vocabulary = epicNoteVocabulary
  @E.proto static styleSheets = { "epic-fold-button": foldCSS, "epic-note": noteCSS }
  @E.proto static elementSetup = { delegatesFocus: false } satisfies Partial<E.ElementSetup>

  /** Light-DOM slot occupancy:  has it a body? */
  readonly slots = new E.SlotContent(this.domElement)

  /** Open or folded:  open to start with. */
  readonly fold = new Fold(() => true)

  /** Unfolded. */
  @E.cssState("open")
  get isOpen(): boolean {
    return this.fold.isOpen()
  }

  /** Has it a note to fold (not just its heading)? */
  get hasBody(): boolean {
    return this.slots.hasContent("")
  }

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
        <div ref={this.fold.heading} class={[HEADER, { [FOLDS]: this.hasBody }]} part={this.partForName("header")}>
          <Show when={this.hasBody}>
            <FoldButton
              fold={this.fold}
              controls={BODY_ID}
              labelledBy={this.title ? `${LABEL_ID} ${TITLE_ID}` : LABEL_ID}
              part={this.partForName("toggle")}
            />
          </Show>
          <span id={LABEL_ID} class={LABEL} part={this.partForName("label")}>
            {this.translationForKey(this.isDone ? "done" : "update")}
          </span>
          <Show when={this.title}>
            {(title) => (
              <>
                {SEPARATOR}
                <span id={TITLE_ID} class={TITLE}>
                  {title()}
                </span>
              </>
            )}
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

/** Ids of the shadow markup:  the heading's words (the fold button's name), the box it folds. */
const LABEL_ID = "label"
const TITLE_ID = "title"
const BODY_ID = "body"
