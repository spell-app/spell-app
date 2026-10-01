import { NativeFallback, proto } from "$/ui/core"

import { containerVocabulary } from "./ui-container.vocabulary.en"

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
