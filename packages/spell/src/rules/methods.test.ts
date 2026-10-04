import { describe, test, expect } from "vite-plus/test"
import { unitTestModuleRules } from "$/spell/test"
import { P } from "$/parser"
import { spellParser } from "$/spell"
import { spellCore } from "$/core"

describe("testing spell module methods", () => {
  unitTestModuleRules(spellParser, "methods", spellCore.resetRuntime)

  describe("declarations", () => {
    test("a method's call-site rule maps back to its definition, and its args to the definition too", () => {
      const scope = spellParser.getScope("method-declaration")
      scope.parse("to notify (message): print the message", "block")
      const scopeRule = scope.rules.get().find((it) => it.declaredBy?.rule.name === "to_do_something")
      expect(scopeRule).toBeDefined()
      const call = scope.parse("notify 1", "statement")
      expect(scopeRule?.instance).toBe(call?.rule)

      // `message` was declared by the definition, inside its method scope
      const definition = scopeRule!.declaredBy!
      const methodScope = definition.nestedScope as P.MethodScope
      expect(methodScope.variables.get("message")?.declaredBy).toBe(definition)
    })
  })
})
