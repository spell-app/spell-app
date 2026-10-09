import { Show, createEffect, untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E } from "$/ui/core"

import { SUMMARY_ID } from "$/epics/review"
// the review controls, shared with `<epic-item>`:  its files, not its barrel (which would define `<epic-item>` here)
import { NoteBox, ReviewButtons, SaidNote, takeToNote } from "$/epics/components/epic-item/ReviewControls"
import { ReviewState } from "$/epics/components/epic-item/ReviewState"
import { OVERVIEW_BUTTONS, STATUS_SLOT, type ReviewTextKey } from "$/epics/components/epic-item/EpicItem.types"

import { epicSummaryVocabulary } from "./EpicSummary.en"

import reviewCSS from "$/epics/components/epic-item/ReviewControls.css?inline"
import summaryCSS from "./EpicSummary.css?inline"

/****************
 * ### `EpicSummary`
 * The component behind `<epic-summary>`:  the Overview's two-sentence summary, a lede at the top of `1. Overview`.
 * - Draws the lede's look:  the text is its light children, through the default slot (Q12).
 * - `<epic-overview>` draws it where it drew `<p slot="summary">`:  first, above the Kickoff prompt and the estimate.
 * - REVIEWED as an Overview sub-section is (epic `airplane` P2;  `ReviewControls.tsx`), keyed `summary` in the inbox
 *   (it has no id of its own):  under the lede, a marked note, then Revisit, Make Todo, Do Now on a line of their own,
 *   then the note box;  only while the page is reviewed.  Owen's kept notes (`slot="notes"`) and Claude's status
 *   cards (`slot="status"`) under the lede, always.
 * - SIDE EFFECT:  follows the review inbox while connected.
 ****************/
export class EpicSummary extends E.UIComponent<typeof epicSummaryVocabulary> {
  @E.proto static vocabulary = epicSummaryVocabulary
  @E.proto static styleSheets = { "epic-summary": summaryCSS, review: reviewCSS }

  /** Its view of the review inbox, keyed `summary`. */
  readonly reviewState = new ReviewState(() => SUMMARY_ID)

  /** Its note box `<textarea>`, once drawn:  Revisit and Edit focus it. */
  private noteInput: HTMLTextAreaElement | undefined

  /** Follow the review inbox while connected (kept alive:  a removed summary stops). */
  onMount(): JSX.Element {
    if (!isServer) {
      createEffect(
        () => this.isConnected,
        (connected) => (connected ? this.reviewState.connect() : undefined)
      )
    }
    return super.onMount()
  }

  render(): JSX.Element {
    return (
      <>
        <div class={this.rootClasses} part={this.partForName("base")}>
          <slot />
        </div>
        <slot name={this.slotForName("notes")} />
        <slot name={this.slotForName(STATUS_SLOT)} />
        <Show when={this.reviewState.reviewing()}>
          <div class="review" part={this.partForName("review")}>
            <SaidNote
              review={this.reviewState}
              text={this.reviewText}
              part={this.partForName("said")}
              onEdit={() => this.takeToNote(this.reviewState.mark()?.note)}
            />
            <ReviewButtons
              review={this.reviewState}
              text={this.reviewText}
              label={this.translationForKey("summaryLabel")}
              buttons={OVERVIEW_BUTTONS}
              part={this.partForName("review-buttons")}
              onOpenBox={() => this.takeToNote()}
            />
            <NoteBox
              review={this.reviewState}
              text={this.reviewText}
              label={this.translationForKey("summaryLabel")}
              part={this.partForName("note-box")}
              ref={(note) => (this.noteInput = note)}
              onEscape={() => this.leaveNote()}
              onUsed={() => this.leaveNote()}
            />
          </div>
        </Show>
      </>
    )
  }

  /** Its texts, as the review controls ask for them. */
  private readonly reviewText = (key: ReviewTextKey, params?: Record<string, string | number>) =>
    this.translationForKey(key, params)

  /** Take the reader to its note box (Revisit;  Edit, with the marked `note`):  always shown, nothing to unfold. */
  private takeToNote(note?: string) {
    takeToNote(
      this.reviewState,
      () => undefined,
      () => this.noteInput,
      note
    )
  }

  /** Done with the note box:  it stays, but stops counting as written in once it's empty. */
  private leaveNote() {
    if (!this.noteInput?.value.trim()) this.reviewState.client?.closeBox(untrack(this.reviewState.id), false)
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface EpicSummary extends E.AttributeValues<typeof epicSummaryVocabulary> {}
