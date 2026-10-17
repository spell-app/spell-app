import { describe, test, expect } from "vite-plus/test"

import { spellCore, Thing, List, Drawable } from "$/core"

/** Thing references:  `Tableau#T1`, `Pile#T1`, `Tableau#1` (epic `drawable-thing` P18). */
describe("thing references", () => {
  /** Piles of cards, as Drawable Solitaire's:  a tableau and a foundation are piles. */
  class Pile extends List {
    get name() {
      return this.getProp("name")
    }
    set name(value) {
      this.setProp("name", value)
    }
  }
  class Tableau extends Pile {}
  class Foundation extends Pile {}
  const t1 = new Tableau({ name: "T1" })
  const t2 = new Tableau({ name: "T2" })
  const clubs = new Foundation({ name: "clubs" })

  test("Type#name finds the thing of that type with that name;  a super-type finds its sub-types' things", () => {
    expect(spellCore.thingForReference("Tableau#T1")).toBe(t1)
    expect(spellCore.thingForReference("Tableau#T2")).toBe(t2)
    expect(spellCore.thingForReference("Pile#T1")).toBe(t1)
    expect(spellCore.thingForReference("Pile#clubs")).toBe(clubs)
    expect(spellCore.thingForReference("Tableau#clubs")).toBeUndefined()
    expect(spellCore.thingNamed(Pile, "T2")).toBe(t2)
  })

  test("Type#1 finds the first of that type made, counting from 1;  a negative place counts from the end", () => {
    expect(spellCore.thingForReference("Tableau#1")).toBe(t1)
    expect(spellCore.thingForReference("Tableau#2")).toBe(t2)
    expect(spellCore.thingForReference("Tableau#9")).toBeUndefined()
    expect(spellCore.thingAtPlace(Tableau, -1)).toBe(t2)
    expect(spellCore.thingAtPlace(Tableau, 0)).toBeUndefined()
    // a place counts its own type's things only, for now (T10)
    expect(spellCore.thingForReference("Pile#1")).toBeUndefined()
  })

  test("what isn't a reference, or names a type the program hasn't, finds nothing", () => {
    for (const text of ["T1", "Tableau#", "#T1", "tableau#T1", "Joker#T1"]) {
      expect(spellCore.thingForReference(text)).toBeUndefined()
    }
  })

  test("a thing's reference finds it again:  its name, else its top-level name, else its place", () => {
    expect(spellCore.referenceFor(t1)).toBe("Tableau#T1")
    expect(spellCore.referenceFor(clubs)).toBe("Foundation#clubs")
    // a name an earlier thing has:  its place instead
    class Hand extends Pile {}
    const first = new Hand({ name: "mine" })
    const second = new Hand({ name: "mine" })
    expect(spellCore.thingNamed(Hand, "mine")).toBe(first)
    expect(spellCore.referenceFor(second)).toBe("Hand#2")
    // no name:  its place
    class Note extends Thing {}
    // kept, as a program keeps them:  the registry holds things weakly
    const notes = [new Note(), new Note()]
    expect(spellCore.referenceFor(notes[1])).toBe("Note#2")
    // not the program's thing:  none
    expect(spellCore.referenceFor(new List())).toBeUndefined()
    expect(spellCore.referenceFor(3)).toBeUndefined()
  })

  test("a tag's id is what follows the #:  digits a place, else a name, a sub-type's thing too", () => {
    expect(spellCore.thingCalled(Tableau, "T2")).toBe(t2)
    expect(spellCore.thingCalled(Tableau, "1")).toBe(t1)
    expect(spellCore.thingCalled(Pile, "clubs")).toBe(clubs)
    expect(spellCore.thingFor(Tableau, "2")).toBe(t2)
    expect(spellCore.thingFor(Tableau, "T9")).toBeUndefined()
  })

  test("a top-level thing with no name goes by the name the program keeps it under", () => {
    class Game extends Thing {}
    const game = new Game()
    spellCore.things.setTopLevel({ game })
    try {
      expect(spellCore.referenceFor(game)).toBe("Game#game")
      expect(spellCore.thingForReference("Game#game")).toBe(game)
    } finally {
      spellCore.things.setTopLevel({})
    }
  })

  describe("elementIdFor():  the id of an element the program draws (J43)", () => {
    /** A card whose name follows its rank and suit, as Drawable Solitaire's does. */
    class Card extends Drawable {
      static elementTag = spellCore.defineElement(this, "Drawable Deck")
      get rank(): string | undefined {
        return this.getProp("rank") as string | undefined
      }
      set rank(value) {
        this.setProp("rank", value)
      }
      get name() {
        return this.rank === undefined ? undefined : `${this.rank}-of-spades`
      }
    }
    /** A sign with a name of its own, which may have spaces. */
    class Sign extends Drawable {
      static elementTag = spellCore.defineElement(this, "Drawable Deck")
      get name() {
        return this.getProp("name")
      }
      set name(value) {
        this.setProp("name", value)
      }
    }

    test("its thing's name;  a second thing of that name is -2, a third -3;  each keeps its id", () => {
      // kept, as a program keeps them:  the registry holds things weakly
      const cards = [new Card({ rank: "queen" }), new Card({ rank: "queen" }), new Card({ rank: "queen" })]
      expect(cards.map((card) => spellCore.elementIdFor(card))).toEqual([
        "queen-of-spades",
        "queen-of-spades-2",
        "queen-of-spades-3"
      ])
      // asked again, in any order:  the same
      expect(spellCore.elementIdFor(cards[1])).toBe("queen-of-spades-2")
    })

    test("it follows the thing's name;  no name, no id;  a space is a dash", () => {
      const card = new Card({ rank: "jack" })
      expect(spellCore.elementIdFor(card)).toBe("jack-of-spades")
      card.rank = "king"
      expect(spellCore.elementIdFor(card)).toBe("king-of-spades")
      const sign = new Sign()
      expect(spellCore.elementIdFor(sign)).toBeUndefined()
      sign.name = "discard  pile"
      expect(spellCore.elementIdFor(sign)).toBe("discard-pile")
      expect(spellCore.elementIdFor(3)).toBeUndefined()
    })

    test("only drawable things count:  a pile named like a card leaves the card its plain id", () => {
      const pile = new Pile({ name: "ace-of-spades" })
      const card = new Card({ rank: "ace" })
      expect(spellCore.elementIdFor(card)).toBe("ace-of-spades")
      expect(pile.name).toBe("ace-of-spades")
    })
  })
})
