import { NativeFallback, proto } from "$/ui/core"

import { brandBlobVocabulary } from "./ui-brand-blob.vocabulary.en"

/****************
 * ### `BrandBlobFallback`
 * Nothing:  the blob is decoration, and the page reads the same without it.
 ****************/
export class BrandBlobFallback extends NativeFallback<typeof brandBlobVocabulary> {
  @proto static vocabulary = brandBlobVocabulary

  @proto static degraded = ["the shape (decoration only:  nothing is lost)"]

  protected override build() {
    return [this.decorate(this.create("span", { "aria-hidden": "true" }), "blob")]
  }
}
