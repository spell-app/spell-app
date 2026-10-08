import { NativeFallback, proto } from "$/ui/core"

import { epicChoicesVocabulary } from "./epic-choices.vocabulary.en"

/****************
 * ### `EpicChoicesFallback`
 * The same box without Solid:  its slots, in the `base` part, so `epic-choices.css` draws it unchanged.
 * - NOTE: only `<epic-choices>`'s:  `<epic-option>` draw nothing of their own yet
 ****************/
export class EpicChoicesFallback extends NativeFallback<typeof epicChoicesVocabulary> {
  @proto static vocabulary = epicChoicesVocabulary

  protected override build() {
    return [this.decorate(this.create("div", { class: this.classes() }, this.slot()), "base")]
  }
}
