import { NativeFallback, proto } from "$/ui/core"

import { STATUS_SLOT } from "$/epics/components/epic-item/epic-item.types"

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
    // an Overview sub-section's status cards from Claude (P13), after its prose
    const status = this.create("slot", { name: STATUS_SLOT })
    return [this.decorate(this.create("div", { class: this.classes() }, heading, this.slot(), status), "base")]
  }
}
