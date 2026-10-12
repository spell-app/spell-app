import { describe, test, expect, afterEach } from "vite-plus/test"

import { spellCore, Thing, Drawable, DrawableList, elementTagFor } from "$/core"

/** A drawable class's element:  its tag, named here, defined by the page's `elementDefiner`. */
describe("drawable things' elements", () => {
  afterEach(() => {
    spellCore.elementDefiner = undefined
  })

  test("a tag is the project's name made singular, then the class's, kebab-cased", () => {
    expect(elementTagFor("Solitaire", "Card")).toBe("solitaire-card")
    expect(elementTagFor("games", "BankAccount")).toBe("game-bank-account")
    expect(elementTagFor("Todos - Form Based", "Task")).toBe("todos-form-based-task")
    expect(elementTagFor("", "Card")).toBe("spell-card")
  })

  test("defineElement() names a drawable class's tag as it's declared;  the page hears of it once the class is whole", async () => {
    const defined: string[] = []
    spellCore.elementDefiner = (tag, Class) => defined.push(`${tag} ${Class.name}`)
    class Card extends Drawable {
      static elementTag = spellCore.defineElement(this, "Solitaire")
    }
    class Pile extends DrawableList<Card> {
      static elementTag = spellCore.defineElement(this, "Solitaire")
    }
    class Note extends Thing {
      static elementTag = spellCore.defineElement(this, "Solitaire")
    }
    expect(defined).toEqual([])
    expect(spellCore.elementFor(new Pile())).toBe("solitaire-pile")
    await Promise.resolve()
    expect(defined).toEqual(["solitaire-pile Pile", "solitaire-card Card"])
    expect(Card.elementTag).toBe("solitaire-card")
    expect(spellCore.elementTagOf(new Pile())).toBe("solitaire-pile")
    expect(Note.elementTag).toBeUndefined()
    expect(spellCore.elementTagOf(new Note())).toBeUndefined()
  })

  test("with no definer, the tag is still named", () => {
    class Card extends Drawable {}
    spellCore.defineElement(Card, "games")
    expect(spellCore.elementTagOf(new Card())).toBe("game-card")
  })
})

describe("elementApiOf():  what a drawable class shows on its element", () => {
  test("its declared properties and its methods, its super-types' too;  not draw(), nor a method with values in it, nor the built-in `id`", () => {
    class Card extends Drawable {
      draw() {
        return null
      }
      turn_over() {}
      is_a_$suit(_suit: string) {
        return false
      }
    }
    Card.declareProp("rank", { type: "number" })
    Card.declareProp("suit", { type: "text" })
    class Joker extends Card {
      wink() {}
    }
    Joker.declareProp("grin", { type: "choice" })
    expect(spellCore.elementApiOf(Joker)).toEqual({
      properties: [
        { name: "grin", type: "choice" },
        { name: "rank", type: "number" },
        { name: "suit", type: "text" }
      ],
      methods: ["wink", "turn_over"]
    })
  })
})
