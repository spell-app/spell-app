import { describe, test, expect } from "vite-plus/test"

import { SP, spellParser } from "$/spell"
import { describeWarnings } from "$/spell/test"

/** `text` parsed as a block, in a fresh scope called `scopeName`. */
function parse(text: string, scopeName: string) {
  return spellParser.getScope(scopeName).parse(text, "block")!
}

describe("SpellWarnings", () => {
  test("`note()` notes a warning once:  the same message about the same match again is ignored", () => {
    const match = parse("set x to 1", "warnings-note")
    SP.SpellWarnings.note(match, "say more")
    SP.SpellWarnings.note(match, "say more")
    SP.SpellWarnings.note(match, "say something else")
    expect(SP.SpellWarnings.in(match).map(({ message }) => message)).toEqual(["say more", "say something else"])
  })

  test("`in()` finds them in nested bodies too, in the order of their text", () => {
    const text = ["a calculator is an app", "to clear (a calculator):", "\tset state to []", "a calculator has a left"]
    expect(describeWarnings(parse(text.join("\n"), "warnings-order"))).toEqual([
      '3:14 Say what "state" holds, e.g. "set state to a new list of text"',
      '4:0 Say what "left" is, e.g. "a calculator has a left as text"'
    ])
  })

  test("`in()` leaves out matches parsed from a string:  their rule notes them again, about its own text", () => {
    const text = ["a card is a thing", 'a card "is the (color) joker" if its color is color']
    expect(describeWarnings(parse(text.join("\n"), "warnings-quoted"))).toEqual([
      '2:7 Say what "color" is, e.g. "(color as text)"'
    ])
  })

  test("a program which says every type has none", () => {
    const text = [
      "a calculator is an app",
      "a calculator has an input as text",
      "to append (digit as text) to (a calculator):",
      "\tset digits to a new list of text",
      "\tadd the digit to digits"
    ]
    expect(describeWarnings(parse(text.join("\n"), "warnings-none"))).toEqual([])
  })
})
