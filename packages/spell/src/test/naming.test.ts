import { describe, test, expect } from "vite-plus/test"

import { describeTypecheckError, typecheck } from "$/spell/node/typecheck"
import { P } from "$/parser"
import { compiledFixture } from "$/spell/test"

/**
 * Each output language names things by its own map (`P.Naming`, epic `drawable-thing` P11):
 * a writer that writes TYPES in snake_case leaves no type's PascalCase name anywhere in its code --
 * not as code (`class Card`, TypeScript's `card: Card`, `List<Card>`),
 * nor as text the runtime reads (`isOfType(x, 'Card')`, `instanceType: "Card"`).
 */
describe("a writer's naming map", () => {
  /** Solitaire, compiled by `writer` (javascript's or TypeScript's) with its types in `typeCase`. */
  function typedIn(typeCase: P.NameCase, writer: P.JSWriter): string {
    writer.naming = new P.Naming({ ...P.Naming.JAVASCRIPT, type: typeCase })
    return compiledFixture("Solitaire", writer)
  }

  test.each([
    ["javascript", () => new P.JSWriter()],
    ["TypeScript", () => new P.TSWriter()]
  ])("%s, types in snake_case:  no type's PascalCase name is left in the code", (_language, makeWriter) => {
    // comments and text say what they like (a heading, a class attribute):  only code counts,
    // and the text the runtime reads as a type's name, `type: "Card"`
    const code = typedIn("snake_case", makeWriter())
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

  // so every place TypeScript names a type agrees:  annotations, `List<Card>`, interfaces, the text.
  // NOT snake_case:  there `const card = new card()` takes the class's name (epic `drawable-thing`, P11's Done list)
  test("TypeScript, types in SCREAMING_SNAKE_CASE:  still checks clean with tsc, as Solitaire does", () => {
    const { errors } = typecheck({ "Solitaire.tsx": typedIn("SCREAMING_SNAKE_CASE", new P.TSWriter()) })
    expect(errors["Solitaire.tsx"]!.map(describeTypecheckError)).toEqual([])
  }, 60_000)

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
