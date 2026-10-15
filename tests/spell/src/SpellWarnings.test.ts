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
    const text = [
      "a card is a thing",
      "a card has a color as text",
      'a card "is the (color) joker" if its color is color'
    ]
    expect(describeWarnings(parse(text.join("\n"), "warnings-quoted"))).toEqual([
      '3:7 Say what "color" is, e.g. "(color as text)"'
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

  describe("a member read its type never declares (epic `output-targets`, Q45)", () => {
    const PILE = ["a card is a thing", "a pile is a list of cards", "the pile is a new pile"]

    test("`the name of the pile`, `its name`:  under the member's word", () => {
      const text = [...PILE, "print the name of the pile", "the state of a pile is:", "\treturn its name"]
      expect(describeWarnings(parse(text.join("\n"), "warnings-undeclared"))).toEqual([
        '4:10 A pile never says it has a name:  declare it, e.g. "a pile has a name as text"',
        '6:12 A pile never says it has a name:  declare it, e.g. "a pile has a name as text"'
      ])
    })

    test("its example names a type its name does", () => {
      const text = [...PILE, "print the card of the pile"]
      expect(describeWarnings(parse(text.join("\n"), "warnings-undeclared-type"))).toEqual([
        '4:10 A pile never says it has a card:  declare it, e.g. "a pile has a card as a card"'
      ])
    })

    test("none once a later line declares it:  checked when the warnings are gathered", () => {
      const declaredLater = [...PILE, "print the name of the pile", "a pile has a name as text"]
      const setLater = [...PILE, "print the name of the pile", 'set the name of the pile to "stock"']
      expect(describeWarnings(parse(declaredLater.join("\n"), "warnings-declared-later"))).toEqual([])
      expect(describeWarnings(parse(setLater.join("\n"), "warnings-set-later"))).toEqual([])
    })

    test("none where spell can't be sure:  a built-in member, a method, a type it doesn't know", () => {
      const text = [
        ...PILE,
        "to shuffle (a pile): print 1",
        "print the length of the pile",
        "print the shuffle of the pile",
        "print the name of the stranger",
        "print the length of 'text'"
      ]
      expect(describeWarnings(parse(text.join("\n"), "warnings-undeclared-none"))).toEqual([])
    })
  })
})
