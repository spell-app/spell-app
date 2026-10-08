import { E } from "$/ui/core"
import { descriptionVocabulary } from "./UIDescription.vocabulary.en"

/****************
 * ### `UIDescription`
 * The component behind `<ui-description>`:  descriptive text, `<div class="description">`.
 *
 * - A card's, item's, modal's, list's, step's or search result's text;  a comment's text.
 * - Finding its owner, the markup and the sheet all come from `PartComponent`.
 ****************/
export class UIDescription extends E.PartComponent<typeof descriptionVocabulary> {
  @E.proto static vocabulary = descriptionVocabulary
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UIDescription extends E.AttributeValues<typeof descriptionVocabulary> {}
