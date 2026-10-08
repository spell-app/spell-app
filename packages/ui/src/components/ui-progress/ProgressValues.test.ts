import { describe, expect, test } from "vite-plus/test"

import { ProgressValues } from "./ProgressValues"

////////////////
// ## `new ProgressValues()`
////////////////

describe("new ProgressValues()", () => {
  test("`percent` wins;  else `value` is a share of `total`, or a percentage without one", () => {
    expect(new ProgressValues({ percent: 30, value: 90 }).percents).toEqual([30])
    expect(new ProgressValues({ value: 9, total: 20 }).percents).toEqual([45])
    expect(new ProgressValues({ value: 45 }).percents).toEqual([45])
    expect(new ProgressValues({}).percents).toEqual([0])
  })

  test("keeps each bar within 0 ... 100, and scales bars that add up to more than 100 down to fit", () => {
    expect(new ProgressValues({ value: "130" }).percents).toEqual([100])
    expect(new ProgressValues({ value: "-5, 40" }).percents).toEqual([0, 40])
    expect(new ProgressValues({ percent: "60 90" }).percents).toEqual([40, 60])
  })

  test("rounds what's shown to `precision`, keeping the exact `percents` for the bar widths", () => {
    // `toEqual()` compares the instance's own fields, not its class
    expect(new ProgressValues({ value: "1, 1", total: 3, precision: 1 })).toEqual({
      precision: 1,
      total: 3,
      percents: [(1 / 3) * 100, (1 / 3) * 100],
      shown: [33.3, 33.3],
      percent: 66.7,
      values: [1, 1],
      value: 2
    })
  })

  test("has no `values` or `value` without a `total`", () => {
    expect(new ProgressValues({ value: 40 })).toMatchObject({ total: undefined, values: undefined, value: undefined })
  })
})

////////////////
// ## `ProgressValues.fill()`
////////////////

describe("ProgressValues.fill()", () => {
  test("fills `{percent}`, `{value}`, `{total}` and `{left}`, of every bar or one;  an unknown name stays", () => {
    const values = new ProgressValues({ value: "3, 6", total: 20 })
    expect(values.fill("{value} of {total}, {left} left ({percent}%)")).toBe("9 of 20, 11 left (45%)")
    expect(values.fill("{value} of {total}", 1)).toBe("6 of 20")
    expect(values.fill("{nope}")).toBe("{nope}")
  })

  test("counts in percent without a `total`", () => {
    expect(new ProgressValues({ value: 30 }).fill("{value} of {total}, {left} left")).toBe("30 of 100, 70 left")
  })

  test("formats each number with `format`", () => {
    expect(new ProgressValues({ value: 1, total: 3, precision: 1 }).fill("{percent}", 0, (n) => n.toFixed(2))).toBe(
      "33.30"
    )
  })
})

////////////////
// ## `ProgressValues.list()`
////////////////

describe("ProgressValues.list()", () => {
  test.each([
    [undefined, []],
    ["", []],
    [7, [7]],
    [Number.NaN, []],
    ["10,0, 30 20", [10, 0, 30, 20]],
    ["4, x, 5", [4, 5]]
  ])("%j => %j", (value, numbers) => {
    expect(ProgressValues.list(value)).toEqual(numbers)
  })
})
