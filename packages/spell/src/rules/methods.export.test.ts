import { describe, test, expect } from "vite-plus/test"
import { spellParser } from "$/spell"

/**
 * `scope.rules` exists so a scope can hand on the rules it created while parsing -- e.g. a file which
 * defines `to frobnicate (thing)` exporting that method's call-site rule to a file which imports it.
 * - Each entry is a `class` + `definition` PAIR, which is exactly what re-registering needs.
 */
describe("scope records the rules it creates, for export", () => {
  /** Compile `source` as a block in a fresh scope, so `BlockLine.parse()` runs `mutateScope()`. */
  function compileInScope(name: string, source: string) {
    const scope = spellParser.getScope(name)
    const compiled = scope.compile(source, "block")
    return { scope, compiled }
  }

  test("a method definition records its generated call-site rule as a class + definition pair", () => {
    const { scope } = compileInScope("exporter", "to frobnicate (thing):\n\tprint the thing")
    const entry = scope.rules?.get("frobnicate_$thing")
    expect(entry).toBeDefined()
    expect(typeof entry!.rule).toBe("function")
    // the alias is what makes it reachable as a statement -- it travels ON THE CLASS, as `@proto static`
    expect(entry!.rule.prototype.alias).toEqual(["statement", "expression"])
    // ...so the definition holds only `syntax`, like every other spell rule's
    expect(Object.keys(entry!.definition)).toEqual(["syntax"])
  })

  test("re-registering that pair on another scope makes the method callable there", () => {
    const { scope } = compileInScope("exporter2", "to frobnicate (thing):\n\tprint the thing")
    const entry = scope.rules!.get("frobnicate_$thing")!

    const importer = spellParser.getScope("importer")
    expect(importer.parser!.rules.frobnicate_$thing).toBeUndefined()
    importer.addRule(entry.rule, entry.definition)
    expect(importer.compile("frobnicate 1", "statement")).toBe("frobnicate_$thing(1)")
  })
})
