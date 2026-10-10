import { Repeat, Show } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E, UI, UIT } from "$/ui/core"
import { ProgressValues } from "./ProgressValues"
import { LIST_SPLIT } from "./UIProgress.types"
import { progressVocabulary } from "./UIProgress.en"

import progressCSS from "./UIProgress.css?inline"

/****************
 * ### `UIProgress`
 * The component behind `<ui-progress>`:  a bar showing how far along a task is.
 *
 * - Its shadow DOM is Fomantic's markup:  `<div class="ui … progress" part="progress" data-percent>`, holding
 *   - one `<div class="bar" part="bar">` per value
 *     (with `<div class="progress" part="bar-text">` inside, when `bar-text` is set)
 *   - and `<div class="label" part="label">` around the slot.
 *
 * - The numbers:  `value` (a share of `total`, else a percentage) or `percent`.
 *   - A comma list makes several bars (`ProgressValues`).
 *   - The widths and `data-percent` are written as Fomantic's JS wrote them.
 *
 * - Accessibility:  the DOM ELEMENT is the `progressbar`, through `internals`.
 *   A native `<progress>` can't hold Fomantic's bars, their texts, several values or the indeterminate looks,
 *   and it looks different in every engine.
 *   - The range is `0 … total` (else `0 … 100`), with `aria-valuenow` (none while indeterminate),
 *     and `aria-valuetext` in the `bar-text` format (the percentage by default).
 *   - It's named by the element's `aria-label` / `aria-labelledby`, else by the label
 *     (the `label` shorthand or the slotted text).
 *   - Its children are presentational, as the role says.
 *
 * - `state` is `success`, `warning` or `error`.
 *   Unset, a single bar at 100% shows `success` (Fomantic's `autoSuccess`).
 * - `active` is only what the author sets:  Fomantic's JS pulsed every bar between 0 and 100%.
 *
 * - Events:  `ui-change` when the percentage changes, `ui-complete` when it reaches 100.
 *   Both only after the first render, whatever wrote the numbers (there is no user input).
 ****************/
@E.cssStates("active")
export class UIProgress extends E.UIComponent<typeof progressVocabulary> {
  @E.proto static vocabulary = progressVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { progress: progressCSS },
    delegatesFocus: false,
    aria: { role: "progressbar", ariaValueMin: "0" },
    // `disabled`:  only a look
    disabled: "its own"
  } satisfies Partial<E.ElementSetup>

  ////////////////
  // ## The numbers
  ////////////////

  /**
   * The numbers, from `value` / `total` / `percent` / `precision`.
   * - `@derived`:  parses comma lists into a new object;  the change effect compares it by identity.
   */
  @E.derived
  get numbers(): ProgressValues {
    return new ProgressValues({
      value: this.value,
      total: this.total,
      percent: this.percent,
      precision: this.precision
    })
  }

  /** Percentage when the last `ui-change` went out, to tell when it reaches 100. */
  private lastAnnouncedPercent = this.numbers.percent

  /** The numbers changed:  `ui-change`, and `ui-complete` when it just reached 100.  Not for the first draw. */
  @E.onChange("numbers", { defer: true })
  protected onNumbersChanged(numbers: ProgressValues) {
    if (numbers.percent === this.lastAnnouncedPercent) return
    const hasReached = numbers.percent >= 100 && this.lastAnnouncedPercent < 100
    this.lastAnnouncedPercent = numbers.percent
    const { percent, shown, value, total } = numbers
    this.send("ui-change", { percent, percents: [...shown], value, total })
    if (hasReached) this.send("ui-complete", { value, total })
  }

  ////////////////
  // ## States
  ////////////////

  /** Unknown progress?  `:state(indeterminate)`. */
  @E.cssState("indeterminate")
  get isIndeterminate(): boolean {
    return !!this.indeterminate
  }

  /** Every bar together at 100%, and determinate?  `:state(complete)`. */
  @E.cssState("complete")
  get isComplete(): boolean {
    return !this.isIndeterminate && this.numbers.percent >= 100
  }

  /** `state`, else `success` for a single complete bar (Fomantic's `autoSuccess`). */
  get shownState(): string | undefined {
    if (this.state) return this.state
    return this.isComplete && this.numbers.barCount === 1 ? SUCCESS : undefined
  }

  protected classValue(name: E.AttributeName<typeof progressVocabulary>): unknown {
    if (name === "state") return this.shownState
    return super.classValue(name)
  }

  ////////////////
  // ## Texts
  ////////////////

  /** The element's text (its slotted label), read again when it changes. */
  @E.fromContent({ childList: true, characterData: true, subtree: true })
  get elementText(): string {
    return (this.domElement.textContent ?? "").trim()
  }

  /** `value` in the page's number format, to `precision` decimals. */
  private readonly format = (value: number): string =>
    UI.i18n.formatNumber(value, { maximumFractionDigits: this.numbers.precision })

  /** Text for bar `index` (every bar together without one), in the `bar-text` format. */
  barTextFor(index?: number): string {
    const numbers = this.numbers
    const isRatio = this.barText === RATIO && numbers.total !== undefined
    return numbers.fill(this.translationForKey(isRatio ? "progressRatio" : "progressPercent"), index, this.format)
  }

  /** The `label` shorthand with its placeholders filled in. */
  get labelText(): string | undefined {
    const label = this.label
    return label ? this.numbers.fill(label, undefined, this.format) : undefined
  }

  ////////////////
  // ## ARIA
  ////////////////

  /**
   * ARIA values for the internals, once ready (`undefined` before:  the texts read `UI.i18n`);  tracked.
   * - `null`, not `undefined`:  what `ElementInternals` takes to clear one, a platform boundary.
   * - Protected, not private:  only `@onChange` reads it, by name.
   */
  protected get ariaValues() {
    if (!this.isReady) return undefined
    const numbers = this.numbers
    const isIndeterminate = this.isIndeterminate
    const total = numbers.total
    const texts = Array.from({ length: numbers.barCount }, (_, index) => this.barTextFor(index))
    return {
      max: String(total ?? 100),
      now: isIndeterminate ? null : String(total !== undefined ? numbers.value : numbers.percent),
      text: isIndeterminate ? null : texts.join(LIST_SEPARATOR),
      label: this.labelText || this.elementText || null
    }
  }

  /** The internals follow `ariaValues`;  `writesDOMElement`:  a server render (`$/ui/static`) applies it too. */
  @E.onChange("ariaValues", { writesDOMElement: true })
  protected onAriaValuesChanged(aria: UIProgress["ariaValues"]) {
    if (!aria) return
    const { internals } = this.domElement
    internals.ariaValueMax = aria.max
    internals.ariaValueNow = aria.now
    internals.ariaValueText = aria.text
    internals.ariaLabel = aria.label
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    return (
      <div
        class={this.rootClass}
        part={this.partForName("progress")}
        data-percent={this.isIndeterminate ? undefined : String(Math.round(this.numbers.percent))}
      >
        <Repeat count={this.numbers.barCount}>{(index) => this.bar(index)}</Repeat>
        <div class={UIT.LABEL} part={this.partForName("label")}>
          <slot>{this.labelText}</slot>
        </div>
      </div>
    )
  }

  /** Bar `index`:  its width and corners, its hue, its text. */
  private bar(index: number): JSX.Element {
    return (
      <div class={this.barClass(index)} part={this.partForName("bar")} style={this.barStyle(index)}>
        <Show when={this.barText}>
          <div class={BAR_TEXT} part={this.partForName("bar-text")}>
            {this.barTextFor(index)}
          </div>
        </Show>
      </div>
    )
  }

  /**
   * Hue per bar, from `bar-colors`;  unknown words dropped.
   * - `@derived`:  split / map.
   */
  @E.derived
  get barHues(): (string | undefined)[] {
    return (this.barColors ?? "").split(LIST_SPLIT).map((hue) => (E.ValueSets.has("hues", hue) ? hue : undefined))
  }

  /** `bar`, with `ui-<hue>` (the colour remap) from `bar-colors`. */
  private barClass(index: number): string {
    const hue = this.barHues[index]
    return hue ? `${UIT.COLOR_CLASS_PREFIX}${hue} ${UIT.BAR}` : UIT.BAR
  }

  /**
   * Width, and corners of several bars (Fomantic's `set.barWidth()`):
   * - a zero bar among several is hidden
   * - only the first and last shown bars keep their outer corners
   * - none while indeterminate (the CSS fills the track)
   */
  private barStyle(index: number): JSX.CSSProperties {
    if (this.isIndeterminate) return {}
    const { percents, barCount } = this.numbers
    const percent = percents[index] ?? 0
    const isMultiple = barCount > 1
    const shown = percents.map((value, at) => value > 0 || (at === barCount - 1 && percents.every((it) => it === 0)))
    if (isMultiple && !shown[index]) return { display: "none" }
    const first = shown.indexOf(true)
    const last = shown.lastIndexOf(true)
    const style: JSX.CSSProperties = { width: `${percent}%` }
    if (!isMultiple) return style
    if (index !== first) Object.assign(style, { "border-top-left-radius": "0", "border-bottom-left-radius": "0" })
    if (index !== last) Object.assign(style, { "border-top-right-radius": "0", "border-bottom-right-radius": "0" })
    return style
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UIProgress extends E.AttributeValues<typeof progressVocabulary> {}

/** The automatic outcome at 100%. */
const SUCCESS = "success"

/** `bar-text` value for the ratio format. */
const RATIO = "ratio"

/** Joins several bars' texts into one `aria-valuetext`. */
const LIST_SEPARATOR = ", "

/** Class of a bar's text (Fomantic's `.bar > .progress`). */
const BAR_TEXT = "progress"
