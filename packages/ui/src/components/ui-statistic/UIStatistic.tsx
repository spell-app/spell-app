import { Show } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E, UIT } from "$/ui/core"
import { StatisticFallback } from "./ui-statistic.fallback"
import { VALUE } from "./ui-statistic.types"
import { statisticVocabulary } from "./ui-statistic.vocabulary.en"

import statisticCSS from "./ui-statistic.css?inline"

/****************
 * ### `<ui-statistic>`
 * A statistic:  `<div class="ui … statistic" part="statistic">` holding the `value` shorthand, the slot, then the
 * `label` shorthand -- so either shorthand can pair with a slotted part and still read value-over-label.
 * - OWNER of the `value` and `label` parts (`ownsParts`):  a slotted `<ui-value>` / `<ui-label>` finds it through
 *   `PartContext`, sets `:state(in-statistic)` and styles itself from `ui-parts.css`, reading the owner tokens
 *   `ui-statistic.css` declares on the root (layout, value sizes, `--ui-inverted`).  Registered by `define()`.
 * - Shorthands are the SAME parts, drawn in this shadow root:  `<div class="value in-statistic">` and `<div
 *   class="label in-statistic">` -- the static part classes `ui-parts.css` keys on (they ARE children of this root),
 *   which is why this element adopts `ui-parts.css` too (`E.ContentPart.styleSheets`).  `text` makes the value shorthand
 *   a word value.
 * - No role:  a statistic is text;  the page names a group of them where it matters (a heading, `aria-label` on a
 *   region).
 ****************/
export class UIStatistic extends E.UIElement<typeof statisticVocabulary> {
  @E.proto static vocabulary = statisticVocabulary
  @E.proto static styleSheets = { statistic: statisticCSS, ...E.ContentPart.styleSheets }
  @E.proto static elementSetup = { Fallback: StatisticFallback, delegatesFocus: false }

  /** Always `:state(statistic)`. */
  @E.cssState("statistic")
  get isStatistic(): boolean {
    return true
  }

  /** For a dark background (`inverted`)? */
  @E.cssState("inverted")
  get isInverted(): boolean {
    return this.inverted
  }

  render(): JSX.Element {
    return (
      <div class={this.rootClasses} part={this.partForName("statistic")}>
        <Show when={this.value}>
          <div class={this.valueClasses} part={this.partForName("value")}>
            {this.value}
          </div>
        </Show>
        <slot />
        <Show when={this.label}>
          <div class={this.staticPart(UIT.LABEL)} part={this.partForName("label")}>
            {this.label}
          </div>
        </Show>
      </div>
    )
  }

  /** Classes of the value shorthand:  `[text] value in-statistic`. */
  @E.derived
  private get valueClasses(): string {
    const value = this.staticPart(VALUE)
    return this.text ? `${UIT.TEXT} ${value}` : value
  }

  /** Classes of a shorthand:  the part noun and the static owner class, e.g. `label in-statistic`. */
  private staticPart(noun: string): string {
    return `${noun} ${UIT.PART_STATIC_CLASS_PREFIX}${this.vocabulary.noun}`
  }
}

/** The vocabulary getters, typed (`UIElement`'s doc). */
export interface UIStatistic extends E.AttributeValues<typeof statisticVocabulary> {}
