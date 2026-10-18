import { describe, test, expect } from "vite-plus/test"

import { core, Thing, List, Drawable, DrawableList } from "$/core"

/** The base classes `a card is a drawable thing` and `a pile is a drawable list of cards` compile to. */
describe("Drawable, DrawableList", () => {
  class Card extends Drawable {}
  class Pile extends DrawableList<Card> {
    static instanceType = Card
  }

  test("a drawable thing is a thing;  a drawable list is a list, holding its items", () => {
    const pile = new Pile()
    core.append(pile, new Card())
    expect(new Card()).toBeInstanceOf(Thing)
    expect(pile).toBeInstanceOf(List)
    expect(pile.items).toHaveLength(1)
  })

  test("both are built in:  found by name", () => {
    expect(core.things.classNamed("Drawable")).toBe(Drawable)
    expect(core.things.classNamed("DrawableList")).toBe(DrawableList)
  })
})
