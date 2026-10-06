import { E } from "$/ui/core"
import { adVocabulary } from "./ui-ad.vocabulary.en"
import { TEST } from "./ui-ad.types"

/****************
 * ### `AdFallback`
 * `<div part="ad" class="ui ... ad [test]" [data-text]><slot></slot></div>`:  the element's markup, so `ui-ad.css`
 * sizes it unchanged.
 * - A bare `test` says the vocabulary's ENGLISH `adTest` text:  a failed render can't count on the runtime's
 *   translations.
 ****************/
export class AdFallback extends E.NativeFallback<typeof adVocabulary> {
  @E.proto static vocabulary = adVocabulary
  @E.proto static degraded = ["the translated default `test` text (English)"]

  protected override build() {
    const test = this.attr("test")
    const ad = this.create(
      "div",
      {
        class: this.classes(test === undefined ? undefined : TEST),
        "data-text": test === undefined ? undefined : test || this.defaultText()
      },
      this.slot()
    )
    return [this.decorate(ad, "ad")]
  }

  /** English text of a bare `test` ad, from the vocabulary. */
  private defaultText(): string {
    return this.vocabulary.texts.find(({ key }) => key === "adTest")!.text
  }
}
