import { NativeFallback, proto } from "$/ui/core"

import { epicOriginalVocabulary } from "./epic-original.vocabulary.en"

/****************
 * ### `EpicOriginalFallback`
 * The same box without Solid:  its slots, in the `base` part, so `epic-original.css` draws it unchanged.
 * - NOTE: only `<epic-original>`'s:  `<epic-version>` draw nothing of their own yet
 ****************/
export class EpicOriginalFallback extends NativeFallback<typeof epicOriginalVocabulary> {
  @proto static vocabulary = epicOriginalVocabulary

  protected override build() {
    return [this.decorate(this.create("div", { class: this.classes() }, this.slot()), "base")]
  }
}
