import { For, Show, createEffect, createMemo } from "solid-js"
import type { JSX } from "@solidjs/web"

import { proto, UIElement } from "$/ui/core"
import { STEPS, type Step } from "$/brand"

import { brandColorRangeVocabulary } from "./ui-brand-color-range.vocabulary.en"
import { BrandColorRangeFallback } from "./ui-brand-color-range.fallback"
import { BrandColorRangeHost } from "./BrandColorRangeHost"
import { ColorLadder } from "./ColorLadder"
import { BRAND_COLOR, CLASSES, NO_NUMBERS, type BrandColorRangeVocabulary } from "./ui-brand-color-range.types"

import "$/brand/components/ui-brand-color"

import rangeCSS from "./ui-brand-color-range.css?inline"

/****************
 * ### `<ui-brand-color-range>`
 * A 17-step ladder from ONE base colour (`Palette.generateScale()`), as the Color Set Chooser's Variants row:
 * `<ol class="range color brand" part="range">`, one `<li part="step">` per step holding a `<ui-brand-color>` (named
 * `<name>-<step>`) and the step's number under it (`numbers="none"`:  no numbers, nor their row).  The base colour's
 * chip is `selected` (the double ring).
 * - `label`, `contrast`, `copy` and `details` are handed to every chip;  chips fill their cells
 *   (`--_ui-brand-color-fit`).
 * - `strip`:  17 small dots instead (the Chooser's folded Variants header), one image named for the ladder.
 * - No base colour (or one it can't read):  nothing is drawn.
 * - `ui-change` (`{ value, scale, anchor }`) when the ladder's colours change after the first render;  a new `name`
 *   alone renames the chips and changes `css()`, without one.
 * - The host (`BrandColorRangeHost`) has `scale`, `anchorStep` and `css(format)`.
 ****************/
export class UIBrandColorRange extends UIElement<BrandColorRangeVocabulary> {
  @proto static vocabulary = brandColorRangeVocabulary
  @proto static styles = { range: rangeCSS }
  @proto static Host = BrandColorRangeHost
  @proto static Fallback = BrandColorRangeFallback
  @proto static delegatesFocus = false

  /** The ladder last announced (`null` before the first render's), for `ui-change`. */
  private announced: ColorLadder | undefined | null = null

  ////////////////
  // ## Derived state
  ////////////////

  /** The ladder the attributes make, or `undefined`;  changes only when it does. */
  readonly ladder = createMemo(
    () =>
      ColorLadder.from({
        value: this.attrs.value,
        anchor: this.attrs.anchor,
        vibrancy: this.attrs.vibrancy,
        hueShift: this.attrs.hueShift,
        name: this.attrs.name
      }),
    { equals: ColorLadder.same }
  )

  /** `copy`, as the chips' attribute text:  `""` (bare), a format, or `undefined` (absent). */
  readonly chipCopy = createMemo(() => {
    const copy = this.attrs.copy
    return copy === true ? "" : copy || undefined
  })

  ////////////////
  // ## Element hooks
  ////////////////

  protected extraClasses(): string | undefined {
    return BRAND_COLOR
  }

  ////////////////
  // ## Rendering
  ////////////////

  /** Adds `ui-change`, when the colours change after the first render. */
  mount(): JSX.Element {
    createEffect(
      () => this.ladder(),
      (ladder) => {
        this.announce(ladder)
      }
    )
    return super.mount()
  }

  render(): JSX.Element {
    return (
      <Show when={this.ladder()}>
        <Show when={this.attrs.strip} fallback={this.renderLadder()}>
          {this.renderStrip()}
        </Show>
      </Show>
    )
  }

  /** The ladder:  17 chips, the number under each. */
  private renderLadder(): JSX.Element {
    return (
      <ol class={this.classes()} part={this.part("range")} aria-label={this.ladderName()}>
        <For each={STEPS}>
          {(step) => (
            <li class={CLASSES.step} part={this.part("step")}>
              <ui-brand-color
                part={this.part("chip")}
                value={this.ladder()?.scale[step]}
                name={this.ladder()?.name(step)}
                label={this.attrs.label}
                contrast={UIBrandColorRange.flag(this.attrs.contrast)}
                copy={this.chipCopy()}
                details={UIBrandColorRange.flag(this.attrs.details)}
                selected={UIBrandColorRange.flag(this.ladder()?.anchor === step)}
              />
              <Show when={this.attrs.numbers !== NO_NUMBERS}>
                <span class={CLASSES.number} part={this.part("number")} aria-hidden="true">
                  {step}
                </span>
              </Show>
            </li>
          )}
        </For>
      </ol>
    )
  }

  /** The strip:  17 dots, one image. */
  private renderStrip(): JSX.Element {
    return (
      <span class={this.classes()} part={this.part("range")} role="img" aria-label={this.ladderName()}>
        <For each={STEPS}>
          {(step) => <span class={CLASSES.dot} part={this.part("dot")} style={this.dotStyle(step)} />}
        </For>
      </span>
    )
  }

  /** The ladder's name:  "brand:  17 shades of #8E96B5". */
  private ladderName(): string {
    const ladder = this.ladder()
    return ladder ? this.text("ladder", { name: ladder.prefix, seed: ladder.seed }) : ""
  }

  /** A strip dot's colour. */
  private dotStyle(step: Step): JSX.CSSProperties | undefined {
    const color = this.ladder()?.scale[step]
    return color ? { "background-color": color } : undefined
  }

  ////////////////
  // ## Events
  ////////////////

  /** A new ladder:  `ui-change`, unless it's the first render's or only its prefix changed. */
  private announce(ladder: ColorLadder | undefined) {
    const first = this.announced === null
    const previous = this.announced
    this.announced = ladder
    if (first || !ladder || ladder.sameColors(previous ?? undefined)) return
    this.emit("ui-change", { value: ladder.seed, scale: { ...ladder.scale }, anchor: ladder.anchor })
  }

  /** A boolean as a chip's attribute:  `""` (on) or absent. */
  private static flag(on: boolean): "" | undefined {
    return on ? "" : undefined
  }
}
