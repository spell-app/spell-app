import { describe, test, expect, afterEach } from "vite-plus/test"

import { spellCore, Thing, Drawable, DrawableList, elementTagFor } from "$/core"

/** A drawable class's element:  its tag, named here, defined by the page's `elementDefiner`. */
describe("drawable things' elements", () => {
  afterEach(() => {
    spellCore.elementDefiner = undefined
  })

  test("a tag is the project's name made singular, then the class's, kebab-cased", () => {
    expect(elementTagFor("Solitaire", "Card")).toBe("solitaire-card")
    expect(elementTagFor("games", "Bank_Account")).toBe("game-bank-account")
    expect(elementTagFor("Todos - Form Based", "Task")).toBe("todos-form-based-task")
    expect(elementTagFor("", "Card")).toBe("spell-card")
  })

  test("defineElements() hands the page each drawable class, and keeps its tag on the class", () => {
    class Card extends Drawable {}
    class Pile extends DrawableList<Card> {}
    class Note extends Thing {}
    const defined: string[] = []
    spellCore.elementDefiner = (tag, Class) => defined.push(`${tag} ${Class.name}`)
    spellCore.defineElements("Solitaire", { Card, Pile, Note, deck: new Note(), version: 1 })
    expect(defined).toEqual(["solitaire-card Card", "solitaire-pile Pile"])
    expect(spellCore.elementTagOf(new Card())).toBe("solitaire-card")
    expect(spellCore.elementTagOf(new Note())).toBeUndefined()
  })

  test("with no definer, the tag is still named", () => {
    class Card extends Drawable {}
    spellCore.defineElements("games", { Card })
    expect(spellCore.elementTagOf(new Card())).toBe("game-card")
  })
})
