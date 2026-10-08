import { E } from "$/ui/core"
import { PartElement } from "./PartElement"
import { summaryVocabulary } from "./ui-summary.vocabulary.en"

/****************
 * ### `<ui-summary>`
 * A summary:  `<div class="summary">`.
 * - A feed event's summary line;  a date inside it goes inline (`--_ui-part: summary`).
 * - Everything else (owner context, markup, sheet) comes from `ContentPart`.
 ****************/
export class UISummary extends PartElement<typeof summaryVocabulary> {
  @E.proto static vocabulary = summaryVocabulary
}

/** The vocabulary getters, typed (`UIElement`'s doc). */
export interface UISummary extends E.AttributeValues<typeof summaryVocabulary> {}
