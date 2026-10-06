import { E, UIT } from "$/ui/core"
import { imageVocabulary } from "./ui-image.vocabulary.en"
import { imagesVocabulary } from "./ui-images.vocabulary.en"

/****************
 * ### `ImageFallback`
 * The element's markup, keyed by the host's tag:
 * - `<ui-image>`:  `<img part="image" class="ui ... image" src alt width height loading>`, or
 *   `<a part="image" class href><img part="img" ...></a>` with `href`
 * - `<ui-images>`:  `<div part="group" class="ui ... images"><slot></slot></div>`
 ****************/
export class ImageFallback extends E.NativeFallback<typeof imageVocabulary | typeof imagesVocabulary> {
  @E.proto static vocabularies = [imageVocabulary, imagesVocabulary]
  @E.proto static degraded = []

  protected override build() {
    if (this.vocabulary === imagesVocabulary) {
      return [this.decorate(this.create("div", { class: this.classes() }, this.slot()), "group")]
    }
    const href = this.attr("href")
    if (href === null) return [this.decorate(this.image({ class: this.classes() }), "image")]
    const disabled = this.flag("disabled")
    const link = this.create(
      "a",
      { class: this.classes(), href: disabled ? undefined : href, "aria-disabled": disabled ? UIT.TRUE : undefined },
      this.image({ part: IMG_PART })
    )
    return [this.decorate(link, "image")]
  }

  /** The `<img>` with `attributes`, its native ones copied from the host;  `decorate()` names a root one. */
  private image(attributes: E.NativeFallbackAttributes): HTMLImageElement {
    const image = this.create("img", attributes)
    for (const name of NATIVE_ATTRIBUTES) {
      const value = this.attr(name)
      if (value !== null) image.setAttribute(name, value)
    }
    return image
  }
}

/** Host attributes passed to the `<img>` as they are. */
const NATIVE_ATTRIBUTES = ["src", "alt", "width", "height", "loading"] as const

/** Part of the `<img>` inside a link. */
const IMG_PART: E.PartNameOf<typeof imageVocabulary> = "img"
