import { NativeFallback, proto } from "$/core"

import { containerVocabulary } from "./container.vocabulary.en"

/****************
 * ### `ContainerFallback`
 * `<div part="container" class="ui ... container"><slot></slot></div>`.
 ****************/
export class ContainerFallback extends NativeFallback<typeof containerVocabulary> {
  @proto static vocabulary = containerVocabulary
  @proto static degraded = []

  protected override build() {
    return [this.decorate(this.create("div", { class: this.classes() }, this.slot()), "container")]
  }
}
