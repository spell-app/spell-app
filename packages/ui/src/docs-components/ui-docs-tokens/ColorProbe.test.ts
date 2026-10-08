import { describe, expect, test } from "vite-plus/test"

import { ColorProbe } from "./ColorProbe"

describe("ColorProbe.hexFor()", () => {
  test("reads any CSS colour back as #rrggbb", () => {
    expect(ColorProbe.hexFor("rgb(255, 0, 0)")).toBe("#ff0000")
    expect(ColorProbe.hexFor("oklch(1 0 0)")).toBe("#ffffff")
  })
})

describe("ColorProbe.hexesFor()", () => {
  test("resolves each value where it's drawn;  a translucent one flattened onto the backdrop, as the reader sees it", () => {
    expect(ColorProbe.hexesFor(document.body, new Map([["a", "var(--nope, rgb(0, 0, 255))"]])).get("a")).toBe("#0000ff")
    expect(
      ColorProbe.hexesFor(document.body, new Map([["a", "rgb(0 0 0 / 0.5)"]]), "rgb(255, 255, 255)").get("a")
    ).toMatch(/^#(7f|80){3}$/)
  })
})
