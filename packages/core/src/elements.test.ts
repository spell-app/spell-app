import { describe, test, expect, afterEach } from "vite-plus/test"

import { spellCore, Thing, Drawable, DrawableList, css, elementTagFor } from "$/core"

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

  test("the word drawable is left out of the project's name (P18)", () => {
    expect(elementTagFor("Drawable Solitaire", "Tableau")).toBe("solitaire-tableau")
    expect(elementTagFor("DrawableSolitaire", "StockPile")).toBe("solitaire-stock-pile")
    expect(elementTagFor("My Drawables", "Card")).toBe("my-card")
    expect(elementTagFor("Drawable", "Card")).toBe("spell-card")
    // only the project's:  a class's own name keeps it
    expect(elementTagFor("Games", "DrawableCard")).toBe("game-drawable-card")
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
  test("its declared properties and its methods, its super-types' too;  not draw(), nor a method with values in it", () => {
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

  test("a list it makes for itself is a list;  a list it belongs to is a property, the list holding it (P18)", () => {
    class Chip extends Drawable {}
    Chip.declareProp("marks", { init: () => [] })
    class Heap extends DrawableList<Chip> {
      static instanceType = Chip
    }
    Heap.exclusive = true
    Object.defineProperty(Chip.prototype, "heap", {
      get(this: Chip) {
        return Heap.ownerOf(this)
      },
      configurable: true
    })
    // the program's classes are known once one of their things is made
    new Heap()
    expect(spellCore.elementApiOf(Chip).properties).toEqual([
      { name: "marks", type: "list" },
      { name: "heap", type: "Heap", owner: true }
    ])
  })
})

/** The tag a drawable type's `<css>` block compiles to:  `static css = css`...``. */
describe("css`...`", () => {
  test("hands back the sheet as text, the indent its lines share taken off", () => {
    class Card extends Drawable {
      static css = css`
        :host {
          display: inline-block;
        }
        .red {
          color: crimson;
        }
      `
    }
    expect(Card.css).toBe(":host {\n  display: inline-block;\n}\n.red {\n  color: crimson;\n}")
  })

  test("keeps CSS's own escapes, and a blank line inside, as written", () => {
    expect(css`
      q::before {
        content: "\201C";
      }

      q::after {
        content: "\201D";
      }
    `).toBe('q::before {\n  content: "\\201C";\n}\n\nq::after {\n  content: "\\201D";\n}')
  })

  test("one line, or nothing:  as is", () => {
    expect(tagged(".red { color: crimson }")).toBe(".red { color: crimson }")
    expect(tagged("  .red { color: crimson }  ")).toBe(".red { color: crimson }  ")
    expect(tagged("")).toBe("")
  })

  /** `css` given `text` as its template, as written:  the formatter lays out a real `css` template's CSS. */
  function tagged(text: string): string {
    return css(Object.assign([text], { raw: [text] }))
  }
})
