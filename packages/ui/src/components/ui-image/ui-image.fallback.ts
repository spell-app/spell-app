import { NativeFallback, proto } from "$/ui/core"

import { imageVocabulary } from "./ui-image.vocabulary.en"
import { imagesVocabulary } from "./ui-images.vocabulary.en"
import { NATIVE } from "./ui-image.types"

/****************
 * ### `ImageFallback`
 * The element's markup, keyed by the host's tag:
 * - `<ui-image>`:  `<img part="image" class="ui ... image" src alt width height loading>`, or
 *   `<a part="image" class href><img part="img" ...></a>` with `href`
 * - `<ui-images>`:  `<div part="group" class="ui ... images"><slot></slot></div>`
 ****************/
export class ImageFallback extends NativeFallback {
  @proto static vocabularies = [imageVocabulary, imagesVocabulary]
  @proto static degraded = []

  protected override build() {
    if (this.vocabulary === imagesVocabulary) {
      return [this.decorate(this.create("div", { class: this.classes() }, this.slot()), "group")]
    }
    const href = this.host.getAttribute("href")
    if (href === null) return [this.decorate(this.image(this.classes()), "image")]
    const disabled = this.flag("disabled")
    const link = this.create(
      "a",
      { class: this.classes(), href: disabled ? null : href, "aria-disabled": disabled ? "true" : null },
      this.image(null, "img")
    )
    return [this.decorate(link, "image")]
  }

  /** The `<img>`, its native attributes copied from the host;  `part` only inside a link (`decorate()` names the root). */
  private image(classes: string | null, part: string | null = null): HTMLImageElement {
    const image = this.create("img", { class: classes, part })
    for (const name of NATIVE) {
      const value = this.host.getAttribute(name)
      if (value !== null) image.setAttribute(name, value)
    }
    return image
  }
}
