import { NativeFallback, proto } from "$/ui/core"

import { epicPageVocabulary } from "./epic-page.vocabulary.en"

/****************
 * ### `EpicPageFallback`
 * The same box without Solid:  its slots, in the `base` part, so `epic-page.css` draws it unchanged.
 ****************/
export class EpicPageFallback extends NativeFallback<typeof epicPageVocabulary> {
  @proto static vocabulary = epicPageVocabulary

  protected override build() {
    return [
      this.decorate(
        this.create("div", { class: this.classes() }, this.create("slot", { name: "durable" }), this.slot()),
        "base"
      )
    ]
  }
}
