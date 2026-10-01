import { NativeFallback, PART_STATIC_CLASS_PREFIX, proto } from "$/ui/core"

import { statisticVocabulary } from "./statistic.vocabulary.en"

/****************
 * ### `StatisticFallback`
 * `<div part="statistic" class="ui ... statistic">` holding the `value` shorthand, a `<slot>` and the `label`
 * shorthand, both with their static `in-statistic` part classes:  the element's markup, so `statistic.css` and
 * `parts.css` style it unchanged.
 ****************/
export class StatisticFallback extends NativeFallback<typeof statisticVocabulary> {
  @proto static vocabulary = statisticVocabulary
  @proto static degraded = ["spacing after another statistic (`:state(statistic)`)"]

  protected override build() {
    const owner = `${PART_STATIC_CLASS_PREFIX}${this.vocabulary.noun}`
    const value = this.attr("value")
    const label = this.attr("label")
    const statistic = this.create("div", { class: this.classes() })
    if (value) {
      const classes = this.flag("text") ? `text value ${owner}` : `value ${owner}`
      statistic.append(this.create("div", { class: classes, part: "value" }, value))
    }
    statistic.append(this.slot())
    if (label) statistic.append(this.create("div", { class: `label ${owner}`, part: "label" }, label))
    return [this.decorate(statistic, "statistic")]
  }
}
