import { E } from "$/ui/core"
import { PartElement } from "./PartElement"
import { valueVocabulary } from "./ui-value.vocabulary.en"

/****************
 * ### `<ui-value>`
 * A value:  `<div class="[text] value">`.
 * - A statistic's value;  a search result's price.
 * - Everything else (owner context, markup, sheet) comes from `ContentPart`.
 ****************/
export class UIValue extends PartElement<typeof valueVocabulary> {
  @E.proto static vocabulary = valueVocabulary
}
