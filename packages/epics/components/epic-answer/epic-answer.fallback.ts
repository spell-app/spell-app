import { NativeFallback, proto } from "$/ui/core"

import { epicAnswerVocabulary } from "./epic-answer.vocabulary.en"
import { BODY, HEADER, HEADING_SEPARATOR, LABEL, OLD_DECISION, TITLE_SLOT } from "./epic-answer.types"

/****************
 * ### `EpicAnswerFallback`
 * The answer card without Solid, drawn by `epic-answer.css`:  its `Answer · <title>` band, then its body.
 * - NOTE: only `<epic-answer>`'s:  `<epic-reply>` and `<epic-more>` have none
 ****************/
export class EpicAnswerFallback extends NativeFallback<typeof epicAnswerVocabulary> {
  @proto static vocabulary = epicAnswerVocabulary

  protected override build() {
    const id = this.attr("id") ?? ""
    const title = this.attr("title")
    const label = this.create("b", { class: LABEL }, OLD_DECISION.test(id) ? id.toUpperCase() : "Answer")
    // a title with markup comes through its `title` slot;  the attribute's text is the slot's fallback
    const titleSlot = this.create("slot", { name: TITLE_SLOT }, ...(title ? [title] : []))
    const hasTitle = !!title || !!this.host.querySelector(`:scope > [slot="${TITLE_SLOT}"]`)
    const header = this.create("div", { class: HEADER }, label, ...(hasTitle ? [HEADING_SEPARATOR, titleSlot] : []))
    const body = this.create("div", { class: BODY }, this.slot())
    return [this.decorate(this.create("div", { class: this.classes() }, header, body), "base")]
  }
}
