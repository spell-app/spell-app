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
      expect(compiled).toContain("append_$digit_to(digit) {")
      expect(compiled).not.toContain("export function")
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
