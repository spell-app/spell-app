import { describe, test, expect } from "vite-plus/test"

import { P } from "$/parser"
import { spellCore, List } from "$/core"
import { SP } from "$/spell"

/**
 * `SP.BUILT_IN_TYPE_TABLE` -- spell's built-in types' members, as data.
 * - Pins each member's `readAs` template to something REAL:  a `spellCore` helper,
 *   or a javascript property or method of a sample value of its type.
 *   - Reads it off that value, to check it's what the member says.
 * - Pins each `rules` name to a live rule, and each type to the root scope's.
 */
describe("built-in type table", () => {
  test("each type is in the root scope, with the super-type `P.BUILT_IN_TYPES` gives it", () => {
    for (const entry of SP.BUILT_IN_TYPE_TABLE) {
      expect(Object.hasOwn(P.BUILT_IN_TYPES, entry.name), entry.name).toBe(true)
      expect(entry.superType, entry.name).toBe(P.BUILT_IN_TYPES[entry.name])
      const type = SP.SpellParser.rootScope.types.get(entry.name, "LOCAL_ONLY")
      expect(type, entry.name).toBeDefined()
      expect(SP.isBuiltInTypeScope(type)).toBe(true)
    }
  })

  test("each member's `readAs` template reads a REAL `spellCore` helper or javascript member -- of its datatype", () => {
    const read: string[] = []
    for (const entry of SP.BUILT_IN_TYPE_TABLE) {
      for (const member of entry.members.filter((it) => it.readAs)) {
        const where = `${entry.name}'s ${member.words}:  ${member.readAs}`
        const template = SP.parseReadAsTemplate(member.readAs!)
        expect(template, where).toBeDefined()
        const sample = SAMPLES[entry.name]
        expect(sample, `${where} -- no sample ${entry.name}`).toBeDefined()
        const value = readMember(template!, sample)
        expect(isA(value, member.datatype), `${where} => ${String(value)}`).toBe(true)
        read.push(`${entry.name} ${member.words} => ${JSON.stringify(value)}`)
      }
    }
    expect(read).toMatchInlineSnapshot(`
      [
        "list length => 3",
        "list size => 3",
        "text length => 3",
        "text characters => ["A","d","a"]",
        "date year => 2026",
        "date day => 4",
      ]
    `)
  })

  test("each `rules` name is a live rule", () => {
    const names = SP.BUILT_IN_TYPE_TABLE.flatMap((entry) => [
      ...(entry.rules ?? []),
      ...entry.members.flatMap((member) => member.rules ?? [])
    ])
    expect(names.filter((name) => !SP.spellParser.rules[name])).toEqual([])
  })

  test("a member with `readAs` is in its type's scope, as a property `getMember()` finds;  one with only `rules` isn't", () => {
    const list = SP.SpellParser.rootScope.types.get("list")!
    expect(list.getMember("length")).toMatchObject({ name: "length", datatype: "number" })
    expect(list.getMember("shuffle (a list)")).toBeUndefined()
    // a sub-type finds it too, e.g. `a deck is a list of cards`
    expect(SP.SpellParser.rootScope.types.get("text")!.itemType).toBe("character")
  })

  test("a template that's none of the forms is refused", () => {
    expect(SP.parseReadAsTemplate("{it}.length")).toEqual({ form: "property", name: "length" })
    expect(SP.parseReadAsTemplate("{it}.getFullYear()")).toEqual({ form: "method", name: "getFullYear" })
    expect(SP.parseReadAsTemplate("spellCore.itemCountOf({it})")).toEqual({ form: "spellCore", name: "itemCountOf" })
    expect(SP.parseReadAsTemplate("spellCore.getItemOf({it}, 1)")).toBeUndefined()
    expect(SP.parseReadAsTemplate("it.length")).toBeUndefined()
  })
})

/** `SP.typeName()`:  spell's words for its types, handed to the parser's language-free `P.typeName()`. */
describe("typeName()", () => {
  test("spell's own ways to write a built-in type", () => {
    expect(SP.typeName("string")).toBe("text")
    expect(SP.typeName("Yes or No")).toBe("choice")
    expect(SP.typeName("fractions")).toBe("number")
    expect(SP.typeName("array of Card")).toBe("list of cards")
    expect(SP.typeName("lists of numbers")).toBe("list of numbers")
  })

  test("the parser alone knows only each datatype's own name", () => {
    expect(P.typeName("Text")).toBe("text")
    expect(P.typeName("list of cards")).toBe("list of cards")
    expect(P.typeName("string")).toBe("String")
    expect(P.typeName("array of Card")).toBe("Array of Card")
  })

  test("anything else is a user's type, Type_Case and singular", () => {
    expect(SP.typeName("cards")).toBe("Card")
    expect(SP.typeName("playing_cards")).toBe("Playing_Card")
  })
})

/** A value of each built-in type the table has members for, to read them off. */
const SAMPLES: Record<string, unknown> = {
  text: "Ada",
  list: Object.assign(new List({}), { items: ["a", "b", "c"] }),
  date: new Date(2026, 9, 4),
  thing: {},
  app: {}
}

/**
 * Read the member `template` names off `sample`, as compiled code would.
 * - Throws if there's no such helper, property or method.
 */
function readMember({ form, name }: SP.ReadAsTemplate, sample: unknown): unknown {
  if (form === "spellCore") {
    const helper = (spellCore as unknown as Record<string, unknown>)[name]
    if (typeof helper !== "function") throw new Error(`no spellCore.${name}()`)
    return (helper as (it: unknown) => unknown).call(spellCore, sample)
  }
  const object = Object(sample) as Record<string, unknown>
  if (!(name in object)) throw new Error(`no '${name}' on ${String(sample)}`)
  const value = object[name]
  if (form === "property") return value
  if (typeof value !== "function") throw new Error(`'${name}' of ${String(sample)} isn't a method`)
  return (value as () => unknown).call(sample)
}

/**
 * Is `value` a `datatype`, as the runtime says?
 * - A `list of ...` is any list.
 * - Unknown datatype:  anything is.
 */
function isA(value: unknown, datatype: P.Datatype | undefined): boolean {
  if (!datatype) return true
  if (P.itemTypeOf(datatype)) return spellCore.isArrayLike(value)
  return spellCore.isOfType(value, datatype)
}
