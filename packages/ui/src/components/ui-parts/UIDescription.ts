import { E } from "$/ui/core"
import { PartElement } from "./PartElement"
import { descriptionVocabulary } from "./ui-description.vocabulary.en"

/****************
 * ### `<ui-description>`
 * Descriptive text:  `<div class="description">`.
 * - Card / item / modal / list / step / search text, a comment's text.
 * - Everything else (owner context, markup, sheet) comes from `ContentPart`.
 ****************/
export class UIDescription extends PartElement<typeof descriptionVocabulary> {
  @E.proto static vocabulary = descriptionVocabulary
}
