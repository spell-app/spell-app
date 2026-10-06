import { E } from "$/ui/core"
import { PartElement } from "./PartElement"
import { actionsVocabulary } from "./ui-actions.vocabulary.en"

/****************
 * ### `<ui-actions>`
 * Actions:  `<div class="actions">`.
 * - A modal's or toast's buttons, a comment's reply links.
 * - Everything else (owner context, markup, sheet) comes from `ContentPart`.
 ****************/
export class UIActions extends PartElement<typeof actionsVocabulary> {
  @E.proto static vocabulary = actionsVocabulary
}
