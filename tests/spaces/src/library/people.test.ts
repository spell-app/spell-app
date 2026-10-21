import { execFileSync } from "child_process"
import { readFileSync } from "fs"
import { resolve } from "path"
import { describe, test, expect } from "vite-plus/test"

import { checkEntry, Loader, Saver } from "spell-lang/core/model"

/**
 * The people library, `@spell/library/people` (epic `people-and-orgs` P7):  people, orgs and what they keep.
 * - The first test that reads a LIVE project, not a frozen test project:
 *   its committed library must be what its spell compiles to now (J23).
 */
const REPO = resolve(import.meta.dirname, "../../../..")
const LIBRARY = resolve(REPO, "spaces/@spell/library/people/people.lib.ts")

describe("the people library", () => {
  test("its committed people.lib.ts is what its spell compiles to now:  else `spell compile @spell/library/people`", () => {
    const compiled = execFileSync(
      process.execPath,
      [resolve(REPO, "cli/bin/spell.mjs"), "compile", "@spell/library/people", "--target", "ts/lib", "--stdout"],
      { cwd: REPO, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }
    )
    expect(compiled.trim()).toBe(readFileSync(LIBRARY, "utf8").trim())
  }, 120_000)

  test("a person is saved in a file of their own;  what they keep, inside it;  a friend, by reference", async () => {
    const People = (await import(LIBRARY)) as Record<string, new (props?: Record<string, unknown>) => any>
    const owen = new People.Person({ id: "owen", names: "Owen Williams", nickname: "O" })
    const matt = new People.Person({ id: "matt", names: "Matt" })
    owen.emails.add("owen@example.com")
    owen.dates.add(new People.DatedEvent({ label: "birthday", day: new Date("1970-01-01T00:00:00.000Z") }))
    const family = new People.FriendList({ name: "family" })
    family.relationships.add(new People.Relationship({ kind: "brother", person: matt }))
    owen.friendLists.add(family)

    const { root, entries } = new Saver().save(owen)
    expect([...entries.keys()]).toEqual(["Person#owen", "Person#matt"])
    expect(entries.get("Person#owen")!.friendLists).toEqual([
      {
        $type: "FriendList",
        name: "family",
        relationships: [{ $type: "Relationship", kind: "brother", person: { $ref: "Person#matt" } }]
      }
    ])

    const classNamed = (name: string) => People[name]
    for (const entry of entries.values()) expect(checkEntry(entry, { classNamed })).toEqual([])
    const loaded = new Loader({ entryFor: (ref) => entries.get(ref), classNamed }).load(root) as any
    expect(loaded.friendLists.items[0].relationships.items[0].person.names).toBe("Matt")
    expect(loaded.dates.items[0].day).toEqual(new Date("1970-01-01T00:00:00.000Z"))
  })

  test("an org, and its members:  each a membership, a person and their role", async () => {
    const People = (await import(LIBRARY)) as Record<string, any>
    const owen = new People.Person({ id: "owen", names: "Owen" })
    const spell = new People.Org({ id: "spell", name: "Spell" })
    spell.members.add(new People.Membership({ person: owen, role: "spell-admin" }))
    expect(People.Membership.Roles).toEqual(["guest", "member", "admin", "spell-admin"])
    const { entries } = new Saver().save(spell)
    expect(entries.get("Org#spell")!.members).toEqual([
      { $type: "Membership", person: { $ref: "Person#owen" }, role: "spell-admin" }
    ])
    const classNamed = (name: string) => People[name]
    expect(
      checkEntry({ ...entries.get("Org#spell")!, members: [{ $type: "Membership", role: "boss" }] }, { classNamed })
    ).toEqual([
      {
        property: "members[0].role",
        message: 'members[0].role is one of "guest", "member", "admin", "spell-admin"'
      }
    ])
  })
})
