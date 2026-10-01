import { proto } from "$/ui/core"

import { descriptionVocabulary } from "./ui-parts.vocabulary.en"
import { PartElement } from "./PartElement"

/****************
 * ### `<ui-description>`
 * Descriptive text:  `<div class="description">`.
 * - Card / item / modal / list / step / search text, a comment's text.
 * - Everything else (owner context, markup, sheet) comes from `ContentPart`.
 ****************/
export class UIDescription extends PartElement<typeof descriptionVocabulary> {
  @proto static vocabulary = descriptionVocabulary
}
