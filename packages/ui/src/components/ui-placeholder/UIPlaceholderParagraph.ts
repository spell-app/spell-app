import { E } from "$/ui/core"
import { PlaceholderShape } from "./PlaceholderShape"
import { placeholderParagraphVocabulary } from "./ui-placeholder-paragraph.vocabulary.en"

/****************
 * ### `<ui-placeholder-paragraph>`
 * A paragraph's skeleton, a block of lines:  `<div class="paragraph" part="paragraph"><slot></slot></div>`.
 ****************/
export class UIPlaceholderParagraph extends PlaceholderShape<typeof placeholderParagraphVocabulary> {
  @E.proto static vocabulary = placeholderParagraphVocabulary
}
export interface UIPlaceholderParagraph extends E.AttributeValues<typeof placeholderParagraphVocabulary> {}
