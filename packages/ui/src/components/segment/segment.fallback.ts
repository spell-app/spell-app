import { NativeFallback, proto } from "$/ui/core"

import { segmentVocabulary } from "./segment.vocabulary.en"

/****************
 * ### `SegmentFallback`
 * `<div part="segment" class="ui ... segment"><slot></slot></div>`.
 ****************/
export class SegmentFallback extends NativeFallback<typeof segmentVocabulary> {
  @proto static vocabulary = segmentVocabulary
  @proto static degraded = ["the `--ui-inverted` / colour-scheme owner tokens for inverted segments"]

  protected override build() {
    return [this.decorate(this.create("div", { class: this.classes() }, this.slot()), "segment")]
  }
}
