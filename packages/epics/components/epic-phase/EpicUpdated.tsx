import { Show } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"

import { PlanDates } from "$/epics/dates"
// the fold pieces every `<epic-*>` fold shares:  their files, not `epic-item`'s barrel (which would define it here)
import { FOLDS, Fold } from "$/epics/components/epic-item/Fold"
import { FoldButton } from "$/epics/components/epic-item/FoldButton"

import { epicUpdatedVocabulary } from "./EpicUpdated.en"
import { ICON, LABEL, TEXT } from "./EpicPhase.types"

import fieldCSS from "./EpicField.css?inline"
import foldCSS from "$/epics/components/epic-item/FoldButton.css?inline"

/****************
 * ### `EpicUpdated`
 * The component behind `<epic-updated>`:  one dated change to a phase's plan, FENCED under its Symptom / Changes (a
 * dashed orange box) -- the fold chevron, its icon, `Updated` and the time (`at`, to the minute), the phase under
 * way then;  under them, what changed (its children).
 * - Folds by its heading row (Owen, 2026-10-08:  everything in a section box folds):  open to start with;  page
 *   state, never written;  folded, what changed is `hidden="until-found"`.
 * - Kept once the phase is done:  the record of how the plan moved.
 * - A copy in the Phases section's Plan changes box (`of`, the phase it changes) leads with a `P5` link to it.
 ****************/
export class EpicUpdated extends E.UIComponent<typeof epicUpdatedVocabulary> {
  @E.proto static vocabulary = epicUpdatedVocabulary
  @E.proto static styleSheets = { "epic-fold-button": foldCSS, "epic-field": fieldCSS }
  @E.proto static elementSetup = { delegatesFocus: false } satisfies Partial<E.ElementSetup>

  /** Light-DOM slot occupancy:  has it a change to fold? */
  readonly slots = new E.SlotContent(this.domElement)

  /** Open or folded:  open to start with. */
  readonly fold = new Fold(() => true)

  /** Unfolded. */
  @E.cssState("open")
  get isOpen(): boolean {
    return this.fold.isOpen()
  }

  /** Has it what changed (not just its heading)? */
  get hasBody(): boolean {
    return this.slots.hasContent("")
  }

  /** Its icon. */
  readonly glyph = new E.IconGlyph({ owner: this, name: () => "pen to square" })

  /** `at`, as shown:  `10/6/26 14:30` (`PlanDates`). */
  get shownTime(): string {
    return PlanDates.format(this.at)
  }

  render(): JSX.Element {
    return (
      <div class={[this.rootClasses, UPDATED]} part={this.partForName("base")}>
        {/* the heading row:  its cells are the fence's grid's (`display: contents`), its clicks fold */}
        <div ref={this.fold.heading} class={[HEAD, { [FOLDS]: this.hasBody }]}>
          <span class={FOLD_CELL}>
            <Show when={this.hasBody}>
              <FoldButton fold={this.fold} controls={BODY_ID} labelledBy={LABEL_ID} part={this.partForName("toggle")} />
            </Show>
          </span>
          <span class={ICON} part={this.partForName("icon")} aria-hidden="true">
            {this.glyph.svg}
          </span>
          <span id={LABEL_ID} class={[TEXT, LABEL]} part={this.partForName("label")}>
            <Show when={this.of}>
              {(of) => (
                <a class="of" href={`#p${of()}`}>
                  {this.translationForKey("of", { phase: of() })}
                </a>
              )}
            </Show>
            <b>{this.translationForKey("updated")}</b> <time datetime={this.at}>{this.shownTime}</time>
            <Show when={this.phase}>
              {(phase) => <span class="during">{this.translationForKey("during", { phase: phase() })}</span>}
            </Show>
          </span>
        </div>
        <div
          ref={this.fold.watch}
          id={BODY_ID}
          class={[TEXT, BODY]}
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
export interface EpicUpdated extends E.AttributeValues<typeof epicUpdatedVocabulary> {}

/** Class word of its box:  fenced, dashed orange. */
const UPDATED = "updated"

/** Classes of the shadow markup:  the heading row, the fold button's cell, what changed. */
const HEAD = "head"
const FOLD_CELL = "fold-cell"
const BODY = "body"

/** Ids of the shadow markup:  the heading's words (the fold button's name), the box it folds. */
const LABEL_ID = "label"
const BODY_ID = "body"
