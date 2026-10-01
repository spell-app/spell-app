import { proto } from "$/ui/core"

import { detailVocabulary } from "./parts.vocabulary.en"
import { PartElement } from "./PartElement"

/****************
 * ### `<ui-detail>`
 * A label's dimmer second value:  `<span class="detail">`, owned by `<ui-label>` (`:state(in-label)`).
 * - A tab on an image label:  `label.css` sets `--_ui-label-layout: image`, which `parts.css` style-queries.
 * - `href` renders `<a class="detail" href>` (a link detail, `label.css` styles `a.detail`).
 ****************/
export class UIDetail extends PartElement<typeof detailVocabulary> {
  @proto static vocabulary = detailVocabulary

  protected tag(): string {
    return this.attrs.href ? "a" : "span"
  }

  protected href(): string | undefined {
    return this.attrs.href
  }
}
