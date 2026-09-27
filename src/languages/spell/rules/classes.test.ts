import { describe, test, expect } from "vitest"
import { unitTestModuleRules } from "~/test"
import { spellParser } from "~/languages/spell"
import { spellCore } from "~/spellCore"

describe("testing spell module classes", () => {
  unitTestModuleRules(spellParser, "classes", spellCore.resetRuntime)

  describe("declarations", () => {
    test("a type's `declaredBy` is its `is a` line", () => {
      const scope = spellParser.getScope("type-declaration")
      scope.parse("a card is a thing", "block")
      const card = scope.types.get("Card")
      expect(card?.stub).toBeFalsy()
      expect(card?.declaredBy?.rule.name).toBe("create_type")
    })
    test("a type mentioned before its own line is a stub the real line then claims, keeping its state", () => {
      const scope = spellParser.getScope("stub-declaration")
      scope.parse("a card has a suit as one of clubs, diamonds", "block")
      const stub = scope.types.get("Card")
      expect(stub?.stub).toBe(true)
      expect(stub?.declaredBy?.rule.name).toBe("define_property_has")
      expect(stub?.classVariables.get("Suits")).toBeDefined()

      scope.parse("a card is a thing", "block")
      const card = scope.types.get("Card")
      expect(card).toBe(stub)
      expect(card?.stub).toBe(false)
      expect(card?.declaredBy?.rule.name).toBe("create_type")
      expect(card?.classVariables.get("Suits")?.declaredBy?.rule.name).toBe("define_property_has")
      expect(scope.constants.get("clubs")?.declaredBy?.rule.name).toBe("define_property_has")
    })
    test("a generated rule's `ScopeRule` has its `declaredBy` and built `instances`", () => {
      const scope = spellParser.getScope("rule-declaration")
      scope.parse("a card is a thing\na card has a suit as one of clubs, diamonds", "block")
      const scopeRule = scope.rules.get().find((it) => it.declaredBy?.rule.name === "define_property_has")
      expect(scopeRule?.name).toBe("Card_Suits")
      const use = scope.parse("card suits", "expression")
      expect(scopeRule?.instances).toContain(use?.rule)
    })
  })
})
