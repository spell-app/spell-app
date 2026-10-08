import { NativeFallback, proto } from "$/ui/core"

import { epicPageVocabulary } from "./epic-page.vocabulary.en"

/****************
 * ### `EpicPageFallback`
 * The page without Solid:  its h1 (`/epic <name>`), its title under it, the durable doc's link, then its blocks -- no meta lines, no
 * step label.  In the `base` part, so `epic-page.css` (and the pack's tokens on `:host`) still apply.
 ****************/
export class EpicPageFallback extends NativeFallback<typeof epicPageVocabulary> {
  @proto static vocabulary = epicPageVocabulary

  protected override build() {
    const heading = this.create("h1", { class: "heading" }, `/epic ${this.attr("epic") ?? ""}`)
    const subhead = this.create("p", { class: "subhead" }, this.attr("title") ?? "")
    return [
      this.decorate(
        this.create(
          "div",
          { class: this.classes() },
          heading,
          subhead,
          this.create("slot", { name: "durable" }),
          this.slot()
        ),
        "base"
      )
    ]
  }
}
