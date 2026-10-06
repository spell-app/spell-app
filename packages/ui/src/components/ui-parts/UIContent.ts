import { E } from "$/ui/core"
import { PartElement } from "./PartElement"
import { contentVocabulary } from "./ui-content.vocabulary.en"

/****************
 * ### `<ui-content>`
 * A content block:  `<div class="[image] [scrolling] [floated] [text-align] [vertical-align] content">`.
 * - The main content block of an owner;  `image` / `scrolling` are modal layouts;  `floated` / `text-align` /
 *   `vertical-align` are Fomantic's `right floated content`, `center aligned content` (card, item, list).
 * - `scrolling`:  the root is a keyboard stop (`tabindex=0`), as every scrollable region must be.
 * - Everything else (owner context, markup, sheet) comes from `ContentPart`.
 ****************/
export class UIContent extends PartElement<typeof contentVocabulary> {
  @E.proto static vocabulary = contentVocabulary

  protected tabIndex(): number | undefined {
    return this.attrs.scrolling ? 0 : undefined
  }
}
