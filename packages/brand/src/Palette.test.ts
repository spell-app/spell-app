import { describe, expect, it } from "vite-plus/test"

import { Palette } from "$/brand"

// Claude Design's own output (`brand/spell-design-system/lib/palette.json`, shared), copied:  a test can't read the
// shared folder, which only this machine's checkouts link (claude-design P11).  Copy again if Claude Design re-exports.
import palette from "./Palette.fixture.json"

describe("Palette", () => {
  it("rebuilds the brand's 20 sets exactly as Claude Design's palette.mjs did (lib/palette.json)", () => {
    expect(Palette.buildPalette()).toEqual(palette)
  })

  it("lands a seed on its anchor step, and picks the nearest step by lightness when none is given", () => {
    const { anchor, scale } = Palette.generateScale("#6550CA", { anchor: 600 })
    expect(anchor).toBe(600)
    expect(scale[600]).toBe("#6550CA")
    // House of Owen's lightness (0.677) is nearer 400's 0.72 than 500's 0.63:  the Color Set Chooser says 400 too
    expect(Palette.generateScale("#8E96B5").anchor).toBe(400)
  })

  it("converts hex <-> OKLCH, and formats both as the brand's tools show them", () => {
    const { l, c, h } = Palette.hexToOklch("#8E96B5")
    expect(Palette.oklchToHex({ l, c, h })).toBe("#8E96B5")
    expect(Palette.format("#8e96b5")).toBe("#8E96B5")
    expect(Palette.format("#8E96B5", "oklch")).toBe("oklch(67.7% 0.047 274)")
  })

  it("converts hex <-> HSL exactly (every 8-bit colour round-trips), and formats it as CSS", () => {
    expect(Palette.hexToHsl("#FF0000")).toEqual({ h: 0, s: 1, l: 0.5 })
    expect(Palette.hexToHsl("#00FF00")).toEqual({ h: 120, s: 1, l: 0.5 })
    expect(Palette.hexToHsl("#808080")).toEqual({ h: 0, s: 0, l: 128 / 255 })
    expect(Palette.hslToHex({ h: 240, s: 1, l: 0.25 })).toBe("#000080")
    expect(Palette.hslToHex({ h: 300, s: 1, l: 0.5 })).toBe("#FF00FF")
    expect(Palette.hslToHex({ h: -60, s: 1, l: 0.5 })).toBe("#FF00FF") // the hue wraps
    expect(Palette.hslToHex({ h: 30, s: 2, l: -1 })).toBe("#000000") // S and L clamp
    // every 8-bit grey and colour on a coarse grid comes back as itself
    for (let r = 0; r < 256; r += 15) {
      for (let g = 0; g < 256; g += 17) {
        for (let b = 0; b < 256; b += 51) {
          const hex = Palette.rgbToHex([r / 255, g / 255, b / 255])
          expect(Palette.hslToHex(Palette.hexToHsl(hex))).toBe(hex)
        }
      }
    }
    expect(Palette.format("#6550CA", "hsl")).toBe("hsl(250 54% 55%)")
    expect(Palette.format("#FFFFFF", "hsl")).toBe("hsl(0 0% 100%)")
    expect(Palette.formatHsl({ h: 359.6, s: 0.524, l: 0.555 })).toBe("hsl(0 52% 56%)")
  })

  it("parses what a person types:  hex, short hex, RGB 0-255, HSL, OKLCH;  nothing else", () => {
    expect(Palette.parse("hsl(250 54% 55%)")).toBe(Palette.hslToHex({ h: 250, s: 0.54, l: 0.55 }))
    expect(Palette.parse("hsl(120deg, 100%, 25%)")).toBe("#008000")
    expect(Palette.parse("hsl(0 120% 50%)")).toBeUndefined()
    expect(Palette.parse("#abc")).toBe("#AABBCC")
    expect(Palette.parse("8e96b5")).toBe("#8E96B5")
    expect(Palette.parse("142 150 181")).toBe("#8E96B5")
    expect(Palette.parse("oklch(67.7% 0.047 274)")).toBe("#8E96B5")
    expect(Palette.parse("blue")).toBeUndefined()
    expect(Palette.parse("300 0 0")).toBeUndefined()
  })

  it("measures contrast and picks readable ink", () => {
    expect(Palette.contrast("#000000", "#FFFFFF")).toBeCloseTo(21, 5)
    expect(Palette.ink("#6550CA")).toBe("#FFFFFF")
    expect(Palette.ink("#F1E7D4")).toBe("#1A1C27")
  })
})
