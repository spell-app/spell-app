import { NativeFallback, proto } from "$/ui/core"

import { stickyVocabulary } from "./sticky.vocabulary.en"

/****************
 * ### `StickyFallback`
 * The element's markup, plain DOM:  `<div part="sticky" class="ui ... sticky">` around the slot, with the offsets
 * inline -- so the content still sticks (it's CSS);  only the reporting is lost.
 ****************/
export class StickyFallback extends NativeFallback<typeof stickyVocabulary> {
  @proto static vocabulary = stickyVocabulary
  @proto static degraded = ["`:state(stuck)` / `:state(bound)`, `ui-stick` / `ui-unstick`"]

  protected override build() {
    const offset = Number(this.attr("offset")) || 0
    const bottomOffset = Number(this.attr("bottom-offset")) || 0
    const style = `--_ui-sticky-offset: ${offset}px; --_ui-sticky-bottom-offset: ${bottomOffset}px`
    return [this.decorate(this.create("div", { class: this.classes(), style }, this.slot()), "sticky")]
  }
}
