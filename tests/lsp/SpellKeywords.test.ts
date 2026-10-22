import { describe, test, expect, beforeAll } from "vite-plus/test"
import { cpSync, mkdtempSync, readFileSync } from "fs"
import { tmpdir } from "os"
import { resolve } from "path"
import { pathToFileURL } from "url"
import { CompletionItemKind, DiagnosticSeverity, type TextEdit } from "vscode-languageserver"

import { SP } from "spell-lang/spell"
import { LSP } from "spell-app/lsp"
import { SpellDiskWorkspace } from "spell-app/lsp/SpellDiskWorkspace"
import { fixturePath } from "spell-lang/spell/test"

/** spell-app's checkout. */
const ROOT = resolve(import.meta.dirname, "../..")

/** The VS Code extension's grammar and its editing settings. */
const GRAMMAR = resolve(ROOT, "vscode/syntaxes/spell.tmLanguage.json")
const LANGUAGE_CONFIGURATION = resolve(ROOT, "vscode/language-configuration.json")

/** Every accent fix `language` makes, `numero` => `número`, whatever rule it's on. */
function fixesOf(language: SP.Language): Map<string, string> {
  const fixes = new Map<string, string>()
  const byRule = (LSP.SpellKeywords.of(language) as unknown as { fixesByRule: Map<unknown, Map<string, string>> })
    .fixesByRule
  for (const pairs of byRule.values()) for (const [word, accented] of pairs) fixes.set(word, accented)
  return fixes
}

describe("SpellKeywords", () => {
  describe("accent fixes", () => {
    test("Spanish:  a keyword with a written accent, typed without it", () => {
      const fixes = fixesOf(SP.spanish)
      expect(fixes.get("numero")).toBe("número")
      expect(fixes.get("posicion")).toBe("posición")
      expect(fixes.get("esta")).toBe("está")
      expect(fixes.get("mas")).toBe("más")
      expect(fixes.get("despues")).toBe("después")
    })

    test("never a word the pack ALSO has as a keyword of its own:  `si` is `if`, so never `sí`", () => {
      expect(fixesOf(SP.spanish).has("si")).toBe(false)
    })

    test("English has none", () => {
      expect(LSP.SpellKeywords.of(SP.english).hasAccentFixes).toBe(false)
    })
  })

  describe("the VS Code grammar", () => {
    test("its keywords are the packs' -- else run `yarn tsx scripts/vscode-grammar.ts`", () => {
      const grammar = JSON.parse(readFileSync(GRAMMAR, "utf8"))
      expect(grammar.repository.keyword).toEqual(LSP.SpellKeywords.grammarKeywords([...SP.Language.all.values()]))
    })

    test("statements start with each language's words;  the little words are anywhere", () => {
      const [control, operator] = LSP.SpellKeywords.grammarKeywords([SP.english, SP.spanish]).patterns.map(
        ({ match }) => new RegExp(match, "u")
      )
      expect(control!.exec("\tsi la carta es roja")?.[1]).toBe("si")
      expect(control!.exec("de lo contrario")?.[1]).toBe("de lo contrario")
      expect(control!.exec("\tif x is 1")?.[1]).toBe("if")
      expect(operator!.exec("x is not 1")?.[1]).toBe("is not")
      expect(operator!.exec("su palo es o bien")?.[1]).toBe("es")
      // a word inside a dashed name isn't one
      expect(operator!.test("está-preparado")).toBe(false)
    })
  })

  describe("going back out a level", () => {
    test("every pack's `else` goes back out", () => {
      for (const language of SP.Language.all.values()) {
        const keywords = LSP.SpellKeywords.of(language)
        for (const phrase of [...keywords.leadingPhrasesOf("else"), ...keywords.leadingPhrasesOf("else_if")]) {
          expect(LSP.SpellKeywords.DECREASE_INDENT.test(`\t${phrase}:`), `${language.lang}:  ${phrase}`).toBe(true)
        }
      }
    })

    test("Spanish's `si no` only as `else`:  `si no hay cartas:` is an `if`", () => {
      const { DECREASE_INDENT } = LSP.SpellKeywords
      expect(DECREASE_INDENT.test("\tsi no si x")).toBe(true)
      expect(DECREASE_INDENT.test("\tsi no hay cartas:")).toBe(false)
      expect(DECREASE_INDENT.test("\telsewhere")).toBe(false)
    })

    test("VS Code's is the same as Monaco's", () => {
      const { pattern, flags } = JSON.parse(readFileSync(LANGUAGE_CONFIGURATION, "utf8")).indentationRules
        .decreaseIndentPattern
      expect({ pattern, flags }).toEqual({
        pattern: LSP.SpellKeywords.DECREASE_INDENT.source,
        flags: LSP.SpellKeywords.DECREASE_INDENT.flags
      })
    })
  })
})

/**
 * The language service over a project written in Spanish:  a temp copy of the frozen `cartas` project
 * (`language: "es"`), so edits never touch the repo.
 */
describe("SpellLanguageService, in Spanish", () => {
  const dir = mkdtempSync(resolve(tmpdir(), "spell-lsp-es-"))
  cpSync(fixturePath("cartas"), resolve(dir, "cartas"), { recursive: true })
  const mazoPath = resolve(dir, "cartas/Mazo.spell")
  const mazoUri = pathToFileURL(mazoPath).href
  const mazoText = readFileSync(mazoPath, "utf8")
  const workspace = new SpellDiskWorkspace()
  const service = new LSP.SpellLanguageService(workspace)
  let mazo: SP.SpellFile

  beforeAll(async () => {
    await workspace.update(mazoUri, mazoText)
    mazo = workspace.fileFor(mazoUri)!
  })

  test("the project reads as Spanish, cleanly", () => {
    expect(mazo.project.language).toBe(SP.spanish)
    for (const file of mazo.project.spellFiles) expect(errorsIn(file), file.path).toEqual([])
  })

  test("completion at a statement's start offers Spanish's words, not English's", () => {
    const line = mazoText.split("\n").findIndex((it) => it.startsWith("para mostrar un mazo")) + 1
    const words = service
      .completion(mazo, { line, character: 1 })
      .filter((item) => item.kind === CompletionItemKind.Keyword)
      .map((item) => item.label)
    expect(words).toEqual(expect.arrayContaining(["si", "para", "devolver", "poner"]))
    expect(words).not.toContain("if")
    expect(words).not.toContain("return")
  })

  test("hover over a type names it, in the project's language (P13)", () => {
    const line = mazoText.split("\n").findIndex((it) => it.startsWith("un mazo es una lista de cartas"))
    const hover = service.hover(mazo, { line, character: 4 })
    expect(JSON.stringify(hover?.contents)).toMatch(/tipo \*\*Mazo\*\*/)
  })

  describe("accent fixes", () => {
    test("a keyword typed without its accent gets it back:  `el numero de` => `el número de`", async () => {
      const text = mazoText.replace("el número de cartas en el mazo sea 52", "el numero de cartas en el mazo sea 52")
      await withMazoText(text, () => {
        expect(fixedWords(service.accentEdits(mazo))).toEqual(["número"])
      })
    })

    test("as you type:  a new line fixes the line just ended", async () => {
      const typed = "\teco el numero de cartas en el mazo\n\t"
      await withMazoText(`${mazoText.trimEnd()}\n\npara contar un mazo\n${typed}`, () => {
        const lastLine = mazo.parseText.split("\n").length - 1
        const edits = service.onTypeFormatting(mazo, { line: lastLine, character: 1 }, "\n")
        expect(fixedWords(edits)).toEqual(["número"])
        expect(edits[0]!.range.start.line).toBe(lastLine - 1)
      })
    })

    test("leaves alone `si` (`if`), what's already accented, and a name a person chose", async () => {
      expect(service.accentEdits(mazo)).toEqual([])
      await withMazoText(`${mazoText.trimEnd()}\n\npara contar un mazo\n\tponer numero a 5\n\teco numero\n`, () => {
        expect(errorsIn(mazo)).toEqual([])
        expect(service.accentEdits(mazo)).toEqual([])
      })
    })
  })

  /** The errors in `file`. */
  function errorsIn(file: SP.SpellFile) {
    return service.diagnostics(file).filter(({ severity }) => severity === DiagnosticSeverity.Error)
  }

  /** Run `check` with Mazo.spell's open text set to `text`, then ALWAYS put the original back. */
  async function withMazoText(text: string, check: () => void) {
    try {
      await workspace.update(mazoUri, text)
      check()
    } finally {
      await workspace.update(mazoUri, mazoText)
    }
  }
})

/** The words `edits` write. */
function fixedWords(edits: TextEdit[]): string[] {
  return edits.map((edit) => edit.newText)
}
