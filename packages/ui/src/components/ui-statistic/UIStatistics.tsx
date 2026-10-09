import type { JSX } from "@solidjs/web"

import { E, UIT } from "$/ui/core"
import { statisticsVocabulary } from "./UIStatistics.en"

import statisticCSS from "./UIStatistic.css?inline"

/****************
 * ### `UIStatistics`
 * The component behind `<ui-statistics>`:  a group of statistics sharing one look,
 * `<div class="ui … statistics" part="group"><slot></slot></div>`.
 *
 * - `UIStatistic.css` hands the group's size, colour, layout, count and stacking to its statistics
 *   through inherited private tokens.
 * - The DOM element is a block and the size container `stackable` answers to (`:state(statistics)`);
 *   with `stack-with="page"` (a private class after the noun), the screen is.
 ****************/
export class UIStatistics extends E.UIComponent<typeof statisticsVocabulary> {
  @E.proto static vocabulary = statisticsVocabulary
  @E.proto static styleSheets = { statistic: statisticCSS }
  @E.proto static elementSetup = { delegatesFocus: false } satisfies Partial<E.ElementSetup>

  /** Always `:state(statistics)`:  the size container `stackable` answers to. */
  @E.cssState("statistics")
  get isStatistics(): boolean {
    return true
  }

  /**
   * Spaced, unless `horizontal` or `widths`, whose roots have no top margin.
   * - Why:  the DOM element is a size container (its own formatting context),
   *   so the group's top margin sits on the DOM ELEMENT, to collapse with the content above
   *   as class grammar's does (`UIStatistic.css`).
   */
  @E.cssState("spaced")
  get isSpaced(): boolean {
    return !this.horizontal && !this.widths
  }

  /** `stack-with`'s class (`UIT.StackClasses`). */
  protected get extraClass(): string | undefined {
    return UIT.StackClasses.classFor(this.stackWith)
  }

  render(): JSX.Element {
    return (
      <div class={this.rootClass} part={this.partForName("group")}>
        <slot />
      </div>
    )
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UIStatistics extends E.AttributeValues<typeof statisticsVocabulary> {}
