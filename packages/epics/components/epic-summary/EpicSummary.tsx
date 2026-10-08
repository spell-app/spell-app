import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"

import { epicSummaryVocabulary } from "./EpicSummary.en"

import summaryCSS from "./EpicSummary.css?inline"

/****************
 * ### `EpicSummary`
 * The component behind `<epic-summary>`:  the Overview's two-sentence summary, a lede at the top of `1. Overview`.
 * - Draws nothing but the lede's look:  the text is its light children, through the default slot (Q12).
 * - `<epic-overview>` draws it where it drew `<p slot="summary">`:  first, above the Kickoff prompt and the estimate.
 ****************/
export class EpicSummary extends E.UIComponent<typeof epicSummaryVocabulary> {
  @E.proto static vocabulary = epicSummaryVocabulary
  @E.proto static styleSheets = { "epic-summary": summaryCSS }

  render(): JSX.Element {
    return (
      <div class={this.rootClasses} part={this.partForName("base")}>
        <slot />
      </div>
    )
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface EpicSummary extends E.AttributeValues<typeof epicSummaryVocabulary> {}
