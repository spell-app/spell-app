import { describe, test, expect, beforeAll } from "vite-plus/test"
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import { resolve } from "path"
import { pathToFileURL } from "url"
import type { DocumentSymbol, Position, SemanticTokens } from "vscode-languageserver"

import { SP } from "spell-parser/spell"
import { LSP } from "spell-app/lsp"
import { SpellDiskWorkspace } from "spell-app/lsp/SpellDiskWorkspace"

/** spell-parser's spellx pair fixtures:  each `X.spellx` beside the `X.spell` it means. */
const PAIRS = resolve(import.meta.dirname, "../../../spell-parser/tests/spell/spellx")

/**
 * The language service over a SPELLX file, spell's tag-shaped form (epic `elemental-spell` P8):
 * a temp project holding spell-parser's FlipTile pair fixture, `FlipTile.spellx`.
 * - Its colours, hover and outline come from the match tree, as a `.spell` file's do.
 * - A tag line reads as its code-spell twin, whose own words are SYNTHETIC tokens at the tag's start (C24):
 *   nothing may colour them, or hover on them, as if they were typed there.
 */
describe("SpellLanguageService, spellx", () => {
  const dir = mkdtempSync(resolve(tmpdir(), "spell-lsp-spellx-"))
  const folder = resolve(dir, "Tiles")
  mkdirSync(folder)
  const tileText = readFileSync(resolve(PAIRS, "FlipTile.spellx"), "utf8")
  writeFileSync(resolve(folder, "FlipTile.spellx"), tileText)
  writeFileSync(resolve(folder, SP.PROJECT_FILE), `{ imports: [{ path: "/FlipTile.spellx", active: true }] }\n`)
  const tileUri = pathToFileURL(resolve(folder, "FlipTile.spellx")).href
  const workspace = new SpellDiskWorkspace()
  const service = new LSP.SpellLanguageService(workspace)
  let tile: SP.SpellFile

  beforeAll(async () => {
    await workspace.update(tileUri, tileText)
    tile = workspace.fileFor(tileUri)!
  })

  test("it parses as spellx, with no errors", () => {
    expect(tile.form).toBe("spellx")
    expect(service.diagnostics(tile).map((it) => it.message)).toEqual([])
  })

  test("its tags' words, attribute names and closers are coloured as written;  a twin's own words never are (C24)", () => {
    const tokens = describeTokens(tile)
    expect(tokens).toContain(`4:1 "<property" keyword`)
    expect(tokens).toContain(`4:11 "\\"side\\"" property declaration`)
    expect(tokens).toContain(`4:18 "one-of" property`)
    expect(tokens).toContain(`6:1 "/>" keyword`)
    expect(tokens).toContain(`11:2 "<description>" keyword`)
    expect(tokens).toContain(`11:15 "Turns it over." comment`)
    expect(tokens).toContain(`16:1 "</action>" keyword`)
    expect(tokens).toContain(`30:1 "<on" keyword`)
    expect(tokens).toContain(`31:0 "</spell-view>" keyword`)
    // the twin's `its ... is one of`, `it`, `to`, `on` stand at a tag with no text of their own:  none coloured there
    for (const stray of [`4:1 "<pr"`, `7:1 "<e"`, `10:1 "<a"`, `17:1 "<d"`, `24:2 "<i"`]) {
      expect(tokens.filter((token) => token.startsWith(stray))).toEqual([])
    }
  })

  test("hover on a tag is its statement's, as its twin reads", () => {
    const hover = service.hover(tile, positionOf(tileText, '<property "side"', "<property"))
    const text = JSON.stringify(hover?.contents)
    expect(text).toContain("a flip tile has a side as one of up, down")
    // not the twin's `it` of an alias line, which stands at the same tag
    expect(text).not.toContain("**subject_it**")
  })

  test("the outline lists its template and members", () => {
    const names = (symbols: DocumentSymbol[]): string[] =>
      symbols.flatMap((symbol) => [symbol.name, ...names(symbol.children ?? [])])
    expect(names(service.documentSymbols(tile))).toEqual(expect.arrayContaining(["Flip tile", "side", "flip it"]))
  })

  test("its tags fold", () => {
    const lines = tileText.split("\n")
    const action = lines.findIndex((line) => line.includes("<action"))
    expect(service.foldingRanges(tile).some((range) => range.startLine === action)).toBe(true)
  })

  test("formatting keeps a tidy file as it is, and tidies a body line's spacing, its tabs kept (Q7)", async () => {
    const options = { tabSize: 2, insertSpaces: false, trimFinalNewlines: true, insertFinalNewline: true }
    expect(service.formatting(tile, options)).toEqual([])
    const untidy = tileText.replace("\t\t\tset its side to down\n", "\t\t\tset its  side to   down\n")
    await workspace.update(tileUri, untidy)
    try {
      const edits = service.formatting(workspace.fileFor(tileUri)!, options)
      expect(edits.map((edit) => edit.newText)).toEqual(["\t\t\tset its side to down"])
    } finally {
      await workspace.update(tileUri, tileText)
    }
  })

  test("Show as Code Spell:  the code spell it means, its drawings' components by their tags (`spell/compiled`)", () => {
    const code = service.compiled(tile, "spell")
    expect(code).toContain(`a "flip tile" is a view:\n`)
    expect(code).toContain(`\t- its "side" is one of up, down\n\t\t- it "is showing (side)"\n`)
    expect(code).toContain("\t- to draw its face:\n\t\t<ui-text>face</ui-text>\n")
    expect(code).toContain("\t- on mouse down: flip it\n")
  })

  /** 0-based position of `word` on the first line containing `line`. */
  function positionOf(text: string, line: string, word: string): Position {
    const lines = text.split("\n")
    const index = lines.findIndex((it) => it.includes(line))
    return { line: index, character: lines[index]!.indexOf(word) }
  }

  /** `file`'s semantic tokens, as `line:character "text" type modifiers...`, 1-based lines. */
  function describeTokens(file: SP.SpellFile): string[] {
    const { tokenTypes, tokenModifiers } = LSP.SpellLanguageService.TOKEN_LEGEND
    const { data } = service.semanticTokens(file) as SemanticTokens
    const text = file.parseText.split("\n")
    const tokens: string[] = []
    let line = 0
    let character = 0
    for (let index = 0; index < data.length; index += 5) {
      const [deltaLine, deltaChar, length, type, modifierBits] = data.slice(index, index + 5) as number[]
      line += deltaLine!
      character = deltaLine ? deltaChar! : character + deltaChar!
      const modifiers = tokenModifiers.filter((_, bit) => modifierBits! & (1 << bit))
      const word = JSON.stringify(text[line]!.slice(character, character + length!))
      tokens.push([`${line + 1}:${character} ${word} ${tokenTypes[type!]}`, ...modifiers].join(" "))
    }
    return tokens
  }
})

/**
 * A SPANISH spellx file (`Ficha.es.spellx`, spell-parser's pair fixture), typed without its accents:
 * its tags' and attributes' words are upgraded as you type, as Spanish code spell's keywords are (Q49).
 */
describe("SpellLanguageService, Spanish spellx", () => {
  const dir = mkdtempSync(resolve(tmpdir(), "spell-lsp-spellx-es-"))
  const folder = resolve(dir, "Fichas")
  mkdirSync(folder)
  const accented = readFileSync(resolve(PAIRS, "Ficha.es.spellx"), "utf8")
  const plain = accented
    .replaceAll("<acción", "<accion")
    .replaceAll("</acción>", "</accion>")
    .replace("descripción=", "descripcion=")
  writeFileSync(resolve(folder, "Ficha.es.spellx"), plain)
  writeFileSync(resolve(folder, SP.PROJECT_FILE), `{ imports: [{ path: "/Ficha.es.spellx", active: true }] }\n`)
  const uri = pathToFileURL(resolve(folder, "Ficha.es.spellx")).href
  const workspace = new SpellDiskWorkspace()
  const service = new LSP.SpellLanguageService(workspace)
  let ficha: SP.SpellFile

  beforeAll(async () => {
    await workspace.update(uri, plain)
    ficha = workspace.fileFor(uri)!
  })

  test("a tag's word and an attribute's name typed without accents get them back", () => {
    const fixed = service.accentEdits(ficha).map((edit) => edit.newText)
    expect(fixed).toContain("acción")
    expect(fixed).toContain("descripción")
    expect(fixed.filter((word) => word === "acción")).toHaveLength(2)
    // never a twin's own word, standing at a tag
    expect(fixed.every((word) => /[áéíóú]/.test(word))).toBe(true)
  })
})
