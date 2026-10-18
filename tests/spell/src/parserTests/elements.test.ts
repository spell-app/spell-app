import { describe, test, expect } from "vite-plus/test"

import { parseSpellProject } from "$/spell/test"
import { SP } from "$/spell"

/**
 * A drawable type defines its element as its class is declared (epic `drawable-thing`, P5):
 * `static elementTag = core.defineElement(this, "<project>")` -- see `TypeDeclaration.elementMember()`.
 */
describe("drawable types' elements", () => {
  /** `lines` as one file of a test project:  its compiled module. */
  function compiled(lines: string[]): string {
    const { scope, files } = parseSpellProject([{ path: "/Main.spell", contents: lines.join("\n") }])
    return SP.SpellProject.combineCompiled([files[0]!.match!.AST as never], undefined, "", scope)
  }

  test("each drawable type, a sub-type of one too, defines its element as it's declared", () => {
    const code = compiled([
      "a card is a drawable thing",
      "a joker is a card",
      "a pile is a drawable list of cards",
      "a note is a thing"
    ])
    const defining = code.split("\n").filter((line) => line.includes("defineElement"))
    expect(defining.map((line) => line.trim())).toEqual([
      'static elementTag = core.defineElement(this, "test-project")',
      'static elementTag = core.defineElement(this, "test-project")',
      'static elementTag = core.defineElement(this, "test-project")'
    ])
    expect(code).toMatch(/class Note extends Thing \{\}/)
  })

  test("a project with none compiles as before", () => {
    expect(compiled(["a card is a thing"])).not.toContain("defineElement")
  })
})
