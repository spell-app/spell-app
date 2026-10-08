import { NativeFallback, proto } from "$/ui/core"

import { epicSectionVocabulary } from "./epic-section.vocabulary.en"

/****************
 * ### `EpicSectionFallback`
 * The section without Solid:  a plain, UNFOLDED heading (its title, or its kind), then its children -- no fold, no
 * sticky line, nothing loaded from `source`.  In the `base` part, so the fold sheet's box rules still apply.
 ****************/
export class EpicSectionFallback extends NativeFallback<typeof epicSectionVocabulary> {
  @proto static vocabulary = epicSectionVocabulary

  protected override build() {
    const nested = this.attr("kind") === "overview-part"
    const words = this.attr("title") ?? this.attr("kind") ?? ""
    const heading = this.create(nested ? "h3" : "h2", {}, this.create("slot", { name: "title" }, words))
    return [this.decorate(this.create("div", { class: this.classes() }, heading, this.slot()), "base")]
  }
}
