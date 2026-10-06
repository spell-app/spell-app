import { E } from "$/ui/core"
import { containerVocabulary } from "./ui-container.vocabulary.en"

/****************
 * ### `ContainerFallback`
 * `<div part="container" class="ui ... container"><slot></slot></div>`.
 ****************/
export class ContainerFallback extends E.NativeFallback<typeof containerVocabulary> {
  @E.proto static vocabulary = containerVocabulary
  @E.proto static degraded = []

  protected override build() {
    return [this.decorate(this.create("div", { class: this.classes() }, this.slot()), "container")]
  }
}
