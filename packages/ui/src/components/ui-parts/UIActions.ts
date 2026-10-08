import { E } from "$/ui/core"
import { actionsVocabulary } from "./UIActions.vocabulary.en"

/****************
 * ### `UIActions`
 * The component behind `<ui-actions>`:  a row of actions, `<div class="actions">`,
 * such as a modal's or a toast's buttons, or a comment's reply links.
 *
 * - Finding its owner, the markup and the sheet all come from `PartComponent`.
 ****************/
export class UIActions extends E.PartComponent<typeof actionsVocabulary> {
  @E.proto static vocabulary = actionsVocabulary
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UIActions extends E.AttributeValues<typeof actionsVocabulary> {}
