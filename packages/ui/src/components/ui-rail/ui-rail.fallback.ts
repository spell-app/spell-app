import { E } from "$/ui/core"
import { railVocabulary } from "./ui-rail.vocabulary.en"

/****************
 * ### `RailFallback`
 * `<div part="rail" class="ui ... rail"><slot></slot></div>`:  the element's markup, so `ui-rail.css` positions it
 * unchanged.
 ****************/
export class RailFallback extends E.NativeFallback<typeof railVocabulary> {
  @E.proto static vocabulary = railVocabulary
  @E.proto static degraded = []

  protected override build() {
    return [this.decorate(this.create("div", { class: this.classes() }, this.slot()), "rail")]
  }
}
