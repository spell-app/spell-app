import { NativeFallback, proto } from "$/ui/core"

import { epicPhaseVocabulary } from "./epic-phase.vocabulary.en"

/****************
 * ### `EpicPhaseFallback`
 * The phase without Solid:  a plain, UNFOLDED heading (`P3 · <title>`), then its children -- no fold, no status
 * icon, nothing loaded from `source`.  In the `base` part, so the fold sheet's box rules still apply.
 * - NOTE: only `<epic-phase>`'s:  `<epic-field>`, `<epic-updated>` draw too little to fail
 ****************/
export class EpicPhaseFallback extends NativeFallback<typeof epicPhaseVocabulary> {
  @proto static vocabulary = epicPhaseVocabulary

  protected override build() {
    const id = (this.attr("id") ?? "").toUpperCase()
    const title = this.create("slot", { name: "title" }, this.attr("title") ?? "")
    const heading = this.create("h3", {}, `${id} · `, title)
    return [this.decorate(this.create("div", { class: this.classes() }, heading, this.slot()), "base")]
  }
}
