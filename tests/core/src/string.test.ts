import { describe, test, expect } from "vite-plus/test"
import { core } from "$/core"

describe("core.unicode()", () => {
  test('the character with a code point;  "" for what\'s no code point', () => {
    expect(core.unicode(0x1f0a0)).toBe("🂠")
    expect(core.unicode(65)).toBe("A")
    expect(core.unicode(1.5)).toBe("")
    expect(core.unicode(0x110000)).toBe("")
    expect(core.unicode(undefined)).toBe("")
    expect(core.unicode("x")).toBe("")
  })
})
