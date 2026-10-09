import { For, Show, createEffect, createMemo } from "solid-js"
import type { JSX } from "@solidjs/web"

import { DOMElement, proto, protoMerged, UIComponent, type ElementSetup, type AttributeValues } from "$/ui/core"
import { STEPS, type Scale, type Step } from "$/brand"

import { brandColorRangeVocabulary } from "./UIBrandColorRange.en"
import { ColorLadder } from "./ColorLadder"
import type { BrandColorRangeVocabulary, CssFormat, LadderInput } from "./UIBrandColorRange.types"

import "$/brand/components/ui-brand-color"

import rangeCSS from "./UIBrandColorRange.css?inline"

/****************
 * ### `DOMBrandColorRangeElement`
 * The DOM element of `<ui-brand-color-range>`:  it adds the ladder as read-only properties, and `css()`.
 *
 * - Worked out from the DOM element's CURRENT properties (`value`, `anchor`, `vibrancy`, `hueShift`, `name`),
 *   not the component's memo, so a read straight after a write sees the new ladder
 *   (Solid applies writes a microtask late).
 * - `DOMElement` refuses a member named like an attribute's property:  none of these is one.
 * - Above the component:  its `elementSetup` reads this class while the component is defined.
 ****************/
export class DOMBrandColorRangeElement extends DOMElement<UIBrandColorRange> {
  /** Step => `#RRGGBB` (a copy), or `undefined` without a base colour. */
  get scale(): Scale | undefined {
    const ladder = this.ladder()
    return ladder && { ...ladder.scale }
  }

  /** The step the base colour sits at (`anchor="auto"`:  the one picked), or `undefined`. */
  get anchorStep(): Step | undefined {
    return this.ladder()?.anchor
  }

  /** The ladder as CSS custom properties on `:root` (the Chooser's CSS panel), or `""`. */
  css(format: CssFormat = "hex"): string {
    return this.ladder()?.css(format) ?? ""
  }

  /** The ladder the current properties make. */
  private ladder(): ColorLadder | undefined {
    const { value, anchor, vibrancy, hueShift, name } = this as unknown as LadderInput
    return ColorLadder.from({ value, anchor, vibrancy, hueShift, name })
  }
}

/****************
 * ### `UIBrandColorRange`
 * The component behind `<ui-brand-color-range>`:  a 17-step ladder from ONE base colour
 * (`Palette.generateScale()`), as the Color Set Chooser's Variants row.
 *
 * - Its shadow DOM:  `<ol class="range color brand" part="range">`, one `<li part="step">` per step,
 *   holding a `<ui-brand-color>` (named `<name>-<step>`) and the step's number under it
 *   (`numbers="none"`:  no numbers, nor their row).
 *   The base colour's chip is `selected` (the double ring).
 *
 * - `label`, `contrast`, `copy` and `details` are handed to every chip;
 *   the chips fill their cells (`--_ui-brand-color-fit`).
 * - `strip`:  17 small dots instead (the Chooser's folded Variants header), one image named for the ladder.
 * - No base colour (or one it can't read):  nothing is drawn.
 * - `ui-change` (`{ value, scale, anchor }`) when the ladder's colours change after the first render;
 *   a new `name` alone renames the chips and changes `css()`, without one.
 * - The DOM element (`DOMBrandColorRangeElement`) has `scale`, `anchorStep` and `css(format)`.
 ****************/
export class UIBrandColorRange extends UIComponent<BrandColorRangeVocabulary> {
  @proto static vocabulary = brandColorRangeVocabulary
  @protoMerged static elementSetup = {
    styleSheets: { range: rangeCSS },
    DOMElement: DOMBrandColorRangeElement,
    delegatesFocus: false
  } satisfies Partial<ElementSetup>

  /** The ladder last announced (`null` before the first render's), for `ui-change`. */
  private announced: ColorLadder | undefined | null = null

  ////////////////
  // ## Derived state
  ////////////////

  /** The ladder the attributes make, or `undefined`;  changes only when it does. */
  readonly ladder = createMemo(
    () =>
      ColorLadder.from({
        value: this.value,
        anchor: this.anchor,
        vibrancy: this.vibrancy,
        hueShift: this.hueShift,
        name: this.name
      }),
    { equals: ColorLadder.same }
  )

  /** `copy`, as the chips' attribute text:  `""` (bare), a format, or `undefined` (absent). */
  readonly chipCopy = createMemo(() => {
    const copy = this.copy
    return copy === true ? "" : copy || undefined
  })

  ////////////////
  // ## Classes
  ////////////////

  protected get extraClass(): string | undefined {
    return BRAND_COLOR
  }

  ////////////////
  // ## Rendering
  ////////////////

  /** Adds `ui-change`, when the colours change after the first render. */
  onMount(): JSX.Element {
    createEffect(
      () => this.ladder(),
      (ladder) => {
        this.announce(ladder)
      }
    )
    return super.onMount()
  }

  render(): JSX.Element {
    return (
      <Show when={this.ladder()}>
        <Show when={this.strip} fallback={this.renderLadder()}>
          {this.renderStrip()}
        </Show>
      </Show>
    )
  }

  /** The ladder:  17 chips, the number under each. */
  private renderLadder(): JSX.Element {
    return (
      <ol class={this.rootClass} part={this.partForName("range")} aria-label={this.ladderName()}>
        <For each={STEPS}>
          {(step) => (
            <li class={CLASSES.step} part={this.partForName("step")}>
              <ui-brand-color
                part={this.partForName("chip")}
                value={this.ladder()?.scale[step]}
                name={this.ladder()?.name(step)}
                label={this.label}
                contrast={UIBrandColorRange.flag(this.contrast)}
                copy={this.chipCopy()}
                details={UIBrandColorRange.flag(this.details)}
                selected={UIBrandColorRange.flag(this.ladder()?.anchor === step)}
              />
              <Show when={this.numbers !== NO_NUMBERS}>
                <span class={CLASSES.number} part={this.partForName("number")} aria-hidden="true">
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
      <span class={this.rootClass} part={this.partForName("range")} role="img" aria-label={this.ladderName()}>
        <For each={STEPS}>
          {(step) => <span class={CLASSES.dot} part={this.partForName("dot")} style={this.dotStyle(step)} />}
        </For>
      </span>
    )
  }

  /** The ladder's name:  "brand:  17 shades of #8E96B5". */
  private ladderName(): string {
    const ladder = this.ladder()
    return ladder ? this.translationForKey("ladder", { name: ladder.prefix, seed: ladder.seed }) : ""
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
    this.send("ui-change", { value: ladder.seed, scale: { ...ladder.scale }, anchor: ladder.anchor })
  }

  /** A boolean as a chip's attribute:  `""` (on) or absent. */
  private static flag(on: boolean): "" | undefined {
    return on ? "" : undefined
  }
}

export interface UIBrandColorRange extends AttributeValues<BrandColorRangeVocabulary> {}

/** The class words the component adds before the noun:  `color brand range`. */
const BRAND_COLOR = "color brand"

/** The `numbers` value that leaves the step numbers out. */
const NO_NUMBERS = "none"

/** The shadow classes, one per part. */
const CLASSES = {
  step: "step",
  number: "number",
  dot: "dot"
} as const
