import { E, UIT } from "$/ui/core"
import { visibilityVocabulary } from "./ui-visibility.vocabulary.en"
import { DATA_SRC, DATA_SRCSET, LAZY, LAZY_IMAGES, SRC } from "./ui-visibility.types"

/****************
 * ### `VisibilityFallback`
 * The element's markup, plain DOM:  `<div part="visibility" class="ui visibility">` around a `<slot>`.
 * - With `type="image"` every `<img data-src>` inside gets its source AT ONCE (with `loading="lazy"`, so the browser
 *   still defers it), so no image stays empty.
 ****************/
export class VisibilityFallback extends E.NativeFallback<typeof visibilityVocabulary> {
  @E.proto static vocabulary = visibilityVocabulary
  @E.proto static degraded = [
    "every event and `:state(visible)`;  lazy images load natively, with no fade or `ui-load`"
  ]

  protected override build() {
    const hasImages = this.attr("type") === UIT.IMAGE
    if (hasImages) {
      for (const image of this.host.querySelectorAll<HTMLImageElement>(LAZY_IMAGES)) {
        if (image.hasAttribute(SRC)) continue
        image.loading = LAZY
        const srcset = image.getAttribute(DATA_SRCSET)
        if (srcset) image.srcset = srcset
        image.src = image.getAttribute(DATA_SRC)!
      }
    }
    const root = this.create("div", { class: this.classes(hasImages ? UIT.IMAGE : undefined) }, this.slot())
    return [this.decorate(root, "visibility")]
  }
}
