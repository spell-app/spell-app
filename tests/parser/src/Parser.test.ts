//
// # Tests for `Parser` class.
// Note that lots of parser functionality is tested via other files in this package. ???
//

import { describe, test, expect } from "vite-plus/test"
import { proto } from "$/util"
import { P, Parser, ParserError, Rule, type RuleConstructor } from "$/parser"
// These tests define rules with rulex `syntax`, so they must opt into the rulex parser.
import "$/parser/rulex"

describe("addRule() and rules", () => {
  test("parser.rules works when no rules are defined", () => {
    const parser = new Parser()
    expect(parser.rules).toEqual({})
  })

  test("parser.rules is memoized properly when rules don't change", () => {
    const parser = new Parser()
    expect(parser.rules).toBe(parser.rules)
  })

  test("parser.rules changes when addRule() is called", () => {
    const parser = new Parser()
    const startRules = parser.rules
    // Rule is abstract; that's fine here since we're only testing addRule() plumbing.
    parser.addRule(new (Rule as unknown as RuleConstructor)(), "foo")

    expect(parser.rules).not.toBe(startRules)
  })

  test("parser.rules changes when import() is called", () => {
    const parser = new Parser()
    const startRules = parser.rules
    parser.import(new Parser())
    expect(parser.rules).not.toBe(startRules)
  })

  test("throws if a rule instance has neither 'name' nor an explicit ruleName", () => {
    const parser = new Parser()
    // Deliberately missing `literal` -- doesn't matter since it's never compiled/parsed.
    expect(() => parser.addRule(new P.Symbol({} as any))).toThrow(ParserError)
    expect(parser.rules).toEqual({})
  })
})

describe("Parser.import()", () => {
  test("adds new rules directly in either direction", () => {
    class rule1 extends P.Sequence {
      @proto static syntax = "foo1"
    }
    class rule2 extends P.Sequence {
      @proto static syntax = "bar2"
    }
    const foo = new Parser({ module: "foo" })
    foo.addRule(rule1)

    const bar = new Parser({ module: "bar" })
    bar.addRule(rule2)

    foo.import(bar)
    expect(foo.rules.rule1).toBe(foo.rules.rule1)
    expect(foo.rules.rule2).toBe(bar.rules.rule2)
  })

  test("merges individual rules into a new group", () => {
    class foo_rule1 extends P.Sequence {
      static ruleName = "rule1"
      @proto static syntax = "foo1"
    }
    class bar_rule1 extends P.Sequence {
      static ruleName = "rule1"
      @proto static syntax = "bar1"
    }
    const foo = new Parser({ module: "foo" })
    foo.addRule(foo_rule1)
    const foo1 = foo.rules.rule1

    const bar = new Parser({ module: "bar" })
    bar.addRule(bar_rule1)
    const bar1 = bar.rules.rule1

    foo.import(bar)
    expect(foo.rules.rule1).toBeInstanceOf(P.Group)
    const rule1 = foo.rules.rule1 as P.Group
    expect(rule1.matchGroup).toBe("rule1")
    expect(rule1.rules.length).toBe(2)
    expect(rule1.rules).toEqual([foo1, bar1])
  })

  test("merges individual rules with existing groups", () => {
    class foo_rule1 extends P.Sequence {
      static ruleName = "rule1"
      @proto static syntax = "foo1"
    }
    class foo_rule1a extends P.Sequence {
      static ruleName = "rule1"
      @proto static syntax = "foo1a"
    }
    class bar_rule1 extends P.Sequence {
      static ruleName = "rule1"
      @proto static syntax = "bar1"
    }
    const foo = new Parser({ module: "foo" })
    foo.addRule(foo_rule1)
    foo.addRule(foo_rule1a)
    const foo1OriginalGroup = foo.rules.rule1 as P.Group
    const foo1OriginalGroupRules = [...foo1OriginalGroup.rules]

    const bar = new Parser({ module: "bar" })
    bar.addRule(bar_rule1)

    foo.import(bar)
    expect(foo.rules.rule1).toBeInstanceOf(P.Group)
    const rule1 = foo.rules.rule1 as P.Group
    expect(rule1.matchGroup).toBe("rule1")
    expect(rule1).not.toBe(foo1OriginalGroup)
    expect(rule1.rules.length).toBe(3)

    const allRules = foo1OriginalGroupRules.concat(bar.rules.rule1)
    expect(rule1.rules).toEqual(allRules)
  })
})

// Set up parser used in the below
const parser = new Parser()
// `rules` defaults to `[]` at runtime if omitted; the props type doesn't reflect that.
const statement = new P.Group({ name: "statement", matchGroup: "statement" } as any)
const statements = new P.Repeat({ name: "block", rule: new P.Subrule("statement") })
parser.addRule(statement)
parser.addRule(statements)

class dog extends P.Sequence {
  @proto static syntax = "dog"
}
class cat extends P.Sequence {
  @proto static syntax = "cat"
}
class dog_and_cat extends P.Sequence {
  @proto static alias = ["statement"]
  @proto static syntax = "{dog} and {cat}"
}
parser.addRule(dog)
parser.addRule(cat)
parser.addRule(dog_and_cat)

describe("parser.parse()", () => {
  test("takes an explicit start rule", () => {
    const match = parser.parse("dog and cat", "block")!
    expect(match.rule).toBe(statements)
  })

  test("defaults to 'statements' if not passed a start rule", () => {
    const match = parser.parse("dog and cat")!
    expect(match.rule).toBe(statements)
  })

  test("returns undefined if no text parses", () => {
    const match = parser.parse("", "block")
    expect(match).toBe(undefined)
  })

  test("throws if named rule is not found", () => {
    expect(() => parser.parse("text", "missing_rule")).toThrow(ParserError)
  })
})

describe("parser.compile()", () => {
  test("takes an explicit start rule", () => {
    const result = parser.compile("dog and cat", "statement")
    expect(result).toStrictEqual("dog and cat")
  })

  test("defaults to 'statements' if not passed a start rule", () => {
    const result = parser.compile("dog and cat")
    expect(result).toStrictEqual(["dog and cat"])
  })

  test("throws if text can't be parsed", () => {
    expect(() => parser.compile("blah")).toThrow(ParserError)
  })
})
