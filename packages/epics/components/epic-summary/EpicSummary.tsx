import { Show } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"

import { SUMMARY_ID } from "$/epics/review"
// its view of the review inbox:  the file, not `epic-review`'s barrel (`index.ts` defines that family)
import { ReviewState } from "$/epics/components/epic-review/ReviewState"
import { STATUS_SLOT } from "$/epics/components/epic-item/EpicItem.types"

import { epicSummaryVocabulary } from "./EpicSummary.en"

import summaryCSS from "./EpicSummary.css?inline"

/****************
 * ### `EpicSummary`
 * The component behind `<epic-summary>`:  the Overview's two-sentence summary, a lede at the top of `1. Overview`.
 * - Draws the lede's look:  the text is its light children, through the default slot (Q12).
 * - `<epic-overview>` draws it where it drew `<p slot="summary">`:  first, above the Kickoff prompt and the estimate.
 * - REVIEWED as an Overview sub-section is, keyed `summary` in the inbox (it has no id of its own)
 *   (epic `airplane` P2;  `<epic-review>`).
 *   - only while the page is reviewed, under the lede:
 *     a marked note, then Revisit, Make Todo, Do Now on a line of their own, then the note box
 *   - always, under the lede:  Owen's kept notes (`slot="notes"`) and Claude's status cards (`slot="status"`)
 *   - Revisit and Edit need nothing of it:  its note box is always shown
 * - SIDE EFFECT:  follows the review inbox while connected.
 ****************/
export class EpicSummary extends E.UIComponent<typeof epicSummaryVocabulary> {
  @E.proto static vocabulary = epicSummaryVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { "epic-summary": summaryCSS },
    // `disabled`:  only a look (the sheet dims it), so the text stays findable;  `loading`:  the shared spinner
    disabled: "its own",
    loading: "loader"
  } satisfies Partial<E.ElementSetup>

  /** Its view of the review inbox, keyed `summary`:  is the page reviewed?  Has it a marked note? */
  readonly reviewState = new ReviewState(() => SUMMARY_ID)

  /** Follow the review inbox while connected (kept alive:  a removed summary stops). */
  @E.whileConnected
  protected followReviews() {
    return this.reviewState.connect()
  }

  render(): JSX.Element {
    return (
      <>
        <div class={this.rootClass} part={this.partForName("base")}>
          <slot />
        </div>
        <slot name={this.slotForName("notes")} />
        <slot name={this.slotForName(STATUS_SLOT)} />
        <Show when={this.reviewState.reviewing()}>
          <div class="review" part={this.partForName("review")}>
            <Show when={this.reviewState.noted()}>
              <epic-review of={SUMMARY_ID} shows="said" buttons="part" part={this.partForName("said")} />
            </Show>
            <epic-review
              of={SUMMARY_ID}
              shows="buttons"
              buttons="part"
              label={this.translationForKey("summaryLabel")}
              part={this.partForName("review-buttons")}
            />
            <epic-review
              of={SUMMARY_ID}
              shows="note"
              buttons="part"
              label={this.translationForKey("summaryLabel")}
              part={this.partForName("note-box")}
            />
          </div>
        </Show>
      </>
    )
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface EpicSummary extends E.AttributeValues<typeof epicSummaryVocabulary> {}
