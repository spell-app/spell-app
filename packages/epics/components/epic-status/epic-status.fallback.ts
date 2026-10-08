import { NativeFallback, proto } from "$/ui/core"

import { BODY, DATE, DATED, HEADER, WHO } from "$/epics/components/epic-answer/epic-answer.types"

import { epicStatusVocabulary } from "./epic-status.vocabulary.en"
import { DONE, SUMMARY, SUMMARY_SLOT } from "./epic-status.types"

/****************
 * ### `EpicStatusFallback`
 * The status card without Solid, drawn by the same sheets:  its `Claude • Underway` / `Claude • Done` band with the
 * date as written (no `PlanDates`:  the fallback stays small), then the reading and the summary's slot.
 ****************/
export class EpicStatusFallback extends NativeFallback<typeof epicStatusVocabulary> {
  @proto static vocabulary = epicStatusVocabulary

  protected override build() {
    const done = this.attr("state") === DONE
    const when = (done && this.attr("done-at")) || this.attr("at") || ""
    const who = this.create("span", { class: WHO }, done ? "Claude • Done" : "Claude • Underway")
    const date = this.create("time", { class: DATE }, when)
    const header = this.create("div", { class: `${HEADER} ${DATED}` }, who, date)
    const body = this.create("div", { class: BODY }, this.slot())
    const summary = this.create("div", { class: `${BODY} ${SUMMARY}` }, this.create("slot", { name: SUMMARY_SLOT }))
    const classes = `${this.classes()} ${done ? DONE : "underway"}`
    return [this.decorate(this.create("div", { class: classes }, header, body, summary), "base")]
  }
}
