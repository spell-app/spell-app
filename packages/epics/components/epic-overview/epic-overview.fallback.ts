import { NativeFallback, proto } from "$/ui/core"

import { epicOverviewVocabulary } from "./epic-overview.vocabulary.en"

/****************
 * ### `EpicOverviewFallback`
 * The same box without Solid:  its slots, in the `base` part, so `epic-overview.css` draws it unchanged.
 ****************/
export class EpicOverviewFallback extends NativeFallback<typeof epicOverviewVocabulary> {
  @proto static vocabulary = epicOverviewVocabulary

  protected override build() {
    return [
      this.decorate(
        this.create(
          "div",
          { class: this.classes() },
          this.create("slot", { name: "summary" }),
          this.create("slot", { name: "prompt" }),
          this.slot()
        ),
        "base"
      )
    ]
  }
}
