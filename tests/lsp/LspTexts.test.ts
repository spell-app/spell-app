import { beforeAll, describe, expect, test } from "vite-plus/test"
import { cpSync, mkdtempSync, readFileSync } from "fs"
import { tmpdir } from "os"
import { resolve } from "path"
import { pathToFileURL } from "url"

import { SP } from "spell-lang/spell"
import { fixtureFolder } from "spell-app/spaces/test"
import { LSP } from "spell-app/lsp"
import { SpellDiskWorkspace } from "spell-app/lsp/SpellDiskWorkspace"

/**
 * The language server's labels follow the FILE's language, by its name (epic `spanish` P13, P19):
 * a Spanish program's hover and completion read Spanish, in any editor.
 * - Over a temp copy of the Spanish example, Solitario.
 */
describe("LSP.LspTexts", () => {
  test("a language's texts, by its pack;  English for one with none", () => {
    expect(LSP.LspTexts.for(SP.Language.for("es")).text("declaredIn", { where: "x" })).toBe("declarado en x")
    expect(LSP.LspTexts.for(SP.Language.for("en")).text("declaredIn", { where: "x" })).toBe("declared in x")
    expect(LSP.LspTexts.forLang("klingon").text("statement")).toBe("statement")
  })

  describe("over a Spanish project", () => {
    const dir = mkdtempSync(resolve(tmpdir(), "spell-lsp-es-"))
    cpSync(fixtureFolder("Solitario"), resolve(dir, "Solitario"), { recursive: true })
    const mazoUri = pathToFileURL(resolve(dir, "Solitario/Mazo.es.spell")).href
    const workspace = new SpellDiskWorkspace()
    const service = new LSP.SpellLanguageService(workspace)
    let mazo: SP.SpellFile

    beforeAll(async () => {
      await workspace.update(mazoUri, readFileSync(resolve(dir, "Solitario/Mazo.es.spell"), "utf8"))
      mazo = workspace.fileFor(mazoUri)!
      expect(mazo.language.lang).toBe("es")
    })

    test("a hover on a type says what it is, and where it's declared, in Spanish", () => {
      const line = mazo.parseText.split("\n").findIndex((text) => text.startsWith('un "mazo" es una lista de cartas'))
      const character = mazo.parseText.split("\n")[line]!.indexOf("cartas")
      const markdown = (service.hover(mazo, { line, character })!.contents as { value: string }).value
      expect(markdown).toMatch(/tipo \*\*Carta\*\*/)
      expect(markdown).toContain("declarado en [Carta.es.spell:")
      expect(markdown).not.toContain("declared in")
    })

    test("completion at a statement's start labels spell's statements `sentencia`", () => {
      const line = mazo.parseText.split("\n").length
      const items = service.completion(mazo, { line, character: 0 }).items
      const statements = items.filter((item) => item.detail === "sentencia")
      expect(statements.length).toBeGreaterThan(0)
      expect(items.some((item) => item.detail === "statement")).toBe(false)
    })
  })
})
