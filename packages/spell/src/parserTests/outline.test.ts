import { describe, test, expect, vi } from "vite-plus/test"

import { spellCore, Thing, List, App } from "$/core"
import { P } from "$/parser"
import { SP } from "$/spell"
import { loadFixtureProject, parseSpellProject } from "$/spell/test"

/**
 * The OUTLINE style (plan doc `outline-spell`):  a type's heading, `a card is a thing where:`, then a bulleted
 * body all about cards -- `it` / `its` meaning a card.
 * - Each outline must compile to EXACTLY what today's sentence style does for the same lines (plan doc Q1:
 *   both styles, same meaning).
 * - The rules are `TypeDeclaration` (`rules/classes/TypeDeclaration.ts`), `subject_it` / `subject_its` (`types/`),
 *   and each member rule's `{type:subject_it}` syntax.
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
    expect(files[0]!.errors).toEqual([
      `2:0 "it" and "its" mean a type only in its outline, indented under e.g. "a card is a thing where:"`
    ])
  })

  test("a property's quotes are optional:  `its rank is ...` (plan doc Q4)", () => {
    const quoted = [
      "a card is a thing where:",
      '\t- its "rank" is a number',
      '\t- its "name" is text',
      '\t- its "double" is: its rank * 2',
      '\t- its "color" is red if its rank is 1 otherwise it is black'
    ]
    const bare = [
      "a card is a thing where:",
      "\t- its rank is a number",
      "\t- its name is text",
      "\t- its double is: its rank * 2",
      "\t- its color is red if its rank is 1 otherwise it is black"
    ]
    expect(compile(bare)).toBe(compile(quoted))
    expect(compile(quoted)).toContain("this.declareProp('name', { type: 'text' })")
  })

  test("without its article, only a TYPE makes a declaration:  `its x is total` is a getter (issue I2)", () => {
    expect(compile(["total is 5", "a card is a thing where:", "\t- its x is total"])).toContain("return total")
  })

  test('`- it "rank" is ...` says to write `its` (plan doc todo T3)', () => {
    const { files } = parseSpellProject([
      { path: "/test.spell", contents: 'a card is a thing where:\n\t- it "rank" is a number' }
    ])
    expect(files[0]!.errors).toEqual([`2:3 A property starts "its":  write its "rank" is ...`])
  })

  test("quoted property names in the sentence style (plan doc J3, option C)", () => {
    const sentences = [
      "a card is a thing",
      "a card has a suit as one of clubs, diamonds, hearts or spades",
      "cards have a direction as either up or down",
      'the short name of a card is: "x" + its suit',
      "the color of a card is red if its suit is either diamonds or hearts otherwise it is black"
    ]
    const quoted = [
      "a card is a thing",
      'a card has a "suit" as one of clubs, diamonds, hearts or spades',
      'cards have a "direction" as either up or down',
      'the "short name" of a card is: "x" + its suit',
      'the "color" of a card is red if its suit is either diamonds or hearts otherwise it is black'
    ]
    expect(compile(quoted)).toBe(compile(sentences))
  })

  test("a quoted type can be named above its line (issue I1)", () => {
    const quoted = compile(["the card is a new card", 'a "card" is a thing'])
    expect(quoted).toBe(compile(["the card is a new card", "a card is a thing"]))
  })

  test("no `where:` / `with:` / `:`, no body:  the indented lines under `a card is a thing` aren't its", () => {
    expect(errorsOf(["a card is a thing", "\t- its rank is a number"])).toEqual([
      `2:3 Don't understand "its rank is a number"`
    ])
  })

  describe('value kinds (P2):  `"suits" as one of ...` in a deck\'s body', () => {
    /** A card's suit is one of the deck's suits, read when set:  the deck's class may be defined after the card's. */
    const LAZY_SUITS = /static \{ this\.declareProp\('suit', \{ oneOf: \(\) => \{\s+return Deck\.Suits\s+\} \}\) \}/
    const DECK = [
      "a deck is a list of cards with:",
      '\t- "suits" as one of clubs, diamonds, hearts or spades',
      '\t- the "color" of a suit is:',
      "\t\tred if it is diamonds or hearts",
      "\t\tblack otherwise",
      '\t- "ranks" as one of ace, 2 ... 10, jack, queen or king',
      "a card is a thing where:",
      '\t- its "suit" is a suit',
      '\t- its "color" is the color of its suit',
      '\t- its "rank" is a rank'
    ]

    test("compiles:  the list on the deck, the kind's class, its property as a static method", () => {
      const js = compile(DECK)
      expect(js).toContain("Deck.Suits = ['clubs', 'diamonds', 'hearts', 'spades']")
      expect(js).toContain("Deck.Ranks = ['ace', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'jack', 'queen', 'king']")
      expect(js).toMatch(/export class Suit \{\s+static color\(suit\) \{/)
      expect(js).toContain("if (spellCore.includes(['diamonds', 'hearts'], suit)) { return 'red' }")
      expect(js).toMatch(LAZY_SUITS)
      expect(js).toContain("return Suit.color(this.suit)")
    })

    test("`a suit of its deck` says the same as `a suit`;  `up or down` needs no `either`", () => {
      const said = compile([
        ...DECK.slice(0, 7),
        '\t- its "suit" is a suit of its deck',
        '\t- its "direction" is up or down'
      ])
      expect(said).toMatch(LAZY_SUITS)
      expect(said).toContain("static Directions = ['up', 'down']")
    })

    test("`is jack, queen or king`:  one of those values", () => {
      const js = compile([...DECK, '\t- it "is a face card" if its rank is jack, queen or king'])
      expect(js).toContain("spellCore.includes(['jack', 'queen', 'king'], this.rank)")
    })

    test("a property of a type nobody declared is an error, not a class that doesn't exist", () => {
      const { files } = parseSpellProject([{ path: "/test.spell", contents: 'a widget "is shiny" if 1 is 1' }])
      expect(files[0]!.errors).toEqual([`1:0 There's no type "widget":  declare it, e.g. "a widget is a thing"`])
    })

    test("the card may come first, above the deck whose kinds it uses (issue I3)", () => {
      const cardFirst = [...DECK.slice(6), ...DECK.slice(0, 6)]
      const js = compile(cardFirst)
      expect(js).toMatch(LAZY_SUITS)
      expect(js).toContain("return Suit.color(this.suit)")
      const run = runSpell([...cardFirst, "the queen is a new card with suit = hearts, rank = queen"])
      expect(run("queen")).toMatchObject({ queen: { color: "red" } })
    })

    test("runs:  a card's color comes from its suit", () => {
      const run = runSpell([
        ...DECK,
        "the queen is a new card with suit = hearts, rank = queen",
        "the other is a new card with suit = spades, rank = 2",
        "set queen-color to the color of the queen",
        "set other-color to the color of the other"
      ])
      expect(run("queen_color, other_color")).toEqual({ queen_color: "red", other_color: "black" })
    })
  })

  describe('inferred phrases (P3, J9):  `it "is a (suit)"` with no `for its suits`', () => {
    const DECK = [
      "a deck is a list of cards with:",
      '\t- "suits" as one of clubs, diamonds, hearts or spades',
      '\t- "ranks" as one of ace, 2 ... 10, jack, queen or king'
    ]
    const CARD = [
      "a card is a thing where:",
      '\t- its "suit" is a suit',
      '\t- its "rank" is a rank',
      "\t- its direction is up or down",
      '\t- it "is a (suit)"',
      '\t- it "is the (rank) of (suits)"'
    ]
    const USES = [
      "the queen is a new card with suit = spades, rank = queen",
      "set spade to the queen is a spade",
      "set heart to the queen is a heart",
      "set queen-of-spades to the queen is the queen of spades",
      "set two-of-spades to the queen is the 2 of spades"
    ]
    const EXPECTED = { spade: true, heart: false, queen_of_spades: true, two_of_spades: false }

    test("the deck first:  the values are known", () => {
      const js = compile([...DECK, ...CARD, ...USES])
      expect(js).toContain("is_a_$suit(suit) {")
      expect(js).toContain("let spade = queen.is_a_$suit('spades')")
      expect(runSpell([...DECK, ...CARD, ...USES])("spade, heart, queen_of_spades, two_of_spades")).toEqual(EXPECTED)
    })

    test("the card first:  checked where it's used (issue I3's order)", () => {
      const js = compile([...CARD, ...DECK, ...USES])
      expect(js).toContain("let spade = queen.is_a_$suit('spades')")
      expect(runSpell([...CARD, ...DECK, ...USES])("spade, heart, queen_of_spades, two_of_spades")).toEqual(EXPECTED)
    })

    test('a phrase on a value kind:  `a rank "is a face card" if ...` is the kind\'s static method', () => {
      const lines = [
        ...DECK,
        '\t- a rank "is a face card" if it is jack, queen or king',
        ...CARD,
        "the queen is a new card with suit = spades, rank = queen",
        "set face to the rank of the queen is a face card",
        "set low to ace is a face card"
      ]
      const js = compile(lines)
      expect(js).toMatch(/export class Rank \{\s+static is_a_face_card\(rank\) \{/)
      expect(js).toContain("spellCore.includes(['jack', 'queen', 'king'], rank)")
      expect(js).toContain("let face = Rank.is_a_face_card(queen.rank)")
      expect(runSpell(lines)("face, low")).toEqual({ face: true, low: false })
    })

    test("`for its suits` on a value kind's `suit` finds it by its singular (I5), above or below the deck", () => {
      const card = CARD.map((line) =>
        line
          .replace('"is a (suit)"', '"is a (suit)" for its suits')
          .replace('"is the (rank) of (suits)"', '"is the (rank) of (suits)" for its ranks and its suits')
      )
      expect(compile([...DECK, ...card, ...USES])).toContain("let spade = queen.is_a_$suit('spades')")
      expect(runSpell([...DECK, ...card, ...USES])("spade, heart, queen_of_spades, two_of_spades")).toEqual(EXPECTED)
      expect(runSpell([...card, ...DECK, ...USES])("spade, heart, queen_of_spades, two_of_spades")).toEqual(EXPECTED)
    })

    test("`for its ...` naming no property with a list of values is an error (I5), not a crash where it's used", () => {
      expect(errorsOf([...DECK, ...CARD, '\t- it "is a (color)" for its colors'])).toEqual([
        `10:3 "its colors" isn't a property of a card with a list of values, ` +
          `e.g. its "suit" is one of clubs, diamonds, hearts or spades`
      ])
    })

    test('a word that names no property stays a word:  `it "is face up" if ...` is still a phrase method', () => {
      const js = compile([...DECK, ...CARD, '\t- it "is face up" if its direction is up'])
      expect(js).toContain("get is_face_up() {")
    })

    test('only a word in parens is a blank (J9):  `it "is my suit" if ...` is a plain phrase, `suit` a word', () => {
      const js = compile([...DECK, ...CARD, '\t- it "is my suit" if its suit is spades'])
      expect(js).toContain("get is_my_suit() {")
      expect(js).not.toContain("is_my_$suit")
    })

    test('no blank and no `if` is an error, not an empty method (J9):  `it "is a suit"`', () => {
      expect(errorsOf([...DECK, ...CARD, '\t- it "is a suit"'])).toEqual([
        `10:3 "is a suit" has no blank:  put the word that varies in parens, e.g. "is a (suit)", ` +
          `or say when it's true, "is a suit" if ...`
      ])
    })

    test('a phrase with no body is an error, not an empty method (I6):  `it "can move"`', () => {
      expect(errorsOf([...DECK, ...CARD, '\t- it "can move"', 'a card "can fly"'])).toEqual([
        `10:3 "can move" has no body:  write "can move" always, or "can move" if ...`,
        `11:0 "can fly" has no body:  write "can fly" always, or "can fly" if ...`
      ])
    })

    test("`always` / `never` is the body of a phrase true for every one of the type (I6, option A)", () => {
      const js = compile([...DECK, ...CARD, '\t- it "can move" always', '\t- it "can fly" never'])
      expect(js).toMatch(/get can_move\(\) \{\s+return true\s+\}/)
      expect(js).toMatch(/get can_fly\(\) \{\s+return false\s+\}/)
    })

    test('a blank naming no property with a list of values is an error (J9):  `it "is a (color)"`', () => {
      expect(errorsOf([...DECK, ...CARD, '\t- it "is a (color)"'])).toEqual([
        `10:3 "(color)" names no property of a card with a list of values, ` +
          `e.g. its "suit" is one of clubs, diamonds, hearts or spades`
      ])
    })
  })

  describe("whose phrase (J11, I7):  a phrase after `and` / `or` checks its owner too", () => {
    const TYPES = [
      "a card is a thing where:",
      "\t- its color is red or black",
      '\t- it "is (color)"',
      "\t- its direction is up or down",
      '\t- it "is face up" if its direction is up',
      "a game is a thing where:",
      "\t- its team is red or blue",
      '\t- it "is (team)"',
      "the card is a new card with color = red, direction = up",
      "the game is a new game with team = blue"
    ]

    test("`... and the game is red` is the game's phrase, not the card's (declared first)", () => {
      const lines = [...TYPES, "set both to the card is face up and the game is red"]
      expect(compile(lines)).toContain("let both = (card.is_face_up && game.is_$team('red'))")
      expect(runSpell(lines)("both")).toEqual({ both: false })
    })

    test("`... or the game is red` too", () => {
      const lines = [...TYPES, "set either to the card is black or the game is red"]
      expect(compile(lines)).toContain("let either = (card.is_$color('black') || game.is_$team('red'))")
      expect(runSpell(lines)("either")).toEqual({ either: false })
    })

    test("a card's phrase on the game, after `and`, is an error, not silently false", () => {
      expect(errorsOf([...TYPES, "set both to the card is red and the game is face up"])).toEqual([
        `11:41 Don't understand "is face up"`
      ])
    })
  })

  test('`to "draw its front":` + markup:  a side, as a getter;  front and back give `draw()` by direction (Q14)', () => {
    const lines = [
      "a card is a thing where:",
      "\t- its direction is up or down",
      '\t- to "draw its front":',
      '\t\t<ui-image source="images/front.png" />',
      '\t- to "draw its back": <ui-image source="images/back.png" />'
    ]
    const js = compile(lines)
    expect(js).toMatch(/get front\(\) \{\s+return spellCore\.element\(\{ tag: "ui-image"/)
    expect(js).toContain("draw() {")
    expect(js).toContain("return (this.direction === 'down' ? this.back : this.front)")
  })

  test("`[rank]` fills in, in text and markup:  inside a card, a bare property is its own (P4)", () => {
    const lines = [
      "a card is a thing where:",
      "\t- its rank is a number",
      "\t- its suit is text",
      '\t- to "draw its front":',
      '\t\t<ui-image source="images/[rank]-of-[suit].png" />',
      '\t- its "label" is: "the [rank] of [suit]"',
      '\t- to "draw its back": <span>[rank] of [suit], [[face down]]</span>'
    ]
    const js = compile(lines)
    expect(js).toContain("props: { source: () => `images/${this.rank}-of-${this.suit}.png` }")
    expect(js).toContain("return `the ${this.rank} of ${this.suit}`")
    expect(js).toContain("`${this.rank} of ${this.suit}, [face down]`")
    expect(runSpell([...lines, 'the card is a new card with rank = 2, suit = "spades"'])("card")).toMatchObject({
      card: { label: "the 2 of spades" }
    })
  })

  test("a bullet is never part of the statement:  `- x` and `x` are the same line", () => {
    expect(compile(["- a card is a thing", "- a card has a rank as a number"])).toBe(
      compile(["a card is a thing", "a card has a rank as a number"])
    )
  })

  test("each body line's long form (P6's hover) is the sentence style, and compiles the same", () => {
    const outline = [
      "a pile is a list of cards",
      "a card is a thing where:",
      "\t- it has a name as text",
      '\t- its "rank" is a number',
      "\t- its direction is up or down",
      '\t- its "suit" is one of clubs, diamonds, hearts or spades',
      '\t- it "is face up" if its direction is up',
      '\t- it "is a (suit)"',
      '\t- its "color" is red if its suit is either diamonds or hearts otherwise it is black',
      '\t- its "short name" is: its rank + " of " + its suit',
      "\t- it belongs to a pile"
    ]
    const { files } = parseSpellProject([{ path: "/test.spell", contents: outline.join("\n") }])
    const typeLine = files[0]!.match!.matched[1] as P.Match
    const body = (typeLine.data.statement as P.Match).data.body as P.Match
    const longForms = body.matched
      .map((line) => (line as P.Match).data.statement as P.Match | undefined)
      .map((statement) => statement && (statement.rule as SP.SpellStatement).getLongForm(statement))
    expect(longForms).toEqual([
      "a card has a name as text",
      "a card has a rank as a number",
      "a card has a direction as one of up or down",
      "a card has a suit as one of clubs, diamonds, hearts or spades",
      'a card "is face up" if its direction is up',
      'a card "is a (suit)" for its suits',
      'the "color" of a card is red if its suit is either diamonds or hearts otherwise it is black',
      'the "short name" of a card is: its rank + " of " + its suit',
      "a card belongs to one pile"
    ])
    expect(compile(["a pile is a list of cards", "a card is a thing", ...(longForms as string[])])).toBe(
      compile(outline)
    )
  })

  test("the outline Solitaire's cards pass their own tests, as today's cards do (P5)", () => {
    // its deck, card, dealing and piles -- not the game itself, which starts an app
    const files = loadFixtureProject("OutlineSolitaire").filter(({ path }) => !path.endsWith("Solitaire.spell"))
    const lines: string[] = []
    const console = spellCore.console as unknown as Record<string, (...args: unknown[]) => void>
    for (const method of ["log", "group", "groupCollapsed", "warn", "error", "info"].filter((it) => console[it])) {
      vi.spyOn(console, method).mockImplementation((...args) => void lines.push(args.join(" ")))
    }
    runSpellFiles(files)("")
    vi.restoreAllMocks()
    expect(lines.filter((line) => line.includes("❌"))).toEqual([])
    expect(lines.filter((line) => line.includes("✅")).length).toBe(30)
  })
})

/**
 * `lines` compiled, then RUN on `core`'s source, as `membership.test.ts` does:  a function of the names to return.
 * - Throws on a parse error.
 */
function runSpell(lines: string[]) {
  return runSpellFiles([{ path: "/Test.spell", contents: lines.join("\n") }])
}

/** `files`, a project, compiled then RUN -- see `runSpell()`. */
function runSpellFiles(sources: Array<{ path: string; contents: string }>) {
  const { files } = parseSpellProject(sources)
  const errors = files.flatMap((file) => file.errors)
  if (errors.length) throw new Error(`parse errors:\n${JSON.stringify(errors, null, 2)}`)
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

/** The parse errors of `lines`, as one file of its own project. */
function errorsOf(lines: string[]): string[] {
  const { files } = parseSpellProject([{ path: "/test.spell", contents: lines.join("\n") }])
  return files[0]!.errors
}
