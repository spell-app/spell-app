import type { JSX } from "@solidjs/web"

import { E, UIT } from "$/ui/core"
import { statisticsVocabulary } from "./ui-statistics.vocabulary.en"

import statisticCSS from "./ui-statistic.css?inline"

/****************
 * ### `<ui-statistics>`
 * A group of statistics:  `<div class="ui … statistics" part="group"><slot></slot></div>`.
 * - `ui-statistic.css` hands the group's size, colour, layout, count and stacking to its statistics through inherited
 *   private tokens;  the host is a block and the size container `stackable` answers to (`:state(statistics)`), or
 *   the screen is, with `stack-with="page"` (a private class after the noun).
 * - No native fallback of its own:  a failed group keeps its statistics visible through the default `<slot>`.
 ****************/
export class UIStatistics extends E.UIElement<typeof statisticsVocabulary> {
  @E.proto static vocabulary = statisticsVocabulary
  @E.proto static styleSheets = { statistic: statisticCSS }
  @E.proto static elementSetup = { delegatesFocus: false }

  /** Always `:state(statistics)`:  the size container `stackable` answers to. */
  @E.cssState("statistics")
  get isStatistics(): boolean {
    return true
  }

  /**
   * Spaced, unless `horizontal` or `widths`, whose roots have no top margin.
   * - Why:  the host is a size container (its own formatting context), so the group's top margin sits on the HOST
   *   to collapse with the content above, as class grammar's does (`ui-statistic.css`).
   */
  @E.cssState("spaced")
  get isSpaced(): boolean {
    return !this.horizontal && !this.widths
  }

  /** `stack-with`'s class (`UIT.StackClasses`). */
  protected get extraClasses(): string | undefined {
    return UIT.StackClasses.classFor(this.stackWith)
  }

  render(): JSX.Element {
    return (
      <div class={this.rootClasses} part={this.partForName("group")}>
        <slot />
      </div>
    )
  }
}

/** The vocabulary getters, typed (`UIElement`'s doc). */
export interface UIStatistics extends E.AttributeValues<typeof statisticsVocabulary> {}
