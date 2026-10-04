import { describe, test, expect } from "vitest"
import { unitTestModuleRules } from "$/spell/test"
import { spellParser } from "$/spell"
import { spellCore } from "$/core"

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
    test("every property statement records the property on its type, with what declared it", () => {
      const scope = spellParser.getScope("property-declaration")
      scope.parse(
        [
          "a card is a thing",
          "a card has a rank as a number",
          "cards have a suit as one of clubs, diamonds",
          "the color of a card is red if its suit is clubs",
          "the name of a card is: its suit",
          "the rank of a card is: 1"
        ].join("\n"),
        "block"
      )
      const card = scope.types.get("Card")!
      const declaredBy = (name: string) => card.variables.get(name, "LOCAL_ONLY")?.declaredBy?.rule.name
      expect(card.variables.get("rank", "LOCAL_ONLY")?.datatype).toBe("number")
      // the FIRST declaration wins
      expect(declaredBy("rank")).toBe("define_property_has")
      expect(declaredBy("suit")).toBe("define_property_has")
      expect(declaredBy("color")).toBe("property_value_either")
      expect(declaredBy("name")).toBe("property_value_getter")
    })
    test("a generated rule's `ScopeRule` has its `declaredBy` and built `instances`", () => {
      const scope = spellParser.getScope("rule-declaration")
      scope.parse(
        ["a card is a thing", "a card has a suit as one of clubs, diamonds", 'a card "is a (suit)" for its suits'].join(
          "\n"
        ),
        "block"
      )
      const scopeRule = scope.rules.get().find((it) => it.declaredBy?.rule.name === "quoted_property_formula")
      expect(scopeRule?.name).toBe("is_a_$suit")
      const use = scope.parse("is a club", "expression_suffix")
      expect(scopeRule?.instance).toBe(use?.rule)
    })
    test("an enumeration makes no rule:  `class_member` reads any type's class variables", () => {
      const scope = spellParser.getScope("enumeration-declaration")
      scope.parse("a card is a thing\na card has a suit as one of clubs, diamonds", "block")
      expect(scope.rules.get()).toEqual([])
      expect(scope.parse("card suits", "expression")?.rule.name).toBe("class_member")
    })
  })
})
