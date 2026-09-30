import { NativeFallback, proto, type NativeFallbackRoot } from "$/core"

import { imageVocabulary, imagesVocabulary } from "./image.vocabulary.en"

/****************
 * ### `ImageFallback`
 * The element's markup, keyed by the host's tag:
 * - `<ui-image>`:  `<img part="image" class="ui ... image" src alt width height loading>`, or
 *   `<a part="image" class href><img part="img" ...></a>` with `href`
 * - `<ui-images>`:  `<div part="group" class="ui ... images"><slot></slot></div>`
 ****************/
export class ImageFallback extends NativeFallback {
  @proto static degraded = []

  constructor(host: HTMLElement, root: NativeFallbackRoot, error?: unknown, internals?: ElementInternals) {
    super(host, root, error, internals)
    // Shadows the prototype's placeholder vocabulary, see `@proto`.
    this.vocabulary = host.localName === imagesVocabulary.tag ? imagesVocabulary : imageVocabulary
  }

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

/** Host attributes passed to the `<img>` as they are. */
const NATIVE = ["src", "alt", "width", "height", "loading"] as const
