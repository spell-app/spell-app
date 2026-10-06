import { describe, expect, test } from "vite-plus/test"

import { DesignColor } from "./DesignColor.ts"

describe("DesignColor.parse()", () => {
  test("parses and writes hex", () => {
    expect(DesignColor.toHex(DesignColor.parse("#7b68e9")!)).toBe("#7b68e9")
    expect(DesignColor.toHex(DesignColor.parse("rgb(200 206 231 / 0.16)")!)).toBe("#c8cee729")
    expect(DesignColor.toHex(DesignColor.parse("transparent")!)).toBe("#00000000")
  })

  test("works out relative colours and mixes", () => {
    // same channels:  the colour itself, with a new alpha
    expect(DesignColor.toHex(DesignColor.parse("oklch(from #7b68e9 l c h / 0.5)")!)).toBe("#7b68e980")
    const darker = DesignColor.parse("oklch(from #7b68e9 calc(l - 0.1) c h)")!
    expect(darker.l).toBeCloseTo(DesignColor.parse("#7b68e9")!.l - 0.1, 5)
    expect(DesignColor.parse("oklch(from #7b68e9 min(l, 0.3) c h)")!.l).toBeCloseTo(0.3, 5)
    expect(DesignColor.toHex(DesignColor.parse("color-mix(in oklab, #ffffff 50%, #ffffff)")!)).toBe("#ffffff")
    expect(DesignColor.parse("color-mix(in oklab, currentColor 40%, transparent)")).toBeUndefined()
  })
})

describe("DesignColor.isPlain()", () => {
  test("tells plain colours from the rest", () => {
    expect(DesignColor.isPlain("oklch(0.57 0.21 27)")).toBe(true)
    expect(DesignColor.isPlain("rgb(43 47 63 / 0.06)")).toBe(true)
    expect(DesignColor.isPlain("red")).toBe(false)
    expect(DesignColor.isPlain("oklch(from var(--x) l c h)")).toBe(false)
  })
})
