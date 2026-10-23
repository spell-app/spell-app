import { describe, test, expect } from "vite-plus/test"

import { describeTypecheckError, typecheck } from "spell-parser/spell/node/typecheck"
import { P } from "spell-parser/parser"
import { SP } from "spell-parser/spell"
import { parseSpellProject } from "spell-parser/spell/test"
import { loadFixtureProject } from "spell-app/spaces/test"

/**
 * Each output language names things by its own map (`P.Naming`, epic `drawable-thing` P11):
 * a writer that writes TYPES in snake_case leaves no type's PascalCase name anywhere in its code --
 * not as code (`class Card`, TypeScript's `card: Card`, `List<Card>`),
 * nor as text the runtime reads (`isOfType(x, 'Card')`, `instanceType: "Card"`).
 * - Here on a whole game, Solitaire, its card library's files compiled with it:  every type its own, to rename.
 *   The maps themselves:  spell-parser's own `naming.test.ts`.
 */
describe("a writer's naming map", () => {
  /** Solitaire and its cards, compiled by `writer` (javascript's or TypeScript's) with its types in `typeCase`. */
  function typedIn(typeCase: P.NameCase, writer: P.JSWriter): string {
    writer.naming = new P.Naming({ ...P.Naming.JAVASCRIPT, type: typeCase })
    const { scope, files } = parseSpellProject(loadFixtureProject("Solitaire"))
    const parts = files.map(({ match, compiled }) => (match?.AST instanceof P.ASTStatementGroup ? match.AST : compiled))
    const importLines = SP.SpellProject.importHeaderFor(scope, writer)
    return scope.parser!.inPlay(() => SP.SpellProject.combineCompiled(parts, writer, importLines, scope))
  }

  test.each([
    ["javascript", () => new P.JSWriter()],
    ["TypeScript", () => new P.TSWriter()]
  ])("%s, types in snake_case:  no type's PascalCase name is left in the code", (_language, makeWriter) => {
    // only code counts, and the text the runtime reads as a type's name (`type: "Card"`):
    // comments and other text say what they like (a heading, a class attribute)
    const code = typedIn("snake_case", makeWriter())
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\/\/.*$/gm, "")
      .replace(/(?<!\b(?:type|instanceType):\s*)"[^"\n]*"/g, '""')
      .replace(/`[^`]*`/g, "``")
    // not `Solitaire`:  its menu says "Klondike Solitaire", as text
    const types = ["Card", "Joker", "Deck", "Pile", "StockPile", "DiscardPile", "Foundation", "Tableau"]
    const left = types.flatMap((type) => {
      const lines = code.split("\n").filter((line) => new RegExp(`\\b${type}\\b`).test(line))
      return lines.map((line) => `${type}:  ${line.trim()}`)
    })
    expect(left).toEqual([])
  })

  // so every place TypeScript names a type agrees:  annotations, `List<Card>`, interfaces, the text.
  // NOT snake_case:  there `const card = new card()` takes the class's name (epic `drawable-thing`, P11's Done list)
  // `tsc` checks compiled spell against the app's types
  test("TypeScript, types in SCREAMING_SNAKE_CASE:  tsc says what it says of Solitaire's usual names", () => {
    const errorsIn = (typeCase: P.NameCase) => {
      const { errors } = typecheck({ "Solitaire.tsx": typedIn(typeCase, new P.TSWriter()) })
      // by what's wrong, not where:  the two name the same lists, `List<Pile>` and `List<PILE>`
      return errors["Solitaire.tsx"]!.map((error) =>
        describeTypecheckError(error)
          .replace(/^\d+:\d+ /, "")
          .toLowerCase()
      )
    }
    expect(errorsIn("SCREAMING_SNAKE_CASE")).toEqual(errorsIn("PascalCase"))
  }, 120_000)
})
