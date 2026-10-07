import { NativeFallback, proto } from "$/ui/core"

import { epicSectionVocabulary } from "./epic-section.vocabulary.en"

/****************
 * ### `EpicSectionFallback`
 * The same box without Solid:  its slots, in the `base` part, so `epic-section.css` draws it unchanged.
 ****************/
export class EpicSectionFallback extends NativeFallback<typeof epicSectionVocabulary> {
  @proto static vocabulary = epicSectionVocabulary

  protected override build() {
    return [
      this.decorate(
        this.create("div", { class: this.classes() }, this.create("slot", { name: "title" }), this.slot()),
        "base"
      )
    ]
  }
}
