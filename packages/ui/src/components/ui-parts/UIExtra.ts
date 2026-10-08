import { E } from "$/ui/core"
import { extraVocabulary } from "./UIExtra.vocabulary.en"

/****************
 * ### `UIExtra`
 * The component behind `<ui-extra>`:  extra content, `<div class="[text] extra">`,
 * set apart from the main content, such as a card's footer.
 *
 * - `text`:  a feed event's extra text.
 * - Finding its owner, the markup and the sheet all come from `PartComponent`.
 ****************/
export class UIExtra extends E.PartComponent<typeof extraVocabulary> {
  @E.proto static vocabulary = extraVocabulary
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UIExtra extends E.AttributeValues<typeof extraVocabulary> {}
