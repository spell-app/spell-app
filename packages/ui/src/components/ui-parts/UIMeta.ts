import { E } from "$/ui/core"
import { metaVocabulary } from "./UIMeta.en"

/****************
 * ### `UIMeta`
 * The component behind `<ui-meta>`:  metadata, `<div class="meta">`, such as a date or a category.
 *
 * - Fomantic's comment `.metadata`.
 * - Finding its owner, the markup and the sheet all come from `PartComponent`.
 ****************/
export class UIMeta extends E.PartComponent<typeof metaVocabulary> {
  @E.proto static vocabulary = metaVocabulary
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UIMeta extends E.AttributeValues<typeof metaVocabulary> {}
