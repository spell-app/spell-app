import { Show } from "solid-js"
import type { JSX } from "@solidjs/web"

import { PART_STATIC_CLASS_PREFIX, proto, UIElement } from "$/ui/core"

import { statisticVocabulary } from "./ui-statistic.vocabulary.en"
import { StatisticFallback } from "./ui-statistic.fallback"

import statisticCSS from "./ui-statistic.css?inline"
import partsCSS from "$/ui/components/ui-parts/ui-parts.css?inline"

/****************
 * ### `<ui-statistic>`
 * A statistic:  `<div class="ui … statistic" part="statistic">` holding the `value` shorthand, the slot, then the
 * `label` shorthand -- so either shorthand can pair with a slotted part and still read value-over-label.
 * - OWNER of the `value` and `label` parts (`ownsParts`):  a slotted `<ui-value>` / `<ui-label>` finds it through
 *   `PartContext`, sets `:state(in-statistic)` and styles itself from `ui-parts.css`, reading the owner tokens
 *   `ui-statistic.css` declares on the root (layout, value sizes, `--ui-inverted`).  Registered by `define()`.
 * - Shorthands are the SAME parts, drawn in this shadow root:  `<div class="value in-statistic">` and `<div
 *   class="label in-statistic">` -- the static part classes `ui-parts.css` keys on (they ARE children of this root),
 *   which is why this element adopts `ui-parts.css` too.  `text` makes the value shorthand a word value.
 * - No role:  a statistic is text;  the page names a group of them where it matters (a heading, `aria-label` on a
 *   region).
 ****************/
export class UIStatistic extends UIElement<typeof statisticVocabulary> {
  @proto static vocabulary = statisticVocabulary
  @proto static styles = { statistic: statisticCSS, parts: partsCSS }
  @proto static Fallback = StatisticFallback
  @proto static delegatesFocus = false

  protected hostStates() {
    return { statistic: true, inverted: this.attrs.inverted }
  }

  render(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part("statistic")}>
        <Show when={this.attrs.value}>
          <div class={this.valueClass()} part={this.part("value")}>
            {this.attrs.value}
          </div>
        </Show>
        <slot />
        <Show when={this.attrs.label}>
          <div class={LABEL_CLASS} part={this.part("label")}>
            {this.attrs.label}
          </div>
        </Show>
      </div>
    )
  }

  /** Classes of the value shorthand:  `[text] value in-statistic`. */
  private valueClass(): string {
    return this.attrs.text ? `${TEXT} ${VALUE_CLASS}` : VALUE_CLASS
  }
}

/** The static owner class of a part in a statistic (`ui-parts.css`). */
const IN_STATISTIC = `${PART_STATIC_CLASS_PREFIX}${statisticVocabulary.noun}`

/** Classes of the `value` shorthand. */
const VALUE_CLASS = `value ${IN_STATISTIC}`

/** Classes of the `label` shorthand. */
const LABEL_CLASS = `label ${IN_STATISTIC}`

/** Word-value class word. */
const TEXT = "text"
