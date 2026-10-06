import { E } from "$/ui/core"
import { PlaceholderShape } from "./PlaceholderShape"
import { placeholderHeaderVocabulary } from "./ui-placeholder-header.vocabulary.en"

/****************
 * ### `<ui-placeholder-header>`
 * A header's skeleton, two taller bars, optionally beside a square (`image`):
 * `<div class="[image] header" part="header"><slot></slot></div>`.
 ****************/
export class UIPlaceholderHeader extends PlaceholderShape<typeof placeholderHeaderVocabulary> {
  @E.proto static vocabulary = placeholderHeaderVocabulary
}
