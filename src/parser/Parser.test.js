//
// # Tests for `Parser` class.
// Note that lots of parser functionality is tested via other files in this package. ???
//

import { Parser, ParseError, Rule, ruleEx, Tokenizer } from "./all"

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
    parser.addRule(new Rule(), "foo")

    expect(parser.rules).not.toBe(startRules)
  })

  test("parser.rules changes when import() is called", () => {
    const parser = new Parser()
    const startRules = parser.rules
    parser.import(new Parser())
    expect(parser.rules).not.toBe(startRules)
  })
})

describe("defineRule()", () => {
  test("doesn't add rule if passed a 'skip' property", () => {
    const parser = new Parser()
    parser.defineRule({ name: "foo", skip: true })
    expect(parser.rules).toEqual({})
  })

  test("doesn't add rule if passed a Rule instance without a 'name' property", () => {
    const parser = new Parser()
    parser.defineRule(new Rule.Symbols({}))
    expect(parser.rules).toEqual({})
  })

  test("doesn't add rule if passed empty object (where constructor === Object)", () => {
    const parser = new Parser()
    parser.defineRule({})
    expect(parser.rules).toEqual({})
  })

  test("doesn't add rule if passed constructor as undefined", () => {
    const parser = new Parser()
    parser.defineRule({ constructor: undefined })
    expect(parser.rules).toEqual({})
  })

  test("returns undefined if not passed a 'name' property", () => {
    const parser = new Parser()
    parser.defineRule({ constructor: Rule })
    expect(parser.rules).toEqual({})
  })
})

describe("Parser.import()", () => {
  test("adds new rules directly in either direction", () => {
    const foo = new Parser({ module: "foo" })
    foo.defineRule({ name: "rule1", syntax: "foo1" })

    const bar = new Parser({ module: "bar" })
    bar.defineRule({ name: "rule2", syntax: "bar2" })

    foo.import(bar)
    expect(foo.rules.rule1).toBe(foo.rules.rule1)
    expect(foo.rules.rule2).toBe(bar.rules.rule2)
  })

  test("merges individual rules into a new group", () => {
    const foo = new Parser({ module: "foo" })
    foo.defineRule({ name: "rule1", syntax: "foo1" })
    const foo1 = foo.rules.rule1

    const bar = new Parser({ module: "bar" })
    bar.defineRule({ name: "rule1", syntax: "bar1" })
    const bar1 = bar.rules.rule1

    foo.import(bar)
    expect(foo.rules.rule1).toBeInstanceOf(Rule.Group)
    expect(foo.rules.rule1.argument).toBe("rule1")
    expect(foo.rules.rule1.rules.length).toBe(2)
    expect(foo.rules.rule1.rules).toEqual([foo1, bar1])
  })

  test("merges individual rules with existing groups", () => {
    const foo = new Parser({ module: "foo" })
    foo.defineRule({ name: "rule1", syntax: "foo1" })
    foo.defineRule({ name: "rule1", syntax: "foo1a" })
    const foo1OriginalGroup = foo.rules.rule1

    const bar = new Parser({ module: "bar" })
    bar.defineRule({ name: "rule1", syntax: "bar1" })

    foo.import(bar)
    expect(foo.rules.rule1).toBeInstanceOf(Rule.Group)
    expect(foo.rules.rule1.argument).toBe("rule1")
    expect(foo.rules.rule1).not.toBe(foo1OriginalGroup)
    expect(foo.rules.rule1.rules.length).toBe(3)

    const allRules = foo1OriginalGroup.rules.concat(bar.rules.rule1)
    expect(foo.rules.rule1.rules).toEqual(allRules)
  })
})

// Set up parser used in the below
const parser = new Parser()
const statement = new Rule.Group({ name: "statement", argument: "statement" })
const statements = new Rule.Repeat({ name: "block", rule: new Rule.Subrule("statement") })
parser.defineRules(
  statement,
  statements,

  { name: "dog", syntax: "dog" },
  { name: "cat", syntax: "cat" },
  {
    name: "dog_and_cat",
    alias: "statement",
    syntax: "{dog} and {cat}",
    testRule: "{dog}",
    compile(parser, match) {
      return "dog && cat"
    }
  }
)

describe("parser.parse()", () => {
  test("takes an explicit start rule", () => {
    const match = parser.parse("dog and cat", "block")
    expect(match.rule).toBe(statements)
  })

  test("defaults to 'statements' if not passed a start rule", () => {
    const match = parser.parse("dog and cat")
    expect(match.rule).toBe(statements)
  })

  test("returns undefined if no text parses", () => {
    const match = parser.parse("", "block")
    expect(match).toBe(undefined)
  })

  test("throws if named rule is not found", () => {
    expect(() => parser.parse("text", "missing_rule")).toThrow(ParseError)
  })
})

describe("parser.compile()", () => {
  test("takes an explicit start rule", () => {
    const result = parser.compile("dog and cat", "statement")
    expect(result).toEqual("dog && cat")
  })

  test("defaults to 'statements' if not passed a start rule", () => {
    const result = parser.compile("dog and cat")
    expect(result).toEqual(["dog && cat"])
  })

  test("throws if text can't be parsed", () => {
    expect(() => parser.compile("blah")).toThrow(ParseError)
  })
})
