import { describe, expect, test } from "vite-plus/test"

import { hues } from "$/ui/styles"
import { ColorContrast } from "$/ui/styles/ColorContrast"

describe("ColorContrast.linearSrgb()", () => {
  test("measures OKLCH like the browser paints it", () => {
    // cross-check the conversion against a canvas pixel, for every light-scheme base
    const context = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!
    for (const [name, hue] of Object.entries(hues)) {
      const [lightness, chroma, angle] = hue.onLight
      context.fillStyle = `oklch(${lightness} ${chroma} ${angle})`
      context.fillRect(0, 0, 1, 1)
      const pixel = [...context.getImageData(0, 0, 1, 1).data.slice(0, 3)]
      const expected = ColorContrast.linearSrgb(hue.onLight).map((channel) => Math.round(encode(channel) * 255))
      for (const [index, value] of pixel.entries()) expect(Math.abs(value - expected[index]!), name).toBeLessThan(2)
    }
  })

  test("CLIPS out-of-gamut channels to 0..1, as axe does", () => {
    for (const channel of ColorContrast.linearSrgb([0.7, 0.4, 145])) {
      expect(channel).toBeGreaterThanOrEqual(0)
      expect(channel).toBeLessThanOrEqual(1)
    }
  })
})

describe("ColorContrast.ratio()", () => {
  test("is 21:1 for black on white, 1:1 for a colour on itself, in either order", () => {
    expect(ColorContrast.ratio([1, 0, 0], [0, 0, 0])).toBeCloseTo(21, 5)
    expect(ColorContrast.ratio([0, 0, 0], [1, 0, 0])).toBeCloseTo(21, 5)
    expect(ColorContrast.ratio([0.6, 0.1, 250], [0.6, 0.1, 250])).toBe(1)
  })
})

/** sRGB transfer function:  linear light -> gamma-encoded channel. */
function encode(linear: number): number {
  return linear <= 0.0031308 ? 12.92 * linear : 1.055 * linear ** (1 / 2.4) - 0.055
}
