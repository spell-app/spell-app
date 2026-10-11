import { describe, test, expect } from "vite-plus/test"

import { spellCore, Thing, List } from "$/core"

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
})
