import { LIST_SPLIT } from "./ui-progress.types"

/****************
 * ### `ProgressValues`
 * The numbers of a progress bar, from its attributes:  Fomantic's `progress.js` arithmetic, without jQuery or Solid,
 * so the element and its native fallback agree.
 * - `percent` wins;  else `value` is a share of `total`, or a percentage when there is no `total`.
 * - Each percentage is kept within 0 ... 100 (Fomantic's `limitValues`);  several bars that add up to more than 100
 *   are scaled down to fit (Fomantic refused the update with an error).
 * - `percents` are exact (bar widths);  `shown` are rounded to `precision` decimals (texts, `data-percent`).
 * - Plain arithmetic, no DOM:  exported from the family's barrel, so an app can compute the same numbers.
 ****************/
export class ProgressValues {
  /** Exact percentage per bar. */
  readonly percents: readonly number[]

  /** Percentage per bar, rounded for display. */
  readonly shown: readonly number[]

  /** Value per bar in `total`'s units, rounded for display;  `undefined` without a total. */
  readonly values: readonly number[] | undefined

  /** `total`, when there is one. */
  readonly total: number | undefined

  /** Every bar together, rounded for display. */
  readonly percent: number

  /** Every bar's value together, in `total`'s units;  `undefined` without a total. */
  readonly value: number | undefined

  /** Decimal places shown. */
  readonly precision: number

  constructor(input: ProgressValuesProps) {
    const precision = Math.max(0, Math.floor(input.precision ?? 0))
    const total = input.total !== undefined && input.total > 0 ? input.total : undefined
    const given = ProgressValues.list(input.percent)
    const values = ProgressValues.list(input.value)
    let percents = given.length
      ? given
      : values.length
        ? values.map((value) => (total ? (value / total) * 100 : value))
        : [0]
    percents = percents.map((percent) => Math.min(100, Math.max(0, percent)))
    const sum = percents.reduce((a, b) => a + b, 0)
    if (sum > 100) percents = percents.map((percent) => (percent * 100) / sum)
    this.precision = precision
    this.total = total
    this.percents = percents
    this.shown = percents.map((percent) => ProgressValues.round(percent, precision))
    this.percent = ProgressValues.round(
      percents.reduce((a, b) => a + b, 0),
      precision
    )
    this.values = total
      ? percents.map((percent) => ProgressValues.round((percent / 100) * total, precision))
      : undefined
    this.value = this.values
      ? ProgressValues.round(
          this.values.reduce((a, b) => a + b, 0),
          precision
        )
      : undefined
  }

  /** How many bars. */
  get bars(): number {
    return this.percents.length
  }

  /** `{ percent, value, total, left }` for bar `index` (or every bar together), for text templates. */
  params(index?: number): Record<string, number> {
    const percent = index === undefined ? this.percent : (this.shown[index] ?? 0)
    const value = index === undefined ? this.value : this.values?.[index]
    const params: Record<string, number> = { percent, left: ProgressValues.round(100 - percent, this.precision) }
    if (value !== undefined && this.total !== undefined) {
      params.value = value
      params.total = this.total
      params.left = ProgressValues.round(this.total - value, this.precision)
    } else {
      params.value = percent
      params.total = 100
    }
    return params
  }

  /** `template` with `{percent}`, `{value}`, `{total}`, `{left}` filled in (Fomantic's `get.text()`). */
  fill(template: string, index?: number, format: (value: number) => string = String): string {
    const params = this.params(index)
    return template.replace(/\{(\w+)\}/g, (match, name: string) => (name in params ? format(params[name]!) : match))
  }

  /**
   * Numbers in `value`:  one, or a comma / space separated list;  anything else is skipped.
   * - Static:  pure, and the constructor's parsing step.
   */
  static list(value: string | number | undefined): number[] {
    if (value === undefined || value === "") return []
    if (typeof value === "number") return Number.isFinite(value) ? [value] : []
    return value
      .split(LIST_SPLIT)
      .filter(Boolean)
      .map(Number)
      .filter((number) => Number.isFinite(number))
  }

  /**
   * `value` rounded to `precision` decimals.
   * - Static:  pure.
   */
  static round(value: number, precision: number): number {
    const factor = 10 ** precision
    return Math.round(value * factor) / factor
  }
}

/** Constructor props for `ProgressValues`:  the host's converted attributes. */
export type ProgressValuesProps = {
  /** `value`:  one number or a comma list. */
  value?: string | number
  /** `total`. */
  total?: number
  /** `percent`:  one number or a comma list. */
  percent?: string | number
  /** Decimal places for display. */
  precision?: number
}
