import { proto } from "$/core"

import { placeholderParagraphVocabulary } from "./placeholder.vocabulary.en"
import { PlaceholderShape } from "./PlaceholderShape"

/****************
 * ### `<ui-placeholder-paragraph>`
 * A paragraph's skeleton, a block of lines:  `<div class="paragraph" part="paragraph"><slot></slot></div>`.
 ****************/
export class UIPlaceholderParagraph extends PlaceholderShape<typeof placeholderParagraphVocabulary> {
  @proto static vocabulary = placeholderParagraphVocabulary
}
