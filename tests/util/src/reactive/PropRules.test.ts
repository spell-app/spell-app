import { afterEach, describe, expect, test, vi } from "vite-plus/test"

import {
  brokenRule,
  declareProp,
  declareRules,
  Observable,
  ruleText,
  ruleWarning,
  schemaOf,
  type PropRule
} from "$/util"

/**
 * PROP RULES (epic `property-editor` P9):  what a prop's value must be, beyond its type -- `PropRules.ts`;  and the
 * schema keeping them (`declareProp()`, `declareRules()`).
 */

afterEach(() => {
  vi.restoreAllMocks()
})

const EMPTY: PropRule = { type: "empty" }
const DIGITS: PropRule = { type: "regExp", value: "/^\\d+$/", prompt: "Digits only" }

describe("brokenRule()", () => {
  test("each rule word keeps and breaks", () => {
    expect(brokenRule("", [EMPTY])).toBe(EMPTY)
    expect(brokenRule("x", [EMPTY])).toBeUndefined()
    expect(brokenRule("12a", [DIGITS])).toBe(DIGITS)
    expect(brokenRule("12", [DIGITS])).toBeUndefined()
    expect(brokenRule("ab", [{ type: "minLength", value: "3" }])).toBeDefined()
    expect(brokenRule(["a", "b", "c", "d"], [{ type: "maxLength", value: "3" }])).toBeDefined()
    expect(brokenRule(6, [{ type: "range", value: "1..5" }])).toBeDefined()
    expect(brokenRule("5", [{ type: "range", value: "1..5" }])).toBeUndefined()
    expect(brokenRule(17, [{ type: "minValue", value: "18" }])).toBeDefined()
    expect(brokenRule(121, [{ type: "maxValue", value: "120" }])).toBeDefined()
    expect(brokenRule("me@example.com", [{ type: "email" }])).toBeUndefined()
    expect(brokenRule("me", [{ type: "email" }])).toBeDefined()
    expect(brokenRule("https://spell.example", [{ type: "url" }])).toBeUndefined()
  })

  test("an empty value breaks only `empty`:  the rule that says a value is needed", () => {
    expect(brokenRule("", [{ type: "minLength", value: "3" }, DIGITS])).toBeUndefined()
    expect(brokenRule(undefined, [EMPTY])).toBe(EMPTY)
  })

  test("a pattern that isn't one passes everything:  a typo never breaks a program", () => {
    expect(brokenRule("x", [{ type: "regExp", value: "/[/" }])).toBeUndefined()
  })
})

describe("ruleText() and ruleWarning()", () => {
  test("the rule in spell's words, or its own", () => {
    expect(ruleText(EMPTY)).toBe("must not be empty")
    expect(ruleText({ type: "range", value: "1..5" })).toBe("must be between 1 and 5")
    expect(ruleWarning("title", EMPTY)).toBe("title must not be empty")
    expect(ruleWarning("version", DIGITS)).toBe("version:  Digits only")
  })
})

describe("a class's rules", () => {
  class Card extends Observable {
    get title() {
      return this.getProp<string>("title")
    }
    set title(value: string) {
      this.setProp("title", value)
    }
  }
  // a rule on a line of its own may come first:  the prop's own declaration keeps it
  declareRules(Card, "title", [DIGITS])
  declareProp(Card, "title", { type: "text", rules: [EMPTY] })

  test("kept together, whichever is declared first", () => {
    expect(schemaOf(Card).declared.get("title")!.rules).toEqual([EMPTY, DIGITS])
  })

  test("a value that breaks one is set, with a warning", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    const card = new Card()
    card.title = "seven"
    expect(card.title).toBe("seven")
    expect(warn).toHaveBeenCalledWith("Card.title:  Digits only, got", "seven")
  })
})
