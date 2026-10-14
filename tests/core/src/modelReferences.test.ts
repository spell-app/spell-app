import { afterEach, describe, test, expect } from "vite-plus/test"

import { spellCore, Thing, type ThingsToSearch } from "$/core/model"

/**
 * References by name and place under `$/core/model`, which has no running program:  they search what the caller
 * says (`searchThings()`, epic `people-and-orgs` P9, Q44).  This file loads the model ALONE, never the barrel.
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
  afterEach(() => void spellCore.searchThings(undefined))

  test("nothing is found before the caller says what to search", () => {
    expect(spellCore.thingForReference("Person#owen")).toBeUndefined()
    expect(spellCore.thingNamed(Person, "owen")).toBeUndefined()
  })

  test("by name, by place, and a thing's reference back, in what searchThings() was given", () => {
    spellCore.searchThings(people)
    expect(spellCore.thingForReference("Person#owen")).toBe(owen)
    expect(spellCore.thingForReference("Person#2")).toBe(ana)
    expect(spellCore.thingNamed(Org, "spell")).toBe(spell)
    expect(spellCore.thingAtPlace(Person, -1)).toBe(ana)
    expect(spellCore.referenceFor(ana)).toBe("Person#ana")
    expect(spellCore.referenceFor(spell)).toBe("Org#spell")
    expect(spellCore.referenceFor(new Person({ name: "nobody" }))).toBeUndefined()
  })

  test("searchThings() returns what was searched before, to put back", () => {
    expect(spellCore.searchThings(people)).toBeUndefined()
    expect(spellCore.searchThings(undefined)).toBe(people)
    expect(spellCore.thingForReference("Person#owen")).toBeUndefined()
  })

  test("an element's id needs drawing:  it says so", () => {
    expect(() => spellCore.elementIdFor(owen)).toThrow(/needs drawing/)
  })
})
