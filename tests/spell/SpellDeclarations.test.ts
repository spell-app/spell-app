import { describe, test, expect } from "vite-plus/test"

import { P } from "spell-lang/parser"
import { SP } from "spell-lang/spell"
import { compiledSpellProject, parseSpellProject, summarize } from "spell-lang/spell/test"
import { loadFixtureProject } from "spell-app/spaces/test"

/**
 * A project's declarations:  marked inline while compiling, then split out into its declarations file.
 * - That file is what another project imports it by.
 * - Snapshot pins Solitaire's, so a change to what a project declares shows up in review.
 */
describe("SpellDeclarations, inline", () => {
  const {
    marked: compiled,
    code,
    declarations
  } = compiledSpellProject(loadFixtureProject("solitaire"), { version: "1.0.0" })

  test("Solitaire's declarations", () => {
    expect(declarations).toMatchSnapshot()
  })

  test("`split()` takes every marker out of the code", () => {
    expect(compiled).toContain("/*! SPELL: DECLARES")
    expect(code).not.toContain("SPELL:")
    expect(code).toBe(SP.SpellDeclarations.stripComments(compiled))
  })

  test("`codeLines`:  where each statement's code starts in the code", () => {
    const lines = code.split("\n")
    expect(declarations.codeLines).toHaveLength(declarations.statements.length)
    const rank = declarations.statements.findIndex(({ property, of }) => property === "rank" && of === "Card")
    // its code starts with the spell that made it (epic `people-and-orgs` P19)
    expect(lines[declarations.codeLines![rank]!]).toMatch(/^ {2}\/\/ cards have a rank as one of /)
    expect(lines[declarations.codeLines![rank]! + 1]).toMatch(/^ {2}static Ranks = /)
    const card = declarations.statements.findIndex(({ type }) => type === "Card")
    expect(lines[declarations.codeLines![card]!]).toBe("export class Card extends Thing {")
  })

  test("`fromComments()` still reads a compiled .js from before declarations files", () => {
    const header = `/*! SPELL: PROJECT { spellVersion: "${SP.SPELL_VERSION}", provides: ["Card"] } */\n`
    const old = SP.SpellDeclarations.fromComments(header + compiled)!
    expect(old.provides).toEqual(["Card"])
    expect(old.statements).toEqual(declarations.statements)
  })

  test("each statement's comment is short:  3-7 lines", () => {
    const comments = compiled.match(/\/\*! SPELL: DECLARES \{[\s\S]*? \*\//g)!
    expect(comments.length).toBe(declarations.statements.length)
    for (const comment of comments) expect(comment.split("\n").length).toBeLessThanOrEqual(7)
  })

  test("reads a class member's comment, indented in its class's body", () => {
    expect(compiled).toMatch(/\n {2}\/\*! SPELL: DECLARES \{\n {4}property: "rank", classVariable: "Ranks"/)
    expect(declarations.statements).toContainEqual(expect.objectContaining({ property: "rank", of: "Card" }))
    // ...and one from another file, `Pile.spell`, which went in `Card.spell`'s class
    const moveTo = declarations.statements.find(({ output }) => output === "move_to_$pile")
    expect(moveTo).toMatchObject({ of: "Card", defined: expect.stringMatching(/^\/Pile\.spell:/) })
  })

  test("reads the way it's written, e.g. a function", () => {
    const compiled = compiledSpellProject(loadFixtureProject("fizzbuzz")).marked
    const source = loadFixtureProject("fizzbuzz")[0]!.contents
    const comment = compiled.match(/\/\*! SPELL: DECLARES \{[\s\S]*? \*\//)![0]
    const start = source.indexOf("to play fizzbuzz")
    const end = source.indexOf("\n\nplay fizzbuzz")
    expect(comment).toBe(
      [
        "/*! SPELL: DECLARES {",
        '  syntax: "play fizzbuzz", output: "play_fizzbuzz", rule: "method_call",',
        '  alias: ["statement", "expression"], kind: "function",',
        `  defined: "/FizzBuzz.spell:${start}-${end}",`,
        "} */"
      ].join("\n")
    )
  })

  test("are plain data:  survive a JSON round trip unchanged", () => {
    expect(JSON.parse(JSON.stringify(declarations))).toEqual(declarations)
  })

  test("each rule's class can be found again by its `importableAs` name", () => {
    const rules = declarations.statements.filter(({ rule }) => rule)
    expect(rules.length).toBeGreaterThan(0)
    for (const { rule } of rules) expect(P.Rule.importableRule(rule!)).toBeDefined()
  })

  test("`exports` in `project.json` limits what it provides", () => {
    const limited = compiledSpellProject(loadFixtureProject("solitaire"), { exports: ["Card"] }).declarations
    expect(limited?.provides).toEqual(["Card"])
    expect(() => compiledSpellProject(loadFixtureProject("solitaire"), { exports: ["Joker"] })).toThrow(
      /exports 'Joker', which it doesn't declare/
    )
  })
})

/**
 * `SpellDeclarations.importScope()` -- a project parses against another's declarations, NOT its sources.
 * - Solitaire split in two:  a library (`Card`, `Deck`, `Pile`) and an app (`Solitaire.spell`).
 */
describe("SpellDeclarations.importScope()", () => {
  const all = loadFixtureProject("solitaire")
  const library = all.filter(({ path }) => path !== "/Solitaire.spell")
  const app = all.filter(({ path }) => path === "/Solitaire.spell")
  // read back out of compiled text, as another project would
  const declarations = compiledSpellProject(library, { version: "1.2.0" }).declarations
  const from = "@spell/library/cards"

  /** Import layer over the root scope, holding just the library -- `options` as a `project.json` entry. */
  function importLibrary(options: Partial<SP.DeclarationsImport> = {}) {
    return SP.SpellDeclarations.importScope(SP.SpellParser.rootScope, [{ from, declarations, ...options }])
  }

  test("the app compiles the same against the library's declarations as against its sources", () => {
    const fromSources = summarize(parseSpellProject(all)).filter(({ path }) => path === "/Solitaire.spell")
    const fromDeclarations = summarize(parseSpellProject(app, { parentScope: importLibrary() }))
    // The same, bar one thing:  a member read its type never declares warns only where the type is the project's
    // own, never an import's -- the importer may give it anything (see `MemberReadExpression.warnIfUndeclared()`).
    // - A pile's `name` is no longer a second:  every list has one, built in (epic `spanish` P15),
    //   so `set the name of cards-to-move to ...` declares nothing, from sources or declarations.
    const neverSays = /A pile never says it has a droppable/
    expect(fromSources[0]!.warnings).toContainEqual(expect.stringMatching(neverSays))
    const withoutIt = fromSources.map((it) => ({
      ...it,
      warnings: it.warnings.filter((warning) => !/never says it has/.test(warning))
    }))
    expect(fromDeclarations).toEqual(withoutIt)
  })

  test("records where each name came from", () => {
    const { origins } = importLibrary()
    expect(origins.get("Card")).toBe(from)
    expect(origins.get("turn_face_up")).toBe(from)
  })

  describe("records keep what editors need, with no `declaredBy` -- for a library shipped without sources", () => {
    const projectId = "@spell/library/cards"
    const imports = importLibrary({ projectId })

    test("a type, its properties and constants:  `declaredAt` -- in the project's own files", () => {
      const card = imports.types.get("Card", "LOCAL_ONLY")!
      expect(card.declaredAt?.path).toBe(`${projectId}/Card.spell`)
      expect(sourceAt(card.declaredAt)).toBe("a card is a thing")
      expect(sourceAt(card.variables.get("suit", "LOCAL_ONLY")?.declaredAt)).toMatch(/^cards have a suit as one of/)
      expect(sourceAt(card.classVariables.get("Suits", "LOCAL_ONLY")?.declaredAt)).toMatch(/^cards have a suit/)
      expect(sourceAt(imports.constants.get("clubs", "LOCAL_ONLY")?.declaredAt)).toMatch(/^cards have a suit/)
    })

    test("a rule:  its owner, what its statement declared, as `getDeclaration()` said -- and where", () => {
      const { declared } = imports.rules.get("turn_face_up", "LOCAL_ONLY")!
      expect(declared?.owner).toBe("Card")
      expect(declared?.declaration).toEqual({
        kind: "method",
        name: "turn (a card) face up",
        of: "Card",
        detail: "turnFaceUp()"
      })
      expect(sourceAt(declared?.declaredAt)).toMatch(/^to turn \(a card\) face up/)
      // a quoted alias's rule says it declared the method it calls
      expect(imports.rules.get("is_a_$suit", "LOCAL_ONLY")?.declared?.declaration).toEqual({
        kind: "method",
        name: '"is a (suit)"',
        detail: "isASuit()",
        of: "Card"
      })
    })

    test("renamed, it's still where it was", () => {
      const renamed = importLibrary({ projectId, import: ["Card:Playingcard"] })
      expect(sourceAt(renamed.types.get("Playingcard", "LOCAL_ONLY")?.declaredAt)).toBe("a card is a thing")
      expect(renamed.rules.get("turn_face_up", "LOCAL_ONLY")?.declared?.owner).toBe("Playingcard")
    })

    test("`declaredAt` defaults to `from`, if the importer doesn't say its project", () => {
      expect(importLibrary().types.get("Card", "LOCAL_ONLY")?.declaredAt?.path).toBe(`${from}/Card.spell`)
    })

    /** Library source `at` points to. */
    function sourceAt(at: P.DeclaredAt | undefined) {
      const file = library.find(({ path }) => at?.path === SP.SpellLocation.join(projectId, path))
      return file?.contents.slice(at!.start, at!.end)
    }
  })

  test("a method's parameters and a list type's item type load with their types -- renamed with them", () => {
    const imports = importLibrary()
    const move = imports.types.get("Card", "LOCAL_ONLY")?.methods.get("move_to_$pile", "LOCAL_ONLY")
    expect(move?.params).toEqual([{ name: "pile", datatype: "Pile" }])
    expect(move?.asWritten).toBe("move (a card) to (a pile)")
    expect(imports.types.get("Pile", "LOCAL_ONLY")?.itemType).toBe("Card")
    const renamed = importLibrary({ import: ["Card:Playingcard", "*"] })
    expect(renamed.types.get("Pile", "LOCAL_ONLY")?.itemType).toBe("Playingcard")
  })

  test("an imported call rule checks its arguments' types -- a deck falls to the built-in `move` -- and is an operand", () => {
    const contents = [
      "set card to a new card",
      "set deck to a new deck",
      "set pile to a new pile",
      "move card to pile",
      "move card to deck",
      "set moved to move card to pile"
    ].join("\n")
    const { files } = parseSpellProject([{ path: "/A.spell", contents }], { parentScope: importLibrary() })
    expect([files[0]!.compiled, ...files[0]!.errors].join("\n")).toMatchInlineSnapshot(`
      "export const card = new Card()
      export const deck = new Deck()
      export const pile = new Pile()
      card.moveToPile(pile)
      core.move(card, deck)
      export const moved = card.moveToPile(pile)"
    `)
  })

  test("declarations from before P4 load:  no `params` or `itemType` is unknown", () => {
    const old = {
      ...declarations,
      statements: declarations.statements.map(({ params, itemType, ...statement }) => statement)
    }
    const imports = SP.SpellDeclarations.importScope(SP.SpellParser.rootScope, [{ from, declarations: old }])
    expect(imports.types.get("Card", "LOCAL_ONLY")?.methods.get("move_to_$pile", "LOCAL_ONLY")?.params).toEqual([])
    expect(imports.types.get("Pile", "LOCAL_ONLY")?.itemType).toBeUndefined()
  })

  // NOTE: pins TODAY's partial-import behaviour:  a type brings only the rules it OWNS.
  // See the plan's open question 1:  whether a rule owned by a type left out could still change how the importer parses.
  test("`import` loads just the names picked, with what they own", () => {
    const { scope } = parseSpellProject([], { parentScope: importLibrary({ import: ["Card"] }) })
    expect(scope.types.get("Card")).toBeDefined()
    expect(scope.parse("card suits", "expression")?.compile()).toBe("Card.Suits")
    expect(scope.types.get("Deck")).toBeUndefined()
    // ...but what a card's properties hold comes along:
    // `set the pile of the card to the pile` declared one
    expect(scope.types.get("Pile")).toBeDefined()
  })

  test("a picked type brings the types it depends on", () => {
    const { scope } = parseSpellProject([], { parentScope: importLibrary({ import: ["Pile"] }) })
    // `Pile` is a `List`, which is built in -- `Card` it only holds, so it doesn't come along
    expect(scope.types.get("Pile")?.superType).toBe("List")
  })

  describe("`Card:Playingcard` loads `Card` as `Playingcard`", () => {
    const parentScope = importLibrary({ import: ["Card:Playingcard", "*"], module: "@spell/project/cards" })
    const { scope } = parseSpellProject([], { parentScope })
    const imports = scope.parentScope as P.ImportScope

    test("under its new name only -- its class keeps its old one, at runtime", () => {
      expect(scope.types.get("Card")).toBeUndefined()
      expect(scope.types.get("Playingcard")?.runtimeName).toBe("Card")
      expect(scope.types.get("Playingcard")?.variables.get("suit")).toBeDefined()
      expect(imports.origins.get("Playingcard")).toBe(from)
    })

    test("its rules too", () => {
      expect(scope.parse("playingcard suits", "expression")?.compile()).toBe("Playingcard.Suits")
      expect(scope.parse("card suits", "expression")).toBeUndefined()
    })

    test("a runtime type check uses its class's real name", () => {
      scope.variables.add("thing")
      expect(scope.parse("thing is a playingcard", "expression")?.compile()).toBe('core.isOfType(thing, "Card")')
      // ...and so does a property's, when it's set
      expect(scope.parse("a hand has a top as a playingcard", "block")?.compile()).toContain('type: "Card"')
    })

    test("the importer's compiled JS imports it under its new name", () => {
      const names = imports.modules.get("@spell/project/cards")
      expect(names).toContain("Card as Playingcard")
      expect(names).toContain("Deck")
    })
  })

  describe("won't load, rather than loading something half right", () => {
    test("a name it doesn't provide", () => {
      expect(() => importLibrary({ import: ["Joker"] })).toThrow(/@spell\/library\/cards.*doesn't provide 'Joker'/)
    })
    test("a rename of something that isn't a type", () => {
      expect(() => importLibrary({ import: ["test_card_setup:setup"] })).toThrow(/only a type can be renamed/)
    })
    test("a rename to something that isn't a type name", () => {
      expect(() => importLibrary({ import: ["Card:playing card"] })).toThrow(/'playing card' isn't a type name/)
    })
    test("a rename to a name something else loaded has", () => {
      expect(() => importLibrary({ import: ["Card:Deck", "*"] })).toThrow(/would both be called 'Deck'/)
    })
    test("a version outside the importer's range", () => {
      expect(importLibrary({ version: "^1.1" })).toBeDefined()
      expect(() => importLibrary({ version: "^2" })).toThrow(/version 1\.2\.0 isn't '\^2'/)
    })
    test("declarations from another major version of spell", () => {
      const future = { ...declarations, spellVersion: "99.0.0" }
      expect(() => importLibrary({ declarations: future })).toThrow(/compiled by spell 99\.0\.0/)
    })
    test("the same type from two imports", () => {
      const twice = [
        { from, declarations },
        { from: "@spell/library/more-cards", declarations }
      ]
      expect(() => SP.SpellDeclarations.importScope(SP.SpellParser.rootScope, twice)).toThrow(
        /more-cards.*type 'Card' was already imported from '@spell\/library\/cards'/
      )
    })
  })
})
