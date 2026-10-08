import { E } from "$/ui/core"
import { detailVocabulary } from "./UIDetail.en"

/****************
 * ### `UIDetail`
 * The component behind `<ui-detail>`:  a label's dimmer second value, `<span class="detail">`,
 * owned by `<ui-label>` (`:state(in-label)`).
 *
 * - On an image label it's a tab:  `UILabel.css` sets `--_ui-label-layout: image`, which `UIParts.css` style-queries.
 * - With `href`:  `<a class="detail" href>`, a link detail (`UILabel.css` styles `a.detail`).
 ****************/
export class UIDetail extends E.PartComponent<typeof detailVocabulary> {
  @E.proto static vocabulary = detailVocabulary

  protected get rootTag(): string {
    return this.href ? "a" : "span"
  }

  protected get rootHref(): string | undefined {
    return this.href
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UIDetail extends E.AttributeValues<typeof detailVocabulary> {}
