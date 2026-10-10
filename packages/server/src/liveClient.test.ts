import { describe, expect, test } from "vite-plus/test"

import { SRV } from "$/server"

/** A Mac, the key going to the page itself (no field). */
const MAC = { apple: true }

/** A key press:  `key`, with the modifiers named in `held` (`"meta shift"` ...). */
function press(key: string, held = ""): SRV.KeyPress {
  return {
    key,
    metaKey: held.includes("meta"),
    ctrlKey: held.includes("ctrl"),
    altKey: held.includes("alt"),
    shiftKey: held.includes("shift")
  }
}

describe("forVsCode()", () => {
  test("VS Code's own keys go to VS Code:  the palette, quick open, go to symbol, the side bars, F1", () => {
    const keys = [
      press("P", "meta shift"),
      press("p", "meta"),
      press("O", "meta shift"),
      press("b", "meta"),
      press("b", "meta alt"),
      press("`", "ctrl"),
      press("F", "meta shift"),
      press("w", "meta"),
      press("F1")
    ]
    expect(keys.map((key) => SRV.forVsCode(key, MAC))).toEqual(keys.map(() => true))
  })

  test("the PAGE's edit keys, its find bar, plain typing and keys that move stay in the page", () => {
    const keys = [
      press("a", "meta"),
      press("c", "meta"),
      press("v", "meta"),
      press("z", "meta"),
      press("Z", "meta shift"),
      press("f", "meta"),
      press("G", "meta shift"),
      press("p"),
      press("P", "shift"),
      press("Meta", "meta"),
      press("ArrowDown", "meta"),
      press("Enter", "meta"),
      press(" ", "ctrl")
    ]
    expect(keys.map((key) => SRV.forVsCode(key, MAC))).toEqual(keys.map(() => false))
  })

  test("in a field on a Mac, Ctrl moves the caret (stays);  Cmd + Shift + P still opens the palette", () => {
    const field = { apple: true, field: "text" } as const
    expect(SRV.forVsCode(press("e", "ctrl"), field)).toBe(false)
    expect(SRV.forVsCode(press("P", "meta shift"), field)).toBe(true)
    expect(SRV.forVsCode(press("e", "ctrl"), { apple: false, field: "text" })).toBe(true)
  })

  test("in rich text, Cmd + B / I / U format it;  outside it, Cmd + B is VS Code's side bar", () => {
    expect(SRV.forVsCode(press("b", "meta"), { apple: true, field: "rich" })).toBe(false)
    expect(SRV.forVsCode(press("b", "meta"), { apple: true, field: "text" })).toBe(true)
  })

  test("a key still being composed (an IME) is never sent", () => {
    expect(SRV.forVsCode({ ...press("p", "meta"), isComposing: true }, MAC)).toBe(false)
  })
})
