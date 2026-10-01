import { proto } from "$/ui/core"

import { metaVocabulary } from "./parts.vocabulary.en"
import { PartElement } from "./PartElement"

/****************
 * ### `<ui-meta>`
 * Metadata:  `<div class="meta">`.
 * - A date or a category;  Fomantic's comment `metadata`.
 * - Everything else (owner context, markup, sheet) comes from `ContentPart`.
 ****************/
export class UIMeta extends PartElement<typeof metaVocabulary> {
  @proto static vocabulary = metaVocabulary
}
