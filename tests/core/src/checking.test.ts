import { describe, test, expect } from "vite-plus/test"

import { checkEntry, jsonSchemaFor, kindOf, List, Saver, Thing } from "$/core"

/**
 * A saved entry checked against its class, and the JSON Schema VS Code checks the same file with
 * (`checking.ts`, epic `people-and-orgs` P5, decision Q43).
 * - The classes are what spell compiles from:
 *
 *   ```spell
 *   a person is a thing where:
 *   - its "name" is text
 *   - its "age" is a number
 *   - its "mood" is one of "happy", "grumpy"
 *   - its "dates" is a list of dated-events
 *   - its "friends" is a list of people
 *   - its "best" is a person
 *
 *   a dated-event is a thing where:
 *   - its "label" is text
 *   - its "day" is a date
 *   - it is saved inline
 *
 *   a pen-pal is a person
 *   ```
 */
class Person extends Thing {
  static {
    this.declareProp("name", { type: "text" })
    this.declareProp("age", { type: "number" })
    this.declareProp("mood", { type: "text", oneOf: ["happy", "grumpy"] })
    this.declareProp("dates", { itemType: "DatedEvent", init: () => new List({ instanceType: "DatedEvent" }) })
    this.declareProp("friends", { itemType: "Person", init: () => new List({ instanceType: "Person" }) })
    this.declareProp("best", { type: "Person" })
  }
}

class DatedEvent extends Thing {
  static savedInline = true
  static {
    this.declareProp("label", { type: "text" })
    this.declareProp("day", { type: "date" })
  }
}

class PenPal extends Person {}

const CLASSES: Record<string, Function> = { Person, DatedEvent, PenPal }
const options = { classNamed: (name: string) => CLASSES[name] }

/** A saved person, right in every way. */
const OWEN = {
  $schema: "@spell/library/people/Person",
  $version: 1,
  $type: "Person",
  id: "owen",
  name: "Owen",
  age: 50,
  mood: "happy",
  dates: [{ $type: "DatedEvent", label: "birthday", day: "1975-04-01T00:00:00.000Z" }],
  friends: [{ $ref: "Person#matt" }, { $ref: "PenPal#ann@three-degrees" }],
  best: { $ref: "Person#matt" }
}

describe("checkEntry()", () => {
  test("a right entry:  no problems;  the file's own $ keys aren't properties", () => {
    expect(checkEntry(OWEN, options)).toEqual([])
  })

  test("what a Saver writes checks clean", () => {
    const owen = new Person({ name: "Owen", age: 50 })
    const { entries } = new Saver().save(owen)
    for (const entry of entries.values()) expect(checkEntry(entry, options)).toEqual([])
  })

  test("a property of the wrong kind says which, and what it should be", () => {
    expect(checkEntry({ ...OWEN, name: 3, age: "fifty" }, options)).toEqual([
      { property: "name", message: "name is text, not a number" },
      { property: "age", message: "age is a number, not text" }
    ])
  })

  test("a property the class doesn't declare", () => {
    expect(checkEntry({ ...OWEN, nickname: "O" }, options)).toEqual([
      { property: "nickname", message: "a Person has no nickname" }
    ])
  })

  test("a value that isn't one of the legal ones", () => {
    expect(checkEntry({ ...OWEN, mood: "sleepy" }, options)).toEqual([
      { property: "mood", message: 'mood is one of "happy", "grumpy"' }
    ])
  })

  test("a list's items, and a thing written whole inside, are checked too", () => {
    const entry = { ...OWEN, dates: [{ $type: "DatedEvent", label: 7, day: "not a date" }], friends: "matt" }
    expect(checkEntry(entry, options)).toEqual([
      { property: "dates[0].label", message: "label is text, not a number" },
      { property: "dates[0].day", message: "day is a date, not text" },
      { property: "friends", message: "friends is a list, not text" }
    ])
  })

  test("a reference names a thing of the property's type, or a kind of it", () => {
    expect(checkEntry({ ...OWEN, best: { $ref: "PenPal#ann" } }, options)).toEqual([])
    expect(checkEntry({ ...OWEN, best: { $ref: "DatedEvent#x" } }, options)).toEqual([
      { property: "best", message: 'best is a Person:  "DatedEvent#x" isn\'t one' }
    ])
  })

  test("nothing (null) is always allowed:  an unset property", () => {
    expect(checkEntry({ ...OWEN, name: null, best: null }, options)).toEqual([])
  })

  test("no $type, or one no class has", () => {
    expect(checkEntry({ id: "x" }, options)).toEqual([{ property: "", message: 'it says no "$type"' }])
    expect(checkEntry({ $type: "Nobody" }, options)).toEqual([{ property: "", message: "no type is named Nobody" }])
  })
})

describe("jsonSchemaFor()", () => {
  const schema = jsonSchemaFor(Person) as {
    title: string
    properties: Record<string, Record<string, unknown>>
    additionalProperties: boolean
  }

  test("the class's declared properties, each of its kind, and the file's own keys", () => {
    expect(schema.title).toBe("Person")
    expect(schema.additionalProperties).toBe(false)
    expect(Object.keys(schema.properties)).toEqual([
      "$schema",
      "$version",
      "$type",
      "id",
      "name",
      "age",
      "mood",
      "dates",
      "friends",
      "best"
    ])
    expect(schema.properties.$type).toEqual({ const: "Person" })
    expect(schema.properties.name).toEqual({ type: ["string", "null"] })
    expect(schema.properties.mood).toEqual({ enum: ["happy", "grumpy", null] })
    expect(schema.properties.friends).toMatchObject({ type: "array" })
  })

  test("a subclass's schema holds what it inherits", () => {
    const penPal = jsonSchemaFor(PenPal) as { properties: Record<string, unknown> }
    expect(Object.keys(penPal.properties)).toEqual(expect.arrayContaining(["name", "friends", "best"]))
  })

  test("it agrees with checkEntry():  every property it lists is one checkEntry() takes, and no other", () => {
    const listed = Object.keys(schema.properties).filter((name) => !name.startsWith("$"))
    for (const name of listed) expect(checkEntry({ $type: "Person", [name]: null }, options), name).toEqual([])
    expect(listed).not.toContain("nickname")
    expect(checkEntry({ $type: "Person", nickname: null }, options)).toHaveLength(1)
  })

  test("both read a property's kind through kindOf()", () => {
    expect(kindOf({ type: "text" })).toEqual({ kind: "text" })
    expect(kindOf({ itemType: "Person" })).toEqual({ kind: "list", item: { kind: "thing", className: "Person" } })
    expect(kindOf({ type: "text", oneOf: () => ["a", "b"] })).toEqual({ kind: "text", oneOf: ["a", "b"] })
    expect(kindOf(undefined)).toEqual({ kind: "any" })
  })

  test("no sample reference anywhere:  `$ref` is only ever a property's name (decision J3)", () => {
    expect(JSON.stringify(schema)).not.toMatch(/"\$ref":"[A-Z]\w*#/)
  })
})

describe("jsonSchemaFor():  a property's rules (epic `property-editor` P9)", () => {
  /** `- it has a version as text, which must match "^\d+$"` ... */
  class Release extends Thing {}
  Release.declareProp("version", {
    type: "text",
    rules: [{ type: "empty" }, { type: "regExp", value: "/^\\d+$/", prompt: "Digits only" }]
  })
  Release.declareProp("stars", { type: "number", rules: [{ type: "range", value: "1..5" }] })
  Release.declareProp("site", { type: "text", rules: [{ type: "url" }, { type: "maxLength", value: "80" }] })

  test("become JSON Schema's own keywords, for VS Code", () => {
    const { properties } = jsonSchemaFor(Release) as { properties: Record<string, Record<string, unknown>> }
    expect(properties.version).toMatchObject({ minLength: 1, pattern: "^\\d+$", patternErrorMessage: "Digits only" })
    expect(properties.stars).toMatchObject({ minimum: 1, maximum: 5 })
    expect(properties.site).toMatchObject({ format: "uri", maxLength: 80 })
  })
})
