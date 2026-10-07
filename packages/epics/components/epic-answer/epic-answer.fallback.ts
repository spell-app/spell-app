import { NativeFallback, proto } from "$/ui/core"

import { epicAnswerVocabulary } from "./epic-answer.vocabulary.en"

/****************
 * ### `EpicAnswerFallback`
 * The same box without Solid:  its slots, in the `base` part, so `epic-answer.css` draws it unchanged.
 * - NOTE: only `<epic-answer>`'s:  `<epic-reply>`, `<epic-more>` draw nothing of their own yet
 ****************/
export class EpicAnswerFallback extends NativeFallback<typeof epicAnswerVocabulary> {
  @proto static vocabulary = epicAnswerVocabulary

  protected override build() {
    return [this.decorate(this.create("div", { class: this.classes() }, this.slot()), "base")]
  }
}
