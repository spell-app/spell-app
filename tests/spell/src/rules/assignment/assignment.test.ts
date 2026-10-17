import { describe, test, expect } from "vite-plus/test"
import { describeWarnings, unitTestModuleRules } from "$/spell/test"
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

  describe("warnings:  asks for the type a list or a property doesn't say (epic `output-targets`, Q24)", () => {
    /** Warnings in `lines`, parsed as a block in a fresh scope. */
    const warningsIn = (lines: string[], scopeName: string) =>
      describeWarnings(spellParser.getScope(scopeName).parse(lines.join("\n"), "block"))

    test("a new variable's list of nothing said:  under the list", () => {
      expect(warningsIn(["set state to []", "set card-names to a new list"], "untyped-lists")).toEqual([
        '1:13 Say what "state" holds, e.g. "set state to a new list of text"',
        '2:18 Say what "card-names" holds, e.g. "set card-names to a new list of text"'
      ])
    })

    test("its example names a type its name does", () => {
      expect(warningsIn(["a pile is a thing", "piles = []"], "untyped-list-named")).toEqual([
        '2:8 Say what "piles" holds, e.g. "set piles to a new list of piles"'
      ])
    })

    test("a property a `set` declares, from a value which doesn't say what it is", () => {
      const lines = ["a pile is a thing", "set stock to a new pile", "set the name of stock to nothing"]
      expect(warningsIn(lines, "untyped-auto-declared")).toEqual([
        '3:4 Say what "name" is:  declare it, e.g. "a pile has a name as text"'
      ])
    })

    test("none where it says, or spell works it out", () => {
      const lines = [
        "a pile is a thing",
        "set piles to a new list of piles",
        "set numbers to [1, 2]",
        "set stock to a new pile",
        'set the name of stock to "stock"',
        "set state to a new list of text",
        "set state to []"
      ]
      expect(warningsIn(lines, "typed-assignments")).toEqual([])
    })
  })
})
