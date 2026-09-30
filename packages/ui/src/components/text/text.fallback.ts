import { NativeFallback, proto } from "$/core"

import { textVocabulary } from "./text.vocabulary.en"

/****************
 * ### `TextFallback`
 * `<span part="text" class="ui ... text"><slot></slot></span>`:  everything the element renders.
 ****************/
export class TextFallback extends NativeFallback<typeof textVocabulary> {
  @proto static vocabulary = textVocabulary
  @proto static degraded = []

  protected override build() {
    return [this.decorate(this.create("span", { class: this.classes() }, this.slot()), "text")]
  }
}
