import { Palette, STEPS, type Scale, type Step } from "$/brand"

import { DEFAULT_PREFIX, type CssFormat, type LadderInput } from "./UIBrandColorRange.types"

/****************
 * ### `ColorLadder`
 * One `<ui-brand-color-range>`'s ladder, from its attributes:  the base colour, its step,
 * the 17 colours (`Palette.generateScale()`) and the token prefix;  `css()` writes them as the Color Set Chooser's CSS
 * panel.
 * - Shared by the component (a memo over its attributes) and its DOM element
 *   (`scale`, `anchorStep`, `css()`, from the DOM element's current properties, so they're right straight after
 *   a write).
 * - Immutable;  `from()` returns `undefined` for a value that isn't a colour.
 ****************/
export class ColorLadder {
  /** the base colour, `#RRGGBB` */
  readonly seed: string

  /** the step it sits at */
  readonly anchor: Step

  /** step => `#RRGGBB` */
  readonly scale: Scale

  /** token prefix, `brand` */
  readonly prefix: string

  private constructor(seed: string, anchor: Step, scale: Scale, prefix: string) {
    this.seed = seed
    this.anchor = anchor
    this.scale = scale
    this.prefix = prefix
  }

  /**
   * The ladder `input` makes, or `undefined` when `value` isn't a colour.
   * - `anchor`:  a step, else (`auto`, anything else) the step nearest the colour's lightness
   * - `vibrancy`:  percent, `100` = the colour's own chroma (`chromaScale` 1);  never below 0
   * - `hueShift`:  degrees toward the dark end
   */
  static from(input: LadderInput): ColorLadder | undefined {
    const seed = Palette.parse(input.value ?? "")
    if (!seed) return undefined
    const vibrancy = Number.isFinite(input.vibrancy) ? Math.max(0, input.vibrancy!) : 100
    const hueShift = Number.isFinite(input.hueShift) ? input.hueShift! : 0
    const { anchor, scale } = Palette.generateScale(seed, {
      anchor: ColorLadder.stepOf(input.anchor),
      chromaScale: vibrancy / 100,
      hueShift
    })
    return new ColorLadder(seed, anchor, scale, ColorLadder.prefixOf(input.name))
  }

  /** Token name of `step`:  `brand-500`. */
  name(step: Step): string {
    return `${this.prefix}-${step}`
  }

  /**
   * The ladder as CSS custom properties on `:root`, as the Chooser's CSS panel:  a comment naming the prefix,
   * the base colour and its step, then one `--<prefix>-<step>` per step.
   */
  css(format: CssFormat = "hex"): string {
    const lines = STEPS.map((step) => `  --${this.name(step)}: ${Palette.format(this.scale[step], format)};`)
    return `:root {\n  /* ${this.prefix} — seed ${this.seed} @ ${this.anchor} */\n${lines.join("\n")}\n}`
  }

  /** Same colours (base, step and all 17), whatever the prefix? */
  sameColors(other: ColorLadder | undefined): boolean {
    return (
      !!other &&
      other.seed === this.seed &&
      other.anchor === this.anchor &&
      STEPS.every((step) => other.scale[step] === this.scale[step])
    )
  }

  /** Same ladder, prefix included (or both none)? */
  static same(a: ColorLadder | undefined, b: ColorLadder | undefined): boolean {
    if (!a || !b) return a === b
    return a.prefix === b.prefix && a.sameColors(b)
  }

  /** `anchor` as a step, or `undefined` (auto). */
  private static stepOf(anchor: string | undefined): Step | undefined {
    const step = Number(anchor)
    return (STEPS as readonly number[]).includes(step) ? (step as Step) : undefined
  }

  /** A token prefix from `name`:  lower case, runs of other characters as one `-`;  none:  `color`. */
  private static prefixOf(name: string | undefined): string {
    const prefix = (name ?? "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
    return prefix || DEFAULT_PREFIX
  }
}
