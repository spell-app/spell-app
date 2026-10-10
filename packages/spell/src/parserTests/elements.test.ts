import { describe, test, expect } from "vite-plus/test"

import { parseSpellProject } from "$/spell/test"
import { SP } from "$/spell"

/**
 * A project's drawable types define their elements as its compiled module's last line (epic `drawable-thing`, P3):
 * `spellCore.defineElements(<project>, { Card, Pile })` -- see `SpellProject.elementsFooterFor()`.
 */
describe("drawable types' elements", () => {
  /** `lines` as one file of a test project:  its compiled module. */
  function compiled(lines: string[]): string {
    const { scope, files } = parseSpellProject([{ path: "/Main.spell", contents: lines.join("\n") }])
    return SP.SpellProject.combineCompiled([files[0]!.match!.AST as never], undefined, "", scope)
  }

  test("each drawable type, a sub-type of one too, is defined last", () => {
    const code = compiled([
      "a card is a drawable thing",
      "a joker is a card",
      "a pile is a drawable list of cards",
      "a note is a thing"
    ])
    expect(code.trimEnd().split("\n").at(-1)).toBe('spellCore.defineElements("test-project", { Card, Joker, Pile })')
  })

  test("a project with none ends as before", () => {
    expect(compiled(["a card is a thing"])).not.toContain("defineElements")
  })
})
