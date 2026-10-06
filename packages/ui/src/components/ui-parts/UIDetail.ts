import { E, UIT } from "$/ui/core"
import { PartElement } from "./PartElement"
import { detailVocabulary } from "./ui-detail.vocabulary.en"

/****************
 * ### `<ui-detail>`
 * A label's dimmer second value:  `<span class="detail">`, owned by `<ui-label>` (`:state(in-label)`).
 * - A tab on an image label:  `ui-label.css` sets `--_ui-label-layout: image`, which `ui-parts.css` style-queries.
 * - `href` renders `<a class="detail" href>` (a link detail, `ui-label.css` styles `a.detail`).
 ****************/
export class UIDetail extends PartElement<typeof detailVocabulary> {
  @E.proto static vocabulary = detailVocabulary

  protected tag(): string {
    return this.attrs.href ? UIT.ANCHOR_TAG : "span"
  }

  protected href(): string | undefined {
    return this.attrs.href
  }
}
