import { E } from "$/ui/core"
import { PlaceholderShape } from "./PlaceholderShape"
import { placeholderParagraphVocabulary } from "./UIPlaceholderParagraph.vocabulary.en"

/****************
 * ### `UIPlaceholderParagraph`
 * The component behind `<ui-placeholder-paragraph>`:  a paragraph's skeleton, a block of lines:
 * `<div class="paragraph" part="paragraph"><slot></slot></div>`.
 ****************/
export class UIPlaceholderParagraph extends PlaceholderShape<typeof placeholderParagraphVocabulary> {
  @E.proto static vocabulary = placeholderParagraphVocabulary
}
/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UIPlaceholderParagraph extends E.AttributeValues<typeof placeholderParagraphVocabulary> {}
