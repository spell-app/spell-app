import { NativeFallback, proto } from "$/ui/core"

import { adVocabulary } from "./ui-ad.vocabulary.en"
import { DEFAULT_TEXT, TEST } from "./ui-ad.types"

/****************
 * ### `AdFallback`
 * `<div part="ad" class="ui ... ad [test]" [data-text]><slot></slot></div>`:  the element's markup, so `ui-ad.css`
 * sizes it unchanged.
 ****************/
export class AdFallback extends NativeFallback<typeof adVocabulary> {
  @proto static vocabulary = adVocabulary
  @proto static degraded = ["the translated default `test` text (English)"]

  protected override build() {
    const test = this.attr("test")
    const ad = this.create(
      "div",
      {
        class: this.classes(test === null ? undefined : TEST),
        "data-text": test === null ? null : test || DEFAULT_TEXT
      },
      this.slot()
    )
    return [this.decorate(ad, "ad")]
  }
}
