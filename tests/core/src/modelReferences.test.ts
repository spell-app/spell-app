import { afterEach, describe, test, expect } from "vite-plus/test"

import { core, Thing, type ThingsToSearch } from "$/core/model"

/**
 * References by name and place under `$/core/model`, which has no running program (epic `people-and-orgs` P9, Q44).
 * - They search what the caller hands `searchThings()`.
 * - This file loads the model ALONE, never the barrel.
 */
describe("references, in the model core", () => {
  class Person extends Thing {
    get name() {
      return this.getProp("name")
    }
    set name(value) {
      this.setProp("name", value)
    }
  }
  class Org extends Thing {}
  const owen = new Person({ name: "owen" })
  const ana = new Person({ name: "ana" })
  const spell = new Org()
  const people: ThingsToSearch = {
    all: () => [owen, ana, spell],
    classNamed: (name) => ({ Person, Org })[name],
    exported: { spell }
  }
  afterEach(() => void core.searchThings(undefined))

  test("nothing is found before the caller says what to search", () => {
    expect(core.thingForReference("Person#owen")).toBeUndefined()
    expect(core.thingNamed(Person, "owen")).toBeUndefined()
  })

  test("by name, by place, and a thing's reference back, in what searchThings() was given", () => {
    core.searchThings(people)
    expect(core.thingForReference("Person#owen")).toBe(owen)
    expect(core.thingForReference("Person#2")).toBe(ana)
    expect(core.thingNamed(Org, "spell")).toBe(spell)
    expect(core.thingAtPlace(Person, -1)).toBe(ana)
    expect(core.referenceFor(ana)).toBe("Person#ana")
    expect(core.referenceFor(spell)).toBe("Org#spell")
    expect(core.referenceFor(new Person({ name: "nobody" }))).toBeUndefined()
  })

  test("searchThings() returns what was searched before, to put back", () => {
    expect(core.searchThings(people)).toBeUndefined()
    expect(core.searchThings(undefined)).toBe(people)
    expect(core.thingForReference("Person#owen")).toBeUndefined()
  })

  test("an element's id needs drawing:  it says so", () => {
    expect(() => core.elementIdFor(owen)).toThrow(/needs drawing/)
  })
})
