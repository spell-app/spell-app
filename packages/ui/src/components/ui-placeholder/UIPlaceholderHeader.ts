import { E } from "$/ui/core"
import { PlaceholderShape } from "./PlaceholderShape"
import { placeholderHeaderVocabulary } from "./UIPlaceholderHeader.en"

/****************
 * ### `UIPlaceholderHeader`
 * The component behind `<ui-placeholder-header>`:  a header's skeleton, two taller bars,
 * optionally beside a square (`image`):
 * `<div class="[image] header" part="header"><slot></slot></div>`.
 ****************/
export class UIPlaceholderHeader extends PlaceholderShape<typeof placeholderHeaderVocabulary> {
  @E.proto static vocabulary = placeholderHeaderVocabulary
}
/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UIPlaceholderHeader extends E.AttributeValues<typeof placeholderHeaderVocabulary> {}
