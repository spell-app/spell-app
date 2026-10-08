import { E } from "$/ui/core"
import { PartElement } from "./PartElement"
import { extraVocabulary } from "./ui-extra.vocabulary.en"

/****************
 * ### `<ui-extra>`
 * Extra content:  `<div class="[text] extra">`.
 * - Set apart from the main content, e.g. a card's footer;  `text` in a feed.
 * - Everything else (owner context, markup, sheet) comes from `ContentPart`.
 ****************/
export class UIExtra extends PartElement<typeof extraVocabulary> {
  @E.proto static vocabulary = extraVocabulary
}

/** The vocabulary getters, typed (`UIElement`'s doc). */
export interface UIExtra extends E.AttributeValues<typeof extraVocabulary> {}
