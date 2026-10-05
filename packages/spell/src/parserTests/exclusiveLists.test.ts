import { describe, test, expect } from "vite-plus/test"

import { spellCore, Thing, List, App } from "$/core"
import { P } from "$/parser"
import { SP } from "$/spell"
import { parseSpellProject } from "$/spell/test"

/**
 * Exclusive lists END TO END:  spell compiled, then RUN on `core`'s source.
 * - What `a pile is an exclusive list of cards` does to a running program
 *   (plan doc D7, D8 of precedence-and-types).
 * - The runtime alone is `core`'s `src/classes/List.test.ts`;  the parse alone, `grammar.probes.test.ts` (`X1` ...).
 */
describe("exclusive lists, compiled and run", () => {
  const CARDS = [
    "a card is a thing",
    "cards have a name as text",
    "a deck is a list of cards",
    "a pile is an exclusive list of cards",
    "a tableau is a pile",
    "to move a card to a pile",
    "\tadd the card to the pile"
  ]

  test("adding to a second pile moves the card;  the deck keeps it;  removing leaves no pile", () => {
    const run = runSpell([
      ...CARDS,
      "the deck is a new deck",
      "the stock is a new pile",
      "the tableau is a new tableau",
      "for each number from 1 to 3",
      '\tget a new card with name = ("C" + the number)',
      "\tadd it to the deck",
      "\tmove it to the stock",
      "set the card to the first card of the deck",
      "move the card to the tableau",
      "set first-pile to the pile of the card",
      "set the other to the last card of the deck",
      "remove the other from the stock",
      "set other-pile to the pile of the other"
    ])
    const { deck, stock, tableau, card, first_pile, other_pile } = run(
      "deck, stock, tableau, card, first_pile, other_pile"
    )
    expect(names(deck)).toEqual(["C1", "C2", "C3"])
    expect(names(stock)).toEqual(["C2"])
    expect(names(tableau)).toEqual(["C1"])
    expect(first_pile).toBe(tableau)
    expect((card as { pile: unknown }).pile).toBe(tableau)
    expect(other_pile).toBe(undefined)
  })

  test("scratch results own nothing:  `where`, a copy, a merge -- the piles keep their cards", () => {
    const run = runSpell([
      ...CARDS,
      "the stock is a new pile",
      "the tableau is a new tableau",
      "for each number from 1 to 4",
      '\tget a new card with name = ("C" + the number)',
      "\tadd it to the stock",
      "move the last card of the stock to the tableau",
      'set picked to the cards in the stock where its name is not "C1"',
      "set copied to a copy of list the stock as a pile",
      "set both to a new list",
      "add the stock to both",
      "add the tableau to both",
      "set merged to merge both into a new pile"
    ])
    const { stock, tableau, picked, copied, merged } = run("stock, tableau, picked, copied, merged")
    expect(names(picked)).toEqual(["C2", "C3"])
    expect(names(copied)).toEqual(["C1", "C2", "C3"])
    expect(names(merged)).toEqual(["C1", "C2", "C3", "C4"])
    expect(names(stock)).toEqual(["C1", "C2", "C3"])
    expect(names(tableau)).toEqual(["C4"])
    for (const card of (stock as List).getValues()) expect((card as { pile: unknown }).pile).toBe(stock)
  })
})

/**
 * `lines`, one project file, parsed + compiled as a project is.
 * - Returns a function running the compiled code on `core`'s source,
 *   returning the top-level variables `names` lists, e.g. `"deck, card"`.
 * - Fails on any parse error:  these programs MUST parse.
 */
function runSpell(lines: string[]) {
  const { files } = parseSpellProject([{ path: "/Test.spell", contents: lines.join("\n") }])
  const [file] = files
  expect(file!.errors).toEqual([])
  const parts = files.map(({ match, compiled }) => (match?.AST instanceof P.ASTStatementGroup ? match.AST : compiled))
  const code = SP.SpellProject.combineCompiled(parts)
    .split("\n")
    .filter((line) => !line.startsWith("import "))
    .join("\n")
    .replace(/^export /gm, "")
  return (names: string) => {
    const body = `${code}\nreturn { ${names} }`
    // oxlint-disable-next-line no-implied-eval -- running compiled spell, as a runner does, is the test
    const fn = new Function("spellCore", "Thing", "List", "App", body)
    return spellCore.things.quietly(() => fn(spellCore, Thing, List, App)) as Record<string, unknown>
  }
}

/** Each card's `name` in `list`. */
function names(list: unknown): string[] {
  return (list as List).getValues().map((card) => (card as { name: string }).name)
}
