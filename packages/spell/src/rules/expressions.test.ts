import { describe, expect, test } from "vite-plus/test"
import { unitTestModuleRules } from "$/spell/test"
import { SP, spellParser } from "$/spell"
import { spellCore } from "$/core"

describe("testing spell module expressions", () => {
  unitTestModuleRules(spellParser, "expressions", spellCore.resetRuntime)

  // describe("integration tests", () => {})
})

/**
 * `Negatable` words:  which of a word's forms are negated is said by its syntax's `negated` group.
 */
describe("Negatable", () => {
  /** `true` / `false` if `input` matches negatable rule `word` negated / not, `undefined` if it doesn't match. */
  function negatedIn(parser: SP.SpellParser, word: string, input: string) {
    const match = parser.getScope().parse(input, word)
    return match ? SP.Negatable.isNegated(match) : undefined
  }

  test.each([
    ["is", "is", false],
    ["is", "is not", true],
    ["is", "isn't", true],
    ["is", "isnt", true],
    ["can", "can", false],
    ["can", "cannot", true],
    ["can", "can't", true],
    ["will", "will", false],
    ["will", "won't", true],
    ["has", "has", false],
    ["has", "doesn't have", true]
  ])("`%s`:  '%s' is negated:  %s", (word, input, negated) => {
    expect(negatedIn(spellParser, word, input)).toBe(negated)
  })

  test("several positive forms, in any order -- e.g. a translation's own word", () => {
    const parser = spellParser.clone({ module: "negatable-test" })
    parser.addRule(SP.Negatable.specialize({ ruleName: "tiene" }), { syntax: "((negated:no tiene)|tiene|tienen)" })
    expect(negatedIn(parser, "tiene", "tiene")).toBe(false)
    expect(negatedIn(parser, "tiene", "tienen")).toBe(false)
    expect(negatedIn(parser, "tiene", "no tiene")).toBe(true)
  })
})
