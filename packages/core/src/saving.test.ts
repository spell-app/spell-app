import { readFileSync } from "fs"
import { resolve } from "path"
import { describe, test, expect } from "vite-plus/test"

import { Loader, Saver, spellCore, Thing, List } from "$/core"

/**
 * Things saved by id (`saving.ts`):  written by a `Saver`, read back by a `Loader`.
 * - `savedById.expected.json`, beside `src/`, holds the entries these tests write.
 *   Python's core writes the same things and reads the same file, so the two agree
 *   (`packages/py/core/tests/test_saving.py`).
 * - The classes are what spell compiles from:
 *   - `a person is a thing where:`, `- its "name" is text`, `- its "dates" is a list of dated-events`,
 *     `- its "friends" is a list of people`
 *   - `a dated-event is a thing where:`, `- its "label" is text`, `- its "day" is a date`, `- it is saved inline`
 *   - `a card is a thing`, `a card has a rank as text`, `a pile is a list of cards`
 */
const EXPECTED = JSON.parse(readFileSync(resolve(import.meta.dirname, "..", "savedById.expected.json"), "utf8")) as {
  root: string
  entries: Record<string, Record<string, unknown>>
}

////////////////
// ## Classes under test
////////////////

class Person extends Thing {
  static {
    this.declareProp("name", { type: "text" })
    this.declareProp("dates", { itemType: "DatedEvent", init: () => new List({ instanceType: "DatedEvent" }) })
    this.declareProp("friends", { itemType: "Person", init: () => new List({ instanceType: "Person" }) })
  }
  get name() {
    return this.getProp<string>("name")
  }
  set name(value) {
    this.setProp("name", value)
  }
  get dates() {
    return this.getProp<List<DatedEvent>>("dates")
  }
  set dates(value) {
    this.setProp("dates", value)
  }
  get friends() {
    return this.getProp<List<Person>>("friends")
  }
  set friends(value) {
    this.setProp("friends", value)
  }
}

class DatedEvent extends Thing {
  static savedInline = true
  static {
    this.declareProp("label", { type: "text" })
    this.declareProp("day", { type: "date" })
  }
  get label() {
    return this.getProp<string>("label")
  }
  set label(value) {
    this.setProp("label", value)
  }
  get day() {
    return this.getProp<Date>("day")
  }
  set day(value) {
    this.setProp("day", value)
  }
}

class Card extends Thing {
  get rank() {
    return this.getProp<string>("rank")
  }
  set rank(value) {
    this.setProp("rank", value)
  }
}

class Pile extends List<Card> {}

/** Look classes up by name, as `spellCore.things` would once a program made them. */
const CLASSES: Record<string, new (props?: Record<string, unknown>) => Thing | List> = {
  Person,
  DatedEvent,
  Card,
  Pile,
  List
}
const classNamed = (name: string) => CLASSES[name]

/** Owen and Matt, friends of each other:  a reference each way. */
function owenAndMatt(): Person {
  const owen = new Person({ id: "owen", name: "Owen" })
  const matt = new Person({ id: "matt", name: "Matt" })
  owen.dates.add(new DatedEvent({ label: "birthday", day: new Date("1970-01-01T00:00:00.000Z") }))
  owen.friends.add(matt)
  matt.friends.add(owen)
  return owen
}

/** A loader reading `entries`, as the program's classes. */
function loaderOf(entries: Map<string, Record<string, unknown>> | Record<string, Record<string, unknown>>): Loader {
  const map = entries instanceof Map ? entries : new Map(Object.entries(entries))
  return new Loader({ entryFor: (ref) => map.get(ref), classNamed })
}

////////////////
// ## Tests
////////////////

describe("Saver", () => {
  test("each thing an entry of its own, by id;  what holds it, a reference", () => {
    const { root, entries } = new Saver().save(owenAndMatt())
    expect(root).toBe("Person#owen")
    expect({ root, entries: Object.fromEntries(entries) }).toEqual(EXPECTED)
  })

  test("a kind saved inline is written whole, inside what holds it:  no entry of its own", () => {
    const { entries } = new Saver().save(owenAndMatt())
    expect([...entries.keys()]).toEqual(["Person#owen", "Person#matt"])
    expect(entries.get("Person#owen")!.dates).toEqual([
      { "@type": "DatedEvent", label: "birthday", day: "1970-01-01T00:00:00.000Z" }
    ])
  })

  test("a thing with no id is given one as it's saved, and keeps it", () => {
    const anon = new Person({ name: "Anon" })
    const { root } = new Saver().save(anon)
    expect(root).toMatch(/^Person#person-[0-9a-z]{8}$/)
    expect(root).toBe(`Person#${anon.id}`)
  })

  test("what a thing was made with and doesn't declare is saved too, and read back:  a foundation's `symbol`", () => {
    const clubs = new Card({ id: "clubs", symbol: "♣️" })
    const { root, entries } = new Saver().save(clubs)
    expect(entries.get(root)).toEqual({ "@type": "Card", id: "clubs", symbol: "♣️" })
    const loaded = loaderOf(entries).load(root) as unknown as { symbol: string }
    expect(loaded.symbol).toBe("♣️")
  })

  test("`refOf` names entries and references:  the people store names them by address", () => {
    const { root, entries } = new Saver({ refOf: (thing) => `${thing.id}@spell` }).save(owenAndMatt())
    expect(root).toBe("owen@spell")
    expect(entries.get("owen@spell")!.friends).toEqual([{ "@ref": "matt@spell" }])
  })
})

describe("Loader", () => {
  test("reads the entries back:  the same values, and each thing once, however many hold it", () => {
    const owen = loaderOf(EXPECTED.entries).load(EXPECTED.root) as Person
    expect(owen).toBeInstanceOf(Person)
    expect(owen.name).toBe("Owen")
    expect(owen.id).toBe("owen")
    const [birthday] = owen.dates.items
    expect(birthday).toBeInstanceOf(DatedEvent)
    expect(birthday!.day).toEqual(new Date("1970-01-01T00:00:00.000Z"))
    const [matt] = owen.friends.items
    expect(matt!.name).toBe("Matt")
    // a reference each way:  matt's friend IS owen, not a copy
    expect(matt!.friends.items[0]).toBe(owen)
  })

  test("a card in two piles comes back as ONE card", () => {
    const ace = new Card({ id: "ace", rank: "ace" })
    const [stock, discards] = [new Pile({ id: "stock" }), new Pile({ id: "discards" })]
    stock.add(ace)
    discards.add(ace)
    const holder = new List({ id: "piles" })
    holder.add(stock)
    holder.add(discards)
    const { root, entries } = new Saver().save(holder)
    const piles = loaderOf(entries).load(root) as List<Pile>
    const [first, second] = piles.items
    expect(first!.items[0]).toBeInstanceOf(Card)
    expect(first!.items[0]).toBe(second!.items[0])
  })

  test("saved, loaded, saved again:  the same entries", () => {
    const { root, entries } = new Saver().save(loaderOf(EXPECTED.entries).load(EXPECTED.root)!)
    expect({ root, entries: Object.fromEntries(entries) }).toEqual(EXPECTED)
  })

  test("a reference to nothing saved:  left out of a list, with a warning", () => {
    const warnings: unknown[][] = []
    const warn = spellCore.console.warn
    spellCore.console.warn = (...message: unknown[]) => void warnings.push(message)
    try {
      const entries = { "Person#owen": { ...EXPECTED.entries["Person#owen"], friends: [{ "@ref": "Person#nobody" }] } }
      const owen = loaderOf(entries).load("Person#owen") as Person
      expect(owen.friends.items).toEqual([])
      expect(warnings).toEqual([['Loader.load():  nothing is saved as "Person#nobody"']])
    } finally {
      spellCore.console.warn = warn
    }
  })
})
