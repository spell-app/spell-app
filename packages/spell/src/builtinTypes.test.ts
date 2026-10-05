import { describe, test, expect } from "vite-plus/test"

import { P } from "$/parser"
import { spellCore, List } from "$/core"
import { SP } from "$/spell"

/**
 * `SP.BUILT_IN_TYPE_TABLE` -- spell's built-in types' members, as data.
 * - Pins each member's `compile` template to something REAL:  a `spellCore` helper, or a javascript property or
 *   method of a sample value of its type -- and reads it off that value, to check it's what the member says.
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

  test("each member's `compile` template reads a REAL `spellCore` helper or javascript member -- of its datatype", () => {
    const read: string[] = []
    for (const entry of SP.BUILT_IN_TYPE_TABLE) {
      for (const member of entry.members.filter((it) => it.compile)) {
        const where = `${entry.name}'s ${member.words}:  ${member.compile}`
        const template = SP.parseCompileTemplate(member.compile!)
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

  test("a member with `compile` is in its type's scope, as a property `getMember()` finds;  one with only `rules` isn't", () => {
    const list = SP.SpellParser.rootScope.types.get("list")!
    expect(list.getMember("length")).toMatchObject({ name: "length", datatype: "number" })
    expect(list.getMember("shuffle (a list)")).toBeUndefined()
    // a sub-type finds it too, e.g. `a deck is a list of cards`
    expect(SP.SpellParser.rootScope.types.get("text")!.itemType).toBe("character")
  })

  test("a template that's none of the forms is refused", () => {
    expect(SP.parseCompileTemplate("{it}.length")).toEqual({ form: "property", name: "length" })
    expect(SP.parseCompileTemplate("{it}.getFullYear()")).toEqual({ form: "method", name: "getFullYear" })
    expect(SP.parseCompileTemplate("spellCore.itemCountOf({it})")).toEqual({ form: "spellCore", name: "itemCountOf" })
    expect(SP.parseCompileTemplate("spellCore.getItemOf({it}, 1)")).toBeUndefined()
    expect(SP.parseCompileTemplate("it.length")).toBeUndefined()
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
 * Read the member `template` names off `sample`, as compiled code would -- throwing if there's no such helper,
 * property or method.
 */
function readMember({ form, name }: SP.CompileTemplate, sample: unknown): unknown {
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

/** Is `value` a `datatype`, as the runtime says -- a `list of ...` any list?  Unknown datatype:  anything is. */
function isA(value: unknown, datatype: P.Datatype | undefined): boolean {
  if (!datatype) return true
  if (P.itemTypeOf(datatype)) return spellCore.isArrayLike(value)
  return spellCore.isOfType(value, datatype)
}
