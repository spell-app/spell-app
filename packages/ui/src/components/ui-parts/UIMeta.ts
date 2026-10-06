import { E } from "$/ui/core"
import { PartElement } from "./PartElement"
import { metaVocabulary } from "./ui-meta.vocabulary.en"

/****************
 * ### `<ui-meta>`
 * Metadata:  `<div class="meta">`.
 * - A date or a category;  Fomantic's comment `metadata`.
 * - Everything else (owner context, markup, sheet) comes from `ContentPart`.
 ****************/
export class UIMeta extends PartElement<typeof metaVocabulary> {
  @E.proto static vocabulary = metaVocabulary
}
