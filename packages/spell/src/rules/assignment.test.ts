import { describe, test, expect } from "vite-plus/test"
import { unitTestModuleRules } from "$/spell/test"
import { spellParser } from "$/spell"
import { spellCore } from "$/core"

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

  describe("declarations", () => {
    test("a new variable's `declaredBy` is the assignment", () => {
      const scope = spellParser.getScope("assignment-declaration")
      scope.parse("set foo to 1", "block")
      expect(scope.variables.get("foo")?.declaredBy?.rule.name).toBe("assignment")
    })
    test("a numbered `it`'s `declaredBy` is its `get`", () => {
      const scope = spellParser.getScope("get-declaration")
      scope.variables.add("thing")
      scope.parse("get thing\nget thing", "block")
      const it = scope.variables.get("it")
      expect(it?.output).toBe("it_2")
      expect(it?.declaredBy?.rule.name).toBe("get")
      expect(it?.declaredBy?.line).toBe(1)
    })
  })
})
