import type { SliderScaleProps } from "./ui-slider.types"

/****************
 * ### `SliderScale`
 * The number line of a slider:  `min` ... `max` in `step`s -- snapping, ratios along the track, and which steps get
 * a label.  Pure arithmetic (no DOM, no Solid), so it's tested on its own.
 * - Snapping keeps to the step grid from `min`, like a native `<input type=range>`:  a `max` off the grid is never
 *   reached (the last step below it is).  `step` `0` allows any value.
 * - Floating point:  results are rounded to the step's own decimals, so `0.1` steps give `0.3`, not
 *   `0.30000000000000004`.
 ****************/
export class SliderScale {
  /** Lowest value. */
  readonly min: number

  /** Highest value (never below `min`). */
  readonly max: number

  /** Step;  `0` ~== any value. */
  readonly step: number

  /** Distance between labels (and ticks):  `tickStep`, else `step`;  `0` ~== one per unit. */
  readonly tickStep: number

  /** Decimal places of `step` / `tickStep`, for rounding. */
  private readonly decimals: number

  constructor({ min, max, step, tickStep }: SliderScaleProps) {
    this.min = Number.isFinite(min) ? min : 0
    this.max = Number.isFinite(max) ? Math.max(this.min, max) : this.min
    this.step = Number.isFinite(step) && step > 0 ? step : 0
    this.tickStep = tickStep !== undefined && Number.isFinite(tickStep) && tickStep > 0 ? tickStep : this.step
    this.decimals = Math.max(
      SliderScale.decimalsOf(this.step),
      SliderScale.decimalsOf(this.tickStep),
      SliderScale.decimalsOf(this.min)
    )
  }

  /** `value` on the grid, within `min` ... `max`. */
  snap(value: number): number {
    const { min, max, step } = this
    if (!Number.isFinite(value)) return min
    const clamped = Math.min(max, Math.max(min, value))
    if (!step) return clamped
    let snapped = min + Math.round((clamped - min) / step) * step
    if (snapped > max) snapped -= step
    return this.round(snapped)
  }

  /** Where `value` lies along the track, `0` ... `1`. */
  ratio(value: number): number {
    const span = this.max - this.min
    return span ? Math.min(1, Math.max(0, (value - this.min) / span)) : 0
  }

  /** The snapped value at `ratio` (`0` ... `1`) along the track. */
  valueAt(ratio: number): number {
    return this.snap(this.min + Math.min(1, Math.max(0, ratio)) * (this.max - this.min))
  }

  /** `value` moved by `steps` steps (a percent of the span when `step` is `0`), snapped. */
  move(value: number, steps: number): number {
    const unit = this.step || (this.max - this.min) / 100
    return this.snap(value + steps * unit)
  }

  /** Number of intervals between labels:  one per `tickStep` (per unit, with no step). */
  get intervals(): number {
    return Math.max(1, Math.round((this.max - this.min) / (this.tickStep || 1)))
  }

  /** Value of label `index`. */
  labelValue(index: number): number {
    return this.round(Math.min(this.max, this.min + index * (this.tickStep || 1)))
  }

  /**
   * Show every `gap()`-th label in full, so neighbours are at least `distance` px apart on a `length` px track
   * (Fomantic's `autoAdjustLabels` / `labelDistance`);  the rest become half ticks.
   * - A gap divides the intervals evenly when it can;  unmeasured (`length` `0`), every label shows.
   */
  gap(length: number, distance: number): number {
    const { intervals } = this
    if (length <= 0) return 1
    const spacing = length / intervals
    for (let gap = 1; gap <= intervals; gap++) {
      if (spacing * gap >= distance && intervals % gap === 0) return gap
    }
    return intervals
  }

  /** `value` rounded to the scale's decimals. */
  private round(value: number): number {
    const factor = 10 ** this.decimals
    return Math.round(value * factor) / factor
  }

  /** Decimal places written in `value`. */
  private static decimalsOf(value: number): number {
    const [, decimals = ""] = String(value).split(".")
    return decimals.length
  }
}
