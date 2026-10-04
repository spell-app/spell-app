import { describe, test, expect } from "vite-plus/test"

import { spellParser } from "$/spell"
import { SpellStatement } from "./Statement"

/**
 * Inline statements change scope ONLY when the line's statement wins -- see `commitStatement()`.
 * - Parsing a statement on its own is what every candidate for a line does, so it must NOT change scope,
 *   or a losing candidate's types / rules / variables leak into the project.
 */
describe("inline statements change scope only when committed", () => {
  const SOURCE = "if yes then a widget is a thing"

  test("parsing the statement alone leaves scope alone", () => {
    const scope = spellParser.getScope("inline-uncommitted")
    const statement = scope.parse(SOURCE, "statement")
    expect(statement?.rule instanceof SpellStatement && statement.rule.getBody(statement)).toBeTruthy()
    expect(scope.types?.get("Widget")).toBeUndefined()
  })

  test("parsing it as a line commits the inline statement's scope changes", () => {
    const scope = spellParser.getScope("inline-committed")
    scope.parse(SOURCE, "block")
    expect(scope.types?.get("Widget")).toBeDefined()
  })
})
