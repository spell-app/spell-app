import { NativeFallback, proto } from "$/core"

import { adVocabulary } from "./ad.vocabulary.en"

/****************
 * ### `AdFallback`
 * `<div part="ad" class="ui ... ad [test]" [data-text]><slot></slot></div>`:  the element's markup, so `ad.css`
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

/** Fomantic's placeholder class word. */
const TEST = "test"

/** The English default `test` text, from the vocabulary:  a failed render can't count on the runtime's texts. */
const DEFAULT_TEXT = adVocabulary.texts.find(({ key }) => key === "adTest")!.text
