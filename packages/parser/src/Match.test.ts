import { describe, test, expect, expectTypeOf } from "vite-plus/test"
import { proto } from "$/util"
import { P, Match, Parser } from "$/parser"
// These tests define rules with rulex `syntax`, so they must opt into the rulex parser.
import "$/parser/rulex"

class word extends P.TokenType {
  @proto static tokenType = P.WordToken
}

/** Rule which declares required / optional groups and what it stashes on its matches. */
class typed_sequence extends P.Sequence<"lhs|rhs?", { note?: string }> {
  static ruleName = "typed"
  @proto static syntax = "{lhs:word} is {rhs:word}?"

  mutateScope(match: P.MatchFor<this>) {
    match.data.note = `saw ${match.groups.lhs.value}`
  }
}

/** Parser with `typed_sequence` installed. */
function makeParser() {
  return new Parser({ rules: [word, typed_sequence] })
}

describe("P.GroupsFor", () => {
  test("names are required unless adorned with `?`", () => {
    expectTypeOf<P.GroupsFor<"lhs|rhs?">>().toEqualTypeOf<{ lhs: Match; rhs?: Match }>()
  })
  test("`[]` makes array of values", () => {
    expectTypeOf<P.GroupsFor<"item[]|extra[]?">>().toEqualTypeOf<{ item: Match[]; extra?: Match[] }>()
  })
  test("`ValueType` overrides value", () => {
    expectTypeOf<P.GroupsFor<"count", number>>().toEqualTypeOf<{ count: number }>()
  })
})

describe("P.Rule type arguments", () => {
  test("bare `P.Rule` / `P.Sequence` / `P.Match` are valid types which accept typed rules", () => {
    const rule = new typed_sequence({ rules: [] })
    expectTypeOf(rule).toExtend<P.Rule>()
    expectTypeOf(rule).toExtend<P.Sequence>()
    expectTypeOf<P.MatchFor<typed_sequence>>().toExtend<P.Match>()
  })
  test("`P.MatchFor` recovers `groups` and `data` shapes", () => {
    expectTypeOf<P.MatchFor<typed_sequence>["groups"]>().toEqualTypeOf<{ lhs: Match; rhs?: Match }>()
    expectTypeOf<P.MatchFor<typed_sequence>["data"]>().toEqualTypeOf<{ note?: string }>()
  })
  test("`Groups` may be an explicit object type", () => {
    type Derived = P.GroupsFor<"source"> & { bits: string[] }
    class derived_sequence extends P.Sequence<Derived> {}
    expectTypeOf<P.MatchFor<derived_sequence>["groups"]["bits"]>().toEqualTypeOf<string[]>()
    expectTypeOf(new derived_sequence({ rules: [] })).toExtend<P.Rule>()
  })
})

describe("match.data", () => {
  test("starts empty and is the same object on each access", () => {
    const match = makeParser().parse("a is b", "typed")!
    expect(match.data).toEqual({})
    expect(match.data).toBe(match.data)
  })
  test("holds what rule stashes, leaving rule itself untouched", () => {
    const match = makeParser().parse("a is b", "typed")!
    const keysBefore = Object.keys(match.rule)
    match.rule.mutateScope(match)
    expect(match.data).toEqual({ note: "saw a" })
    expect(Object.keys(match.rule)).toEqual(keysBefore)
  })
})

describe("match.is()", () => {
  test("is true for rule class which produced match, narrowing `groups` and `data`", () => {
    const match = makeParser().parse("a is", "typed")!
    expect(match.is(typed_sequence)).toBe(true)
    if (match.is(typed_sequence)) {
      expectTypeOf(match.groups.lhs).toEqualTypeOf<Match>()
      expectTypeOf(match.data.note).toEqualTypeOf<string | undefined>()
      expect(match.groups.lhs.value).toBe("a")
      expect(match.groups.rhs).toBeUndefined()
    }
  })
  test("narrows `rule` too, so rule methods are callable", () => {
    const match = makeParser().parse("a is b", "typed")!
    if (!match.is(typed_sequence)) throw new Error("expected typed_sequence match")
    expectTypeOf(match.rule).toExtend<typed_sequence>()
    match.rule.mutateScope(match)
    expect(match.data.note).toBe("saw a")
  })
  test("accepts base classes, rejects unrelated ones", () => {
    const match = makeParser().parse("a is b", "typed")!
    expect(match.is(P.Sequence)).toBe(true)
    expect(match.is(P.Pattern)).toBe(false)
  })
})

describe("Match positions", () => {
  test("`end` stops at the text, `next` includes trailing whitespace", () => {
    const match = makeParser().parse("a is b   ", "typed")!
    expect(match.start).toBe(0)
    expect(match.end).toBe("a is b".length)
    expect(match.next).toBe("a is b   ".length)
  })
})
