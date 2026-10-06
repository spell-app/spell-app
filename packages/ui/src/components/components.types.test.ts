import { describe, expect, test } from "vite-plus/test"

import { UIT } from "$/ui/core"

describe("Flags.emojiFor()", () => {
  test("draws a two-letter code as its regional-indicator pair, in any case", () => {
    expect(UIT.Flags.emojiFor("fr")).toBe("🇫🇷")
    expect(UIT.Flags.emojiFor("US")).toBe("🇺🇸")
  })

  test("draws the flags that aren't a country's:  ZWJ sequences and subdivision tag sequences", () => {
    expect(UIT.Flags.emojiFor("rainbow")).toBe(UIT.SpecialFlags.rainbow)
    expect(UIT.Flags.emojiFor("GB-ENG")).toBe(UIT.SpecialFlags["gb-eng"])
  })

  test('returns `""` for anything that names no flag, `Object.prototype` keys included', () => {
    for (const code of ["", "f", "fra", "france", "f1", "constructor", "__proto__"]) {
      expect(UIT.Flags.emojiFor(code), code).toBe("")
    }
  })
})

describe("Flags.isSpecial()", () => {
  test("is true ONLY for a lowercase key of `SpecialFlags`", () => {
    expect(UIT.Flags.isSpecial("pirate")).toBe(true)
    expect(UIT.Flags.isSpecial("fr")).toBe(false)
    expect(UIT.Flags.isSpecial("toString")).toBe(false)
  })
})
