import { proto } from "$/ui/core"

import { summaryVocabulary } from "./ui-summary.vocabulary.en"
import { PartElement } from "./PartElement"

/****************
 * ### `<ui-summary>`
 * A summary:  `<div class="summary">`.
 * - A feed event's summary line;  a date inside it goes inline (`--_ui-part: summary`).
 * - Everything else (owner context, markup, sheet) comes from `ContentPart`.
 ****************/
export class UISummary extends PartElement<typeof summaryVocabulary> {
  @proto static vocabulary = summaryVocabulary
}
