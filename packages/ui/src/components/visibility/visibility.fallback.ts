import { NativeFallback, proto } from "$/ui/core"

import { visibilityVocabulary } from "./visibility.vocabulary.en"

/****************
 * ### `VisibilityFallback`
 * The element's markup, plain DOM:  `<div part="visibility" class="ui visibility">` around a `<slot>`.  With `type="image"` every `<img data-src>` inside gets its source
 * AT ONCE (with `loading="lazy"`, so the browser still defers it), so no image stays empty.
 ****************/
export class VisibilityFallback extends NativeFallback<typeof visibilityVocabulary> {
  @proto static vocabulary = visibilityVocabulary
  @proto static degraded = ["every event and `:state(visible)`;  lazy images load natively, with no fade or `ui-load`"]

  protected override build() {
    const images = this.attr("type") === "image"
    if (images) {
      for (const image of this.host.querySelectorAll<HTMLImageElement>("img[data-src]")) {
        if (image.hasAttribute("src")) continue
        image.loading = "lazy"
        const srcset = image.getAttribute("data-srcset")
        if (srcset) image.srcset = srcset
        image.src = image.getAttribute("data-src")!
      }
    }
    return [
      this.decorate(
        this.create("div", { class: this.classes(images ? "image" : undefined) }, this.slot()),
        "visibility"
      )
    ]
  }
}
