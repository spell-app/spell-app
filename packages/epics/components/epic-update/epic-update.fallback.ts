import { NativeFallback, proto } from "$/ui/core"

import { epicUpdateVocabulary } from "./epic-update.vocabulary.en"

/****************
 * ### `EpicUpdateFallback`
 * The same box without Solid:  its slots, in the `base` part, so `epic-update.css` draws it unchanged.
 ****************/
export class EpicUpdateFallback extends NativeFallback<typeof epicUpdateVocabulary> {
  @proto static vocabulary = epicUpdateVocabulary

  protected override build() {
    return [this.decorate(this.create("div", { class: this.classes() }, this.slot()), "base")]
  }
}
