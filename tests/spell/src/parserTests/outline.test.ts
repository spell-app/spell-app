import { describe, test, expect, vi } from "vite-plus/test"

import {
  core,
  Thing,
  List,
  App,
  on,
  off,
  once,
  trigger,
  positionOf,
  position,
  spellPosition,
  endPosition,
  withSpellPositions
} from "$/core"
import { P } from "$/parser"
import { SP } from "$/spell"
import { loadFixtureProject, parseSpellProject } from "$/spell/test"

/**
 * The OUTLINE style (epic page `outline-spell`):  a type's heading, `a card is a thing where:`, then a bulleted
 * body all about cards -- `it` / `its` meaning a card.
 * - Each outline must compile to EXACTLY what today's sentence style does for the same lines (epic page Q1:
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

  test('`it is saved inline` and `its "dates" is a list of ...` compile as their sentences do', () => {
    const sentences = [
      "a person is a thing",
      "a dated-event is a thing",
      "a dated-event has a label as text",
      "a dated-event is saved inline",
      "a person has dates as a new list of dated-events"
    ]
    const outline = [
      "a person is a thing where:",
      '\t- its "dates" is a list of dated-events',
      "a dated-event is a thing where:",
      "\t- it has a label as text",
      "\t- it is saved inline"
    ]
    const expected = compile(sentences)
    expect(compile(outline)).toBe(expected)
    expect(expected).toContain("static savedInline = true")
    expect(expected).toContain('itemType: "DatedEvent"')
  })

  test("`it` inside a getter's body is the instance, not the type", () => {
    const outline = ["a card is a thing where:", "\t- it has a rank as a number", '\t- its "double" is: its rank * 2']
    expect(compile(outline)).toContain("return this.rank * 2")
  })

  test("`it` / `its` as a subject only work in a type's body", () => {
    const { files } = parseSpellProject([
      { path: "/test.spell", contents: "a card is a thing\nit has a rank as a number" }
    ])
    expect(files[0]!.errors).toEqual([
      `2:0 "it" and "its" mean a type only in its outline, indented under e.g. "a card is a thing where:"`
    ])
  })

  test("a property's quotes are optional:  `its rank is ...` (epic page Q4)", () => {
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
    expect(compile(quoted)).toContain('this.declareProp("name", { type: "text" })')
  })

  test("without its article, only a TYPE makes a declaration:  `its x is total` is a getter (issue I2)", () => {
    expect(compile(["total is 5", "a card is a thing where:", "\t- its x is total"])).toContain("return total")
  })

  test('`- it "rank" is ...` says to write `its` (epic page todo T3)', () => {
    const { files } = parseSpellProject([
      { path: "/test.spell", contents: 'a card is a thing where:\n\t- it "rank" is a number' }
    ])
    expect(files[0]!.errors).toEqual([`2:3 A property starts "its":  write its "rank" is ...`])
  })

  test("quoted property names in the sentence style (epic page J3, option C)", () => {
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

  describe("a heading without a colon (P10):  the indented lines under it are its body", () => {
    const withColon = ["a card is a thing where:", "\t- its rank is a number", "\t- suit is one of clubs or spades"]

    test("no `where:`, or `where` alone:  the same body", () => {
      const expected = compile(withColon)
      expect(compile(["a card is a thing", ...withColon.slice(1)])).toBe(expected)
      expect(compile(["a card is a thing where", ...withColon.slice(1)])).toBe(expected)
    })

    test("a list type's sub-type:  `a stock-pile is a pile`, then its guard", () => {
      const sentences = [
        "a card is a thing",
        "a pile is a list of cards",
        "a stock-pile is a pile",
        "a stock-pile can give up a card if: the card is its last card"
      ]
      const outline = [...sentences.slice(0, 3), "\t- can give up a card if: the card is its last card"]
      expect(compile(outline)).toBe(compile(sentences))
    })

    test("nothing indented under it:  the type alone, as before", () => {
      expect(compile(["a card is a thing", "a card has a rank as a number"])).toBe(
        compile(["a card is a thing:", "a card has a rank as a number"])
      )
    })
  })

  test("`every pile`:  every pile the program made, sub-types too, in the order made (P16)", () => {
    const run = runSpell(
      [
        "a card is a thing",
        "a pile is a list of cards",
        "a tableau is a pile",
        'set a to a new pile with name = "a"',
        'set b to a new tableau with name = "b"',
        "set piles to every pile",
        "set tableaus to every tableau"
      ],
      { registered: true }
    )
    const { piles, tableaus } = run("piles, tableaus") as {
      piles: { items: { name: string }[] }
      tableaus: { items: unknown[] }
    }
    expect(piles.items.map(({ name }) => name)).toEqual(["a", "b"])
    expect(tableaus.items.length).toBe(1)
  })

  describe("methods before their definitions (P22)", () => {
    test("a call above its definition:  in a type's body, at the top, before a later method", () => {
      const run = runSpell([
        "game is an app where:",
        "\t- its score is a number",
        "\t- to reset:\n\t\tset its score to 0\n\t\tadd a point",
        "\t- to add a point:\n\t\tset its score to its score + 1",
        "reset",
        "play the game",
        "to play a game:\n\tadd a point\n\tadd a point",
        "set score to the score of game"
      ])
      expect(run("score")).toEqual({ score: 3 })
    })

    test("from another file:  one loaded before the method's", () => {
      const run = runSpellFiles([
        { path: "/A.spell", contents: "set x to double 21" },
        { path: "/B.spell", contents: "to double (n as a number):\n\treturn n * 2" }
      ])
      expect(run("x")).toEqual({ x: 42 })
    })
  })

  describe("one-of-a-kind apps (P21):  `solitaire is an app where:`", () => {
    test("the type and its one instance, made after every class, even one declared below", () => {
      const run = runSpell([
        "game is an app where:",
        "\t- its score is a number",
        '\t- its clubs is a new pile with name = "clubs"',
        "\t- to add a point:\n\t\tset its score to its score + 1",
        "a pile is a thing",
        "\t- to play it:\n\t\tadd a point",
        "set the score of game to 0",
        "add a point",
        "play the clubs of game",
        "set score to the score of the game",
        "set clubs to the name of the clubs of game"
      ])
      // bare calls anywhere:  at the top, and in another type's method
      expect(run("score, clubs")).toEqual({ score: 2, clubs: "clubs" })
    })

    test("compiles to the class, then `export const game = new Game()`;  `a game is an app` makes none", () => {
      expect(compile(["game is an app"])).toBe("export class Game extends App {}\nexport const game = new Game()")
      expect(compile(["a game is an app"])).toBe("export class Game extends App {}")
    })

    test("only an app", () => {
      expect(() => runSpell(["game is a thing"])).toThrow(/parse errors/)
    })
  })

  describe("body methods (P20, I15):  a method in a type's body that names no type is the type's", () => {
    test("`- to debug it:` is `to debug a game`;  `- to cheat at it:` keeps the type's name after `at`", () => {
      const sentences = ["a game is an app", "to debug a game:\n\tprint 1", "to cheat at a game:\n\tprint 2"]
      const outline = ["a game is an app where:", "\t- to debug it:\n\t\tprint 1", "\t- to cheat at it:\n\t\tprint 2"]
      expect(compile(outline)).toBe(compile(sentences))
    })

    test("with no `it`:  bare inside its own methods, `of` (or after one word) from outside", () => {
      const run = runSpell([
        "a game is an app where:",
        "\t- its score is a number",
        "\t- to add a point:\n\t\tset its score to its score + 1",
        "\t- to reset:\n\t\tset its score to 0\n\t\tadd a point\n\t\tfor each number from 1 to 2\n\t\t\tadd a point",
        "a stock pile is a list",
        "\t- to flip:\n\t\tprint 1",
        "set game to a new game",
        "reset the game",
        "add a point of game",
        "set score to the score of game"
      ])
      expect(run("score")).toEqual({ score: 4 })
      expect(compile(["a stock pile is a list", "\t- to flip:\n\t\tprint 1"])).toContain("class StockPile extends List {\n  flip()")
    })

    test("one word, `- to reset:`, is bare inside too", () => {
      const lines = ["a game is an app where:", "\t- to reset:\n\t\tprint 1", "\t- to restart:\n\t\treset"]
      expect(compile(lines)).toContain("restart() {\n    this.reset()")
    })

    test("its words alone aren't a call outside the type's own methods", () => {
      const lines = ["a game is an app where:", "\t- to add a point:\n\t\tprint 1", "a card is a thing"]
      expect(() => runSpell([...lines, "add a point"])).toThrow(/parse errors/)
      expect(() => runSpell([...lines, "to play a card:\n\tadd a point"])).toThrow(/parse errors/)
    })
  })

  describe("starting values (P19):  `- its clubs is a new foundation with ...`", () => {
    const types = ["a pile is a thing", "a foundation is a pile", "\t- its symbol is text"]

    test("the same as the sentence `has ... as a new ...`", () => {
      expect(
        compile(["a game is an app where:", '\t- its clubs is a new foundation with name = "clubs"', ...types])
      ).toBe(compile(["a game is an app", 'a game has a clubs as a new foundation with name = "clubs"', ...types]))
    })

    test("each thing gets its own, of the new thing's type;  `name T1` needs no `=`", () => {
      const run = runSpell([
        "a game is an app where:",
        '\t- its clubs is a new foundation with name = "clubs", symbol = "♣️"',
        "\t- its T1 is a new pile with name T1",
        ...types,
        "set a to a new game",
        "set b to a new game",
        "set clubs-a to the clubs of a",
        "set clubs-b to the clubs of b",
        "set t1 to the T1 of b"
      ])
      const { clubs_a, clubs_b, t1 } = run("clubs_a, clubs_b, t1") as Record<string, Record<string, unknown>>
      expect(clubs_a).not.toBe(clubs_b)
      expect(clubs_a).toMatchObject({ name: "clubs", symbol: "♣️" })
      expect(t1).toMatchObject({ name: "T1" })
    })

    test("a thing's is made with it:  `every pile` finds them before anything reads them;  a list's isn't", () => {
      const lines = [
        "a game is an app where:",
        '\t- its clubs is a new pile with name = "clubs"',
        '\t- its hearts is a new pile with name = "hearts"',
        "\t- its scores is a new list of numbers",
        "a pile is a thing"
      ]
      const run = runSpell([...lines, "set game to a new game", "set piles to every pile"], { registered: true })
      const { piles } = run("piles") as { piles: { items: { name: string }[] } }
      expect(piles.items.map(({ name }) => name)).toEqual(["clubs", "hearts"])
      expect(compile(lines)).toContain('init: () => new Pile({ name: "clubs" }), early: true')
      expect(compile(lines)).not.toMatch(/new List\(.*early/)
    })
  })

  describe("re-opening a type (P11):  `a game:` adds to it", () => {
    test("in the same file:  its bullets go into the one class", () => {
      const sentences = [
        "a game is an app",
        "a card is a thing",
        "a game has a score as a number",
        "the state of a game is: its score * 2"
      ]
      const outline = [
        "a game is an app",
        "a card is a thing",
        "a game:",
        "\t- score is a number",
        "\t- state is: its score * 2"
      ]
      expect(compile(outline)).toBe(compile(sentences))
      expect(compile(["a game is an app", "a game where:", "\t- score is a number"])).toBe(
        compile(sentences.slice(0, 3).filter((line) => !line.startsWith("a card")))
      )
    })

    test("in a later file of the project, as a sentence there would", () => {
      const reopened = parseSpellProject([
        { path: "/Game.spell", contents: "a game is an app" },
        { path: "/Score.spell", contents: "a game:\n\t- score is a number" }
      ])
      const sentence = parseSpellProject([
        { path: "/Game.spell", contents: "a game is an app" },
        { path: "/Score.spell", contents: "a game has a score as a number" }
      ])
      expect(reopened.files.flatMap(({ errors }) => errors)).toEqual([])
      expect(withoutComments(reopened.files[1]!.compiled)).toBe(withoutComments(sentence.files[1]!.compiled))
    })

    test("a type nobody declares is an error saying how:  `a gmae:`", () => {
      expect(errorsOf(["a game is an app", "a gmae:", "\t- score is a number"])).toEqual([
        `2:0 There's no type "gmae":  declare it, e.g. "a gmae is a thing"`,
        // its body isn't read:  nothing to add it to
        `3:3 Don't understand "score is a number"`
      ])
    })

    test("a type declared twice is an error on its second line, saying to re-open it (I13)", () => {
      expect(errorsOf(["a game is an app", "a card is a thing", "a game is an app"])).toEqual([
        `3:0 There's a game already, on line 1:  to add to it, write "a game:"`
      ])
    })

    test("declared twice in two files:  the error names the first one's", () => {
      const { files } = parseSpellProject([
        { path: "/Game.spell", contents: "a game is an app" },
        { path: "/More.spell", contents: "a game is an app" }
      ])
      expect(files[1]!.errors).toEqual([
        `1:0 There's a game already, on line 1 of /Game.spell:  to add to it, write "a game:"`
      ])
    })

    test("a lone `a game` is not an opener:  the colon stays", () => {
      expect(errorsOf(["a game is an app", "a game"])).toEqual([`2:0 Don't understand "a game"`])
    })
  })

  describe('value kinds (P2):  `"suits" as one of ...` in a deck\'s body', () => {
    /** A card's suit is one of the deck's suits, read when set:  the deck's class may be defined after the card's. */
    const LAZY_SUITS = /static \{ this\.declareProp\("suit", \{ oneOf: \(\) => Deck\.Suits \}\) \}/
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
      expect(js).toContain('static Suits = ["clubs", "diamonds", "hearts", "spades"]')
      expect(js).toContain('static Ranks = ["ace", 2, 3, 4, 5, 6, 7, 8, 9, 10, "jack", "queen", "king"]')
      expect(js).toMatch(/export class Suit \{\s+static color\(suit\) \{/)
      expect(js).toContain('if (core.includes(["diamonds", "hearts"], suit)) return "red"')
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
      expect(said).toContain('static Directions = ["up", "down"]')
    })

    test("`is jack, queen or king`:  one of those values", () => {
      const js = compile([...DECK, '\t- it "is a face card" if its rank is jack, queen or king'])
      expect(js).toContain('core.includes(["jack", "queen", "king"], this.rank)')
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

  describe("a kind's values and lists (P12):  `- value is the position of its rank`", () => {
    const DECK = [
      "a deck is a list of cards with:",
      '\t- "suits" as one of clubs, diamonds, hearts or spades',
      '\t- "ranks" as one of ace, 2 ... 10, jack, queen or king'
    ]
    const CARD = ["a card is a thing where:", "\t- rank is a rank", "\t- value is the position of its rank"]

    test("a kind's value is found in its kind's own list:  12 for a queen, the deck above or below", () => {
      for (const lines of [
        [...DECK, ...CARD],
        [...CARD, ...DECK]
      ]) {
        expect(compile(lines)).toContain("return spellPosition(positionOf(Deck.Ranks, this.rank))")
        const run = runSpell([...lines, "the queen is a new card with rank = queen"])
        expect(run("queen")).toMatchObject({ queen: { value: 12 } })
      }
    })

    test("`... in deck ranks` keeps working", () => {
      expect(
        compile([
          ...DECK,
          "a card is a thing where:",
          "\t- rank is a rank",
          "\t- value is the position of its rank in deck ranks"
        ])
      ).toContain("positionOf(Deck.Ranks, this.rank)")
    })

    test("anything but a kind's value needs its list:  a warning, and no position", () => {
      const lines = [
        "a card is a thing where:",
        "\t- deck is a deck",
        "\t- place is the position of its deck",
        "a deck is a list of cards"
      ]
      const { files } = parseSpellProject([{ path: "/test.spell", contents: lines.join("\n") }])
      expect(files[0]!.errors).toEqual([])
      expect(SP.SpellWarnings.in(files[0]!.match!).map(({ message }) => message)).toEqual([
        `"the position of its deck":  a deck isn't a kind's value;  say which list, "... in ..."`
      ])
    })

    test("a loop over a kind's list knows its item:  a member the kind doesn't have warns (I14)", () => {
      const lines = [
        ...DECK,
        "to set up a deck:",
        "\tfor each rank in its ranks",
        "\t\tfor each suit in its suits",
        "\t\t\tprint suit"
      ]
      const { files } = parseSpellProject([{ path: "/test.spell", contents: lines.join("\n") }])
      expect(SP.SpellWarnings.in(files[0]!.match!).map(({ message }) => message)).toEqual([
        'A rank never says it has a suits:  declare it, e.g. "a rank has a suits as a suits"'
      ])
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
      expect(js).toContain("isASuit(suit) {")
      expect(js).toContain('const spade = queen.isASuit("spades")')
      expect(runSpell([...DECK, ...CARD, ...USES])("spade, heart, queen_of_spades, two_of_spades")).toEqual(EXPECTED)
    })

    test("the card first:  checked where it's used (issue I3's order)", () => {
      const js = compile([...CARD, ...DECK, ...USES])
      expect(js).toContain('const spade = queen.isASuit("spades")')
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
      expect(js).toMatch(/export class Rank \{\s+static isAFaceCard\(rank\) \{/)
      expect(js).toContain('core.includes(["jack", "queen", "king"], rank)')
      expect(js).toContain("const face = Rank.isAFaceCard(queen.rank)")
      expect(runSpell(lines)("face, low")).toEqual({ face: true, low: false })
    })

    test("`for its suits` on a value kind's `suit` finds it by its singular (I5), above or below the deck", () => {
      const card = CARD.map((line) =>
        line
          .replace('"is a (suit)"', '"is a (suit)" for its suits')
          .replace('"is the (rank) of (suits)"', '"is the (rank) of (suits)" for its ranks and its suits')
      )
      expect(compile([...DECK, ...card, ...USES])).toContain('const spade = queen.isASuit("spades")')
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
      expect(js).toContain("get isFaceUp() {")
    })

    test('only a word in parens is a blank (J9):  `it "is my suit" if ...` is a plain phrase, `suit` a word', () => {
      const js = compile([...DECK, ...CARD, '\t- it "is my suit" if its suit is spades'])
      expect(js).toContain("get isMySuit() {")
      expect(js).not.toContain("isMySuit(suit)")
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
      expect(js).toMatch(/get canMove\(\) \{\s+return true\s+\}/)
      expect(js).toMatch(/get canFly\(\) \{\s+return false\s+\}/)
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
      expect(compile(lines)).toContain('const both = card.isFaceUp && game.isTeam("red")')
      expect(runSpell(lines)("both")).toEqual({ both: false })
    })

    test("`... or the game is red` too", () => {
      const lines = [...TYPES, "set either to the card is black or the game is red"]
      expect(compile(lines)).toContain('const either = card.isColor("black") || game.isTeam("red")')
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
    expect(js).toMatch(/get front\(\) \{\s+return h\("ui-image"/)
    expect(js).toContain("draw() {")
    expect(js).toContain('return this.direction === "down" ? this.back : this.front')
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
    expect(js).toContain('{ "prop:source": () => `images/${this.rank}-of-${this.suit}.png` }')
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
    const longForms = longFormsOf(files[0]!.match!)
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

  describe('the subject left out (P8):  `- has a name as text`, `- "suit" is ...`', () => {
    const withSubject = [
      "a pile is a list of cards",
      "a card is a thing where:",
      "\t- it has a name as text",
      '\t- its "rank" is a number',
      '\t- its "direction" is either up or down',
      '\t- its "suit" is one of clubs, diamonds, hearts or spades',
      '\t- it "is face up" if its direction is up',
      '\t- it "is a (suit)"',
      '\t- it "can move" always',
      '\t- its "color" is red if its suit is either diamonds or hearts otherwise it is black',
      '\t- its "short name" is: its rank + " of " + its suit',
      "\t- it belongs to a pile",
      "\t- it is saved inline"
    ]
    const withoutSubject = withSubject.map((line) => line.replace(/^\t- its? /, "\t- "))

    test("compiles exactly as the same lines with `it` / `its` do", () => {
      expect(withoutSubject[2]).toBe("\t- has a name as text")
      expect(compile(withoutSubject)).toBe(compile(withSubject))
    })

    test("each line's long form puts the subject back", () => {
      const { files } = parseSpellProject([{ path: "/test.spell", contents: withoutSubject.join("\n") }])
      expect(files[0]!.errors).toEqual([])
      expect(longFormsOf(files[0]!.match!)).toEqual([
        "a card has a name as text",
        "a card has a rank as a number",
        "a card has a direction as either up or down",
        "a card has a suit as one of clubs, diamonds, hearts or spades",
        'a card "is face up" if its direction is up',
        'a card "is a (suit)" for its suits',
        'a card "can move" always',
        'the "color" of a card is red if its suit is either diamonds or hearts otherwise it is black',
        'the "short name" of a card is: its rank + " of " + its suit',
        "a card belongs to one pile",
        "a card is saved inline"
      ])
    })

    test("a list type's guards:  `- can take a card if: ...`, with `it` or without", () => {
      const sentences = [
        "a card is a thing",
        "a pile is a list of cards",
        "a pile can take a card if: it is empty",
        "a pile can give up a card if: the card is its last card",
        "a stock is a list of cards",
        "a stock can never let go of a card"
      ]
      const outline = (subject: string) => [
        "a card is a thing",
        "a pile is a list of cards where:",
        `\t- ${subject}can take a card if: it is empty`,
        `\t- ${subject}can give up a card if: the card is its last card`,
        "a stock is a list of cards where:",
        `\t- ${subject}can never let go of a card`
      ]
      expect(compile(outline("it "))).toBe(compile(sentences))
      expect(compile(outline(""))).toBe(compile(sentences))
    })

    test('`"x" is ...` is a property, not a phrase:  a getter, or a type', () => {
      const compiled = compile(["a card is a thing where:", '\t- "rank" is a number', '\t- "double" is: its rank * 2'])
      expect(compiled).toContain('this.declareProp("rank", { type: "number" })')
      expect(compiled).toContain("return this.rank * 2")
    })

    test("only in a type's body:  at the top level, or in a getter there, it's still an error", () => {
      expect(errorsOf(['"rank" is a number'])).toEqual([`1:0 Don't understand ""rank" is a number"`])
      expect(errorsOf(["has a name as text"])).toEqual([`1:0 Don't understand "has a name as text"`])
    })

    test("a getter's line outside a getter is an error, not a return at the top level (I9)", () => {
      expect(errorsOf(["x is 1", "red if x is 1"])).toEqual([
        `2:0 A line of a getter's body:  put it under one, e.g. "the color of a card is:"`
      ])
    })
  })

  describe("a bare name is a property (P9):  `- suit is a suit of its deck`", () => {
    const withIts = [
      "a pile is a list of cards",
      "a card is a thing where:",
      "\t- its name is text",
      "\t- its rank is a number",
      "\t- its direction is either up or down",
      "\t- its suit is one of clubs, diamonds, hearts or spades",
      "\t- its color is red if its suit is either diamonds or hearts otherwise it is black",
      '\t- its short name is: its rank + " of " + its suit',
      "\t- its state is:",
      "\t\treturn its rank",
      "\t- its piles is a list of piles"
    ]
    const bare = withIts.map((line) => line.replace(/^\t- its /, "\t- "))

    test("compiles exactly as the same lines with `its` do", () => {
      expect(bare[2]).toBe("\t- name is text")
      expect(compile(bare)).toBe(compile(withIts))
    })

    test("`are` as well as `is`:  `- piles are a list of piles`", () => {
      expect(compile([...bare.slice(0, -1), "\t- piles are a list of piles"])).toBe(compile(withIts))
    })

    test("a bare name with a value is a getter, not a variable, and warns:  `- score is 0`", () => {
      const lines = ["a card is a thing where:", "\t- score is 0", '\t- label is "card"']
      const { files } = parseSpellProject([{ path: "/test.spell", contents: lines.join("\n") }])
      expect(files[0]!.errors).toEqual([])
      expect(compile(lines)).toContain("get score() {\n    return 0")
      expect(SP.SpellWarnings.in(files[0]!.match!).map(({ message }) => message)).toEqual([
        'score is always 0:  to give it a type, write "score is a number"',
        'label is always "card":  to give it a type, write "label is text"'
      ])
    })

    test("a line starting with a statement's word stays that statement:  `- return x is 1`", () => {
      expect(compile(["x is 1", "to check:", "\ta card is a thing where:", "\t\t- return x is 1"])).toContain(
        "return x === 1"
      )
    })

    test("only in a type's body:  in a getter there, or at the top level, it sets a variable", () => {
      expect(compile(["a card is a thing where:", "\t- double is:", "\t\ttotal is 2", "\t\treturn total"])).toContain(
        "const total = 2"
      )
      expect(compile(["score is 0"])).toContain("const score = 0")
    })
  })

  test("the outline Solitaire's cards pass their own tests, as today's cards do (P5)", () => {
    // its deck, card, dealing and piles -- not the game itself, which starts an app
    const files = loadFixtureProject("outline-solitaire").filter(({ path }) => !path.endsWith("Solitaire.spell"))
    const lines: string[] = []
    const console = core.console as unknown as Record<string, (...args: unknown[]) => void>
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
function runSpell(lines: string[], options?: RunOptions) {
  return runSpellFiles([{ path: "/Test.spell", contents: lines.join("\n") }], options)
}

/** How `runSpell()` runs a program. */
type RunOptions = {
  /** `true`:  its things register in `core.things`, as a running program's do, e.g. for `every pile`.  Default:  not. */
  registered?: boolean
}

/** `files`, a project, compiled then RUN -- see `runSpell()`. */
function runSpellFiles(sources: Array<{ path: string; contents: string }>, { registered = false }: RunOptions = {}) {
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
    // each top-level variable by spell's name, e.g. `first_pile`:  compiled javascript calls it `firstPile`
    const named = names
      .split(/,\s*/)
      .filter(Boolean)
      .map((name) => `${name}: ${P.JSWriter.instance.nameOf(name)}`)
    const body = `${code}\nreturn { ${named.join(", ")} }`
    // `@spell/core`'s helpers it imports by name, e.g. `trigger()`, as the import it lost would give them
    const imported = { on, off, once, trigger, positionOf, position, spellPosition, endPosition, withSpellPositions }
    // oxlint-disable-next-line no-implied-eval -- running compiled spell, as a runner does, is the test
    const fn = new Function("core", "Thing", "List", "App", ...Object.keys(imported), body)
    const run = () => fn(core, Thing, List, App, ...Object.values(imported))
    if (!registered) return core.things.quietly(run) as Record<string, unknown>
    core.things.clear()
    return run() as Record<string, unknown>
  }
}

/**
 * Compiled `lines`, as one file of its own project:  the CODE alone.
 * - without its `SPELL: DECLARES` comments, which say where each declaration is
 * - without its line comments:  each property's says the spell that made it (epic `people-and-orgs` P19), which is
 *   the outline's line in one, the sentence in the other
 * - Throws on a parse error, naming it.
 */
function compile(lines: string[]): string {
  const { files } = parseSpellProject([{ path: "/test.spell", contents: lines.join("\n") }])
  const [file] = files
  if (file!.errors.length) throw new Error(`parse errors:\n${JSON.stringify(file!.errors, null, 2)}`)
  return withoutComments(file!.compiled)
}

/** `compiled` javascript without its comments and declarations, which name source lines and positions. */
function withoutComments(compiled: string): string {
  return compiled
    .replace(/\/\*! SPELL: DECLARES[^]*?\*\//g, "")
    .split("\n")
    .filter((line) => line.trim() && !line.trim().startsWith("//"))
    .join("\n")
}

/** The long form of each line in the body of `file`'s 2nd line, a type's outline -- see `SpellStatement.getLongForm()`. */
function longFormsOf(file: P.Match): Array<string | undefined> {
  const typeLine = file.matched[1] as P.Match
  const body = (typeLine.data.statement as P.Match).data.body as P.Match
  return body.matched
    .map((line) => (line as P.Match).data.statement as P.Match | undefined)
    .map((statement) => statement && (statement.rule as SP.SpellStatement).getLongForm(statement))
}

/** The parse errors of `lines`, as one file of its own project. */
function errorsOf(lines: string[]): string[] {
  const { files } = parseSpellProject([{ path: "/test.spell", contents: lines.join("\n") }])
  return files[0]!.errors
}
