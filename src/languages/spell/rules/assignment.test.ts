import { describe, test, expect } from "vitest"
import { unitTestModuleRules } from "~/test"
import { spellParser } from "~/languages/spell"
import { spellCore } from "~/spellCore"

describe("testing spell module assignment", () => {
  unitTestModuleRules(spellParser, "assignment", spellCore.resetRuntime)

  describe("`get` declares a new `it` each time", () => {
    test("leaves the old `it` as it was -- its `datatype` too", () => {
      const scope = spellParser.getScope("get-new-it")
      const [it] = scope.variables!.add({ name: "it", datatype: "number" })
      scope.variables!.add("thing")
      scope.parse("get thing", "block")
      const newIt = scope.variables!.get("it", "LOCAL_ONLY")
      expect(newIt).not.toBe(it)
      expect(newIt?.output).toBe("it_2")
      expect(it!.datatype).toBe("number")
    })

    test("redefines an alias `it` as plain, real `it`", () => {
      const scope = spellParser.getScope("get-redefines-alias")
      scope.variables!.add({ name: "it", output: "this", isAlias: true })
      scope.variables!.add("thing")
      scope.parse("get thing", "block")
      const newIt = scope.variables!.get("it", "LOCAL_ONLY")
      expect(newIt?.isAlias).toBeFalsy()
      expect(newIt?.output).toBeUndefined()
    })
  })
})
