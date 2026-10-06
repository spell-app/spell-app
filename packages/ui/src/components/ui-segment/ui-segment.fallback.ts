import { E } from "$/ui/core"
import { segmentVocabulary } from "./ui-segment.vocabulary.en"

/****************
 * ### `SegmentFallback`
 * `<div part="segment" class="ui ... segment"><slot></slot></div>`.
 ****************/
export class SegmentFallback extends E.NativeFallback<typeof segmentVocabulary> {
  @E.proto static vocabulary = segmentVocabulary
  @E.proto static degraded = ["the `--ui-inverted` / colour-scheme owner tokens for inverted segments"]

  protected override build() {
    return [this.decorate(this.create("div", { class: this.classes() }, this.slot()), "segment")]
  }
}
