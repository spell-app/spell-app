import { unitTestModuleRules } from "~/test"
import { spellParser } from "~/languages/spell"
import { parenthesizeCondition } from "./if"
import { spellCore } from "~/spell-core"

describe("testing spell module if", () => {
  unitTestModuleRules(spellParser, "if", spellCore.resetRuntime)

  describe("\n    methods defined in rule file", () => {
    describe("parenthesizedCondition()", () => {
      test("adds parenthesis as necessary", () => {
        expect(parenthesizeCondition("a")).toBe("(a)")
      })

      test("doesn't parenthesize when not necessary", () => {
        expect(parenthesizeCondition("(a)")).toBe("(a)")
      })
    })
  })

  describe("integration tests", () => {})
})
