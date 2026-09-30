import { proto } from "$/core"

import { actionsVocabulary } from "./parts.vocabulary.en"
import { PartElement } from "./PartElement"

/****************
 * ### `<ui-actions>`
 * Actions:  `<div class="actions">`.
 * - A modal's or toast's buttons, a comment's reply links.
 * - Everything else (owner context, markup, sheet) comes from `ContentPart`.
 ****************/
export class UIActions extends PartElement<typeof actionsVocabulary> {
  @proto static vocabulary = actionsVocabulary
}
