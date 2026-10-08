import { E } from "$/ui/core"
import { contentVocabulary } from "./UIContent.en"

/****************
 * ### `UIContent`
 * The component behind `<ui-content>`:  an owner's main block of content,
 * `<div class="[image] [scrolling] [floated] [text-align] [vertical-align] content">`.
 *
 * - `image` and `scrolling` are a modal's layouts;  `floated`, `text-align` and `vertical-align` are Fomantic's
 *   `right floated content` and `center aligned content` (in a card, an item, a list).
 * - `scrolling`:  the root is a keyboard stop (`tabindex=0`), as every scrollable region must be.
 * - Finding its owner, the markup and the sheet all come from `PartComponent`.
 ****************/
export class UIContent extends E.PartComponent<typeof contentVocabulary> {
  @E.proto static vocabulary = contentVocabulary

  protected get rootTabIndex(): number | undefined {
    return this.scrolling ? 0 : undefined
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UIContent extends E.AttributeValues<typeof contentVocabulary> {}
