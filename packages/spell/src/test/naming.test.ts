import { describe, test, expect } from "vite-plus/test"

import { P } from "$/parser"
import { SP } from "$/spell"
import { loadFixtureProject, parseSpellProject } from "$/spell/test"

/**
 * Each output language names things by its own map (`P.Naming`, epic `drawable-thing` P11):
 * a writer that writes TYPES in snake_case leaves no type's PascalCase name anywhere in its code --
 * not as code (`class Card`), nor as text the runtime reads (`isOfType(x, 'Card')`, `instanceType: "Card"`).
 */
describe("a writer's naming map", () => {
  /** Solitaire, compiled by a javascript writer whose types are `snake_case`. */
  function snakeTyped(): string {
    const { scope, files } = parseSpellProject(loadFixtureProject("Solitaire"))
    const writer = new P.JSWriter()
    writer.naming = new P.Naming({ ...P.Naming.JAVASCRIPT, type: "snake_case" })
    const parts = files.map(({ match, compiled }) => (match?.AST instanceof P.ASTStatementGroup ? match.AST : compiled))
    const marked = SP.SpellProject.combineCompiled(parts, writer, SP.SpellProject.importHeaderFor(scope), scope)
    return SP.SpellDeclarations.split(marked, scope).code
  }

  test("types in snake_case:  no type's PascalCase name is left in the code", () => {
    // comments and text say what they like (a heading, a class attribute):  only code counts,
    // and the text the runtime reads as a type's name, `type: "Card"`
    const code = snakeTyped()
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\/\/.*$/gm, "")
      .replace(/(?<!\b(?:type|instanceType):\s*)"[^"\n]*"/g, '""')
      .replace(/`[^`]*`/g, "``")
    const types = ["Card", "Deck", "Pile", "Game", "StockPile", "DiscardPile", "Foundation", "Tableau"]
    const left = types.flatMap((type) => {
      const lines = code.split("\n").filter((line) => new RegExp(`\\b${type}\\b`).test(line))
      return lines.map((line) => `${type}:  ${line.trim()}`)
    })
    expect(left).toEqual([])
  })

  test("javascript's own map writes what spell always wrote", () => {
    const naming = new P.Naming(P.Naming.JAVASCRIPT)
    expect(naming.nameOf("BankAccount", "type")).toBe("BankAccount")
    expect(naming.nameOf("turn_face_up", "method")).toBe("turnFaceUp")
    expect(naming.nameOf("start_pile", "variable")).toBe("startPile")
    expect(naming.nameOf("is_set_up", "property")).toBe("isSetUp")
    expect(naming.nameOf("Thing", "type")).toBe("Thing")
  })

  test("Python's, one case for all", () => {
    const naming = new P.Naming({ all: "snake_case" })
    expect(naming.nameOf("BankAccount", "type")).toBe("bank_account")
    expect(naming.nameOf("turn_face_up", "method")).toBe("turn_face_up")
    expect(naming.nameOf("DrawableList", "type")).toBe("DrawableList")
  })
})
