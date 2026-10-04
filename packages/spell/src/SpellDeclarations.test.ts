import semver from "semver"
import { describe, test, expect } from "vitest"

import { P } from "$/parser"
import { SP } from "$/spell"
import { loadFixtureProject, parseSpellProject, summarize, type SpellSourceFile } from "$/spell/test"

/**
 * `files` compiled as a project's `<Project>.compiled.js` would be:  the `/*! SPELL: PROJECT` header, then each
 * file's code, with its statements' `/*! SPELL: DECLARES` comments inline -- a class member's in its class's body.
 */
function compiledProject(files: SpellSourceFile[], options: { version?: string; exports?: string[] } = {}) {
  const { scope, files: parsed } = parseSpellProject(files)
  const parts = parsed.map(({ match, compiled }) => (match?.AST instanceof P.ASTStatementGroup ? match.AST : compiled))
  return SP.SpellDeclarations.header(scope, options) + SP.SpellProject.combineCompiled(parts)
}

/**
 * A project's declarations, inline in its compiled JS -- what another project imports it by.
 * - Snapshot pins Solitaire's, so a change to what a project declares shows up in review.
 */
describe("SpellDeclarations, inline", () => {
  const compiled = compiledProject(loadFixtureProject("Solitaire"), { version: "1.0.0" })
  const declarations = SP.SpellDeclarations.read(compiled)!

  test("Solitaire's declarations", () => {
    expect(declarations).toMatchSnapshot()
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
    const compiled = compiledProject(loadFixtureProject("FizzBuzz"))
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
    const limited = SP.SpellDeclarations.read(compiledProject(loadFixtureProject("Solitaire"), { exports: ["Card"] }))
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
  const declarations = SP.SpellDeclarations.read(compiledProject(library, { version: "1.2.0" }))!
  const from = "@library/cards"

  /** Import layer over the root scope, holding just the library -- `options` as a `project.json` entry. */
  function importLibrary(options: Partial<SP.DeclarationsImport> = {}) {
    return SP.SpellDeclarations.importScope(SP.SpellParser.rootScope, [{ from, declarations, ...options }])
  }

  test("the app compiles the same against the library's declarations as against its sources", () => {
    const fromSources = summarize(parseSpellProject(all)).filter(({ path }) => path === "/Solitaire.spell")
    const fromDeclarations = summarize(parseSpellProject(app, { parentScope: importLibrary() }))
    expect(fromDeclarations).toEqual(fromSources)
  })

  test("records where each name came from", () => {
    const { origins } = importLibrary()
    expect(origins.get("Card")).toBe(from)
    expect(origins.get("Card_Suits")).toBe(from)
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
        detail: "turn_face_up()"
      })
      expect(sourceAt(declared?.declaredAt)).toMatch(/^to turn \(a card\) face up/)
      // a property's rule says it declared the property
      expect(imports.rules.get("Card_Suits", "LOCAL_ONLY")?.declared?.declaration).toEqual({
        kind: "property",
        name: "suit",
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
    expect(move?.words).toBe("move (a card) to (a pile)")
    expect(imports.types.get("Pile", "LOCAL_ONLY")?.itemType).toBe("Card")
    const renamed = importLibrary({ import: ["Card:Playingcard", "*"] })
    expect(renamed.types.get("Pile", "LOCAL_ONLY")?.itemType).toBe("Playingcard")
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

  // NOTE: pins TODAY's partial-import behaviour:  a type brings only the rules it OWNS -- see the plan's open
  // question 1, whether a rule owned by a type left out could still change how the importer parses.
  test("`import` loads just the names picked, with what they own", () => {
    const { scope } = parseSpellProject([], { parentScope: importLibrary({ import: ["Card"] }) })
    expect(scope.types.get("Card")).toBeDefined()
    expect(scope.parse("card suits", "expression")?.compile()).toBe("Card.Suits")
    expect(scope.types.get("Pile")).toBeUndefined()
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
