import { describe, test, expect } from "vite-plus/test"

import { Loader, Saver, type List, type Thing } from "$/core"
import { runSpell } from "$/spell/test"

/**
 * Saving by id END TO END:  spell compiled, run, its things saved and loaded back (epic `people-and-orgs`, P2).
 * - The runtime alone is `core`'s `src/saving.test.ts`.
 */
describe("saving, compiled and run", () => {
  const PEOPLE = [
    "a person is a thing where:",
    '\t- its "name" is text',
    '\t- its "dates" is a list of dated-events',
    '\t- its "friends" is a list of people',
    "a dated-event is a thing where:",
    '\t- its "label" is text',
    "\t- it is saved inline"
  ]

  test("a person, their dates inline, their friend by reference -- loaded back as the same people", () => {
    const run = runSpell([
      ...PEOPLE,
      'owen = a new person with id = "owen", name = "Owen"',
      'matt = a new person with id = "matt", name = "Matt"',
      'add a new dated-event with label = "birthday" to the dates of owen',
      "add matt to the friends of owen",
      "add owen to the friends of matt"
    ])
    const { owen, matt } = run("owen, matt") as { owen: Person; matt: Person }
    const { root, entries } = new Saver().save(owen)
    expect(Object.fromEntries(entries)).toEqual({
      "Person#owen": {
        $type: "Person",
        id: "owen",
        name: "Owen",
        dates: [{ $type: "DatedEvent", label: "birthday" }],
        friends: [{ $ref: "Person#matt" }]
      },
      "Person#matt": { $type: "Person", id: "matt", name: "Matt", friends: [{ $ref: "Person#owen" }] }
    })

    const classes: Record<string, new () => Thing> = {
      Person: owen.constructor as new () => Thing,
      DatedEvent: owen.dates.items[0]!.constructor as new () => Thing
    }
    const loader = new Loader({ entryFor: (ref) => entries.get(ref), classNamed: (name) => classes[name] })
    const loaded = loader.load(root) as unknown as Person
    expect(loaded).not.toBe(owen)
    expect(loaded.name).toBe("Owen")
    expect(loaded.dates.items.map((date) => date.label)).toEqual(["birthday"])
    const [friend] = loaded.friends.items
    expect(friend!.name).toBe(matt.name)
    expect(friend!.friends.items[0]).toBe(loaded)
  })
})

/** What the compiled `person` above has, for the test to read. */
type Person = Thing & { name: string; dates: List<Thing & { label: string }>; friends: List<Person> }
