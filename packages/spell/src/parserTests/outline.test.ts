import { describe, test, expect } from "vite-plus/test"

import { parseSpellProject } from "$/spell/test"

/**
 * The OUTLINE style (plan doc `outline-spell`):  a type's heading, `a card is a thing where:`, then a bulleted
 * body all about cards -- `it` / `its` meaning a card.
 * - Each outline must compile to EXACTLY what today's sentence style does for the same lines (plan doc Q1:
 *   both styles, same meaning).
 * - The rules are `TypeDeclaration` (`classes.ts`), `subject_it` / `subject_its` (`types.ts`), and each member
 *   rule's `{type:subject_it}` syntax.
 */
describe("outline style", () => {
  test("a type's bulleted body compiles as its sentences do", () => {
    const sentences = [
      "a pile is a list of cards",
      "a card is a thing",
      "a card has a name as text",
      "a card has a direction as either up or down",
      "a card has a rank as a number",
      "a card has a suit as one of clubs, diamonds, hearts or spades",
      'a card "is face up" if its direction is up',
      'a card "is a (suit)" for its suits',
      "the color of a card is red if its suit is either diamonds or hearts otherwise it is black",
      'the short name of a card is: its rank + " of " + its suit',
      "a card belongs to one pile"
    ]
    const outline = [
      "a pile is a list of cards",
      "a card is a thing where:",
      "\t- it has a name as text",
      '\t- its "direction" is either up or down',
      '\t- its "rank" is a number',
      '\t- its "suit" is one of clubs, diamonds, hearts or spades',
      '\t- it "is face up" if its direction is up',
      '\t- it "is a (suit)" for its suits',
      '\t- its "color" is red if its suit is either diamonds or hearts otherwise it is black',
      '\t- its "short name" is: its rank + " of " + its suit',
      "\t- it belongs to a pile"
    ]
    const expected = compile(sentences)
    expect(compile(outline)).toBe(expected)
    // and the members went INTO the class
    expect(expected).toMatch(/export class Card extends Thing \{[^]*get color\(\)/)
  })

  test("a list type's body, a quoted type name, `with:` and a bare `:`", () => {
    const sentences = ["a card is a thing", "a deck is a list of cards", "a deck has with jokers as yes or no"]
    for (const outline of [
      ['a "card" is a thing', 'a "deck" is a list of cards with:', '\t- its "with jokers" is yes or no'],
      ["a card is a thing:", "a deck is a list of cards:", "\t- it has with jokers as yes or no"]
    ]) {
      expect(compile(outline)).toBe(compile(sentences))
    }
  })

  test("`it` inside a getter's body is the instance, not the type", () => {
    const outline = ["a card is a thing where:", "\t- it has a rank as a number", '\t- its "double" is: its rank * 2']
    expect(compile(outline)).toContain("return (this.rank * 2)")
  })

  test("`it` / `its` as a subject only work in a type's body", () => {
    const { files } = parseSpellProject([
      { path: "/test.spell", contents: "a card is a thing\nit has a rank as a number" }
    ])
    expect(files[0]!.errors).not.toEqual([])
  })

  test("a bullet is never part of the statement:  `- x` and `x` are the same line", () => {
    expect(compile(["- a card is a thing", "- a card has a rank as a number"])).toBe(
      compile(["a card is a thing", "a card has a rank as a number"])
    )
  })
})

/**
 * Compiled `lines`, as one file of its own project -- without its `SPELL: DECLARES` comments, which say where
 * each declaration is.
 * - Throws on a parse error, naming it.
 */
function compile(lines: string[]): string {
  const { files } = parseSpellProject([{ path: "/test.spell", contents: lines.join("\n") }])
  const [file] = files
  if (file!.errors.length) throw new Error(`parse errors:\n${JSON.stringify(file!.errors, null, 2)}`)
  return file!.compiled
    .replace(/\/\*! SPELL: DECLARES[^]*?\*\//g, "")
    .split("\n")
    .filter((line) => line.trim())
    .join("\n")
}
