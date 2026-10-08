import { describe, expect, test } from "vite-plus/test"

import { RootBox } from "./RootBox"

describe("RootBox.css()", () => {
  test("writes width, height, scale and stack-with, in that order", () => {
    expect(RootBox.css({ width: "20em", height: "200px", size: "small", stackWith: "page" })).toBe(
      "width: 20em; height: 200px; --ui-scale: var(--ui-size-small); --ui-stack-with: page"
    )
  })

  test("`window` is the viewport's length, which follows a phone's address bar", () => {
    expect(RootBox.css({ width: "window", height: "window" })).toBe("width: 100dvw; height: 100dvh")
  })

  test("writes NOTHING for medium, an unknown stack-with, or a length that could inject a declaration", () => {
    expect(RootBox.css({ size: "medium", stackWith: "junk", height: "10px; background: red" })).toBe("")
    expect(RootBox.css({})).toBe("")
  })
})

describe("RootBox.isBox()", () => {
  test("is a box ONLY with a usable width or height", () => {
    expect(RootBox.isBox({ width: "window" })).toBe(true)
    expect(RootBox.isBox({ height: " 5em " })).toBe(true)
    expect(RootBox.isBox({ width: "", height: "junk;" })).toBe(false)
  })
})
