import { unitTestModuleRules } from "../../../util"
import { spellParser } from ".."
import { parenthesizeCondition } from "./if"

describe("testing spell module if", () => {
  unitTestModuleRules(spellParser, "if")

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
