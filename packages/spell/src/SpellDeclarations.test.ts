import semver from "semver"
import { describe, test, expect } from "vite-plus/test"

import { P } from "$/parser"
import { SP } from "$/spell"
import { loadFixtureProject, parseSpellProject, summarize, type SpellSourceFile } from "$/spell/test"

/**
 * `files` compiled as a project would be:
 * - `marked`:  each file's code, with its statements' `/*! SPELL: DECLARES` markers inline -- a class member's in its
 *   class's body -- as `SpellProject` combines them, before `split()`
 * - `code`:  that, markers out, as its `<Project>.compiled.js`
 * - `declarations`:  as its `<Project>.declarations.json`, read back as another project would
 */
function compiledProject(files: SpellSourceFile[], options: { version?: string; exports?: string[] } = {}) {
  const { scope, files: parsed } = parseSpellProject(files)
  const parts = parsed.map(({ match, compiled }) => (match?.AST instanceof P.ASTStatementGroup ? match.AST : compiled))
  const marked = SP.SpellProject.combineCompiled(parts)
  const { code, declarations } = SP.SpellDeclarations.split(marked, scope, options)
  return { marked, code, declarations: SP.SpellDeclarations.read(JSON.stringify(declarations))! }
}

/**
 * A project's declarations:  marked inline while compiling, then split out into its declarations file,
 * what another project imports it by.
 * - Snapshot pins Solitaire's, so a change to what a project declares shows up in review.
 */
describe("SpellDeclarations, inline", () => {
  const {
    marked: compiled,
    code,
    declarations
  } = compiledProject(loadFixtureProject("Solitaire"), { version: "1.0.0" })

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
    expect(lines[declarations.codeLines![rank]!]).toMatch(/^ {2}static Ranks = /)
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
    const compiled = compiledProject(loadFixtureProject("FizzBuzz")).marked
    const source = loadFixtureProject("FizzBuzz")[0]!.contents
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
    const limited = compiledProject(loadFixtureProject("Solitaire"), { exports: ["Card"] }).declarations
    expect(limited?.provides).toEqual(["Card"])
    expect(() => compiledProject(loadFixtureProject("Solitaire"), { exports: ["Joker"] })).toThrow(
      /exports 'Joker', which it doesn't declare/
    )
  })

  test("a rule not specialize()d from a class with an `importableAs` throws, rather than being silently left out", () => {
    const projectScope = new P.ProjectScope({
      name: "unimportable",
      path: "/unimportable",
      parser: SP.SpellParser.rootScope.parser!.clone({ module: "/unimportable" }),
      parentScope: SP.SpellParser.rootScope
    })
    const statement = projectScope.parse("1", "expression")!
    projectScope.addRule(class frobnicate extends P.Keyword {}, { syntax: "frobnicate" }, statement)
    expect(() => SP.SpellDeclarations.declarationFor(statement)).toThrow(/frobnicate.*importableAs/)
  })

  test("`SPELL_VERSION` is the language's own semver, set by hand -- NOT from package.json", () => {
    expect(semver.valid(SP.SPELL_VERSION)).toBe(SP.SPELL_VERSION)
  })
})

/**
 * `SpellDeclarations.importScope()` -- a project parses against another's declarations, NOT its sources.
 * - Solitaire split in two:  a library (`Card`, `Deck`, `Pile`) and an app (`Solitaire.spell`).
 */
describe("SpellDeclarations.importScope()", () => {
  const all = loadFixtureProject("Solitaire")
  const library = all.filter(({ path }) => path !== "/Solitaire.spell")
  const app = all.filter(({ path }) => path === "/Solitaire.spell")
  // read back out of compiled text, as another project would
  const declarations = compiledProject(library, { version: "1.2.0" }).declarations
  const from = "@library/cards"

  /** Import layer over the root scope, holding just the library -- `options` as a `project.json` entry. */
  function importLibrary(options: Partial<SP.DeclarationsImport> = {}) {
    return SP.SpellDeclarations.importScope(SP.SpellParser.rootScope, [{ from, declarations, ...options }])
  }

  test("the app compiles the same against the library's declarations as against its sources", () => {
    const fromSources = summarize(parseSpellProject(all)).filter(({ path }) => path === "/Solitaire.spell")
    const fromDeclarations = summarize(parseSpellProject(app, { parentScope: importLibrary() }))
    // bar two things.  `set the name of cards-to-move to ...` declares a pile's `name`
    // only on a type the project declares itself (see `AssignmentStatement.declareProperty()`),
    // and so only there asks what it is
    const autoDeclared =
      /\/\*! SPELL: DECLARES \{\n {2}property: "name", of: "Pile", autoDeclared: true,\n.*\n\} \*\/\n(.*\n){5}/
    const asksWhatItIs = /Say what "name" is/
    // And a member read its type never declares warns only where the type is the project's own, never an import's:
    // the importer may give it anything -- see `MemberReadExpression.warnIfUndeclared()`
    const neverSays = /A pile never says it has a droppable/
    expect(fromSources[0]!.compiled).toMatch(autoDeclared)
    expect(fromSources[0]!.warnings).toContainEqual(expect.stringMatching(asksWhatItIs))
    expect(fromSources[0]!.warnings).toContainEqual(expect.stringMatching(neverSays))
    // and so, from its sources, a foundation's `name` is the pile's, of no known kind:  `==`.
    // From the library's declarations, which don't have it, it's what every foundation is given, text:  `===` (P19)
    const nameKnown = (code: string) => code.replace(/this\.name == ('\w+')/g, "this.name === $1")
    const withoutIt = fromSources.map((it) => ({
      ...it,
      compiled: it.compiled && nameKnown(it.compiled.replace(autoDeclared, "")),
      warnings: it.warnings.filter((warning) => !asksWhatItIs.test(warning) && !/never says it has/.test(warning))
    }))
    expect(fromDeclarations).toEqual(withoutIt)
  })

  test("records where each name came from", () => {
    const { origins } = importLibrary()
    expect(origins.get("Card")).toBe(from)
    expect(origins.get("turn_face_up")).toBe(from)
  })

  describe("records keep what editors need, with no `declaredBy` -- for a library shipped without sources", () => {
    const projectId = "@system:library:cards"
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
      const file = library.find(({ path }) => at?.path === `${projectId}${path}`)
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
      "export let card = new Card()
      export let deck = new Deck()
      export let pile = new Pile()
      card.moveToPile(pile)
      spellCore.move(card, deck)
      export let moved = card.moveToPile(pile)"
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
      expect(scope.parse("thing is a playingcard", "expression")?.compile()).toBe("spellCore.isOfType(thing, 'Card')")
      // ...and so does a property's, when it's set
      expect(scope.parse("a hand has a top as a playingcard", "block")?.compile()).toContain("type: 'Card'")
    })

    test("the importer's compiled JS imports it under its new name", () => {
      const names = imports.modules.get("@spell/project/cards")
      expect(names).toContain("Card as Playingcard")
      expect(names).toContain("Deck")
    })
  })

  describe("won't load, rather than loading something half right", () => {
    test("a name it doesn't provide", () => {
      expect(() => importLibrary({ import: ["Joker"] })).toThrow(/@library\/cards.*doesn't provide 'Joker'/)
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
        { from: "@library/more-cards", declarations }
      ]
      expect(() => SP.SpellDeclarations.importScope(SP.SpellParser.rootScope, twice)).toThrow(
        /more-cards.*type 'Card' was already imported from '@library\/cards'/
      )
    })
  })
})

/**
 * `a card belongs to one pile` is saved as the member it gives cards:  `pile`, `exclusive`, a `Pile`.
 * - Loading it gives `Card` that read-only member again -- see `P.TypeScope.declareOwnerMember()`.
 * - The list types' own declarations say nothing about it:  `a pile is a list of cards` is plain.
 */
describe("SpellDeclarations of `a card belongs to one pile`", () => {
  const library = [
    { path: "/Card.spell", contents: "a card is a thing" },
    { path: "/Pile.spell", contents: "a pile is a list of cards\na card belongs to one pile\na tableau is a pile" }
  ]
  const declarations = compiledProject(library).declarations
  const from = "@library/piles"

  test("says the member it gives cards -- its list types stay plain", () => {
    expect(declarations.statements.find(({ property }) => property === "pile")).toEqual({
      property: "pile",
      of: "Card",
      datatype: "Pile",
      exclusive: true,
      defined: "/Pile.spell:26-52"
    })
    expect(declarations.statements.find(({ type }) => type === "Pile")).toEqual({
      type: "Pile",
      superType: "List",
      itemType: "Card",
      defined: "/Pile.spell:0-25"
    })
  })

  test("loads it again:  `the pile of a card` is a `Pile`, read-only, declared on its own line", () => {
    const imports = SP.SpellDeclarations.importScope(SP.SpellParser.rootScope, [{ from, declarations }])
    const member = imports.types.get("Card", "LOCAL_ONLY")?.variables.get("pile", "LOCAL_ONLY")
    // a getter, which its declaration leaves unsaid -- see `SP.SpellDeclaration.getter`
    expect(member).toMatchObject({ name: "pile", datatype: "Pile", exclusive: true, isGetter: true })
    expect(member?.declaredAt).toMatchObject({ path: `${from}/Pile.spell`, start: 26, end: 52 })
    const contents = ["set card to a new card", "print the pile of the card", "set the pile of the card to 1"]
    const { files } = parseSpellProject([{ path: "/A.spell", contents: contents.join("\n") }], {
      parentScope: imports
    })
    expect([files[0]!.compiled, ...files[0]!.errors].join("\n")).toMatchInlineSnapshot(`
      "export let card = new Card()
      spellCore.console.log(card.pile)
      /* PARSE ERROR: Can't set the pile of a Card:  it's the Pile holding it -- move it to a Pile instead */
      3:0 Can't set the pile of a Card:  it's the Pile holding it -- move it to a Pile instead"
    `)
  })

  test("picking `Card` brings `Pile`, the type its member holds", () => {
    const imports = SP.SpellDeclarations.importScope(SP.SpellParser.rootScope, [
      { from, declarations, import: ["Card"] }
    ])
    expect(imports.types.get("Pile", "LOCAL_ONLY")).toBeDefined()
    expect(imports.types.get("Tableau", "LOCAL_ONLY")).toBeUndefined()
  })
})

/** A multi-word member keeps its words as written through an import, so an importer's editors show `short rank`. */
describe("SpellDeclarations of a multi-word member", () => {
  const library = [
    { path: "/Card.spell", contents: "a card is a thing\na card has short rank as text\na card has a suit" }
  ]
  const declarations = compiledProject(library).declarations

  test("says its `asWritten` when it isn't its name -- not for a one-word member", () => {
    expect(declarations.statements.find(({ property }) => property === "short_rank")?.asWritten).toBe("short rank")
    expect(declarations.statements.find(({ property }) => property === "suit")?.asWritten).toBeUndefined()
  })

  test("loads them again", () => {
    const imports = SP.SpellDeclarations.importScope(SP.SpellParser.rootScope, [{ from: "@library/c", declarations }])
    const member = imports.types.get("Card", "LOCAL_ONLY")?.variables.get("short_rank", "LOCAL_ONLY")
    expect(member?.asWritten).toBe("short rank")
  })
})

/**
 * A DERIVED property -- a getter works it out -- says so, so an importer's TypeScript reads it by TypeScript's name,
 * `card.shortName`, not spell's (epic `output-targets`, J20 / I5).
 */
describe("SpellDeclarations of a derived property", () => {
  const library = [
    {
      path: "/Card.spell",
      contents: [
        "a card is a thing",
        "a card has a rank as number",
        "a card has a suit as text",
        "the short rank of a card is: its rank",
        'the color of a card is "red" if its suit is "hearts" otherwise "black"'
      ].join("\n")
    }
  ]
  const declarations = compiledProject(library).declarations
  const property = (name: string) => declarations.statements.find((it) => it.property === name)

  test("says `getter` for a getter's property -- not for a stored one", () => {
    expect(property("short_rank")?.getter).toBe(true)
    expect(property("color")?.getter).toBe(true)
    expect(property("rank")?.getter).toBeUndefined()
  })

  test("loads it as the record's `isGetter`", () => {
    const imports = SP.SpellDeclarations.importScope(SP.SpellParser.rootScope, [{ from: "@library/c", declarations }])
    const card = imports.types.get("Card", "LOCAL_ONLY")!
    expect(card.variables.get("short_rank", "LOCAL_ONLY")?.isGetter).toBe(true)
    expect(card.variables.get("color", "LOCAL_ONLY")?.isGetter).toBe(true)
    expect(card.variables.get("rank", "LOCAL_ONLY")?.isGetter).toBeUndefined()
  })
})
