import { describe, expect, it } from "vite-plus/test"

import { Chord } from "./Chord"

/** A `keydown` event with the given key and modifiers. */
function keydown(key: string, init: KeyboardEventInit = {}) {
  return new KeyboardEvent("keydown", { key, ...init })
}

////////////////
// ## Parsing
////////////////

describe("Chord.parse()", () => {
  it("parses modifiers and key in any case", () => {
    const chord = Chord.parse("shift+ALT+ArrowUp", { isApple: false })
    expect(chord).toMatchObject({ key: "arrowup", shift: true, alt: true, ctrl: false, meta: false })
    expect(chord.toString()).toBe("Alt+Shift+arrowup")
  })

  it("maps Mod to Meta on Apple and Ctrl elsewhere", () => {
    expect(Chord.parse("Mod+K", { isApple: true })).toMatchObject({ meta: true, ctrl: false })
    expect(Chord.parse("Mod+K", { isApple: false })).toMatchObject({ meta: false, ctrl: true })
  })

  it("resolves key aliases and a trailing ++", () => {
    expect(Chord.parse("Esc").key).toBe("escape")
    expect(Chord.parse("Space").key).toBe(" ")
    expect(Chord.parse("Ctrl++")).toMatchObject({ key: "+", ctrl: true })
    expect(Chord.parse("Up").key).toBe("arrowup")
  })

  it("throws on unknown modifiers and missing keys", () => {
    expect(() => Chord.parse("Hyper+K")).toThrow(/unknown modifier/)
    expect(() => Chord.parse("Ctrl+")).toThrow(/no key/)
  })
})

////////////////
// ## Matching
////////////////

describe("Chord.matches()", () => {
  it("matches modifiers exactly", () => {
    const chord = Chord.parse("Mod+Shift+K", { isApple: false })
    expect(chord.matches(keydown("K", { ctrlKey: true, shiftKey: true }))).toBe(true)
    expect(chord.matches(keydown("k", { ctrlKey: true }))).toBe(false)
    expect(chord.matches(keydown("K", { ctrlKey: true, shiftKey: true, altKey: true }))).toBe(false)
    expect(chord.matches(keydown("K", { metaKey: true, shiftKey: true }))).toBe(false)
  })

  it("matches letters by code when Alt changes the key (macOS Option)", () => {
    const chord = Chord.parse("Alt+K", { isApple: true })
    expect(chord.matches(keydown("˚", { altKey: true, code: "KeyK" }))).toBe(true)
  })

  it("ignores Shift for symbol keys that need it", () => {
    const chord = Chord.parse("?")
    expect(chord.matches(keydown("?", { shiftKey: true }))).toBe(true)
    expect(Chord.parse("a").matches(keydown("A", { shiftKey: true }))).toBe(false)
  })

  it("matches named keys", () => {
    expect(Chord.parse("Escape").matches(keydown("Escape"))).toBe(true)
    expect(Chord.parse("ArrowDown").matches(keydown("ArrowUp"))).toBe(false)
  })
})

describe("Chord.hasCommandModifier", () => {
  it("reports whether a chord has a command modifier", () => {
    expect(Chord.parse("Mod+K").hasCommandModifier).toBe(true)
    expect(Chord.parse("Shift+K").hasCommandModifier).toBe(false)
  })
})
