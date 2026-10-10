import { describe, test, expect } from "vite-plus/test"
import { proto } from "$/util"
import { P, Parser } from "$/parser"
// These tests define rules with rulex `syntax`, so they must opt into the rulex parser.
import "$/parser/rulex"

/** Base class which sets an inherited `alias`, like a language's `Statement` would. */
class TestStatement<
  Groups extends string | P.AnyGroups = P.AnyGroups,
  MatchData extends P.AnyMatchData = P.AnyMatchData
> extends P.Sequence<Groups, MatchData> {
  @proto static alias = "statement"
}

class word extends P.TokenType {
  @proto static tokenType = P.WordToken
}

class give_statement extends TestStatement<"thing|recipient?"> {
  @proto static priority = 10
  @proto static syntax = "give {thing:word} (to {recipient:word})?"
  static tests: P.RuleTests = [{ tests: [] }]
  compile(match: P.MatchFor<this>) {
    const { thing, recipient } = match.groups
    return `give(${thing.value}${recipient ? `, ${recipient.value}` : ""})`
  }
}

class _if extends TestStatement {
  static ruleName = "if"
}

/** Parser with all of the above installed. */
function makeParser(props?: P.ParserProps) {
  const parser = new Parser(props)
  parser.addRule(word)
  parser.addRule(give_statement)
  parser.addRule(_if, { syntax: "if {condition:word}" })
  parser.addRule(_if, { syntax: "when {condition:word} (then {action:word})?" })
  return parser
}

describe("rules defined as classes", () => {
  describe("registration", () => {
    test("registers under class name, inherited alias and `_testable_`", () => {
      const { rules } = makeParser()
      expect(rules.give_statement).toBeInstanceOf(give_statement)
      expect(rules._testable_).toBe(rules.give_statement)
      expect(rules.statement).toBeInstanceOf(P.Group)
      expect((rules.statement as P.Group).rules).toContain(rules.give_statement)
    })
    test("`static ruleName` overrides class name, and is NOT inherited", () => {
      class if_subclass extends _if {}
      const parser = makeParser()
      expect(parser.rules.if).toBeDefined()
      expect(parser.rules._if).toBeUndefined()
      parser.addRule(if_subclass, { syntax: "if {condition:word}" })
      expect(parser.rules.if_subclass).toBeDefined()
    })
    test("a PascalCase class registers under its name in snake_case;  any other name as is", () => {
      class GiveItTo extends TestStatement {}
      const parser = makeParser()
      parser.addRule(GiveItTo, { syntax: "give {thing:word} to {recipient:word}" })
      expect(parser.rules.give_it_to).toBeInstanceOf(GiveItTo)
      expect(parser.rules.GiveItTo).toBeUndefined()
      expect(parser.rules.give_statement).toBeDefined()
    })
    test("`ruleNameFor()`:  splits only before a capital;  a run of capitals is one word", () => {
      expect(P.Rule.ruleNameFor("ListAddRelative")).toBe("list_add_relative")
      expect(P.Rule.ruleNameFor("If")).toBe("if")
      expect(P.Rule.ruleNameFor("Item2Of")).toBe("item2_of")
      expect(P.Rule.ruleNameFor("JSXText")).toBe("jsx_text")
      expect(P.Rule.ruleNameFor("list_add_relative")).toBe("list_add_relative")
      expect(P.Rule.ruleNameFor("matchGroup")).toBe("matchGroup")
      expect(P.Rule.ruleNameFor("_if")).toBe("_if")
    })
    test("anonymous class without `ruleName` throws", () => {
      expect(() => new Parser().addRule(class extends P.Sequence {})).toThrow(P.ParserError)
    })
    test("`static skip` registers nothing", () => {
      class skipped extends P.Keyword {
        static skip = true
        @proto static literal = "x"
      }
      const parser = new Parser()
      expect(parser.addRule(skipped)).toBeUndefined()
      expect(parser.rules.skipped).toBeUndefined()
    })
    test("tags rules with parser's `module`", () => {
      expect(makeParser({ module: "testing" }).rules.give_statement!.module).toBe("testing")
    })
    test("registering a class once per `syntax` makes a `P.Group` of instances", () => {
      const group = makeParser().rules.if as P.Group
      expect(group).toBeInstanceOf(P.Group)
      expect(group.rules.map((rule) => rule.syntax)).toEqual([
        "if {condition:word}",
        "when {condition:word} (then {action:word})?"
      ])
      expect(group.rules.every((rule) => rule instanceof _if)).toBe(true)
    })
    test("plain `static` where `@proto static` is needed throws, rather than being silently ignored", () => {
      class forgetful extends P.Sequence {
        static syntax = "give {thing:word}"
      }
      expect(() => new Parser().addRule(forgetful)).toThrow(/@proto static syntax/)
    })
    test("class with single `syntax` can be constructed directly, staying anonymous", () => {
      const rule = new give_statement()
      expect(rule.rules.length).toBe(3)
      expect(rule.name).toBeUndefined()
      expect(Object.isFrozen(rule)).toBe(false)
    })
    test("bad `syntax` throws at registration rather than warning", () => {
      class broken extends P.Pattern {
        @proto static syntax = "a {b} c"
      }
      expect(() => new Parser().addRule(broken)).toThrow(/does not extend/)
    })
  })

  describe("construction", () => {
    test("decomposes `syntax`", () => {
      const rule = makeParser().rules.give_statement as give_statement
      expect(rule.rules.length).toBe(3)
      expect(rule.syntax).toBe("give {thing:word} (to {recipient:word})?")
    })
    test("`Sequence` subclass wraps syntax which compiles to a single rule", () => {
      class just_word extends P.Sequence {
        @proto static syntax = "{word}"
      }
      const rule = new Parser().addRule(just_word) as just_word
      expect(rule.rules).toHaveLength(1)
      expect(rule.rules[0]).toBeInstanceOf(P.Subrule)
    })
    test("leaf rules take structure from statics", () => {
      class color extends P.Keyword {
        @proto static literal = ["red", "green"]
      }
      class number_word extends P.Pattern {
        @proto static pattern = /^\d+$/
        @proto static blacklist = ["13"]
      }
      class yes_no extends P.Literal {
        @proto static syntax = "(yes|no)"
      }
      const parser = new Parser()
      expect((parser.addRule(color) as color).literal).toEqual(["red", "green"])
      const pattern = parser.addRule(number_word) as number_word
      expect(pattern.pattern).toEqual(/^\d+$/)
      expect(pattern.blacklist).toEqual({ 13: true })
      expect((parser.addRule(yes_no) as yes_no).literal).toEqual(["yes", "no"])
      expect(parser.compile("no", "yes_no")).toBe("no")
    })
    test("parses and compiles with typed groups", () => {
      const parser = makeParser()
      expect(parser.compile("give cake", "statement")).toBe("give(cake)")
      expect(parser.compile("give cake to bob", "statement")).toBe("give(cake, bob)")
    })
  })

  describe("descriptive props", () => {
    test("come from class prototype, leaving instances small", () => {
      const rule = makeParser().rules.give_statement!
      expect(rule.name).toBe("give_statement")
      expect(rule.alias).toBe("statement")
      expect(rule.priority).toBe(10)
      expect(rule.names).toEqual(["give_statement", "statement"])
      expect(Object.keys(rule).sort()).toEqual(["name", "rules", "syntax", "tests"])
    })
    test("prefer instance props", () => {
      const rule = new give_statement({ rules: [], alias: "other", priority: 3 })
      expect(rule.alias).toBe("other")
      expect(rule.priority).toBe(3)
    })
    test("anonymous rules stay nameless, with default priority", () => {
      const rule = new P.Keyword("a")
      expect(rule.name).toBeUndefined()
      expect(rule.priority).toBe(0)
    })
  })

  describe("immutability", () => {
    test("registered rule is frozen, including nested rules", () => {
      const rule = makeParser().rules.give_statement as give_statement
      expect(Object.isFrozen(rule)).toBe(true)
      expect(Object.isFrozen(rule.rules)).toBe(true)
      expect(rule.rules.every((it) => Object.isFrozen(it))).toBe(true)
    })
    test("mutating a registered rule throws", () => {
      const rule = makeParser().rules.give_statement as give_statement
      expect(() => (rule.optional = true)).toThrow(TypeError)
      expect(() => (rule.priority = 99)).toThrow(TypeError)
      expect(() => rule.rules.push(new P.Keyword("x"))).toThrow(TypeError)
      expect(() => (rule.alias = "other")).toThrow(TypeError)
    })
    test("props which were never set are frozen too", () => {
      const rule = new P.Keyword("a").freeze()
      expect(() => (rule.module = "sneaky")).toThrow(TypeError)
      expect(rule.module).toBeUndefined()
    })
    test("merging same-named rules across parsers leaves source parsers' groups untouched", () => {
      const a = makeParser()
      const b = makeParser()
      const countA = (a.rules.statement as P.Group).rules.length
      const merged = new Parser({ imports: [a, b] })
      expect((merged.rules.statement as P.Group).rules.length).toBe(countA * 2)
      expect((a.rules.statement as P.Group).rules.length).toBe(countA)
      expect((b.rules.statement as P.Group).rules.length).toBe(countA)
      expect(merged.rules.statement).not.toBe(a.rules.statement)
    })
  })

  describe("groupSpec", () => {
    const spec = (syntax: string) => P.Rule.compileSyntax(`${syntax} end`).groupSpec
    test("named and anonymous subrules are required", () => {
      expect(spec("{thing:word} {word}")).toBe("thing|word")
    })
    test("`?` makes optional, including everything inside optional parens", () => {
      expect(spec("{a:word}? (to {b:word} {c:word}?)?")).toBe("a?|b?|c?")
    })
    test("keywords and symbols add nothing", () => {
      expect(spec("give {a:word} \\: now")).toBe("a")
    })
    test("repeated name is an array", () => {
      expect(spec("{word} and {word}")).toBe("word[]")
    })
    test("named choice is one group, anonymous choice makes each branch optional", () => {
      expect(spec("(which:{word}|{other})")).toBe("which")
      expect(spec("({word}|{other})")).toBe("word?|other?")
    })
    test("named list is a single group", () => {
      expect(spec("[items:{word},]")).toBe("items")
    })
    test("variants merge:  required only if required in every variant", () => {
      const group = makeParser().rules.if as P.Group
      const merged = P.mergeGroupSpecs(...group.rules.map((rule) => rule.getGroupSpecEntries()))
      expect(P.stringifyGroupSpec(merged)).toBe("condition|action?")
    })
  })

  describe("scope.addRule()", () => {
    test("registers a closure class on the parser, keeping its alias, and records the pair", () => {
      const parser = makeParser()
      const scope = parser.getScope()
      const rootScope = new P.RootScope({ parser })
      const literals = [
        ["card", "Card"],
        ["suits", "Suits"]
      ]
      // Statics may use the enclosing function's locals, e.g. `literals` -- the definition stays empty.
      class card_suits extends P.Keywords {
        @proto static alias = "expression"
        @proto static literals = literals
      }
      rootScope.addRule(card_suits)

      // registered under BOTH its name and its alias -- the alias is what other rules reach it by
      expect(parser.rules.card_suits).toBeInstanceOf(card_suits)
      expect(parser.rules.expression).toBe(parser.rules.card_suits)
      expect(scope.parse("Card suits", "expression")).toBeDefined()

      // and the scope kept the class + definition, so the pair can be re-registered elsewhere
      const entry = rootScope.rules.get("card_suits")
      expect(entry?.rule).toBe(card_suits)
      expect(entry?.definition).toEqual({})
    })

    test("re-registering a recorded pair on another parser reproduces the rule", () => {
      const source = new P.RootScope({ parser: makeParser() })
      class greeting extends P.Keyword {
        @proto static alias = "expression"
      }
      source.addRule(greeting, { syntax: "hi" })

      const target = new P.RootScope({ parser: makeParser() })
      const entry = source.rules.get("greeting")!
      target.addRule(entry.rule, entry.definition)
      expect(target.parser!.rules.greeting).toBeInstanceOf(greeting)
      expect(target.parser!.rules.expression).toBe(target.parser!.rules.greeting)
    })
  })

  describe("specialize()", () => {
    class greeting extends P.Keyword {
      @proto static alias = "expression"
    }

    test("puts `ruleName` on the subclass, everything else on its prototype, and leaves the base alone", () => {
      const hello = greeting.specialize({ ruleName: "hello", literal: "hello", priority: 5 })
      const parser = makeParser()
      parser.addRule(hello)
      const rule = parser.rules.hello!

      expect(hello.ruleName).toBe("hello")
      expect(rule).toBeInstanceOf(greeting)
      expect(rule.priority).toBe(5)
      // inherited from the base, as usual
      expect(rule.alias).toBe("expression")
      expect(greeting.prototype.priority).toBe(0)
      expect(parser.getScope().parse("hello", "hello")?.value).toBe("hello")
    })

    test("remembers what it was specialized from, and with -- plain data, to rebuild it elsewhere", () => {
      const statics = { ruleName: "hello", literal: "hello" }
      const hello = greeting.specialize(statics)
      expect(hello.specializedFrom).toBe(greeting)
      expect(hello.specializedWith).toEqual(statics)
      // plain statics, NOT inherited:  the base was never specialized
      expect(Object.hasOwn(greeting, "specializedFrom")).toBe(false)
    })
  })

  describe("`@proto static importableAs`", () => {
    test("registers the class under its `importableAs` name, for `importableRule()`", () => {
      class importable_probe extends P.Keyword {
        @proto static importableAs = "test:importable_probe"
      }
      expect(P.Rule.importableRule("test:importable_probe")).toBe(importable_probe)
    })

    test("a DIFFERENT class claiming the same id throws, rather than silently replacing it", () => {
      class first_claim extends P.Keyword {
        @proto static importableAs = "test:claimed_twice"
      }
      expect(first_claim).toBeDefined()
      expect(() => {
        class second_claim extends P.Keyword {
          @proto static importableAs = "test:claimed_twice"
        }
        return second_claim
      }).toThrow(/are both importable as 'test:claimed_twice'/)
    })
  })
})
