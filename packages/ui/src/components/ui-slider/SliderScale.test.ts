import { describe, expect, test } from "vite-plus/test"

import { SliderScale } from "./SliderScale"

describe("SliderScale.snap()", () => {
  test("snaps to the step grid within min ... max;  a step of 0 keeps the value", () => {
    const scale = new SliderScale({ min: 0, max: 10, step: 3 })
    expect([scale.snap(4), scale.snap(5), scale.snap(10), scale.snap(-2), scale.snap(Number.NaN)]).toEqual([
      3, 6, 9, 0, 0
    ])
    expect(new SliderScale({ min: 0, max: 1, step: 0 }).snap(0.123)).toBe(0.123)
  })
})

describe("SliderScale.move()", () => {
  test("moves by whole steps, rounding float noise", () => {
    const tenths = new SliderScale({ min: 0, max: 1, step: 0.1 })
    expect(tenths.move(0.2, 1)).toBe(0.3)
  })
})

describe("SliderScale.ratio() / valueAt()", () => {
  test("maps values and ratios both ways", () => {
    const scale = new SliderScale({ min: 10, max: 20, step: 1 })
    expect([scale.ratio(15), scale.ratio(5), scale.valueAt(0.42), scale.valueAt(2)]).toEqual([0.5, 0, 14, 20])
    expect(new SliderScale({ min: 5, max: 5, step: 1 }).ratio(5)).toBe(0)
  })
})

describe("SliderScale.gap()", () => {
  test("spaces labels by distance, dividing the intervals evenly", () => {
    const scale = new SliderScale({ min: 0, max: 20, step: 1 })
    expect([
      scale.intervals,
      scale.gap(0, 100),
      scale.gap(2000, 100),
      scale.gap(400, 100),
      scale.gap(100, 100)
    ]).toEqual([20, 1, 1, 5, 20])
  })
})

describe("SliderScale.labelValue()", () => {
  test("`tickStep`:  labels every tick step from `min`;  snapping keeps to `step`", () => {
    const scale = new SliderScale({ min: -40, max: 40, step: 1, tickStep: 8 })
    expect(scale.intervals).toBe(10)
    expect([0, 1, 5, 10].map((index) => scale.labelValue(index))).toEqual([-40, -32, 0, 40])
    expect(scale.snap(3.4)).toBe(3)
    const fallback = new SliderScale({ min: 0, max: 10, step: 2, tickStep: 0 })
    expect(fallback.intervals).toBe(5)
  })
})
