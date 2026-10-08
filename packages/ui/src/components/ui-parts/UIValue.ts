import { E } from "$/ui/core"
import { valueVocabulary } from "./UIValue.en"

/****************
 * ### `UIValue`
 * The component behind `<ui-value>`:  a value, `<div class="[text] value">`,
 * such as a statistic's number or a search result's price.
 *
 * - Finding its owner, the markup and the sheet all come from `PartComponent`.
 ****************/
export class UIValue extends E.PartComponent<typeof valueVocabulary> {
  @E.proto static vocabulary = valueVocabulary
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UIValue extends E.AttributeValues<typeof valueVocabulary> {}
