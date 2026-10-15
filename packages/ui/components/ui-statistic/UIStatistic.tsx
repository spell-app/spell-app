import { Show } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E, UIT } from "$/ui/core"
import { statisticVocabulary } from "./UIStatistic.en"

import statisticCSS from "./UIStatistic.css?inline"

/****************
 * ### `UIStatistic`
 * The component behind `<ui-statistic>`:  a number with a label.
 * Its shadow DOM:
 * `<div class="ui … statistic" part="statistic">` holding the `value` shorthand, the slot, then the `label` shorthand,
 * so either shorthand can pair with a slotted part and still read value over label.
 *
 * - It OWNS the `value` and `label` parts (`ownsParts`):
 *   a slotted `<ui-value>` or `<ui-label>` finds it through `PartContext`,
 *   sets `:state(in-statistic)` and styles itself from `UIParts.css`,
 *   reading the owner tokens `UIStatistic.css` declares on the root (layout, value sizes, `--ui-inverted`).
 *   `define()` registers it as their owner.
 *
 * - The shorthands are the SAME parts, drawn in this shadow root:
 *   `<div class="value in-statistic">` and `<div class="label in-statistic">`,
 *   the static part classes `UIParts.css` keys on (they ARE children of this root),
 *   which is why this component adopts `UIParts.css` too (`E.PartComponent`'s `elementSetup.styleSheets`).
 * - `text` makes the value shorthand a word value.
 *
 * - No role:  a statistic is text;  the page names a group of them where it matters
 *   (a heading, `aria-label` on a region).
 ****************/
export class UIStatistic extends E.UIComponent<typeof statisticVocabulary> {
  @E.proto static vocabulary = statisticVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { statistic: statisticCSS, ...E.PartComponent.prototype.elementSetup.styleSheets },
    cssStates: ["inverted"],
    delegatesFocus: false
  } satisfies Partial<E.ElementSetup>

  /** Always `:state(statistic)`. */
  @E.cssState("statistic")
  get isStatistic(): boolean {
    return true
  }

  render(): JSX.Element {
    return (
      <div class={this.rootClass} part={this.partForName("statistic")}>
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

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UIStatistic extends E.AttributeValues<typeof statisticVocabulary> {}

/** The `value` shorthand:  its attribute, part noun and class word. */
const VALUE = "value"
