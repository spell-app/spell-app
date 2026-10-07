import { NativeFallback, proto } from "$/ui/core"

import { epicPageVocabulary } from "./epic-page.vocabulary.en"

/****************
 * ### `EpicPageFallback`
 * The page without Solid:  its h1 (`Epic: <title>`), the durable doc's link, then its blocks -- no meta lines, no
 * step label.  In the `base` part, so `epic-page.css` (and the pack's tokens on `:host`) still apply.
 ****************/
export class EpicPageFallback extends NativeFallback<typeof epicPageVocabulary> {
  @proto static vocabulary = epicPageVocabulary

  protected override build() {
    const heading = this.create("h1", { class: "heading" }, `Epic: ${this.attr("title") ?? ""}`)
    return [
      this.decorate(
        this.create("div", { class: this.classes() }, heading, this.create("slot", { name: "durable" }), this.slot()),
        "base"
      )
    ]
  }
}
