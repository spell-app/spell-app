import { proto } from "$/ui/core"

import { valueVocabulary } from "./ui-parts.vocabulary.en"
import { PartElement } from "./PartElement"

/****************
 * ### `<ui-value>`
 * A value:  `<div class="[text] value">`.
 * - A statistic's value;  a search result's price.
 * - Everything else (owner context, markup, sheet) comes from `ContentPart`.
 ****************/
export class UIValue extends PartElement<typeof valueVocabulary> {
  @proto static vocabulary = valueVocabulary
}
