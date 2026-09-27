import { describe, test, expect, beforeAll } from "vitest"
import { cpSync, mkdtempSync, readFileSync } from "fs"
import { tmpdir } from "os"
import { resolve } from "path"
import { pathToFileURL } from "url"
import type { DocumentSymbol, Position, SelectionRange } from "vscode-languageserver"

import environment from "~/environment"
import { SP } from "~/languages/spell"
import { LSP } from "~/lsp"

/**
 * The language service over a real project:  a temp copy of the Solitaire example,
 * so edits and `.imports.json` syncing never touch the repo, and its `@workspace` project is ours alone.
 */
describe("SpellLanguageService", () => {
  const dir = mkdtempSync(resolve(tmpdir(), "spell-lsp-"))
  cpSync(resolve(environment.srcDir, "examples/Solitaire"), resolve(dir, "Solitaire"), { recursive: true })
  const cardPath = resolve(dir, "Solitaire/Card.spell")
  const cardUri = pathToFileURL(cardPath).href
  const cardText = readFileSync(cardPath, "utf8")
  const workspace = new LSP.SpellWorkspace()
  const service = new LSP.SpellLanguageService(workspace)
  let card: SP.SpellFile

  beforeAll(async () => {
    const changed = await workspace.update(cardUri, cardText)
    card = workspace.fileFor(cardUri)!
    expect(changed.map((file) => file.file)).toEqual(["Card.spell", "Deck.spell", "Pile.spell", "Solitaire.spell"])
  })

  test("opening a file parses its whole project, cleanly", () => {
    for (const file of workspace.spellFiles(card.project)) {
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

  test("closing a file puts it back to what's on disk", async () => {
    await workspace.update(cardUri, `${cardText}\nfoo bar baz`)
    expect(service.diagnostics(card)).toHaveLength(1)
    await workspace.close(cardUri)
    expect(card.contents).toBe(cardText)
    expect(service.diagnostics(card)).toEqual([])
  })

  /** Run `check` with Card.spell's open text set to `text`, then ALWAYS put the original back. */
  async function withCardText(text: string, check: (changed: SP.SpellFile[]) => void) {
    try {
      check(await workspace.update(cardUri, text))
    } finally {
      await workspace.update(cardUri, cardText)
    }
  }
})

/** `name (Kind)`, then its children indented -- a compact outline to snapshot. */
function describeSymbol({ name, kind, children }: DocumentSymbol): string {
  const kindName = Object.entries({ Class: 5, Method: 6, Property: 7, Function: 12, Variable: 13, Event: 24 }).find(
    ([, value]) => value === kind
  )?.[0]
  const nested = children?.map((child) => `\n  ${describeSymbol(child).replace(/\n/g, "\n  ")}`).join("") ?? ""
  return `${name} (${kindName ?? kind})${nested}`
}
