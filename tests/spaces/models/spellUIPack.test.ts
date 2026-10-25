import { describe, expect, test } from "vite-plus/test"

import { parseSpellProject } from "spell-parser/spell/test"
import { SPACES } from "spell-app/spaces"

/** Spell UI, as a spellx drawing names its components bare (epic `elemental-spell` P7, Q46). */
describe("SPELL_UI_PACK", () => {
  test("English:  a catalog tag without its ui-", () => {
    expect(SPACES.SPELL_UI_PACK.tagFor("button", "en")).toBe("ui-button")
    expect(SPACES.SPELL_UI_PACK.tagFor("text", "en")).toBe("ui-text")
    expect(SPACES.SPELL_UI_PACK.tagFor("div", "en")).toBeUndefined()
  })

  test("Spanish:  Spell UI's Spanish name, es- before it, accents or not", () => {
    expect(SPACES.SPELL_UI_PACK.tagFor("botón", "es")).toBe("es-boton")
    expect(SPACES.SPELL_UI_PACK.tagFor("boton", "es")).toBe("es-boton")
    expect(SPACES.SPELL_UI_PACK.tagFor("texto", "es")).toBe("es-texto")
  })

  test("loading spaces registers it:  a spellx drawing's <button> compiles to ui-button", () => {
    const contents = ['<spell-view "card">', "\t<draw>", "\t\t<button>Go</>", "\t</draw>", "</spell-view>"].join("\n")
    const [file] = parseSpellProject([{ path: "/card.spellx", contents }]).files
    expect(file!.errors).toEqual([])
    expect(file!.compiled).toContain('h("ui-button", "Go")')
  })
})
