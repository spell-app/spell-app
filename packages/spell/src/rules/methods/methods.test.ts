import { describe, test, expect } from "vite-plus/test"
import { describeWarnings, unitTestModuleRules } from "$/spell/test"
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

    test("a typed parameter before its receiver leaves it a method of the receiver's type", () => {
      const scope = spellParser.getScope("typed-before-receiver")
      const lines = ["a calculator is an app", "to append (digit as text) to (a calculator): print its input + digit"]
      const compiled = `${scope.compile(lines.join("\n"), "block")}`
      expect(compiled).toContain("appendDigitToCalculator(digit) {")
      expect(compiled).not.toContain("export function")
    })
  })

  describe("names:  the receiver's type stays where a little word would dangle (epic `output-targets`, Q44)", () => {
    /** Compiled names of the methods `signatures` define on `typeName`, in a scope with a calculator, card and pile. */
    const namesOf = (typeName: string, signatures: string[], scopeName: string) => {
      const scope = spellParser.getScope(scopeName)
      const lines = ["a calculator is an app", "a card is a thing", "a pile is a list of cards"]
      scope.parse([...lines, ...signatures.map((it) => `${it}: print 1`)].join("\n"), "block")
      return scope
        .types!.get(typeName)!
        .methods.get()
        .map((method) => method.name)
    }

    test("a preposition before the receiver keeps its type's name", () => {
      const signatures = [
        "to update the total of (a calculator)",
        "to append (digit as text) to (a calculator)",
        "to set the operator of (a calculator) to (op as text)",
        "to clear everything in a calculator"
      ]
      expect(namesOf("Calculator", signatures, "dangling-names")).toEqual([
        "update_the_total_of_calculator",
        "append_$digit_to_calculator",
        "set_the_operator_of_calculator_to_$op",
        "clear_everything_in_calculator"
      ])
    })

    test("nothing dangles:  the name drops it", () => {
      const signatures = ["to turn (a card) face up", "to move (a card) to (a pile)", "to pick up (a card)"]
      expect(namesOf("Card", signatures, "no-dangling-names")).toEqual(["turn_face_up", "move_to_$pile", "pick_up"])
    })

    test("a call compiles to the same name", () => {
      const scope = spellParser.getScope("dangling-name-call")
      const lines = [
        "a calculator is an app",
        "to update the total of (a calculator): print 1",
        "c is a new calculator"
      ]
      scope.parse(lines.join("\n"), "block")
      expect(`${scope.compile("update the total of c", "statement")}`).toBe("c.updateTheTotalOfCalculator()")
    })
  })

  describe("warnings:  a parameter asks for the type it doesn't say (epic `output-targets`, Q24)", () => {
    /** Warnings in `lines`, parsed as a block in a fresh scope. */
    const warningsIn = (lines: string[], scopeName: string) =>
      describeWarnings(spellParser.getScope(scopeName).parse(lines.join("\n"), "block"))

    test("`(digit)`:  under its name", () => {
      const lines = ["a calculator is an app", "to append (digit) to (a calculator):", "\tprint the digit"]
      expect(warningsIn(lines, "untyped-parameter")).toEqual(['2:11 Say what "digit" is, e.g. "(digit as text)"'])
    })

    test("its example names a type its name does", () => {
      expect(warningsIn(["a card is a thing", "to show (card): print card"], "untyped-parameter-named")).toEqual([
        '2:9 Say what "card" is, e.g. "(card as a card)"'
      ])
    })

    test("none where it says, or spell works it out", () => {
      const lines = [
        "a card is a thing",
        "a calculator is an app",
        "to append (digit as text) to (a calculator): print the digit",
        "to notify (message = 'hi'): print the message",
        "to show a card: print the card",
        "to flip (a card): print the card"
      ]
      expect(warningsIn(lines, "typed-parameters")).toEqual([])
    })
  })
})
