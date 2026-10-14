import { describe, test, expect } from "vite-plus/test"

import { checkEntry, Loader, Saver, Thing, upgradeEntry, versionOf } from "$/core"

/**
 * A saved thing's VERSION, and bringing an older file up to its type's (`saving.ts`, epic `people-and-orgs` P6).
 * - The class is what spell compiles from:
 *   - `a person is a thing where:`, `- it has names as text`, `- it has a full-name as text`
 *   - `a person version 2 renames name to names`
 *   - `a person version 3 drops nickname`
 *   - `to upgrade (a person) to version 4: set its full-name to its names + " " + its surname`
 */
class Person extends Thing {
  static v2RenamesName = "names"
  static v3DropsNickname = true
  static {
    this.declareProp("names", { type: "text" })
    this.declareProp("fullName", { type: "text" })
  }
  get names() {
    return this.getProp<string>("names")
  }
  set names(value) {
    this.setProp("names", value)
  }
  get fullName() {
    return this.getProp<string>("fullName")
  }
  set fullName(value) {
    this.setProp("fullName", value)
  }
  upgradeToVersion4() {
    // what the old file held that the type no longer declares is still there to read
    this.fullName = `${this.names} ${(this as unknown as { surname: string }).surname}`
  }
}

/** A type with no version steps:  version 1. */
class Note extends Thing {}

const classNamed = (name: string) => ({ Person, Note })[name] as never

/** A file saved as version 1:  no `$version`. */
const VERSION_1 = { $type: "Person", id: "owen", name: "Owen", nickname: "O", surname: "Williams" }

describe("versions", () => {
  test("a type's version is the highest its steps and upgrade methods name;  1 with none", () => {
    expect(versionOf(Person)).toBe(4)
    expect(versionOf(Note)).toBe(1)
  })

  test("the saver writes `$version` past 1, right after `$type`;  none for version 1", () => {
    const { entries } = new Saver().save(new Person({ id: "ann", names: "Ann" }))
    expect(Object.keys(entries.get("Person#ann")!).slice(0, 2)).toEqual(["$type", "$version"])
    expect(entries.get("Person#ann")!.$version).toBe(4)
    expect(new Saver().save(new Note({ id: "n" })).entries.get("Note#n")).not.toHaveProperty("$version")
  })

  test("an older entry, upgraded:  each version's renames and drops in turn, then its upgrade methods", () => {
    const { entry, upgrades } = upgradeEntry(VERSION_1, Person)
    expect(entry).toEqual({ $type: "Person", id: "owen", names: "Owen", surname: "Williams", $version: 4 })
    expect(upgrades).toEqual(["upgradeToVersion4"])
    // the entry it was given is never changed
    expect(VERSION_1).toHaveProperty("name", "Owen")
  })

  test("a version 1 file reads as the newest version, and saves as it", () => {
    const owen = new Loader({ entryFor: () => VERSION_1, classNamed }).load("Person#owen") as Person
    expect(owen.names).toBe("Owen")
    expect(owen.fullName).toBe("Owen Williams")
    const saved = new Saver().save(owen).entries.get("Person#owen")!
    expect(saved).toMatchObject({ $type: "Person", $version: 4, names: "Owen", fullName: "Owen Williams" })
    expect(saved).not.toHaveProperty("name")
    expect(saved).not.toHaveProperty("nickname")
  })

  test("a file at a middle version takes only the steps after it", () => {
    const { entry, upgrades } = upgradeEntry({ $type: "Person", $version: 3, names: "Ann", nickname: "A" }, Person)
    expect(entry).toEqual({ $type: "Person", $version: 4, names: "Ann", nickname: "A" })
    expect(upgrades).toEqual(["upgradeToVersion4"])
  })

  test("a file at its type's version, or past it, reads as it is", () => {
    const current = { $type: "Person", $version: 4, names: "Ann" }
    expect(upgradeEntry(current, Person)).toEqual({ entry: current, upgrades: [] })
    const newer = { $type: "Person", $version: 9, names: "Ann" }
    expect(upgradeEntry(newer, Person).entry).toBe(newer)
  })

  test("the checker reads an older file as it reads now:  its old names are no problem", () => {
    expect(checkEntry({ $type: "Person", id: "owen", name: "Owen" }, { classNamed })).toEqual([])
  })
})
