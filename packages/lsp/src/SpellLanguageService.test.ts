import { describe, test, expect, beforeAll } from "vitest"
import { cpSync, mkdtempSync, readFileSync } from "fs"
import { tmpdir } from "os"
import { resolve } from "path"
import { pathToFileURL } from "url"
import {
  CompletionItemKind,
  type CompletionItem,
  type DocumentSymbol,
  type Position,
  type Range,
  type SelectionRange,
  type SemanticTokens,
  type TextEdit
} from "vscode-languageserver"

import { SP } from "$/spell"
import { LSP } from "$/lsp"
import { SpellDiskWorkspace } from "$/lsp/SpellDiskWorkspace"
import { fixturePath } from "$/spell/test"

/**
 * The language service over a real project:  a temp copy of the Solitaire example,
 * so edits and `project.json` syncing never touch the repo, and its `@workspace` project is ours alone.
 */
describe("SpellLanguageService", () => {
  const dir = mkdtempSync(resolve(tmpdir(), "spell-lsp-"))
  cpSync(fixturePath("Solitaire"), resolve(dir, "Solitaire"), { recursive: true })
  const cardPath = resolve(dir, "Solitaire/Card.spell")
  const cardUri = pathToFileURL(cardPath).href
  const cardText = readFileSync(cardPath, "utf8")
  const solitaireUri = pathToFileURL(resolve(dir, "Solitaire/Solitaire.spell")).href
  const deckUri = pathToFileURL(resolve(dir, "Solitaire/Deck.spell")).href
  const workspace = new SpellDiskWorkspace()
  const service = new LSP.SpellLanguageService(workspace)
  let card: SP.SpellFile
  let deck: SP.SpellFile
  let solitaire: SP.SpellFile

  beforeAll(async () => {
    const changed = await workspace.update(cardUri, cardText)
    card = workspace.fileFor(cardUri)!
    deck = workspace.fileFor(deckUri)!
    solitaire = workspace.fileFor(solitaireUri)!
    expect(changed.map((file) => file.file)).toEqual(["Card.spell", "Deck.spell", "Pile.spell", "Solitaire.spell"])
  })

  test("opening a file parses its whole project, cleanly", () => {
    for (const file of card.project.spellFiles) {
      expect(file.match, file.path).toBeDefined()
      expect(service.diagnostics(file), file.path).toEqual([])
    }
  })

  describe("diagnostics", () => {
    test("a broken line gets an error under exactly its text", async () => {
      await withCardText(`${cardText}\nfoo bar baz  `, (changed) => {
        expect(changed).toContain(card)
        const lastLine = cardText.split("\n").length
        expect(service.diagnostics(card)).toEqual([
          {
            range: { start: { line: lastLine, character: 0 }, end: { line: lastLine, character: 11 } },
            severity: 1,
            source: "spell",
            message: `Don't understand "foo bar baz"`
          }
        ])
      })
      expect(service.diagnostics(card)).toEqual([])
    })

    test("an error inside JSX `{...}` sits on its text", async () => {
      const bad = "the short-suit of the card bogus"
      const broken = cardText.replace("the short-suit of the card}", `${bad}}`)
      await withCardText(broken, () => {
        const start = broken.indexOf(bad)
        expect(service.diagnostics(card).map(({ range }) => range)).toEqual([
          { start: service.positionAt(card, start), end: service.positionAt(card, start + bad.length) }
        ])
      })
    })

    test("a half-typed declaration keeps its last good version, so later files don't change", async () => {
      await withCardText(cardText.replace("a card is a thing", "a card is a"), (changed) => {
        expect(changed).toEqual([card])
        expect(service.diagnostics(card)).toHaveLength(1)
      })
    })

    test("changing a declaration re-parses the files after it", async () => {
      await withCardText(cardText.replace("a card is a thing", "a kard is a thing"), (changed) => {
        expect(changed.map((file) => file.file)).toEqual(["Card.spell", "Deck.spell", "Pile.spell", "Solitaire.spell"])
      })
    })
  })

  describe("structure", () => {
    test("folding ranges", () => {
      const folds = service
        .foldingRanges(card)
        .map(({ startLine, endLine, kind }) => `${startLine + 1}-${endLine + 1}${kind ? ` ${kind}` : ""}`)
      // `the short-suit of a card is:` + its body
      expect(folds).toContain("36-41")
      // `to draw (a card):` + its body, and the multi-line JSX in it
      expect(folds).toContain("74-81")
      expect(folds).toContain("78-81")
      // `// Turn card face up...` comment pair
      expect(folds).toContain("58-59 comment")
      expect(folds).toMatchSnapshot()
    })

    test("document symbols:  properties and methods nest under their type", () => {
      const outline = service.documentSymbols(card).map(describeSymbol)
      expect(outline[0]).toMatch(/^Card \(Class\)/)
      expect(outline).toMatchSnapshot()
    })

    test("a symbol's selection range is its name", () => {
      const [cardType] = service.documentSymbols(card)
      expect(cardType!.selectionRange).toEqual({ start: { line: 1, character: 2 }, end: { line: 1, character: 6 } })
    })

    test("workspace symbols find declarations across the project", () => {
      const found = service
        .workspaceSymbols("pile")
        .map(({ name, location }) => `${name} in ${location.uri.split("/").pop()}`)
      expect(found).toContain("Pile in Pile.spell")
    })

    test("selection ranges grow from the word at the cursor out to the whole file", () => {
      // on `suit` in `cards have a suit as one of clubs, ...`
      const position: Position = { line: 8, character: 13 }
      const [selection] = service.selectionRanges(card, [position])
      const texts: string[] = []
      for (let at: SelectionRange | undefined = selection; at; at = at.parent) {
        const start = service.offsetAt(card, at.range.start)
        texts.push(card.parseText.slice(start, service.offsetAt(card, at.range.end)))
      }
      expect(texts[0]).toBe("suit")
      expect(texts).toContain("cards have a suit as one of clubs, diamonds, hearts or spades")
      expect(texts.at(-1)).toBe(card.parseText)
    })
  })

  describe("highlighting", () => {
    test("semantic tokens", () => {
      // declarations, enumerations, method definitions and calls, JSX
      expect(describeTokens(card, [2, 6, 22, 60, 70, 77])).toMatchSnapshot()
    })

    test("a declared name, a built-in type, and calls to the project's own methods", () => {
      const tokens = describeTokens(card, [2, 60, 70])
      expect(tokens).toContain(`2:2 "card" type declaration`)
      expect(tokens).toContain(`2:12 "thing" type defaultLibrary`)
      expect(tokens).toContain(`60:3 "turn" function declaration`)
      expect(tokens).toContain(`70:25 "turn" function`)
      expect(tokens).toContain(`70:30 "it" variable`)
    })

    test("a heading comment's level is its number of `#`s -- a `//` one has none", async () => {
      await withCardText(`# Cards\n### ranks\n// plain\n${cardText}`, () => {
        const [top, third, plain] = service.highlightSpans(card)
        expect(top).toMatchObject({ kind: "comment", heading: 1 })
        expect(third).toMatchObject({ kind: "comment", heading: 3 })
        expect(plain).toMatchObject({ kind: "comment" })
        expect(plain!.heading).toBeUndefined()
        // ...sent as modifier `heading3`:  bit 1 << (1 + 3)
        const { data } = service.semanticTokens(card)
        expect(data[4 + 5]).toBe(1 << 4)
      })
    })

    test("a range request only covers that range", () => {
      const range = { start: { line: 1, character: 0 }, end: { line: 2, character: 0 } }
      const lines = new Set(describeTokens(card, undefined, range).map((token) => token.split(":")[0]))
      expect([...lines]).toEqual(["2"])
    })
  })

  describe("hover", () => {
    test("on a type:  what it is, and where it's declared", () => {
      const hover = service.hover(deck, at(deck, 9, "card"))
      const markdown = (hover!.contents as { value: string }).value
      expect(markdown).toContain("type **Card** is a Thing")
      expect(markdown).toContain("[Card.spell:2]")
    })

    test("on a method call:  its signature, and the javascript it becomes", () => {
      const markdown = (service.hover(card, at(card, 70, "turn"))!.contents as { value: string }).value
      expect(markdown).toContain("method **turn (a card) face down**")
      expect(markdown).toContain("compiles to `turn_face_down()`")
      expect(markdown).toContain("```js\nif (this.direction == 'up') { this.turn_face_down() }\n```")
    })

    test("a declaration's docstring, just under its name", () => {
      // `// set up tableau piles: ...` is directly above `a tableau is a pile`
      const markdown = (service.hover(solitaire, at(solitaire, 45, "tableau"))!.contents as { value: string }).value
      expect(markdown).toContain(
        "type **Tableau** is a Pile\n\nset up tableau piles: vertical piles where we arrange from king to ace\n\n"
      )
    })

    test("nothing on a blank line", () => {
      expect(service.hover(card, { line: 2, character: 0 })).toBeNull()
    })
  })

  describe("navigation", () => {
    test("definition of a type, from another file", () => {
      expect(service.definition(deck, at(deck, 9, "card"))).toEqual([
        { uri: cardUri, range: { start: { line: 1, character: 2 }, end: { line: 1, character: 6 } } }
      ])
    })

    test("definition of a method, from a call", () => {
      const [location] = service.definition(card, at(card, 70, "turn"))
      expect(location!.range.start).toEqual({ line: 62, character: 3 })
    })

    test("type definition of a method's `it`:  the type the method is on", () => {
      const [location] = service.typeDefinition(card, at(card, 70, "it", 1))
      expect(location).toEqual({
        uri: cardUri,
        range: { start: { line: 1, character: 2 }, end: { line: 1, character: 6 } }
      })
    })

    test("definition of a property, from `its ...`:  exactly where its type declares it", () => {
      expect(service.definition(card, at(card, 61, "direction"))).toEqual([
        { uri: cardUri, range: { start: { line: 17, character: 13 }, end: { line: 17, character: 22 } } }
      ])
      const markdown = (service.hover(card, at(card, 61, "direction"))!.contents as { value: string }).value
      expect(markdown).toContain("property **direction** of Card")
    })

    test("references to a property skip a same-named property of another type", () => {
      const lines = (uri: string) =>
        service
          .references(card, at(card, 34, "name"))
          .filter((location) => location.uri === uri)
          .map(({ range }) => range.start.line + 1)
      // `the name of the card` in Card's test -- `the card`'s type isn't known, so it counts
      expect(lines(cardUri)).toEqual(expect.arrayContaining([34, 89]))
      // `its name` in a method on `foundation`, which is a pile, not a card
      expect(lines(solitaireUri)).not.toContain(31)
    })

    test("references to a property, across files", () => {
      const files = service.references(deck, at(deck, 16, "short-name")).map(({ uri }) => uri.split("/").pop())
      expect(new Set(files)).toEqual(new Set(["Card.spell", "Deck.spell"]))
    })

    test("document highlights:  the declaration writes, the rest read", () => {
      const highlights = service
        .documentHighlights(card, at(card, 75, "className"))
        .map(({ range, kind }) => `${range.start.line + 1}:${range.start.character} ${kind}`)
      expect(highlights).toEqual(["75:5 3", "77:72 2", "78:71 2"])
    })

    test("rename a variable everywhere, and the project still parses the same", async () => {
      const position = at(solitaire, 57, "deck")
      expect(service.prepareRename(solitaire, position)).toMatchObject({ placeholder: "deck" })
      const edit = service.rename(solitaire, position, "stack")!
      const edits = edit.changes![solitaireUri]!
      expect(edits.map(({ range }) => range.start.line + 1)).toEqual([57, 58, 60])
      const renamed = applyEdits(solitaire.parseText, edits)
      expect(renamed).toContain("set the stack to a new deck\nset up the stack\n")
      await withText(solitaireUri, solitaire.parseText, renamed, () => {
        expect(service.diagnostics(solitaire)).toEqual([])
      })
    })

    test("won't rename `it`, a property, or a type written in more than one way", () => {
      expect(service.prepareRename(card, at(card, 70, "it", 1))).toBeNull()
      expect(service.prepareRename(card, at(card, 61, "direction"))).toBeNull()
      expect(service.prepareRename(card, at(card, 2, "card"))).toBeNull()
      expect(service.rename(solitaire, at(solitaire, 57, "deck"), "not a word")).toBeNull()
    })
  })

  test("javascript names show on hover only, not inline:  a numbered `it`, and a method's name", () => {
    const hover = (file: SP.SpellFile, position: Position) =>
      (service.hover(file, position)!.contents as { value: string }).value
    // `get a new foundation ...` then `add it to the foundations`, for the second foundation
    expect(hover(solitaire, at(solitaire, 35, "it"))).toContain("variable **it**: Foundation · as `it_2`")
    // the signature of `to turn (a card) face up`
    expect(hover(card, at(card, 60, "turn"))).toContain("compiles to `turn_face_up()`")
  })

  test("hover says what a variable holds:  an argument, a loop's item, `it`", () => {
    const hover = (file: SP.SpellFile, position: Position) =>
      (service.hover(file, position)!.contents as { value: string }).value
    // `a stock-pile "can pick up (a card)" if: the card is its bottom card`
    expect(hover(solitaire, at(solitaire, 17, "card", 1))).toContain("variable **card**: Card · argument")
    // `for each card in the deck` / `move it to the stock`:  the loop's item
    expect(hover(solitaire, at(solitaire, 61, "it"))).toContain("variable **it**: Card")
    // `to turn (a card) over:` / `if its direction is up: turn it face down`
    expect(hover(card, at(card, 70, "it", 1))).toContain("variable **it**: Card")
  })

  /**
   * Type `line` as a new last line of Solitaire.spell, then `check` at its end -- and put the file back.
   */
  async function typedAtEnd(line: string, check: (position: Position) => void) {
    const original = solitaire.contents!
    const text = `${original.trimEnd()}\n${line}`
    try {
      await workspace.update(solitaireUri, text)
      check({ line: text.split("\n").length - 1, character: line.length })
    } finally {
      await workspace.update(solitaireUri, original)
    }
  }

  describe("completion", () => {
    test("at the start of a statement:  names, statement starts, and the project's methods", () => {
      const labels = service.completion(solitaire, { line: 54, character: 0 }).map(({ label }) => label)
      expect(labels).toEqual(expect.arrayContaining(["to", "if", "set", "card", "deck", "all-piles", "clubs"]))
      expect(labels).toContain("turn (a card) face up")
      // declared after the cursor
      expect(labels).not.toContain("start-pile")
    })

    test("with docstrings", () => {
      const items = service.completion(solitaire, { line: 54, character: 0 })
      const docs = (label: string) =>
        (items.find((item) => item.label === label)?.documentation as { value: string })?.value
      expect(docs("card")).toBe("definition of a Card with nice english aliases for working with it")
      expect(docs("turn (a card) face up")).toBe(
        "Turn card face up or face down\nNote that this will animate if you `wait for turn the card face up`"
      )
    })

    test("a method comes as a snippet, with its arguments' names", () => {
      const item = service
        .completion(solitaire, { line: 54, character: 0 })
        .find(({ label }) => label === "move (a card) to (a pile)")
      expect(item).toMatchObject({ insertText: "move ${1:card} to ${2:pile}", insertTextFormat: 2 })
    })

    describe("what can come next, typed at the end of Solitaire.spell", () => {
      /** Completions at the end of `line`, typed as a new last line of Solitaire.spell. */
      async function typed(line: string, check: (items: CompletionItem[]) => void) {
        await typedAtEnd(line, (position) => check(service.completion(solitaire, position)))
      }
      const labels = (items: CompletionItem[]) => items.map(({ label }) => label)

      test("`set y ` => `to`", async () => {
        await typed("set y ", (items) => expect(labels(items)).toContain("to"))
      })

      test("...and it's what the word being typed filters", async () => {
        await typed("set y t", (items) => expect(labels(items)).toContain("to"))
      })

      test("`a thingy is a ` => types, and ONLY types", async () => {
        await typed("a thingy is a ", (items) => {
          expect(labels(items)).toEqual(expect.arrayContaining(["card", "deck", "pile"]))
          expect(items.every(({ kind }) => kind === CompletionItemKind.Class)).toBe(true)
        })
      })

      test("`if stock ` => `then`, but NO operators;  `if stock a` => `and`", async () => {
        await typed("if stock ", (items) => {
          expect(labels(items)).toContain("then")
          expect(labels(items)).not.toContain("and")
          expect(labels(items)).not.toContain("is")
        })
        await typed("if stock a", (items) => expect(labels(items)).toContain("and"))
      })

      test("partway through a call to a method => the rest of it, as a snippet", async () => {
        await typed("move the top card of stock ", (items) => {
          const rest = items.find(({ detail }) => detail === "move (a card) to (a pile)")
          expect(rest).toMatchObject({ label: "to (pile)", insertText: "to ${1:pile}", insertTextFormat: 2 })
        })
      })

      test("what the statement needs comes before what's deeper", async () => {
        await typed("set y ", (items) => {
          const sorted = [...items].sort((a, b) => a.sortText!.localeCompare(b.sortText!))
          expect(sorted[0]!.label).toBe("to")
        })
      })
    })

    describe("signature help, typed at the end of Solitaire.spell", () => {
      /** Signature help at the end of `line`:  its label, and the active parameter's text. */
      async function help(line: string, check: (help: { label?: string; active?: string } | null) => void) {
        await typedAtEnd(line, (position) => {
          const result = service.signatureHelp(solitaire, position)
          const signature = result?.signatures[0]
          const range = signature?.parameters?.[result!.activeParameter!]?.label as [number, number] | undefined
          check(result && { label: signature?.label, active: range && signature!.label.slice(...range) })
        })
      }

      test("after the method's first word => its first argument", async () => {
        await help("move ", (result) =>
          expect(result).toEqual({ label: "move (a card) to (a pile)", active: "(a card)" })
        )
      })

      test("while typing an argument => that argument", async () => {
        await help("move the top card of", (result) => expect(result?.active).toBe("(a card)"))
      })

      test("after an argument, before the next word => the NEXT argument", async () => {
        await help("move the top card of stock ", (result) => expect(result?.active).toBe("(a pile)"))
        await help("move the top card of stock to ", (result) => expect(result?.active).toBe("(a pile)"))
      })

      test("not in a method call => nothing", async () => {
        await help("set y ", (result) => expect(result).toBeNull())
      })

      test("a paren-free method:  its arguments are its `a <type>`s, as written", async () => {
        await withParenFreeMethod(async () => {
          await help("deal ", (result) =>
            expect(result).toEqual({ label: "deal a card onto a pile", active: "a card" })
          )
          await help("deal the top card of stock onto ", (result) => expect(result?.active).toBe("a pile"))
        })
      })

      test("...inside an expression too, where the call is an operand", async () => {
        await withParenFreeMethod(async () => {
          await help("set y to deal the top card of stock onto ", (result) =>
            expect(result).toEqual({ label: "deal a card onto a pile", active: "a pile" })
          )
        })
      })
    })

    describe("a paren-free method", () => {
      test("comes as a snippet, its placeholders named for its parameters", async () => {
        await withParenFreeMethod(() => {
          // on the empty line after it:  a method is only visible after its definition
          const after = solitaire.parseText.split("\n").length - 1
          const item = service
            .completion(solitaire, { line: after, character: 0 })
            .find(({ label }) => label === "deal a card onto a pile")
          expect(item).toMatchObject({ insertText: "deal ${1:card} onto ${2:pile}", insertTextFormat: 2 })
        })
      })

      test("its arguments' types are parameters, the words between them its name", async () => {
        await withParenFreeMethod(() => {
          // the line before the final newline
          const last = solitaire.parseText.split("\n").length - 1
          expect(describeTokens(solitaire, [last]).slice(0, 7)).toEqual([
            `${last}:0 "to" keyword`,
            `${last}:3 "deal" function declaration`,
            `${last}:8 "a" keyword`,
            `${last}:10 "card" parameter declaration`,
            `${last}:15 "onto" function declaration`,
            `${last}:20 "a" keyword`,
            `${last}:22 "pile" parameter declaration`
          ])
        })
      })
    })

    test("mid-statement:  names, but no statement starts", () => {
      const labels = service.completion(solitaire, at(solitaire, 87, "the bottom")).map(({ label }) => label)
      expect(labels).toEqual(expect.arrayContaining(["game", "stock", "card"]))
      expect(labels).not.toContain("to")
    })
  })

  describe("multi-word members", () => {
    // a getter named by several words -- `short` is on the identifier blacklist -- and a card's test reading it
    const added = [
      "the short colour of a card is: its color",
      "to test short colour",
      "\tthe card is a new card",
      "\tprint the short colour of the card"
    ]
    const text = `${cardText.trimEnd()}\n${added.join("\n")}\n`
    const lineOf = (line: string) => text.split("\n").indexOf(line) + 1
    const getterLine = lineOf(added[0]!)
    const readLine = lineOf(added[3]!)

    test("hover, on any of its words:  the property, as written", async () => {
      await withCardText(text, () => {
        expect(service.diagnostics(card)).toEqual([])
        for (const word of ["short", "colour"]) {
          const markdown = (service.hover(card, at(card, readLine, word))!.contents as { value: string }).value
          expect(markdown).toContain("property **short colour** of Card")
        }
      })
    })

    test("go to definition:  its words in the getter", async () => {
      await withCardText(text, () => {
        expect(service.definition(card, at(card, readLine, "colour"))).toEqual([
          {
            uri: cardUri,
            range: { start: { line: getterLine - 1, character: 4 }, end: { line: getterLine - 1, character: 16 } }
          }
        ])
      })
    })

    test("its type's hover lists it as written", async () => {
      await withCardText(text, () => {
        const markdown = (service.hover(card, at(card, 2, "card"))!.contents as { value: string }).value
        expect(markdown).toMatch(/properties: .*short colour/)
      })
    })

    test("completion after `the ` offers properties, as written", async () => {
      await typedAtEnd("print the ", (position) => {
        const properties = service
          .completion(solitaire, position)
          .filter(({ kind }) => kind === CompletionItemKind.Property)
          .map(({ label }) => label)
        expect(properties).toEqual(expect.arrayContaining(["short-suit", "direction", "pile"]))
      })
    })
  })

  describe("code lens", () => {
    test("one per type and method declared, on its name -- unresolved until asked", () => {
      const lenses = service.codeLens(card)
      const names = lenses.map(({ range }) =>
        card.parseText.split("\n")[range.start.line]!.slice(range.start.character, range.end.character)
      )
      expect(names).toEqual(expect.arrayContaining(["card", "turn (a card) face up"]))
      expect(lenses.every(({ command }) => command === undefined)).toBe(true)
    })

    test("resolved:  how many references, which show them when clicked", () => {
      const [lens] = service.codeLens(card).filter(({ range }) => range.start.line === at(card, 2, "card").line)
      const { command } = service.resolveCodeLens(card, lens!)
      expect(command!.title).toMatch(/^\d+ references$/)
      expect(command!.command).toBe(LSP.SpellLanguageService.SHOW_REFERENCES)
      const [uri, , locations] = command!.arguments as [string, Position, unknown[]]
      expect(uri).toBe(cardUri)
      expect(locations.length).toBe(Number(command!.title.split(" ")[0]))
    })
  })

  describe("semantic tokens delta", () => {
    test("nothing changed => no edits;  a change => edits, not every token again", async () => {
      const full = service.semanticTokens(card)
      const same = service.semanticTokensDelta(card, full.resultId!)
      expect(same).toMatchObject({ edits: [] })

      const original = card.contents!
      try {
        await workspace.update(cardUri, `${original.trimEnd()}\nprint 1`)
        const changed = service.semanticTokensDelta(card, (same as { resultId: string }).resultId)
        expect("edits" in changed && changed.edits.length).toBeGreaterThan(0)
        const sent = (changed as { edits: Array<{ data?: number[] }> }).edits.flatMap(({ data = [] }) => data).length
        expect(sent).toBeLessThan(full.data.length)
      } finally {
        await workspace.update(cardUri, original)
      }
    })

    test("an unknown previous result => all the tokens", () => {
      expect(service.semanticTokensDelta(card, "nope")).toHaveProperty("data")
    })
  })

  describe("code actions", () => {
    /** Quick fixes for the last line of Solitaire.spell, typed as `line`, and the text with the first applied. */
    async function fixes(line: string, check: (titles: string[], fixed: string | undefined) => Promise<void> | void) {
      const original = solitaire.contents!
      const text = `${original.trimEnd()}\n${line}`
      try {
        await workspace.update(solitaireUri, text)
        const last = text.split("\n").length - 1
        const range = { start: { line: last, character: 0 }, end: { line: last, character: line.length } }
        const actions = service.codeActions(solitaire, range)
        const edits = actions[0]?.edit?.changes?.[solitaireUri]
        await check(
          actions.map(({ title }) => title),
          edits && applyEdits(text, edits)
        )
      } finally {
        await workspace.update(solitaireUri, original)
      }
    }

    test("a line that didn't parse => define a method it would call, its expressions as parameters", async () => {
      await fixes("juggle the deck 3 times", (titles) => {
        expect(titles).toEqual(["Define `to juggle a deck (number) times`"])
      })
    })

    test("...which goes above the line's top-level statement, and makes the line parse", async () => {
      await fixes("juggle the deck 3 times", async (_titles, fixed) => {
        expect(fixed).toMatch(/\nto juggle a deck \(number\) times:\n\t\/\/ TODO\n\njuggle the deck 3 times$/)
        await workspace.update(solitaireUri, fixed!)
        expect(service.diagnostics(solitaire)).toEqual([])
      })
    })

    test("a statement that parsed, with words left over => the statement AND its leftovers", async () => {
      // `shuffle the deck` is the built-in `shuffle {list}`, leaving `3 times`
      await fixes("shuffle the deck 3 times", async (titles, fixed) => {
        expect(titles).toEqual(["Define `to shuffle a deck (number) times`"])
        await workspace.update(solitaireUri, fixed!)
        expect(service.diagnostics(solitaire)).toEqual([])
      })
    })

    test("...an inline body's statement too, NOT the line's", async () => {
      await fixes("if stock: shuffle the deck 3 times", async (titles, fixed) => {
        expect(titles).toEqual(["Define `to shuffle a deck (number) times`"])
        await workspace.update(solitaireUri, fixed!)
        expect(service.diagnostics(solitaire)).toEqual([])
      })
    })

    test("NOT for a line that's just unfinished", async () => {
      await fixes("set y to", (titles) => expect(titles).toEqual([]))
    })
  })

  describe("formatting", () => {
    const tabs = { tabSize: 4, insertSpaces: false }

    test("every Solitaire file compiles the same after formatting, and a second format changes nothing", async () => {
      for (const name of ["Card.spell", "Deck.spell", "Pile.spell", "Solitaire.spell"]) {
        const uri = pathToFileURL(resolve(dir, "Solitaire", name)).href
        const file = workspace.fileFor(uri)!
        const original = file.contents!
        const compiled = withoutPositions(service.compiled(file))
        const formatted = applyEdits(original, service.formatting(file, tabs))
        await withText(uri, original, formatted, () => {
          expect(service.diagnostics(file), name).toEqual([])
          // Blank lines compile as they're written, and one with a tab on it belongs to the block it's indented
          // into -- so without the tab, a blank line can move in the javascript.  The code itself can't change.
          expect(withoutPositions(service.compiled(file)), name).toBe(compiled)
          expect(service.formatting(file, tabs), name).toEqual([])
        })
      }
    })

    test("one edit per changed line", () => {
      const edits = service
        .formatting(card, tabs)
        .map(({ range, newText }) => `${range.start.line + 1}: ${JSON.stringify(newText)}`)
      expect(edits).toEqual([
        // a tab alone on a blank line
        '51: ""',
        // trailing spaces
        '60: "to turn (a card) face up:"',
        '63: "to turn (a card) face down:"',
        // a tab between two words
        expect.stringMatching(/^75: "\\tset className to \\"Card face-\\" \+ its direction \+ \\" \\" \+ its rank/),
        '76: "\\tif it is face down"'
      ])
    })

    test("a range formats only the lines it touches", () => {
      const range = { start: { line: 74, character: 0 }, end: { line: 74, character: 5 } }
      expect(service.formatting(card, tabs, range).map(({ range }) => range.start.line + 1)).toEqual([75])
    })

    test("tabs, even if the editor says spaces", () => {
      // the whole body of `to turn (a card) face up`, indented with spaces
      const spaced = card.contents!.replace("\tset its direction to up\n\tpause", "  set its direction to up\n  pause")
      return withText(cardUri, cardText, spaced, () => {
        const edits = service.formatting(card, { tabSize: 2, insertSpaces: true })
        expect(edits.find(({ range }) => range.start.line === 60)?.newText).toBe("\tset its direction to up")
      })
    })
  })

  test("custom requests:  compiled javascript, and the project's files", () => {
    expect(service.compiled(card)).toContain("export class Card extends Thing {\n")
    expect(service.projectInfo(card).files.map(({ file, errors }) => `${file} ${errors}`)).toEqual([
      "Card.spell 0",
      "Deck.spell 0",
      "Pile.spell 0",
      "Solitaire.spell 0"
    ])
  })

  test("closing a file puts it back to what's on disk", async () => {
    await workspace.update(cardUri, `${cardText}\nfoo bar baz`)
    expect(service.diagnostics(card)).toHaveLength(1)
    await workspace.close(cardUri)
    expect(card.contents).toBe(cardText)
    expect(service.diagnostics(card)).toEqual([])
  })

  /** Run `check` with `to deal a card onto a pile` added to the end of Solitaire.spell, then ALWAYS take it out. */
  async function withParenFreeMethod(check: () => void | Promise<void>) {
    const original = solitaire.contents!
    try {
      await workspace.update(solitaireUri, `${original.trimEnd()}\nto deal a card onto a pile: print 1\n`)
      await check()
    } finally {
      await workspace.update(solitaireUri, original)
    }
  }

  /** Run `check` with Card.spell's open text set to `text`, then ALWAYS put the original back. */
  function withCardText(text: string, check: (changed: SP.SpellFile[]) => void) {
    return withText(cardUri, cardText, text, check)
  }

  /** Run `check` with document `uri`'s open text set to `text`, then ALWAYS put back `original`. */
  async function withText(uri: string, original: string, text: string, check: (changed: SP.SpellFile[]) => void) {
    try {
      check(await workspace.update(uri, text))
    } finally {
      await workspace.update(uri, original)
    }
  }

  /**
   * `file`'s semantic tokens on 1-based `lines` (all if not given), as `line:character "text" type modifiers...`.
   * - Decodes the protocol's relative encoding, so a snapshot reads as the file does.
   */
  function describeTokens(file: SP.SpellFile, lines?: number[], range?: Range): string[] {
    const { tokenTypes, tokenModifiers } = LSP.SpellLanguageService.TOKEN_LEGEND
    const { data } = service.semanticTokens(file, range) as SemanticTokens
    const text = file.parseText.split("\n")
    const tokens: string[] = []
    let line = 0
    let character = 0
    for (let index = 0; index < data.length; index += 5) {
      const [deltaLine, deltaChar, length, type, modifierBits] = data.slice(index, index + 5) as number[]
      line += deltaLine!
      character = deltaLine ? deltaChar! : character + deltaChar!
      if (lines && !lines.includes(line + 1)) continue
      const modifiers = tokenModifiers.filter((_, bit) => modifierBits! & (1 << bit))
      const word = JSON.stringify(text[line]!.slice(character, character + length!))
      tokens.push([`${line + 1}:${character} ${word} ${tokenTypes[type!]}`, ...modifiers].join(" "))
    }
    return tokens
  }
})

/** Position of the `nth` (0-based) `word` on 1-based `line` of `file`. */
function at(file: SP.SpellFile, line: number, word: string, nth = 0): Position {
  const text = file.parseText.split("\n")[line - 1]!
  let character = -1
  for (let count = 0; count <= nth; count++) character = text.indexOf(word, character + 1)
  if (character < 0) throw new Error(`No '${word}' on line ${line} of ${file.file}`)
  return { line: line - 1, character }
}

/** `text` without blank lines, or whitespace at the end of any line. */
function withoutBlankLines(text: string): string {
  return text
    .split("\n")
    .map((line) => line.trimEnd())
    .filter(Boolean)
    .join("\n")
}

/**
 * `compiled` without blank lines, nor where each declaring statement is -- its `SPELL: DECLARES` comment's
 * `line` / `defined` line, which formatting moves.
 */
function withoutPositions(compiled: string): string {
  // `line: 9, defined: "/Card.spell:222-283",` -- or either alone
  return withoutBlankLines(compiled.replace(/^ *(line|defined): .*$/gm, ""))
}

/** `text` with `edits` applied -- edits must not overlap. */
function applyEdits(text: string, edits: TextEdit[]): string {
  const lineStarts = [0, ...[...text.matchAll(/\n/g)].map(({ index }) => index + 1)]
  const offsetOf = ({ line, character }: Position) => lineStarts[line]! + character
  return [...edits]
    .sort((a, b) => offsetOf(b.range.start) - offsetOf(a.range.start))
    .reduce(
      (result, { range, newText }) =>
        result.slice(0, offsetOf(range.start)) + newText + result.slice(offsetOf(range.end)),
      text
    )
}

/** `name (Kind)`, then its children indented -- a compact outline to snapshot. */
function describeSymbol({ name, kind, children }: DocumentSymbol): string {
  const kindName = Object.entries({ Class: 5, Method: 6, Property: 7, Function: 12, Variable: 13, Event: 24 }).find(
    ([, value]) => value === kind
  )?.[0]
  const nested = children?.map((child) => `\n  ${describeSymbol(child).replace(/\n/g, "\n  ")}`).join("") ?? ""
  return `${name} (${kindName ?? kind})${nested}`
}
