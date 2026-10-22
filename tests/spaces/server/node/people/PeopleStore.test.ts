import { mkdtempSync, rmSync } from "fs"
import { tmpdir } from "os"
import { resolve } from "path"
import { afterAll, describe, test, expect } from "vite-plus/test"

import { PeopleStore, orgFile, personFile } from "spell-app/spaces/server/node/people/PeopleStore"
import { DiskStorage } from "spell-app/spaces/server/node/storage/DiskStorage"

/** People and orgs on disk (epic `people-and-orgs` P9):  on a temporary spell-spaces. */
const root = mkdtempSync(resolve(tmpdir(), "spell-people-"))
const storage = new DiskStorage(root)
const store = new PeopleStore(storage)
afterAll(() => {
  storage.close()
  rmSync(root, { recursive: true, force: true })
})

/** Matt's file, in another org, with a comment. */
const MATT = `{
  // matt, at three degrees
  "$type": "Person",
  "id": "matt",
  "names": "Matt"
}
`

describe("PeopleStore", () => {
  test("me():  the first time, a starter file, from git's name and email, saying what it is", async () => {
    const { person, problems } = await store.me("owen")
    expect(problems).toEqual([])
    expect(person.id).toBe("owen")
    expect(person.names).toBeTruthy()
    const text = await storage.read(personFile("owen", "spell"))
    expect(text).toContain("// You, as spell knows you")
  })

  test("change():  the panel's fields written into the file, its comments kept", async () => {
    const { person } = await store.me("owen")
    await store.change(person, {
      names: "Owen Williams",
      nickname: "O",
      emails: ["owen@example.com", " "],
      dates: [{ label: "birthday", day: "1970-01-01" }]
    })
    const text = await storage.read(personFile("owen", "spell"))
    expect(text).toContain("// You, as spell knows you")
    expect(text).toContain('"nickname": "O"')
    const again = (await store.person("owen")).person!
    expect(again.names).toBe("Owen Williams")
    expect(again.emails.items).toEqual(["owen@example.com"])
    expect(again.dates.items[0]!.day).toEqual(new Date("1970-01-01"))
  })

  test("a friend in another org:  read with them;  written back as a reference, never into their file", async () => {
    await storage.write(personFile("matt", "three-degrees"), MATT)
    const owen = (await store.person("owen")).person!
    const text = (await storage.read(personFile("owen", "spell")))!
    const withFriend = text.replace(
      '"dates"',
      '"friendLists": [{ "$type": "FriendList", "name": "family", "relationships": [{ "$type": "Relationship", "kind": "brother", "person": { "$ref": "Person#matt@three-degrees" } }] }],\n  "dates"'
    )
    await storage.write(personFile("owen", "spell"), withFriend)
    const { person, problems } = await store.person("owen")
    expect(problems).toEqual([])
    const matt = person!.friendLists.items[0]!.relationships.items[0]!.person
    expect(matt.names).toBe("Matt")

    await store.save(person!)
    expect(await storage.read(personFile("owen", "spell"))).toContain('"$ref": "Person#matt@three-degrees"')
    // matt's own file is never written by owen's save
    expect(await storage.read(personFile("matt", "three-degrees"))).toBe(MATT)
    expect(owen).not.toBe(person)
  })

  test("a file's problems, by file and property, read anyway", async () => {
    await storage.write(personFile("bad", "spell"), '{ "$type": "Person", "id": "bad", "names": 7 }')
    const { person, problems } = await store.person("bad")
    expect(person?.id).toBe("bad")
    expect(problems).toEqual([
      { file: "@spell/bad@/__me.json5", property: "names", message: "names is text, not a number" }
    ])
  })

  test("orgs, each from its folder's __org.json5;  a person's roles in them", async () => {
    await storage.write(
      orgFile("spell"),
      JSON.stringify({
        $type: "Org",
        id: "spell",
        name: "Spell",
        members: [{ $type: "Membership", person: { $ref: "Person#owen@spell" }, role: "spell-admin" }]
      })
    )
    await storage.write(
      orgFile("three-degrees"),
      JSON.stringify({
        $type: "Org",
        id: "three-degrees",
        members: [{ $type: "Membership", person: { $ref: "Person#owen" }, role: "member" }]
      })
    )
    const { orgs } = await store.orgs()
    expect(orgs.map((org) => org.id)).toEqual(["spell", "three-degrees"])
    const owen = (await store.person("owen")).person!
    expect(await store.rolesOf(owen)).toEqual([
      { id: "spell", name: "Spell", role: "spell-admin" },
      { id: "three-degrees", name: "three-degrees", role: "member" }
    ])
  })
})
