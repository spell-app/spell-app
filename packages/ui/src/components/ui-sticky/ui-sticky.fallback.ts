import { E } from "$/ui/core"
import { stickyVocabulary } from "./ui-sticky.vocabulary.en"
import { BOTTOM_OFFSET_PROPERTY, OFFSET_PROPERTY } from "./ui-sticky.types"

/****************
 * ### `StickyFallback`
 * The element's markup, plain DOM:  `<div part="sticky" class="ui ... sticky">` around the slot, with the offsets
 * inline -- so the content still sticks (it's CSS);  only the reporting is lost.
 ****************/
export class StickyFallback extends E.NativeFallback<typeof stickyVocabulary> {
  @E.proto static vocabulary = stickyVocabulary
  @E.proto static degraded = ["`:state(stuck)` / `:state(bound)`, `ui-stick` / `ui-unstick`"]

  protected override build() {
    const offset = Number(this.attr("offset")) || 0
    const bottomOffset = Number(this.attr("bottom-offset")) || 0
    const style = `${OFFSET_PROPERTY}: ${offset}px; ${BOTTOM_OFFSET_PROPERTY}: ${bottomOffset}px`
    return [this.decorate(this.create("div", { class: this.classes(), style }, this.slot()), "sticky")]
  }
}
