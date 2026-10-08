import { NativeFallback, proto } from "$/ui/core"

import { epicCommitVocabulary } from "./epic-commit.vocabulary.en"

/****************
 * ### `EpicCommitFallback`
 * The same box without Solid:  its slots, in the `base` part, so `epic-commit.css` draws it unchanged.
 ****************/
export class EpicCommitFallback extends NativeFallback<typeof epicCommitVocabulary> {
  @proto static vocabulary = epicCommitVocabulary

  protected override build() {
    return [this.decorate(this.create("div", { class: this.classes() }, this.slot()), "base")]
  }
}
