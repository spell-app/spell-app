import { NativeFallback, proto } from "$/ui/core"

import { brandFlourishVocabulary } from "./ui-brand-flourish.vocabulary.en"

/****************
 * ### `BrandFlourishFallback`
 * Nothing:  the art is decoration, and the page reads the same without it.
 ****************/
export class BrandFlourishFallback extends NativeFallback<typeof brandFlourishVocabulary> {
  @proto static vocabulary = brandFlourishVocabulary

  @proto static degraded = ["the art (decoration only:  nothing is lost)"]

  protected override build() {
    return [this.decorate(this.create("span", { "aria-hidden": "true" }), "art")]
  }
}
