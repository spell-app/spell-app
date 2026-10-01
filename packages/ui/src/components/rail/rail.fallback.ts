import { NativeFallback, proto } from "$/ui/core"

import { railVocabulary } from "./rail.vocabulary.en"

/****************
 * ### `RailFallback`
 * `<div part="rail" class="ui ... rail"><slot></slot></div>`:  the element's markup, so `rail.css` positions it
 * unchanged.
 ****************/
export class RailFallback extends NativeFallback<typeof railVocabulary> {
  @proto static vocabulary = railVocabulary
  @proto static degraded = []

  protected override build() {
    return [this.decorate(this.create("div", { class: this.classes() }, this.slot()), "rail")]
  }
}
