import { describe, expect, test } from "vite-plus/test"

import { Palette, STEPS } from "$/brand"

import { ColorLadder } from "./ColorLadder"

describe("ColorLadder.from()", () => {
  test("makes `Palette.generateScale()`'s ladder;  `undefined` for a value that isn't a colour", () => {
    const { scale, anchor } = Palette.generateScale("#8E96B5")
    expect(ColorLadder.from({ value: "#8e96b5" })).toMatchObject({ seed: "#8E96B5", anchor, scale, prefix: "color" })
    expect(ColorLadder.from({ value: "nope" })).toBeUndefined()
    expect(ColorLadder.from({})).toBeUndefined()
  })

  test("puts the colour on a numeric `anchor`;  any other anchor is `auto`", () => {
    expect(ColorLadder.from({ value: "#6550CA", anchor: "600" })!.anchor).toBe(600)
    expect(ColorLadder.from({ value: "#6550CA", anchor: "601" })!.anchor).toBe(
      Palette.nearestStep(Palette.hexToOklch("#6550CA").l)
    )
  })

  test("bends by `vibrancy` (never below 0) and `hueShift`", () => {
    const bent = Palette.generateScale("#14A39A", { chromaScale: 0.6, hueShift: 20 })
    expect(ColorLadder.from({ value: "#14A39A", vibrancy: 60, hueShift: 20 })!.scale).toEqual(bent.scale)
    const grey = Palette.generateScale("#14A39A", { chromaScale: 0 })
    expect(ColorLadder.from({ value: "#14A39A", vibrancy: -5 })!.scale).toEqual(grey.scale)
  })

  test("makes a token prefix of `name`:  lower case, other runs as one `-`", () => {
    expect(ColorLadder.from({ value: "#8E96B5", name: " Brand Set! " })!.prefix).toBe("brand-set-")
  })
})

describe("ColorLadder.css()", () => {
  test("writes a comment naming the seed, then one custom property per step", () => {
    const ladder = ColorLadder.from({ value: "#6550CA", anchor: "600", name: "violet" })!
    const lines = ladder.css().split("\n")
    expect(lines.slice(0, 3)).toEqual([
      ":root {",
      "  /* violet — seed #6550CA @ 600 */",
      `  --violet-25: ${ladder.scale[25]};`
    ])
    expect(lines).toHaveLength(STEPS.length + 3)
    expect(ladder.css("oklch")).toContain(`  --violet-600: ${Palette.format("#6550CA", "oklch")};`)
  })
})

describe("ColorLadder.same()", () => {
  test("compares colours AND prefix;  `sameColors()` the colours alone", () => {
    const brand = ColorLadder.from({ value: "#8E96B5", name: "brand" })
    const other = ColorLadder.from({ value: "#8E96B5", name: "other" })
    expect(ColorLadder.same(brand, ColorLadder.from({ value: "#8E96B5", name: "brand" }))).toBe(true)
    expect(ColorLadder.same(brand, other)).toBe(false)
    expect(brand!.sameColors(other)).toBe(true)
    expect(ColorLadder.same(undefined, undefined)).toBe(true)
    expect(ColorLadder.same(brand, undefined)).toBe(false)
  })
})
