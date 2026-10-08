import { NativeFallback, proto } from "$/ui/core"

import { epicItemVocabulary } from "./epic-item.vocabulary.en"
import { CELL, CHIP, CLOSED_STATUSES, DETAILS, LINE, TITLE } from "./epic-item.types"

/****************
 * ### `EpicItemFallback`
 * The item without Solid, drawn by `epic-item.css`:  its line (id chip in its state's colour, title) and its
 * details, always shown -- nothing folds, so nothing is out of reach.
 * - No review label, no `source` loading:  the placeholder children stay.
 ****************/
export class EpicItemFallback extends NativeFallback<typeof epicItemVocabulary> {
  @proto static vocabulary = epicItemVocabulary

  protected override build() {
    const id = this.attr("id") ?? ""
    const status = this.attr("status") ?? ""
    const state = this.attr("state") || ((CLOSED_STATUSES as readonly string[]).includes(status) ? "old" : "open")
    const chip = this.decorate(this.create("a", { class: CHIP, href: `#${id}` }, id.toUpperCase()), "id")
    const title = this.decorate(
      this.create("span", { class: TITLE }, this.create("slot", { name: "title" }, this.attr("title") ?? "")),
      "title"
    )
    const line = this.decorate(
      this.create("div", { class: LINE }, this.create("span", { class: CELL }, chip), title),
      "line"
    )
    const details = this.decorate(this.create("div", { class: DETAILS }, this.slot()), "details")
    return [this.decorate(this.create("div", { class: this.classes(state), title: "" }, line, details), "base")]
  }
}
