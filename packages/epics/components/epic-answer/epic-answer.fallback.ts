import { NativeFallback, proto } from "$/ui/core"

import { epicAnswerVocabulary } from "./epic-answer.vocabulary.en"
import { BODY, HEADER, HEADING_SEPARATOR, LABEL, OLD_DECISION } from "./epic-answer.types"

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
    const header = this.create("div", { class: HEADER }, label, ...(title ? [HEADING_SEPARATOR, title] : []))
    const body = this.create("div", { class: BODY }, this.slot())
    return [this.decorate(this.create("div", { class: this.classes() }, header, body), "base")]
  }
}
