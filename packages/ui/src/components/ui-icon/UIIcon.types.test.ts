import { describe, expect, test } from "vite-plus/test"

import { IconLabels } from "./UIIcon.types"

describe("IconLabels.applyTo()", () => {
  test("names the element an image by `label`", () => {
    const internals = applied("Home")
    expect(internals).toEqual({ role: "img", ariaLabel: "Home", ariaHidden: null })
  })

  test.each([undefined, ""])("hides the host without a label (%j):  a decorative glyph", (label) => {
    expect(applied(label)).toEqual({ role: null, ariaLabel: label ?? null, ariaHidden: "true" })
  })

  test("undoes a label once it's gone", () => {
    const internals = applied("Home")
    IconLabels.applyTo(internals as ElementInternals, undefined)
    expect(internals).toEqual({ role: null, ariaLabel: null, ariaHidden: "true" })
  })
})

/** The ARIA a plain stand-in for `ElementInternals` ends with after `applyTo(label)`. */
function applied(label: string | undefined): Partial<ElementInternals> {
  const internals = {}
  IconLabels.applyTo(internals as ElementInternals, label)
  return internals
}
