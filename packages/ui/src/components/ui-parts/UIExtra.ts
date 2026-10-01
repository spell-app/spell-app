import { proto } from "$/ui/core"

import { extraVocabulary } from "./ui-parts.vocabulary.en"
import { PartElement } from "./PartElement"

/****************
 * ### `<ui-extra>`
 * Extra content:  `<div class="[text] extra">`.
 * - Set apart from the main content, e.g. a card's footer;  `text` in a feed.
 * - Everything else (owner context, markup, sheet) comes from `ContentPart`.
 ****************/
export class UIExtra extends PartElement<typeof extraVocabulary> {
  @proto static vocabulary = extraVocabulary
}
