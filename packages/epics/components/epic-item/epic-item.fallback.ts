import { NativeFallback, proto } from "$/ui/core"

import { epicItemVocabulary } from "./epic-item.vocabulary.en"

/****************
 * ### `EpicItemFallback`
 * The same box without Solid:  its slots, in the `base` part, so `epic-item.css` draws it unchanged.
 ****************/
export class EpicItemFallback extends NativeFallback<typeof epicItemVocabulary> {
  @proto static vocabulary = epicItemVocabulary

  protected override build() {
    return [
      this.decorate(
        this.create("div", { class: this.classes() }, this.create("slot", { name: "title" }), this.slot()),
        "base"
      )
    ]
  }
}
