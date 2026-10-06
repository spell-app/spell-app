import { describe, expect, test, vi } from "vite-plus/test"

import { CodeLanguages } from "./CodeLanguages"
import { CODE_LANGUAGES_EVENT, type CodeHighlight } from "./runtime.types"

/** A highlighter that does nothing:  the registry never calls it. */
const HIGHLIGHT = vi.fn() as unknown as CodeHighlight

describe("CodeLanguages.register()", () => {
  test("bumps `version` and tells the document, so shown code highlights again", () => {
    const languages = new CodeLanguages()
    const onRegister = vi.fn()
    document.addEventListener(CODE_LANGUAGES_EVENT, onRegister)
    try {
      languages.register("Spell", { highlight: HIGHLIGHT })
      languages.register("other", { highlight: HIGHLIGHT })
    } finally {
      document.removeEventListener(CODE_LANGUAGES_EVENT, onRegister)
    }
    expect(languages.version).toBe(2)
    expect(onRegister).toHaveBeenCalledTimes(2)
  })
})

describe("CodeLanguages.find()", () => {
  test("finds a name or an alias in any case, under its lowercase name", () => {
    const languages = new CodeLanguages()
    languages.register("Spell", { highlight: HIGHLIGHT, aliases: ["SP"] })
    expect(languages.find("SPELL")?.language).toMatchObject({ name: "spell", highlight: HIGHLIGHT })
    expect(languages.find("sp")?.language.name).toBe("spell")
    expect(languages.find("nope")).toBeUndefined()
  })

  test("splits a variant after the `/`;  a name registered WITH a `/` wins whole", () => {
    const languages = new CodeLanguages()
    languages.register("spell", { highlight: HIGHLIGHT })
    languages.register("spell/raw", { highlight: HIGHLIGHT })
    expect(languages.find("spell/es")).toMatchObject({ language: { name: "spell" }, variant: "es" })
    expect(languages.find("spell/raw")).toEqual({ language: expect.objectContaining({ name: "spell/raw" }) })
    expect(languages.find("nope/es")).toBeUndefined()
  })
})

describe("CodeLanguages.detectable()", () => {
  test("lists each language ONCE, and only grammars that opted into detection", () => {
    const languages = new CodeLanguages()
    const grammar = () => ({})
    languages.register("auto", { grammar, detect: true, aliases: ["a1", "a2"] })
    languages.register("manual", { grammar })
    languages.register("own", { highlight: HIGHLIGHT, detect: true })
    expect(languages.detectable().map((language) => language.name)).toEqual(["auto"])
  })
})
