import type { JSX } from "@solidjs/web"

import { proto, UIElement } from "$/ui/core"

import { statisticsVocabulary } from "./ui-statistics.vocabulary.en"

import statisticCSS from "./ui-statistic.css?inline"

/****************
 * ### `<ui-statistics>`
 * A group of statistics:  `<div class="ui … statistics" part="group"><slot></slot></div>`.
 * - `ui-statistic.css` hands the group's size, colour, layout, count and stacking to its statistics through inherited
 *   private tokens;  the host is a block and the size container `stackable` answers to (`:state(statistics)`).
 * - No native fallback of its own:  a failed group keeps its statistics visible through the default `<slot>`.
 ****************/
export class UIStatistics extends UIElement<typeof statisticsVocabulary> {
  @proto static vocabulary = statisticsVocabulary
  @proto static styles = { statistic: statisticCSS }
  @proto static delegatesFocus = false

  protected hostStates() {
    return { statistics: true }
  }

  render(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part("group")}>
        <slot />
      </div>
    )
  }
}
