import { NativeFallback, proto } from "$/ui/core"

import { epicEventVocabulary } from "./epic-event.vocabulary.en"

/****************
 * ### `EpicEventFallback`
 * The same box without Solid:  its slots, in the `base` part, so `epic-event.css` draws it unchanged.
 ****************/
export class EpicEventFallback extends NativeFallback<typeof epicEventVocabulary> {
  @proto static vocabulary = epicEventVocabulary

  protected override build() {
    return [this.decorate(this.create("div", { class: this.classes() }, this.slot()), "base")]
  }
}
