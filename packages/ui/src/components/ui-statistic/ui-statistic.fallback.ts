import { E, UIT } from "$/ui/core"
import { VALUE } from "./ui-statistic.types"
import { statisticVocabulary } from "./ui-statistic.vocabulary.en"

/****************
 * ### `StatisticFallback`
 * `<div part="statistic" class="ui ... statistic">` holding the `value` shorthand, a `<slot>` and the `label`
 * shorthand, both with their static `in-statistic` part classes:  the element's markup, so `ui-statistic.css` and
 * `ui-parts.css` style it unchanged.
 ****************/
export class StatisticFallback extends E.NativeFallback<typeof statisticVocabulary> {
  @E.proto static vocabulary = statisticVocabulary
  @E.proto static degraded = ["spacing after another statistic (`:state(statistic)`)"]

  protected override build() {
    const owner = `${UIT.PART_STATIC_CLASS_PREFIX}${this.vocabulary.noun}`
    const value = this.attr(VALUE)
    const label = this.attr("label")
    const statistic = this.create("div", { class: this.classes() })
    if (value) {
      const classes = this.flag("text") ? `${UIT.TEXT} ${VALUE} ${owner}` : `${VALUE} ${owner}`
      statistic.append(this.create("div", { class: classes, part: VALUE }, value))
    }
    statistic.append(this.slot())
    if (label) statistic.append(this.create("div", { class: `${UIT.LABEL} ${owner}`, part: UIT.LABEL }, label))
    return [this.decorate(statistic, "statistic")]
  }
}
