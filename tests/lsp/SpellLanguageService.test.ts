import { describe, test, expect, beforeAll } from "vite-plus/test"
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import { resolve } from "path"
import { pathToFileURL } from "url"
import {
  CompletionItemKind,
  DiagnosticSeverity,
  type CompletionItem,
  type DocumentSymbol,
  type Position,
  type Range,
  type SelectionRange,
  type SemanticTokens,
  type TextEdit
} from "vscode-languageserver"

import { SP } from "spell-parser/spell"
import { LSP } from "spell-app/lsp"
import { SpellDiskWorkspace } from "spell-app/lsp/SpellDiskWorkspace"
import environment from "spell-app/spaces/server/node/environment"
import { fixtureFolder, lineOf } from "spell-app/spaces/test"

/**
 * The language service over a real project:  a temp copy of the Solitaire example, its cards, deck and piles too,
 * in CODE spell (`copySolitaireAsCodeSpell()`),
 * so edits and `project.json` syncing never touch the repo, and its `@local/<folder>` project is ours alone.
 * - Code spell, as the editor's features here are code spell's:  appending a line, comments, formatting, quick fixes.
 *   The example itself is spellx;  its code-spell twin, the same program, is the spellx pair test's fixture.
 * - The card, deck and piles are outlines;  Solitaire's play, `to play a card`, is a sentence.
 * - Lines are 1-based, as an editor shows them.
 * - The tests name a line of the example by what it says (`lineOf()`, `at()`), never by its number:
 *   the example is Owen's, and changes.
 */
describe("SpellLanguageService", () => {
  const dir = mkdtempSync(resolve(tmpdir(), "spell-lsp-"))
  copySolitaireAsCodeSpell(resolve(dir, "Solitaire"))
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
  /** Card.spell's line declaring the card's type:  `a "card" is a two sided view:`. */
  const CARD_TYPE = 'a "card" is'
  /** Where Card.spell's type names its card:  `"card"` in `a "card" is a two sided view:`, 0-based. */
  const CARD_NAME = rangeAt(cardText, CARD_TYPE, '"card"')
  /** The card's click handler, in Solitaire.spell's `a card:`:  a call of a method of the card's, `play`, on `it`. */
  const IT_CALL = "- on click: play it"
  /** Card.spell's line declaring the card's suit, a property whose values it lists. */
  const SUIT = '- its "suit" is one of'
  /** Card.spell's line declaring the card's symbol, which its `state` reads. */
  const SYMBOL = '- its "symbol" is'
  /** The last line of `- its "state" is:`'s body, reading its symbol. */
  const READ_SYMBOL = "return rank + its symbol + direction"
  /** Solitaire.spell's declaration of a method of the solitaire's own. */
  const OWN_METHOD = "- to reset the stock:"
  /** ...and a call to it, in `- animation play from the stock:`. */
  const OWN_CALL = "wait for: reset the stock"
  /** Solitaire.spell's lines naming the variable `cards`, in `- to reset the stock:`:  it's set, then read twice. */
  const RESET_CARDS = ["set cards to", "reverse the cards", "for each card in the cards"] as const
  /** A card, as Solitaire.spell's last line can name one. */
  const TOP_CARD = "the last card of the stock of solitaire"

  beforeAll(async () => {
    const changed = await workspace.update(cardUri, cardText)
    card = workspace.fileFor(cardUri)!
    deck = workspace.fileFor(deckUri)!
    solitaire = workspace.fileFor(solitaireUri)!
    expect(changed.map((file) => file.file)).toEqual(["Card.spell", "Deck.spell", "Pile.spell", "Solitaire.spell"])
  })

  test("opening a file parses its whole project, cleanly -- bar warnings of what it never says", () => {
    const warnings: string[] = []
    for (const file of card.project.spellFiles) {
      expect(file.match, file.path).toBeDefined()
      expect(errorsIn(service, file), file.path).toEqual([])
      for (const { message } of service.diagnostics(file)) {
        warnings.push(`${file.file}:  ${typeof message === "string" ? message : message.value}`)
      }
    }
    expect(warnings).toEqual([])
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

    test("a property with no type gets a WARNING under its statement, asking for one -- and none once it says", async () => {
      await withCardText(`${cardText}\na card has a nickname`, () => {
        const lastLine = cardText.split("\n").length
        expect(service.diagnostics(card)).toEqual([
          {
            range: { start: { line: lastLine, character: 0 }, end: { line: lastLine, character: 21 } },
            severity: DiagnosticSeverity.Warning,
            source: "spell",
            message: `Say what "nickname" is, e.g. "a card has a nickname as text"`
          }
        ])
      })
      await withCardText(`${cardText}\na card has a nickname as text`, () => {
        expect(service.diagnostics(card)).toEqual([])
      })
    })

    test("an error inside JSX `{...}` sits on its text", async () => {
      const bad = "its picture bogus"
      const broken = cardText.replace("{its picture}", `{${bad}}`)
      await withCardText(broken, () => {
        const start = broken.indexOf(bad)
        expect(service.diagnostics(card).map(({ range }) => range)).toEqual([
          { start: service.positionAt(card, start), end: service.positionAt(card, start + bad.length) }
        ])
      })
    })

    // known gap, epic `elemental-spell` I10:  a two sided view's half-typed kind re-parses every later file
    test.fails("a half-typed declaration keeps its last good version, so later files don't change", async () => {
      await withCardText(
        cardText.replace('a "card" is a two sided view:', 'a "card" is a two sided vew:'),
        (changed) => {
          expect(changed).toEqual([card])
          expect(service.diagnostics(card)).toHaveLength(1)
        }
      )
    })

    test("changing a declaration re-parses the files after it", async () => {
      await withCardText(
        cardText.replace('a "card" is a two sided view', 'a "kard" is a two sided view'),
        (changed) => {
          expect(changed.map((file) => file.file)).toEqual([
            "Card.spell",
            "Deck.spell",
            "Pile.spell",
            "Solitaire.spell"
          ])
        }
      )
    })
  })

  describe("test results (spell/testDiagnostics)", () => {
    /** What `core.expect()` printed for `what` that should be `expected`, failing. */
    const failed = (what: string, expected: string, actual: string) =>
      `Unexpected: \`${what}\` should be \`${expected}\` but is actually \`${actual}\``

    test("a failed check is an error on the line that says it, with what it printed", () => {
      const message = failed("it is the queen of spades", "yes", "false")
      const answer = service.testDiagnostics(card.project, [
        {
          name: "test card setup",
          method: "testCardSetup",
          passed: false,
          failures: [{ what: "it is the queen of spades", expected: "yes", message, occurrence: 0 }]
        }
      ])
      // every file of the project, so one whose tests now pass is cleared
      expect(answer.map(({ uri }) => uri)).toEqual(card.project.spellFiles.map((file) => workspace.uriFor(file)))
      const [diagnostic, ...others] = answer.flatMap(({ diagnostics }) => diagnostics)
      expect(others).toEqual([])
      expect(answer.find(({ uri }) => uri === cardUri)?.diagnostics).toEqual([diagnostic])
      // under its text, after the tabs it's indented by
      const text = "it is the queen of spades should be yes"
      const line = lineOf(cardText, text) - 1
      const indent = cardText.split("\n")[line]!.indexOf(text)
      expect(diagnostic).toEqual({
        range: { start: { line, character: indent }, end: { line, character: indent + text.length } },
        severity: DiagnosticSeverity.Error,
        source: "spell test",
        message
      })
    })

    test("a check its test says twice is found by which time it ran", () => {
      // the deck's count, before and after it's shuffled
      const what = "the number of cards in the deck"
      const failures = [0, 1].map((occurrence) => ({
        what,
        expected: "52",
        message: failed(what, "52", "51"),
        occurrence
      }))
      const test = { name: "test a new deck", method: "testANewDeck", passed: false, failures }
      const [{ diagnostics }] = service.testDiagnostics(card.project, [test]).filter(({ uri }) => uri === deckUri)
      const written = `${what} should be 52`
      expect(diagnostics.map(({ range }) => range.start.line + 1)).toEqual([
        lineOf(deck.parseText, written, 0),
        lineOf(deck.parseText, written, 1)
      ])
    })

    test("a test that threw is an error on its `to test` line;  a test it can't find, or one that passed, on none", () => {
      const threw = 'Error in test "test card setup": oops'
      const answer = service.testDiagnostics(card.project, [
        { name: "test card setup", method: "testCardSetup", passed: false, failures: [], threw },
        { name: "test a new deck", method: "testANewDeck", passed: true, failures: [] },
        { name: "test elsewhere", method: "testElsewhere", passed: false, failures: [], threw: "gone" }
      ])
      const diagnostics = answer.flatMap(({ diagnostics }) => diagnostics)
      expect(diagnostics.map(({ range, message }) => [range.start.line + 1, message])).toEqual([
        [lineOf(cardText, "- to test card setup:"), threw]
      ])
    })
  })

  describe("structure", () => {
    test("folding ranges", () => {
      const folds = service
        .foldingRanges(card)
        .map(({ startLine, endLine, kind }) => `${startLine + 1}-${endLine + 1}${kind ? ` ${kind}` : ""}`)
      /** `first` line to `last` of `text`, as `folds` says it, e.g. `16-18`. */
      const fold = (first: string, last: string, kind = "", text = cardText) =>
        `${lineOf(text, first)}-${lineOf(text, last)}${kind && ` ${kind}`}`
      // `- its "color" is ...:` + its body
      expect(folds).toContain(fold('- its "color" is one of red, black:', "black otherwise"))
      // `- to draw its front:` + its body
      expect(folds).toContain(fold("- to draw its front:", "<ui-text color={its color}>"))
      // the file's docstring:  its heading and the comments under it
      expect(folds).toContain(fold("# A playing card", "// On the page", "comment"))
      expect(folds).toMatchSnapshot()
      // a method with multi-line JSX:  the solitaire's `- to draw it:`, and its JSX
      const solitaireFolds = service
        .foldingRanges(solitaire)
        .map(({ startLine, endLine, kind }) => `${startLine + 1}-${endLine + 1}${kind ? ` ${kind}` : ""}`)
      expect(solitaireFolds).toContain(fold("- to draw it:", "</ui-container>", "", solitaire.parseText))
      expect(solitaireFolds).toContain(fold("<ui-container>", "</ui-container>", "", solitaire.parseText))
    })

    test("document symbols:  properties and methods nest under their type", () => {
      const outline = service.documentSymbols(card).map(describeSymbol)
      expect(outline[0]).toMatch(/^Card \(Class\)/)
      expect(outline).toMatchSnapshot()
    })

    test("a symbol's selection range is its name", () => {
      const [cardType] = service.documentSymbols(card)
      expect(cardType!.selectionRange).toEqual(CARD_NAME)
    })

    test("workspace symbols find declarations across the project", () => {
      const found = service
        .workspaceSymbols("pile")
        .map(({ name, location }) => `${name} in ${location.uri.split("/").pop()}`)
      expect(found).toContain("Pile in Pile.spell")
    })

    test("selection ranges grow from the word at the cursor out to the whole file", () => {
      // on `suit` in `- its "suit" is one of clubs, ...`
      const position: Position = at(card, SUIT, "suit")
      const [selection] = service.selectionRanges(card, [position])
      const texts: string[] = []
      for (let at: SelectionRange | undefined = selection; at; at = at.parent) {
        const start = service.offsetAt(card, at.range.start)
        texts.push(card.parseText.slice(start, service.offsetAt(card, at.range.end)))
      }
      expect(texts[0]).toBe('"suit"')
      // the statement, without its outline's `- `, with the bullet nested under it, `- it "is a (suit)"`
      const [statement, nested] = card.parseText.split("\n").slice(position.line, position.line + 2)
      expect(texts).toContain(`${statement!.trim().replace(/^- /, "")}\n${nested}`)
      expect(texts.at(-1)).toBe(card.parseText)
    })
  })

  describe("highlighting", () => {
    test("semantic tokens", () => {
      const lines = [
        // a declaration
        CARD_TYPE,
        // properties, their values listed
        '- its "rank" is one of',
        SUIT,
        // a quoted phrase, and its condition
        '- it "is a face card" if',
        // a method definition, JSX, a property read, a handler's call
        "- to draw its front:",
        "<ui-text color={its color}>",
        READ_SYMBOL
      ].map((line) => lineOf(cardText, line))
      expect(describeTokens(card, lines)).toMatchSnapshot()
    })

    test("a declared name, a built-in type, and calls to the project's own methods", () => {
      /** `file`'s tokens on the lines starting `lines`. */
      const tokensOf = (file: SP.SpellFile, lines: string[]) =>
        describeTokens(
          file,
          lines.map((line) => lineOf(file.parseText, line))
        )
      /** `word` on `line` of `file`, as `describeTokens()` says it, with token `type` and its modifiers. */
      const token = (file: SP.SpellFile, line: string, word: string, type: string) => {
        const { line: index, character } = at(file, line, word)
        return `${index + 1}:${character} ${JSON.stringify(word)} ${type}`
      }
      const cardTokens = tokensOf(card, [CARD_TYPE])
      expect(cardTokens).toContain(token(card, CARD_TYPE, '"card"', "type declaration"))
      expect(cardTokens).toContain(token(card, CARD_TYPE, "view", "type defaultLibrary"))
      const solitaireTokens = tokensOf(solitaire, [OWN_METHOD, OWN_CALL, IT_CALL])
      expect(solitaireTokens).toContain(token(solitaire, IT_CALL, "it", "variable"))
      expect(solitaireTokens).toContain(token(solitaire, OWN_METHOD, "reset", "function declaration"))
      expect(solitaireTokens).toContain(token(solitaire, OWN_CALL, "reset", "function"))
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

    test("markdown in a comment:  bold / italic / link modifiers, code spans as strings", async () => {
      //                     0123456789012345678901234567890
      await withCardText(`// a **b** *c* \`d\` [e](f)\n${cardText}`, () => {
        const pieces = service
          .highlightSpans(card)
          .filter((span) => span.start < 26)
          .map((span) => {
            const marks = (["bold", "italic", "link"] as const).filter((mark) => span[mark])
            return `${card.parseText.slice(span.start, span.end)}:${span.kind}${marks.map((mark) => `+${mark}`).join("")}`
          })
        expect(pieces).toEqual([
          "// a :comment",
          "**b**:comment+bold",
          " :comment",
          "*c*:comment+italic",
          " :comment",
          "`d`:string",
          " :comment",
          "[e](f):comment+link"
        ])
        // ...`bold` sent as modifier bit 64
        const { data } = service.semanticTokens(card)
        expect(data[5 + 4]).toBe(64)
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
      const hover = service.hover(deck, at(deck, 'a "deck" is', "card"))
      const markdown = (hover!.contents as { value: string }).value
      expect(markdown).toContain("template **Card** is a TwoSidedView")
      expect(markdown).toContain(`[Card.spell:${lineOf(cardText, CARD_TYPE)}]`)
    })

    test("on a method call:  its signature, and the javascript it becomes", () => {
      const markdown = (service.hover(solitaire, at(solitaire, OWN_CALL, "reset"))!.contents as { value: string }).value
      expect(markdown).toContain("action **reset the stock**")
      expect(markdown).toContain("compiles to `resetTheStock()`")
      expect(markdown).toContain("```js\nawait this.resetTheStock()\n```")
    })

    test("a declaration's docstring, just under its name", () => {
      // `// A column, ...` is directly above `a "tableau" is a pile:`
      const position = at(solitaire, 'a "tableau" is', "tableau")
      const markdown = (service.hover(solitaire, position)!.contents as { value: string }).value
      expect(markdown).toContain(
        "template **Tableau** is a Pile\n\nA column, built down from king to ace, red and black in turn\n\n"
      )
    })

    test("nothing on a blank line", () => {
      // between the file's docstring and the card's outline, 0-based
      expect(service.hover(card, { line: lineOf(cardText, CARD_TYPE) - 2, character: 0 })).toBeNull()
    })
  })

  describe("navigation", () => {
    test("definition of a type, from another file", () => {
      expect(service.definition(deck, at(deck, 'a "deck" is', "card"))).toEqual([{ uri: cardUri, range: CARD_NAME }])
    })

    test("definition of a method, from a call", () => {
      const [location] = service.definition(solitaire, at(solitaire, OWN_CALL, "reset"))
      expect(location!.range.start).toEqual(at(solitaire, OWN_METHOD, "reset"))
    })

    test("type definition of a method's `it`:  the type the method is on", () => {
      const [location] = service.typeDefinition(solitaire, at(solitaire, IT_CALL, "it"))
      expect(location).toEqual({ uri: cardUri, range: CARD_NAME })
    })

    test("definition of a property, from `its ...`:  exactly where its type declares it", () => {
      expect(service.definition(card, at(card, READ_SYMBOL, "symbol"))).toEqual([
        { uri: cardUri, range: rangeAt(card, SYMBOL, '"symbol"') }
      ])
      const markdown = (service.hover(card, at(card, READ_SYMBOL, "symbol"))!.contents as { value: string }).value
      expect(markdown).toContain("property **symbol** of Card")
    })

    test("references to a property skip a same-named property of another type", () => {
      const declared = '- its "name" is'
      const lines = (uri: string) =>
        service
          .references(card, at(card, declared, "name"))
          .filter((location) => location.uri === uri)
          .map(({ range }) => range.start.line + 1)
      // `its name should be ...` in Card's test
      expect(lines(cardUri)).toEqual(
        expect.arrayContaining([lineOf(cardText, declared), lineOf(cardText, "its name should be")])
      )
      // a pile's state reads `its name`, which is a pile's, not a card's
      const pileUri = pathToFileURL(resolve(dir, "Solitaire/Pile.spell")).href
      const pileText = readFileSync(resolve(dir, "Solitaire/Pile.spell"), "utf8")
      expect(lines(pileUri)).not.toContain(lineOf(pileText, 'set state to (its name or "pile")'))
    })

    test("references to a property, across files", () => {
      // the card's rank, set in Deck.spell;  Pile's and Solitaire's tests make cards `whose rank is ...`
      const read = at(deck, "add a new card with rank", "rank")
      const files = service.references(deck, read).map(({ uri }) => uri.split("/").pop())
      expect(new Set(files)).toEqual(new Set(["Card.spell", "Deck.spell", "Pile.spell", "Solitaire.spell"]))
    })

    test("document highlights:  the declaration writes, the rest read", () => {
      // `cards`, in Solitaire's `- to reset the stock:`
      const highlights = service
        .documentHighlights(solitaire, at(solitaire, RESET_CARDS[0], "cards"))
        .map(({ range, kind }) => `${range.start.line + 1}:${range.start.character} ${kind}`)
      /** Where `cards` is on `line`, as `highlights` says it, with its kind:  3 writes, 2 reads. */
      const highlight = (line: string, kind: number) => {
        const { line: index, character } = at(solitaire, line, "cards")
        return `${index + 1}:${character} ${kind}`
      }
      expect(highlights).toEqual([
        highlight(RESET_CARDS[0], 3),
        highlight(RESET_CARDS[1], 2),
        highlight(RESET_CARDS[2], 2)
      ])
    })

    test("rename a variable everywhere, and the project still parses the same", async () => {
      const position = at(solitaire, RESET_CARDS[0], "cards")
      expect(service.prepareRename(solitaire, position)).toMatchObject({ placeholder: "cards" })
      const edit = service.rename(solitaire, position, "stack")!
      const edits = edit.changes![solitaireUri]!
      expect(edits.map(({ range }) => range.start.line + 1)).toEqual(
        RESET_CARDS.map((line) => lineOf(solitaire.parseText, line))
      )
      const renamed = applyEdits(solitaire.parseText, edits)
      expect(renamed).toContain("\t\tset stack to a copy of list (its discards) as a pile\n\t\treverse the stack\n")
      await withText(solitaireUri, solitaire.parseText, renamed, () => {
        expect(errorsIn(service, solitaire)).toEqual([])
      })
    })

    test("won't rename `it`, a property, or a type written in more than one way", () => {
      expect(service.prepareRename(solitaire, at(solitaire, IT_CALL, "it"))).toBeNull()
      expect(service.prepareRename(card, at(card, READ_SYMBOL, "symbol"))).toBeNull()
      expect(service.prepareRename(card, at(card, CARD_TYPE, "card"))).toBeNull()
      expect(service.rename(solitaire, at(solitaire, RESET_CARDS[0], "cards"), "not a word")).toBeNull()
    })
  })

  test("javascript names show on hover only, not inline:  a numbered `it`, and a method's name", async () => {
    const hover = (file: SP.SpellFile, position: Position) =>
      (service.hover(file, position)!.contents as { value: string }).value
    // two `get`s in one test:  the second's `it` is `it_2`
    const tested = `${cardText.trimEnd()}\nto test two gets\n\tget a new deck\n\tget a new card\n\tturn it over\n`
    await withCardText(tested, () => {
      const last = tested.trimEnd().split("\n").length
      expect(hover(card, at(card, last, "it"))).toContain("variable **it**: Card · as `it_2`")
    })
    // the signature of `- to reset the stock`
    expect(hover(solitaire, at(solitaire, OWN_METHOD, "reset"))).toContain("compiles to `resetTheStock()`")
  })

  test("hover says what a variable holds:  an argument, a loop's item, `it`", () => {
    const hover = (file: SP.SpellFile, position: Position) =>
      (service.hover(file, position)!.contents as { value: string }).value
    // a stock pile's `- it can give up a card if: the card is its last card`
    const givesUp = "- it can give up a card if: the card is its last card"
    expect(hover(solitaire, at(solitaire, givesUp, "card", 1))).toContain("variable **card**: Card · argument")
    // `for each card in the cards` / `add it to the stock of the solitaire`:  the loop's item
    expect(hover(solitaire, at(solitaire, "add it to the stock of the solitaire", "it"))).toContain(
      "variable **it**: Card"
    )
    // `- on click: play it`
    expect(hover(solitaire, at(solitaire, IT_CALL, "it"))).toContain("variable **it**: Card")
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
    /** The blank line above Solitaire.spell's `## The piles`, after the card's moves:  0-based. */
    const afterClick = () => ({ line: lineOf(solitaire.parseText, "## The piles") - 2, character: 0 })

    test("at the start of a statement:  names, statement starts, and the project's methods", () => {
      const labels = service.completion(solitaire, afterClick()).items.map(({ label }) => label)
      expect(labels).toEqual(expect.arrayContaining(["to", "if", "set", "card", "deck", "solitaire", "clubs"]))
      expect(labels).toContain("play from the stock")
      // a local of `to put a card on a pile`, above:  not out here
      expect(labels).not.toContain("start pile")
    })

    test("with docstrings", () => {
      const items = service.completion(solitaire, afterClick()).items
      const docs = (label: string) =>
        (items.find((item) => item.label === label)?.documentation as { value: string })?.value
      expect(docs("play a card")).toBe(
        "the card, and every card on it, onto the first pile that takes it;  it says whether it moved\n" +
          "- the stock's card turns over onto the discards instead"
      )
      expect(docs("deal the cards")).toBe(
        "gather every card into the stock, shuffle it, and deal the tableaus:  one card more in each, left to right"
      )
    })

    test("a method comes as a snippet, with its arguments' names", () => {
      const item = service.completion(solitaire, afterClick()).items.find(({ label }) => label === "play a card")
      expect(item).toMatchObject({ insertText: "play ${1:card}", insertTextFormat: 2 })
    })

    describe("what can come next, typed at the end of Solitaire.spell", () => {
      /** Completions at the end of `line`, typed as a new last line of Solitaire.spell. */
      async function typed(line: string, check: (items: CompletionItem[]) => void) {
        await typedAtEnd(line, (position) => check(service.completion(solitaire, position).items))
      }
      const labels = (items: CompletionItem[]) => items.map(({ label }) => label)

      test("typing a JSX tag, `<div><chi` => spell's own tags:  `children`, its word for `<slot>`", async () => {
        await typed("print <div><chi", (items) => {
          expect(items).toEqual([expect.objectContaining({ label: "children", detail: "spell's word for <slot>" })])
        })
        // a comparison isn't a tag
        await typed("if 1 < 2", (items) => expect(labels(items)).not.toContain("children"))
      })

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

      test("`if solitaire ` => `then`, but NO operators;  `if solitaire a` => `and`", async () => {
        await typed("if solitaire ", (items) => {
          expect(labels(items)).toContain("then")
          expect(labels(items)).not.toContain("and")
          expect(labels(items)).not.toContain("is")
        })
        await typed("if solitaire a", (items) => expect(labels(items)).toContain("and"))
      })

      test("partway through a call to a method => the rest of it, as a snippet", async () => {
        await withParenFreeMethod(async () => {
          await typed(`deal ${TOP_CARD} `, (items) => {
            const rest = items.find(({ detail }) => detail === "deal a card onto a pile")
            expect(rest).toMatchObject({ insertText: "onto ${1:pile}", insertTextFormat: 2 })
          })
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
        await help("play ", (result) => expect(result).toEqual({ label: "play a card", active: "a card" }))
      })

      test("while typing an argument => that argument", async () => {
        await withParenFreeMethod(async () => {
          await help("deal the last card of", (result) => expect(result?.active).toBe("a card"))
        })
      })

      test("after an argument, before the next word => the NEXT argument", async () => {
        await withParenFreeMethod(async () => {
          await help(`deal ${TOP_CARD} `, (result) => expect(result?.active).toBe("a pile"))
          await help(`deal ${TOP_CARD} onto `, (result) => expect(result?.active).toBe("a pile"))
        })
      })

      test("not in a method call => nothing", async () => {
        await help("set y ", (result) => expect(result).toBeNull())
      })

      test("a paren-free method:  its arguments are its `a <type>`s, as written", async () => {
        await withParenFreeMethod(async () => {
          await help("deal ", (result) =>
            expect(result).toEqual({ label: "deal a card onto a pile", active: "a card" })
          )
          await help(`deal ${TOP_CARD} onto `, (result) => expect(result?.active).toBe("a pile"))
        })
      })

      test("...inside an expression too, where the call is an operand", async () => {
        await withParenFreeMethod(async () => {
          await help(`set y to deal ${TOP_CARD} onto `, (result) =>
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
            .items.find(({ label }) => label === "deal a card onto a pile")
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
      // in `to put a card on a pile`'s `set points to count the points for the card on the pile`
      const position = at(solitaire, "set points to count the points for the card on the pile", "count")
      const labels = service.completion(solitaire, position).items.map(({ label }) => label)
      expect(labels).toEqual(expect.arrayContaining(["solitaire", "start-pile", "card"]))
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
    const getterLine = lineOf(text, added[0]!)
    const readLine = lineOf(text, added[3]!.trim())

    test("hover, on any of its words:  the property, as written", async () => {
      await withCardText(text, () => {
        expect(errorsIn(service, card)).toEqual([])
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
        const markdown = (service.hover(card, at(card, CARD_TYPE, "card"))!.contents as { value: string }).value
        expect(markdown).toMatch(/properties: .*short colour/)
      })
    })

    test("completion after `the ` offers properties, as written", async () => {
      // in Solitaire.spell, with the card's getter
      await withCardText(text, () =>
        typedAtEnd("print the ", (position) => {
          const properties = service
            .completion(solitaire, position)
            .items.filter(({ kind }) => kind === CompletionItemKind.Property)
            .map(({ label }) => label)
          expect(properties).toEqual(expect.arrayContaining(["short colour", "direction", "pile"]))
        })
      )
    })
  })

  describe("built-in members (from `SP.BUILT_IN_TYPE_TABLE`)", () => {
    // a text's `length`, a list's `length`, and a built-in rule which spells a list's member
    const added = [
      'set the title to "Solitaire"',
      "print the length of the title",
      "set the hand to a new list",
      "shuffle the hand"
    ]
    const text = `${cardText.trimEnd()}\n${added.join("\n")}\n`

    test("hover on a member:  which type's it is, what it is, and its docs", async () => {
      await withCardText(text, () => {
        expect(errorsIn(service, card)).toEqual([])
        const markdown = (service.hover(card, at(card, added[1]!, "length"))!.contents as { value: string }).value
        expect(markdown).toContain("property **length** of Text · a number")
        expect(markdown).toContain("How many characters it has")
      })
    })

    test("hover on a built-in rule:  the member it spells, with its docs", async () => {
      await withCardText(text, () => {
        const markdown = (service.hover(card, at(card, added[3]!, "shuffle"))!.contents as { value: string }).value
        expect(markdown).toContain("built in:  **shuffle (a list)** of list")
        expect(markdown).toContain("Put it in random order")
      })
    })

    test("completion after `the ` offers them, with their docs -- each type's", async () => {
      await typedAtEnd("print the ", (position) => {
        const length = service.completion(solitaire, position).items.find(({ label }) => label === "length")!
        expect(length.detail).toBe("property of List, Text")
        const docs = (length.documentation as { value: string }).value
        expect(docs).toMatch(/^\*\*List\*\*:  How many items/)
        expect(docs).toContain("**Text**:  How many characters")
      })
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
      await fixes("juggle solitaire 3 times", (titles) => {
        expect(titles).toEqual(["Define `to juggle a solitaire (number) times`"])
      })
    })

    test("...which goes above the line's top-level statement, and makes the line parse", async () => {
      await fixes("juggle solitaire 3 times", async (_titles, fixed) => {
        expect(fixed).toMatch(/\nto juggle a solitaire \(number\) times:\n\t\/\/ TODO\n\njuggle solitaire 3 times$/)
        await workspace.update(solitaireUri, fixed!)
        expect(errorsIn(service, solitaire)).toEqual([])
      })
    })

    test("a statement that parsed, with words left over => the statement AND its leftovers", async () => {
      // `shuffle the deck of solitaire` is the built-in `shuffle {list}`, leaving `3 times`;
      // its parameter is what the expression is, a deck
      await fixes("shuffle the deck of solitaire 3 times", async (titles, fixed) => {
        expect(titles).toEqual(["Define `to shuffle a deck (number) times`"])
        await workspace.update(solitaireUri, fixed!)
        expect(errorsIn(service, solitaire)).toEqual([])
      })
    })

    test("...an inline body's statement too, NOT the line's", async () => {
      await fixes("if solitaire: shuffle the deck of solitaire 3 times", async (titles, fixed) => {
        expect(titles).toEqual(["Define `to shuffle a deck (number) times`"])
        await workspace.update(solitaireUri, fixed!)
        expect(errorsIn(service, solitaire)).toEqual([])
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
          expect(errorsIn(service, file), name).toEqual([])
          // Blank lines compile as they're written, and one with a tab on it belongs to the block it's indented
          // into -- so without the tab, a blank line can move in the javascript.  The code itself can't change.
          // Nor can its comments, but those that echo a statement as written:  formatting tidies them too.
          expect(withoutEchoes(withoutPositions(service.compiled(file))), name).toBe(withoutEchoes(compiled))
          expect(service.formatting(file, tabs), name).toEqual([])
        })
      }
    })

    /**
     * Card.spell as formatting leaves it, then untidy again:
     * a tab alone on its outline's first blank line, trailing spaces, and a tab between two words.
     * - Tidied first, so the edits are this test's:  the example may have untidy lines of its own.
     */
    function untidyCard() {
      const tidy = applyEdits(cardText, service.formatting(card, tabs))
      const blank = tidy.indexOf("\n\n", tidy.indexOf(CARD_TYPE)) + 1
      const untidy = `${tidy.slice(0, blank)}\t${tidy.slice(blank)}`
        .replace("\t- to draw its front:\n", "\t- to draw its front:  \n")
        .replace("\t- to draw its back:\n", "\t- to draw its back: \n")
        .replace(`\t\t${READ_SYMBOL}\n`, `\t\treturn rank\t+ its symbol + direction\n`)
      /** 1-based line of `start` in the tidy card -- see `lineOf()`. */
      const tidyLine = (start: string) => lineOf(tidy, start)
      return { untidy, blankLine: tidy.slice(0, blank).split("\n").length, tidyLine }
    }

    test("one edit per changed line", async () => {
      const { untidy, blankLine, tidyLine } = untidyCard()
      expect(untidy).not.toBe(cardText)
      await withCardText(untidy, () => {
        const edits = service
          .formatting(card, tabs)
          .map(({ range, newText }) => `${range.start.line + 1}: ${JSON.stringify(newText)}`)
        expect(edits).toEqual([
          // a tab alone on a blank line
          `${blankLine}: ""`,
          // a tab between two words
          `${tidyLine(READ_SYMBOL)}: "\\t\\t${READ_SYMBOL}"`,
          // trailing spaces
          `${tidyLine("- to draw its front:")}: "\\t- to draw its front:"`,
          `${tidyLine("- to draw its back:")}: "\\t- to draw its back:"`
        ])
      })
    })

    test("a range formats only the lines it touches", async () => {
      const { untidy, tidyLine } = untidyCard()
      await withCardText(untidy, () => {
        // the state's `return rank + ...`, 0-based:  not the untidy lines below it
        const line = tidyLine(READ_SYMBOL) - 1
        const range = { start: { line, character: 0 }, end: { line, character: 5 } }
        expect(service.formatting(card, tabs, range).map(({ range }) => range.start.line)).toEqual([line])
      })
    })

    test("tabs, even if the editor says spaces", () => {
      // the whole body of `- its "state" is:`, indented with spaces
      const body = cardText.slice(
        cardText.indexOf("\t\trank is 10"),
        cardText.indexOf(READ_SYMBOL) + READ_SYMBOL.length
      )
      const spaced = card.contents!.replace(body, body.replaceAll("\t\t", "    "))
      return withText(cardUri, cardText, spaced, () => {
        const edits = service.formatting(card, { tabSize: 2, insertSpaces: true })
        const line = lineOf(cardText, READ_SYMBOL) - 1
        expect(edits.find(({ range }) => range.start.line === line)?.newText).toBe(`\t\t${READ_SYMBOL}`)
      })
    })
  })

  test("custom requests:  a line's spell tree;  none for a blank line", () => {
    const lines = card.parseText.split("\n")
    const tree = service.lineTree(
      card,
      lines.findIndex((line) => line.includes("set column to its value"))
    )
    expect(tree?.label).toBe("Set")
    expect(tree?.children?.map(({ slot }) => slot)).toEqual(["thing", "value"])
    expect(
      service.lineTree(
        card,
        lines.findIndex((line) => line.trim() === "")
      )
    ).toBeNull()
  })

  test("custom requests:  compiled TypeScript, by the `ts/solid` target's writer", () => {
    const compiled = service.compiled(card, "ts")
    expect(compiled).toBe(LSP.SpellLanguageService.compileQuietly(card.match!, SP.targetFor("ts/solid").writer))
    expect(compiled).toContain("export class Card extends TwoSidedView {\n")
    // TypeScript's own:  a decorated, typed property
    expect(compiled).toMatch(/@prop\(.*\)\n\s*accessor \w+!?: /)
    expect(compiled).not.toBe(service.compiled(card, "js"))
  })

  test("custom requests:  compiled Python, by the `py` target's writer", () => {
    const compiled = service.compiled(card, "py")
    expect(compiled).toBe(LSP.SpellLanguageService.compileQuietly(card.match!, SP.targetFor("py").writer))
    expect(compiled).toContain("class Card(TwoSidedView):\n")
    // the declaration markers are for the declarations file, not for people
    expect(compiled).not.toContain("SPELL: DECLARES")
  })

  // epic `elemental-spell` J95:  the other form is a view, never a second file
  test("custom requests:  Show as Spellx, a .spell file written as spellx;  one that can't be says why", () => {
    const spellx = service.compiled(card, "spellx")
    expect(spellx).toMatch(/^<spell-view "card"/m)
    expect(spellx).toContain('\t<property "suit"')
    const unparsed = Object.create(card, { match: { value: undefined } }) as SP.SpellFile
    expect(service.compiled(unparsed, "spellx")).toBe(
      "// Card.spell couldn't be written as spellx:  SpellxWriter.textOf():  Card.spell hasn't been parsed;  parse it first"
    )
  })

  test("custom requests:  a file that can't be compiled says why, naming its target", () => {
    const unparsed = Object.create(card, { match: { value: undefined } }) as SP.SpellFile
    expect(service.compiled(unparsed, "ts")).toBe("// Card.spell hasn't been parsed")
    const throws = Object.create(card, {
      match: {
        value: {
          rule: { getAST: true },
          get AST(): never {
            throw new Error("half-typed")
          }
        }
      }
    }) as SP.SpellFile
    expect(service.compiled(throws, "ts")).toBe("// Card.spell couldn't be compiled to ts/solid")
    expect(service.compiled(throws)).toBe("// Card.spell couldn't be compiled to js/solid")
    // in its language's comments
    expect(service.compiled(throws, "py")).toBe("# Card.spell couldn't be compiled to py")
  })

  test("custom requests:  compiled javascript, and the project's files", () => {
    expect(service.compiled(card)).toContain("export class Card extends TwoSidedView {\n")
    expect(service.compiled(card)).toBe(service.compiled(card, "js"))
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

  describe("<css> blocks (see LSP.SpellCSS)", () => {
    // a block in the card type's outline, its CSS with a typo:  `colr`
    const withBlock = cardText.replace(
      'a "card" is a two sided view:\n',
      'a "card" is a two sided view:\n\t<css>\n\t\t.red { colr: red }\n\t</css>\n'
    )
    /** The block's `<css>` line, 0-based:  just under the card's declaration. */
    const block = lineOf(cardText, CARD_TYPE)
    /** Its `.red { colr: red }` line, 0-based. */
    const rule = block + 1

    test("errors:  CSS mistakes, and none of spell's own:  it's spell's `css_block`", async () => {
      await withCardText(withBlock, () => {
        expect(service.diagnostics(card).map(({ source, message, range }) => ({ source, message, range }))).toEqual([
          {
            source: "css",
            message: "Unknown property: 'colr'",
            range: { start: { line: rule, character: 9 }, end: { line: rule, character: 13 } }
          }
        ])
      })
    })

    test("completion and hover are CSS's inside it", async () => {
      await withCardText(withBlock, () => {
        const labels = service.completion(card, { line: rule, character: 12 }).items.map((item) => item.label)
        expect(labels).toContain("color")
        expect(labels).not.toContain("card")
        expect(service.hover(card, { line: rule, character: 4 })).toBeDefined()
      })
    })

    test("no spell colouring in the block;  it folds", async () => {
      await withCardText(withBlock, () => {
        // its three lines, 1-based
        expect(describeTokens(card, [block + 1, block + 2, block + 3])).toEqual([])
        expect(service.foldingRanges(card)).toContainEqual({ startLine: block, endLine: block + 2 })
      })
    })
  })

  describe("<markdown> blocks (spell's `markdown_description`, `markdown_block`)", () => {
    // the card type's description, as markdown in its outline -- with markdown's own `#`, `*`, `<` and braces;
    // its file's docstring blanked
    const withBlock = cardText.replace(
      /^# [\s\S]*?a "card" is a two sided view:\n/,
      '\na "card" is a two sided view:\n\t<markdown>\n\t\t# A card\n\t\tA *playing* card <b>{rank}</b>.\n\t</markdown>\n'
    )

    test("no errors, and no spell colouring inside;  hover on the type shows it as its description", async () => {
      await withCardText(withBlock, () => {
        expect(errorsIn(service, card)).toEqual([])
        expect(describeTokens(card, [4, 5])).toEqual([])
        const markdown = (service.hover(deck, at(deck, 'a "deck" is', "card"))!.contents as { value: string }).value
        expect(markdown).toContain("template **Card** is a TwoSidedView\n\n# A card\nA *playing* card <b>{rank}</b>.")
      })
    })
  })

  describe("membership and guards", () => {
    // a card belongs to one pile;  Solitaire's piles say what each can take and give up
    const pileUri = pathToFileURL(resolve(dir, "Solitaire/Pile.spell")).href
    /** Pile.spell's `a card belongs to one pile`, 1-based. */
    const belongsLine = lineOf(readFileSync(resolve(dir, "Solitaire/Pile.spell"), "utf8"), "a card belongs to one pile")
    /** Where `deal the cards` reads a card's pile. */
    const read = "set start pile to the pile of the card"
    /** Hover's markdown at `word` on `line` of `file` -- see `at()`. */
    const hoverAt = (file: SP.SpellFile, line: number | string, word: string, nth = 0) =>
      (service.hover(file, at(file, line, word, nth))!.contents as { value: string }).value

    test("hover on `the pile of the card`:  the pile holding it, from the `belongs to one` line", () => {
      expect(hoverAt(solitaire, read, "pile", 1)).toContain(
        "property **pile** of Card · a Pile · the Pile holding it, read-only:  it belongs to one at a time"
      )
      expect(hoverAt(solitaire, read, "pile", 1)).toContain(`declared in [Pile.spell:${belongsLine}]`)
    })

    test("go to definition:  the `belongs to one` line", () => {
      const [location] = service.definition(solitaire, at(solitaire, read, "pile", 1))
      expect(location?.uri).toBe(pileUri)
      expect(location?.range.start.line).toBe(belongsLine - 1)
    })

    test("hover on `belongs to one`, and on a guard:  their rules and what they mean", () => {
      const pile = card.project.spellFiles.find((it) => it.path.endsWith("/Pile.spell"))!
      const belongs = hoverAt(pile, belongsLine, "belongs")
      expect(belongs).toContain("**belongs_to_one**")
      expect(belongs).toContain("built in:  **(a thing) belongs to one (list)** of thing")
      // a tableau's `- it can take a card if:`:  the second, after the foundation's
      const guard = hoverAt(solitaire, lineOf(solitaire.parseText, "- it can take a card if:", 1), "take")
      expect(guard).toContain("**list_guard**")
      expect(guard).toContain("built in:  **(a list) can take (a thing)** of list")
      expect(guard).toContain("Tableau.prototype.canTake = function (card) {")
    })

    test("completion offers the phrases:  `belongs` after an item type, `take` and `never` after `can`", async () => {
      const labels = (items: CompletionItem[]) => items.map(({ label }) => label)
      await typedAtEnd("a card ", (position) => {
        expect(labels(service.completion(solitaire, position).items)).toEqual(
          expect.arrayContaining(["belongs", "can"])
        )
      })
      await typedAtEnd("a pile can ", (position) => {
        expect(labels(service.completion(solitaire, position).items)).toEqual(
          expect.arrayContaining(["add", "take", "give", "release", "remove", "let", "never"])
        )
      })
    })
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
  function withCardText(text: string, check: (changed: SP.SpellFile[]) => void | Promise<void>) {
    return withText(cardUri, cardText, text, check)
  }

  /** Run `check` with document `uri`'s open text set to `text`, then ALWAYS put back `original`. */
  async function withText(
    uri: string,
    original: string,
    text: string,
    check: (changed: SP.SpellFile[]) => void | Promise<void>
  ) {
    try {
      await check(await workspace.update(uri, text))
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

/**
 * An OUTLINE project (epic page `outline-spell`):  a temp copy of the Solitaire example in code spell,
 * whose card, deck and piles are written as outlines.
 */
describe("SpellLanguageService, outline style", () => {
  const dir = mkdtempSync(resolve(tmpdir(), "spell-lsp-outline-"))
  copySolitaireAsCodeSpell(resolve(dir, "Solitaire"))
  const cardPath = resolve(dir, "Solitaire/Card.spell")
  const cardUri = pathToFileURL(cardPath).href
  const workspace = new SpellDiskWorkspace()
  const service = new LSP.SpellLanguageService(workspace)
  let card: SP.SpellFile

  beforeAll(async () => {
    await workspace.update(cardUri, readFileSync(cardPath, "utf8"))
    card = workspace.fileFor(cardUri)!
  })

  test("parses cleanly", () => {
    for (const file of card.project.spellFiles) expect(errorsIn(service, file), file.path).toEqual([])
  })

  test("hover on an outline line:  how the sentence style says it", () => {
    const hoverOn = (line: string, word: string) =>
      (service.hover(card, at(card, line, word))!.contents as { value: string }).value
    // a property, its values listed;  a quoted phrase with a blank;  a quoted phrase with an `if`
    expect(hoverOn('- its "suit" is one of', "suit").split("\n")[0]).toMatchInlineSnapshot(
      `"**Reads as**  \`a card has a suit as one of clubs, diamonds, hearts or spades\`"`
    )
    expect(hoverOn('- it "is a (suit)"', "is a (suit)").split("\n")[0]).toMatchInlineSnapshot(
      `"**Reads as**  \`a card "is a (suit)" for its suits\`"`
    )
    expect(hoverOn('- it "is a face card" if', "face card").split("\n")[0]).toMatchInlineSnapshot(
      `"**Reads as**  \`a card "is a face card" if its rank is jack, queen or king\`"`
    )
  })

  test("the editor's outline nests a type's bullets under it", () => {
    const symbols = service.documentSymbols(card)
    const cardSymbol = symbols.find((symbol) => symbol.name === "Card")!
    expect(cardSymbol.children?.map((child) => child.name)).toEqual(expect.arrayContaining(["suit", "rank", "color"]))
  })
})

/**
 * Position of the `nth` (0-based) `word` on `line` of `source`:
 * 1-based, or the first line starting with that text (see `lineOf()`).
 * - Only where a word starts:  the `it` of `await` isn't one.
 * - `source` is a file, or its text.
 */
function at(source: SP.SpellFile | string, line: number | string, word: string, nth = 0): Position {
  const text = typeof source === "string" ? source : source.parseText
  const number = typeof line === "number" ? line : lineOf(text, line)
  const lineText = text.split("\n")[number - 1]!
  const starts: number[] = []
  for (let index = lineText.indexOf(word); index >= 0; index = lineText.indexOf(word, index + 1)) {
    if (!/[\p{L}\p{N}_]/u.test(lineText[index - 1] ?? "")) starts.push(index)
  }
  const character = starts[nth]
  const name = typeof source === "string" ? "the text" : source.file
  if (character === undefined) throw new Error(`No '${word}' #${nth + 1} on line ${number} of ${name}`)
  return { line: number - 1, character }
}

/** Range of the `nth` (0-based) `word` on `line` of `source` -- see `at()`. */
function rangeAt(source: SP.SpellFile | string, line: number | string, word: string, nth = 0): Range {
  const start = at(source, line, word, nth)
  return { start, end: { line: start.line, character: start.character + word.length } }
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
 * `compiled` without blank lines, nor where each declaring statement is:
 * its `SPELL: DECLARES` comment's `line` / `defined` line, which formatting moves.
 */
function withoutPositions(compiled: string): string {
  // `line: 9, defined: "/Card.spell:222-283",` -- or either alone
  return withoutBlankLines(compiled.replace(/^ *(line|defined): .*$/gm, ""))
}

/** `compiled` without its comment lines:  some echo a statement as it's written, e.g. `// - its "game menu" is ...`. */
function withoutEchoes(compiled: string): string {
  return compiled.replace(/^ *\/\/.*\n/gm, "")
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

/**
 * `file`'s errors, as `service` shows them:  its diagnostics bar its warnings.
 * - The fixture's own warnings, e.g. `set state to []`, aren't what a test of parsing cleanly is about.
 */
function errorsIn(service: LSP.SpellLanguageService, file: SP.SpellFile) {
  return service.diagnostics(file).filter(({ severity }) => severity === DiagnosticSeverity.Error)
}

/** `name (Kind)`, then its children indented -- a compact outline to snapshot. */
function describeSymbol({ name, kind, children }: DocumentSymbol): string {
  const kindName = Object.entries({ Class: 5, Method: 6, Property: 7, Function: 12, Variable: 13, Event: 24 }).find(
    ([, value]) => value === kind
  )?.[0]
  const nested = children?.map((child) => `\n  ${describeSymbol(child).replace(/\n/g, "\n  ")}`).join("") ?? ""
  return `${name} (${kindName ?? kind})${nested}`
}

/** Solitaire's code-spell twin:  the spellx pair test's fixture, the same program as the example. */
const SOLITAIRE_CODE_SPELL = resolve(environment.repoDir, "tests", "spell", "__spell__", "Solitaire")

/**
 * Write the Solitaire example into `dir` as CODE spell:  its twin's `.spell` files, its styles,
 * and a project file listing them, in the example's order.
 * - SIDE EFFECT:  makes `dir`.
 */
function copySolitaireAsCodeSpell(dir: string): void {
  mkdirSync(dir, { recursive: true })
  const files = ["Card.spell", "Deck.spell", "Pile.spell", "Solitaire.spell"]
  for (const file of files) copyFileSync(resolve(SOLITAIRE_CODE_SPELL, file), resolve(dir, file))
  copyFileSync(fixtureFolder("Solitaire", "styles.css"), resolve(dir, "styles.css"))
  const imports = [...files, "styles.css"].map((file) => ({ path: `/${file}`, active: true }))
  writeFileSync(resolve(dir, SP.PROJECT_FILE), JSON.stringify({ title: "Solitaire", imports }))
}
