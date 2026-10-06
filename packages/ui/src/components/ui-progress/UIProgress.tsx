import { Repeat, Show, createEffect, createMemo, onSettled, untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E, UI, UIT } from "$/ui/core"
import { ProgressValues } from "./ProgressValues"
import { ProgressFallback } from "./ui-progress.fallback"
import { LIST_SPLIT } from "./ui-progress.types"
import { progressVocabulary } from "./ui-progress.vocabulary.en"

import progressCSS from "./ui-progress.css?inline"

/****************
 * ### `<ui-progress>`
 * A progress bar in Fomantic's markup:  `<div class="ui … progress" part="progress" data-percent>` holding one
 * `<div class="bar" part="bar">` per value (with `<div class="progress" part="bar-text">` inside when `bar-text` is
 * set) and `<div class="label" part="label">` around the slot.
 * - Numbers:  `value` (a share of `total`, else a percentage) or `percent`;  a comma list makes several bars
 *   (`ProgressValues`).  Widths and `data-percent` are written as Fomantic's JS wrote them.
 * - Accessibility:  the HOST is the `progressbar`, through internals -- a native `<progress>` can't hold Fomantic's
 *   bars, their texts, several values or the indeterminate looks, and styles differently per engine.  Range
 *   `0 ... total` (else `0 ... 100`), `aria-valuenow` (none while indeterminate), `aria-valuetext` in the
 *   `bar-text` format (percent by default).  Named by the host's `aria-label` / `aria-labelledby`, else the label
 *   (`label` shorthand or slotted text);  its children are presentational, as the role says.
 * - `state` is `success` / `warning` / `error`;  unset, a single bar at 100% shows `success` (Fomantic's
 *   `autoSuccess`).  `active` is only what the author sets:  Fomantic's JS pulsed every bar between 0 and 100%.
 * - Events:  `ui-change` when the percentage changes, `ui-complete` when it reaches 100 -- both after the first
 *   render, whatever wrote the numbers (there is no user input).
 ****************/
export class UIProgress extends E.UIElement<typeof progressVocabulary> {
  @E.proto static vocabulary = progressVocabulary
  @E.proto static styles = { progress: progressCSS }
  @E.proto static Fallback = ProgressFallback
  @E.proto static delegatesFocus = false

  /** Host text (slotted label), re-read when it changes. */
  readonly hostText = new E.Cell((this.host.textContent ?? "").trim())

  /** The numbers, from `value` / `total` / `percent` / `precision`. */
  readonly numbers = createMemo(
    () =>
      new ProgressValues({
        value: this.attrs.value,
        total: this.attrs.total,
        percent: this.attrs.percent,
        precision: this.attrs.precision
      })
  )

  /** Hue per bar, from `bar-colors`;  unknown words dropped. */
  readonly barColors = createMemo(() =>
    (this.attrs.barColors ?? "").split(LIST_SPLIT).map((hue) => (E.ValueSets.has("hues", hue) ? hue : undefined))
  )

  /** Percentage when the last `ui-change` went out, to tell when it reaches 100. */
  private lastPercent = untrack(() => this.numbers().percent)

  constructor(...args: ConstructorParameters<typeof E.UIElement>) {
    super(...args)
    this.host.internals.role = PROGRESSBAR
    if (isServer) return
    onSettled(() => {
      const observer = new MutationObserver(() => this.hostText.set((this.host.textContent ?? "").trim()))
      observer.observe(this.host, { childList: true, characterData: true, subtree: true })
      return () => observer.disconnect()
    })
  }

  ////////////////
  // ## State
  ////////////////

  /** Unknown progress?  Tracked. */
  isIndeterminate(): boolean {
    return !!this.attrs.indeterminate
  }

  /** Every bar together at 100%, and determinate?  Tracked. */
  isComplete(): boolean {
    return !this.isIndeterminate() && this.numbers().percent >= 100
  }

  /** `state`, else `success` for a single complete bar (Fomantic's `autoSuccess`). */
  state(): string | undefined {
    if (this.attrs.state) return this.attrs.state
    return this.isComplete() && this.numbers().bars === 1 ? SUCCESS : undefined
  }

  protected classValue(name: E.AttributeName<typeof progressVocabulary>): unknown {
    if (name === "state") return this.state()
    return super.classValue(name)
  }

  protected hostStates() {
    return {
      active: this.attrs.active,
      indeterminate: this.isIndeterminate(),
      complete: this.isComplete(),
      disabled: this.attrs.disabled
    }
  }

  ////////////////
  // ## Texts
  ////////////////

  /** `value` in the page's number format, to `precision` decimals. */
  private readonly format = (value: number): string =>
    UI.i18n.formatNumber(value, { maximumFractionDigits: this.numbers().precision })

  /** Text for bar `index` (every bar together without one), in the `bar-text` format. */
  barText(index?: number): string {
    const numbers = this.numbers()
    const isRatio = this.attrs.barText === RATIO && numbers.total !== undefined
    return numbers.fill(this.text(isRatio ? "progressRatio" : "progressPercent"), index, this.format)
  }

  /** The `label` shorthand with its placeholders filled in. */
  labelText(): string | undefined {
    const label = this.attrs.label
    return label ? this.numbers().fill(label, undefined, this.format) : undefined
  }

  ////////////////
  // ## Rendering
  ////////////////

  /** Adds the internals (ARIA value, range, name) and the change events. */
  mount(): JSX.Element {
    // `hostEffect`:  a server render (`$/ui/static`) applies it too
    this.hostEffect(
      () => (this.isLoaded() ? this.aria() : undefined),
      (aria) => {
        if (!aria) return
        const { internals } = this.host
        internals.ariaValueMin = "0"
        internals.ariaValueMax = aria.max
        internals.ariaValueNow = aria.now
        internals.ariaValueText = aria.text
        internals.ariaLabel = aria.label
      }
    )
    createEffect(
      () => this.numbers(),
      (numbers) => this.changed(numbers),
      { defer: true }
    )
    return super.mount()
  }

  /**
   * ARIA values for the internals;  tracked.
   * - `null`, not `undefined`:  what `ElementInternals` takes to clear one, a platform boundary.
   */
  private aria() {
    const numbers = this.numbers()
    const isIndeterminate = this.isIndeterminate()
    const total = numbers.total
    const texts = Array.from({ length: numbers.bars }, (_, index) => this.barText(index))
    return {
      max: String(total ?? 100),
      now: isIndeterminate ? null : String(total !== undefined ? numbers.value : numbers.percent),
      text: isIndeterminate ? null : texts.join(LIST_SEPARATOR),
      label: this.labelText() || this.hostText.get() || null
    }
  }

  /** The numbers changed:  `ui-change`, and `ui-complete` when it just reached 100. */
  private changed(numbers: ProgressValues) {
    if (numbers.percent === this.lastPercent) return
    const hasReached = numbers.percent >= 100 && this.lastPercent < 100
    this.lastPercent = numbers.percent
    const { percent, shown, value, total } = numbers
    this.emit("ui-change", { percent, percents: [...shown], value, total })
    if (hasReached) this.emit("ui-complete", { value, total })
  }

  render(): JSX.Element {
    return (
      <div
        class={this.classes()}
        part={this.part("progress")}
        data-percent={this.isIndeterminate() ? undefined : String(Math.round(this.numbers().percent))}
      >
        <Repeat count={this.numbers().bars}>{(index) => this.bar(index)}</Repeat>
        <div class={UIT.LABEL} part={this.part("label")}>
          <slot>{this.labelText()}</slot>
        </div>
      </div>
    )
  }

  /** Bar `index`:  its width and corners, its hue, its text. */
  private bar(index: number): JSX.Element {
    return (
      <div class={this.barClass(index)} part={this.part("bar")} style={this.barStyle(index)}>
        <Show when={this.attrs.barText}>
          <div class={BAR_TEXT} part={this.part("bar-text")}>
            {this.barText(index)}
          </div>
        </Show>
      </div>
    )
  }

  /** `bar`, with `ui-<hue>` (the colour remap) from `bar-colors`. */
  private barClass(index: number): string {
    const hue = this.barColors()[index]
    return hue ? `${UIT.COLOR_CLASS_PREFIX}${hue} ${UIT.BAR}` : UIT.BAR
  }

  /**
   * Width, and corners of several bars (Fomantic's `set.barWidth()`):  a zero bar among several is hidden;  only
   * the first and last shown bars keep their outer corners.  None while indeterminate (the CSS fills the track).
   */
  private barStyle(index: number): JSX.CSSProperties {
    if (this.isIndeterminate()) return {}
    const { percents, bars } = this.numbers()
    const percent = percents[index] ?? 0
    const isMultiple = bars > 1
    const shown = percents.map((value, at) => value > 0 || (at === bars - 1 && percents.every((it) => it === 0)))
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

/** Host role. */
const PROGRESSBAR = "progressbar"

/** The automatic outcome at 100%. */
const SUCCESS = "success"

/** `bar-text` value for the ratio format. */
const RATIO = "ratio"

/** Joins several bars' texts into one `aria-valuetext`. */
const LIST_SEPARATOR = ", "

/** Class of a bar's text (Fomantic's `.bar > .progress`). */
const BAR_TEXT = "progress"
