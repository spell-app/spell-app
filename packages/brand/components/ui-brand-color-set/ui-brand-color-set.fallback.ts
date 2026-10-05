import { NativeFallback, proto } from "$/ui/core"

import { brandColorSetVocabulary } from "./ui-brand-color-set.vocabulary.en"
import { BRAND_COLOR, COLUMNS_PROPERTY, GRID } from "./ui-brand-color-set.types"

/****************
 * ### `BrandColorSetFallback`
 * The set without Solid:  its box around a `<slot>`, laid out by `ui-brand-color-set.css` (`columns` too), so the
 * chips still show.
 ****************/
export class BrandColorSetFallback extends NativeFallback<typeof brandColorSetVocabulary> {
  @proto static vocabulary = brandColorSetVocabulary

  @proto static degraded = ["choosing a chip (`selectable`, `value`)"]

  protected override build() {
    const columns = Math.floor(Number(this.attr("columns")) || 0)
    const box = this.create(
      "div",
      {
        class: this.classes(columns > 0 ? `${GRID} ${BRAND_COLOR}` : BRAND_COLOR),
        style: columns > 0 ? `${COLUMNS_PROPERTY}: ${columns}` : null
      },
      this.slot()
    )
    return [this.decorate(box, "set")]
  }
}
