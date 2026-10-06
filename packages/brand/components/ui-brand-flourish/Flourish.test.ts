import { describe, expect, test } from "vite-plus/test"

import { Flourish } from "./Flourish"
import { VARIANTS } from "./ui-brand-flourish.types"

/** Stroke, two fills and a weight, each easy to find in the markup. */
const COLORS = { stroke: "red", fill: "green", fill2: "blue", weight: 2 }

describe("Flourish.draw()", () => {
  test("draws every variant;  the same seed draws the same art, another seed another", () => {
    for (const variant of VARIANTS) {
      const one = Flourish.draw(variant, 600, 300, 7, COLORS)
      expect(one).toMatch(/^<path d="M/)
      expect(Flourish.draw(variant, 600, 300, 7, COLORS)).toBe(one)
      // `rising-wave` uses no randomness
      if (variant !== "rising-wave") expect(Flourish.draw(variant, 600, 300, 8, COLORS)).not.toBe(one)
    }
  })

  test("uses the colours and weight it's given", () => {
    expect(Flourish.draw("swoop", 600, 300, 7, COLORS)).toContain(`stroke="red" stroke-width="2"`)
    const blobs = Flourish.draw("blobs", 600, 300, 7, COLORS)
    expect(blobs).toContain(`fill="green"`)
    expect(blobs).toContain(`fill="blue"`)
  })
})
