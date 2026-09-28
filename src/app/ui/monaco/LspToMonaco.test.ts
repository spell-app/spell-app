import { describe, test, expect, beforeAll } from "vitest"
import { readFileSync } from "fs"
import { resolve } from "path"
import { pathToFileURL } from "url"
import {
  CompletionItemKind,
  DiagnosticSeverity,
  DocumentHighlightKind,
  InsertTextFormat,
  SymbolKind
} from "vscode-languageserver"
import { CompletionItemInsertTextRule, MarkerSeverity } from "monaco-editor/editor/common/standalone/standaloneEnums"

import environment from "~/environment"
import { LSP } from "~/lsp"
import { SpellDiskWorkspace } from "~/lsp/SpellDiskWorkspace"
import { LspToMonaco } from "./LspToMonaco"

/**
 * LSP => Monaco conversions, alone and on real `SpellLanguageService` answers.
 * - Runs in node:  `LspToMonaco` takes Monaco's enums and `URI` from DOM-free modules.
 */
describe("LspToMonaco", () => {
  const range = { start: { line: 0, character: 4 }, end: { line: 2, character: 0 } }

  test("positions and ranges:  0-based lines + characters => 1-based lines + columns, and back", () => {
    expect(LspToMonaco.position({ line: 0, character: 0 })).toEqual({ lineNumber: 1, column: 1 })
    expect(LspToMonaco.range(range)).toEqual({ startLineNumber: 1, startColumn: 5, endLineNumber: 3, endColumn: 1 })
    expect(LspToMonaco.lspRange(LspToMonaco.range(range))).toEqual(range)
    expect(LspToMonaco.lspPosition({ lineNumber: 3, column: 2 })).toEqual({ line: 2, character: 1 })
  })

  test("diagnostics:  severity by name, not number", () => {
    const marker = (severity: DiagnosticSeverity) => LspToMonaco.marker({ range, message: "x", severity }).severity
    expect(marker(DiagnosticSeverity.Error)).toBe(MarkerSeverity.Error)
    expect(marker(DiagnosticSeverity.Warning)).toBe(MarkerSeverity.Warning)
    expect(marker(DiagnosticSeverity.Information)).toBe(MarkerSeverity.Info)
    expect(marker(DiagnosticSeverity.Hint)).toBe(MarkerSeverity.Hint)
  })

  test("completion:  kinds by name, and a snippet stays a snippet", () => {
    const monacoRange = LspToMonaco.range(range)
    const snippet = LspToMonaco.completion(
      {
        label: "move",
        kind: CompletionItemKind.Function,
        insertText: "move ${1:card} to ${2:pile}",
        insertTextFormat: InsertTextFormat.Snippet
      },
      monacoRange
    )
    expect(snippet).toMatchObject({
      kind: LspToMonaco.COMPLETION_KINDS[CompletionItemKind.Function],
      insertText: "move ${1:card} to ${2:pile}",
      insertTextRules: CompletionItemInsertTextRule.InsertAsSnippet,
      range: monacoRange
    })
    expect(LspToMonaco.completion({ label: "card" }, monacoRange)).toMatchObject({ insertText: "card" })
  })

  test("symbols and highlights:  1-based kinds => 0-based", () => {
    const symbol = LspToMonaco.documentSymbol({
      name: "Card",
      kind: SymbolKind.Class,
      range,
      selectionRange: range,
      children: [{ name: "rank", kind: SymbolKind.Property, range, selectionRange: range }]
    })
    expect([symbol.kind, symbol.children![0]!.kind]).toEqual([SymbolKind.Class - 1, SymbolKind.Property - 1])
    expect(LspToMonaco.documentHighlight({ range, kind: DocumentHighlightKind.Write }).kind).toBe(
      DocumentHighlightKind.Write - 1
    )
  })

  test("expand selection:  a `parent` chain => a list, innermost first", () => {
    const outer = { start: { line: 0, character: 0 }, end: { line: 9, character: 0 } }
    const steps = LspToMonaco.selectionRanges({ range, parent: { range: outer } })
    expect(steps.map((step) => step.range)).toEqual([LspToMonaco.range(range), LspToMonaco.range(outer)])
  })

  describe("on real answers, for Solitaire", () => {
    const deckPath = resolve(environment.srcDir, "examples/Solitaire/Deck.spell")
    const deckUri = pathToFileURL(deckPath).href
    const deckText = readFileSync(deckPath, "utf8")
    const workspace = new SpellDiskWorkspace()
    const service = new LSP.SpellLanguageService(workspace)
    /** LSP position of `needle` in Deck.spell, plus `delta` characters. */
    const at = (needle: string, delta = 0) => {
      const before = deckText.slice(0, deckText.indexOf(needle) + delta).split("\n")
      return { line: before.length - 1, character: before.at(-1)!.length }
    }

    beforeAll(async () => {
      await workspace.update(deckUri, deckText)
    })

    test("hover => markdown", () => {
      const hover = LspToMonaco.hover(service.hover(workspace.fileFor(deckUri)!, at("a list of cards", 12))!)
      expect(hover.contents[0]!.value).toContain("Card")
      expect(hover.range).toBeDefined()
    })

    test("rename => one edit per use, by file", () => {
      const file = workspace.fileFor(deckUri)!
      const edit = service.rename(file, at("set card-names", 5), "card-labels")
      const edits = LspToMonaco.workspaceEdit(edit!).edits as Array<{ resource: { scheme: string } }>
      expect(edits.length).toBeGreaterThan(1)
      expect(new Set(edits.map((it) => it.resource.scheme))).toEqual(new Set(["file"]))
    })
  })
})
