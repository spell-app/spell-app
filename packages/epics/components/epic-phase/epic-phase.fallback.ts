import { NativeFallback, proto } from "$/ui/core"

import { epicPhaseVocabulary } from "./epic-phase.vocabulary.en"

/****************
 * ### `EpicPhaseFallback`
 * The same box without Solid:  its slots, in the `base` part, so `epic-phase.css` draws it unchanged.
 * - NOTE: only `<epic-phase>`'s:  `<epic-field>`, `<epic-updated>` draw nothing of their own yet
 ****************/
export class EpicPhaseFallback extends NativeFallback<typeof epicPhaseVocabulary> {
  @proto static vocabulary = epicPhaseVocabulary

  protected override build() {
    return [
      this.decorate(
        this.create("div", { class: this.classes() }, this.create("slot", { name: "title" }), this.slot()),
        "base"
      )
    ]
  }
}
