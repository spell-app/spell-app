import { proto } from "$/ui/core"

import { placeholderHeaderVocabulary } from "./ui-placeholder.vocabulary.en"
import { PlaceholderShape } from "./PlaceholderShape"

/****************
 * ### `<ui-placeholder-header>`
 * A header's skeleton, two taller bars, optionally beside a square (`image`):
 * `<div class="[image] header" part="header"><slot></slot></div>`.
 ****************/
export class UIPlaceholderHeader extends PlaceholderShape<typeof placeholderHeaderVocabulary> {
  @proto static vocabulary = placeholderHeaderVocabulary
}
