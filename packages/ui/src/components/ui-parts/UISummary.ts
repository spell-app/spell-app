import { E } from "$/ui/core"
import { summaryVocabulary } from "./UISummary.en"

/****************
 * ### `UISummary`
 * The component behind `<ui-summary>`:  a summary, `<div class="summary">`,
 * such as a feed event's summary line.
 *
 * - A `<ui-date>` inside it goes inline (`UIParts.css` sets `--_ui-part: summary` on its root).
 * - Finding its owner, the markup and the sheet all come from `PartComponent`.
 ****************/
export class UISummary extends E.PartComponent<typeof summaryVocabulary> {
  @E.proto static vocabulary = summaryVocabulary
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UISummary extends E.AttributeValues<typeof summaryVocabulary> {}
