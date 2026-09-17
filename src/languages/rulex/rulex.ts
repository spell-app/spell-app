//
//  # Core `rules` -- simple datatypes, etc.
//
// NOTE: many of the below are created as custom Pattern subclasses for debugging.
//
import global from "global"

import { P } from "~/parser"
// Import the following directly to avoid circular import problems
import { Parser } from "~/parser/Parser"
import { Rules } from "~/parser/rule"
import { Tokens } from "~/parser/tokenizer"

/**
 * Given a list of group names separated by `:`, return an object type for `match.groups`.
 * - e.g. `Match<RulexGroups<"lhs:rhs">>` gives `groups: { lhs?: Match; rhs?: Match }`
 * - Pass `ValueType` to override, e.g. `RulexGroups<"items", Match[]>` for repeated groups.
 */
export type RulexGroups<GroupString extends string, ValueType = P.Match> = Prettify<
  Partial<{
    [Group in SplitString<GroupString>]: ValueType
  }>
>

/** Groups for the optional `testLocation`, `argument` and `repeatFlag` rules which adorn most rulex rules. */
type FlagGroups = RulexGroups<"repeatFlag:argument:testLocation">

/** Compile a rulex sub-`match`, which must yield a `Rule`. */
// TODO CLAUDE: remove me!
function compileMatchOrDie(match: P.Match | undefined): P.Rule {
  const rule = match?.compile()
  if (!(rule instanceof P.Rule)) {
    throw new P.ParserError({
      message: "Expected rulex match to compile to a Rule",
      context: rulex,
      activity: "compileMatchOrDie",
      params: { match, result: rule }
    })
  }
  return rule
}

export class RulexParser extends Parser {
  static {
    Object.defineProperty(this.prototype, "defaultRule", { value: "sequence", writable: true })
  }

  /** Compiling rulex syntax always yields a `Rule`. */
  compile(input: string | P.Token | P.Token[], ruleName?: string, scope?: P.Scope): P.Rule {
    const rule = super.compile(input, ruleName, scope)
    if (!(rule instanceof P.Rule)) {
      throw new P.ParserError({
        message: "rulex.compile() did not produce a Rule",
        context: this,
        activity: "compile",
        params: { input, ruleName, result: rule }
      })
    }
    return rule
  }

  // Apply flags from `match` to the `rule` passed in, possibly returning a new rule!
  applyFlags(rule: P.Rule, match: P.Match<FlagGroups>): P.Rule {
    const repeatFlag = match.groups.repeatFlag?.compile()
    const argument = match.groups.argument?.compile()
    const testLocation = match.groups.testLocation?.compile()

    // handle repeat, which may nest the rule in a repeat
    if (repeatFlag === "?") rule.optional = true
    else if (repeatFlag === "+") rule = new P.Rules.Repeat({ rule })
    else if (repeatFlag === "*") rule = new P.Rules.Repeat({ rule, optional: true })

    if (typeof argument === "string" && argument) rule.argument = argument
    if (testLocation === P.ANYWHERE || testLocation === P.AT_START) rule.testLocation = testLocation

    return rule
  }

  // Consolidate runs of literals in `rules` of type `constructor` together.
  consolidateLiterals(
    rules: P.Rule[],
    constructor: Class<P.Rules.Literal>,
    literalKey: "literal",
    GroupConstructor: Class<P.Rule> = constructor
  ): P.Rule[] {
    if (rules.length === 1) return rules

    const output: P.Rule[] = []
    for (let start = 0, rule: P.Rule | undefined; (rule = rules[start]); start++) {
      // TODO: inline `isAdorned`
      if (rule instanceof constructor && !rule.isAdorned) {
        // find the end of the run
        let end = start
        for (let next: P.Rule | undefined; (next = rules[end + 1]); end++) {
          if (!(next instanceof constructor && !next.isAdorned)) break
        }
        if (end > start) {
          // combine literals into a single map
          const literals: Array<string | string[] | P.LiteralMatcher> = rules.slice(start, end + 1).map((nextRule) => {
            const literal = (nextRule as P.Rules.Literal)[literalKey]
            if (!nextRule.optional) return literal

            // make sure optionals are arrays and add the optional flag to the array
            return { literal, optional: true }
          })
          rule = new GroupConstructor(literals)
          start = end
        }
      }
      output.push(rule)
    }
    return output
  }
}

// Create core `rulex` parser.
// NOTE: THIS INSTANCE is used by other parsers, to pick up the rules defined below.
export const rulex = new RulexParser({ module: "rulex" })
global.rulex = rulex

// Define base rules `testLocation`, `argument` and `repeatFlag`
rulex.defineRules(
  {
    name: "testLocation",
    literal: ["…", "^"],
    optional: true,
    constructor: class testLocation extends Rules.Symbol {
      compile(match: P.Match) {
        return match.matched[0]!.value === "…" ? P.ANYWHERE : P.AT_START
      }
    },
    tests: [
      {
        title: "matches testLocation",
        tests: [
          ["", undefined],
          ["…", P.ANYWHERE],
          ["^", P.AT_START]
        ]
      }
    ]
  },
  {
    name: "argument",
    rules: [new Rules.Word({ argument: "argument" }), new Rules.Symbol(":")],
    optional: true,
    constructor: class argument extends Rules.Sequence {
      compile(match: P.Match<P.RulexGroups<"argument">>) {
        return match.groups.argument!.value
      }
    },
    tests: [
      {
        title: "matches argument",
        tests: [
          ["", undefined],
          ["arg:", "arg"]
        ]
      }
    ]
  },
  {
    name: "repeatFlag",
    literal: ["?", "*", "+"],
    optional: true,
    constructor: class repeatFlag extends Rules.Symbol {
      compile(match: P.Match) {
        return match.matched[0]!.value
      }
    },
    tests: [
      {
        title: "matches repeatFlag",
        tests: [
          ["", undefined],
          ["?", "?"],
          ["*", "*"],
          ["+", "+"]
        ]
      }
    ]
  }
)
const { testLocation, argument, repeatFlag } = rulex.rules as Record<"testLocation" | "argument" | "repeatFlag", P.Rule>

////////////////////
//  Combo rules
////////////////////

rulex.defineRules(
  /** A single symbol, or `\<symbol>` so we can escape special symbols like "?" and "*". */
  {
    name: "symbol",
    alias: "rule",
    rules: [
      testLocation,
      new Rules.Pattern({ argument: "isEscaped", pattern: /^\\$/, optional: true }),
      new Rules.TokenType({ tokenType: Tokens.Symbol, argument: "literal" }),
      repeatFlag
    ],
    constructor: class symbolRule extends Rules.Sequence {
      compile(match: P.Match<P.RulexGroups<"literal:isEscaped"> & FlagGroups>) {
        const { literal, isEscaped } = match.groups
        const rule = new P.Rules.Symbol(literal!.value)
        if (isEscaped) rule.isEscaped = true
        return rulex.applyFlags(rule, match)
      }
    },
    tests: [
      {
        title: "matches symbol",
        tests: [
          ["", undefined],
          // can't match flags by themselves
          ["…", undefined],
          ["^", undefined],

          [":", new Rules.Symbol({ literal: ":" })],

          // matches special chars by themselves if not escaped
          ["(", new Rules.Symbol({ literal: "(" })],
          ["[", new Rules.Symbol({ literal: "[" })],
          ["?", new Rules.Symbol({ literal: "?" })],
          ["*", new Rules.Symbol({ literal: "*" })],
          ["+", new Rules.Symbol({ literal: "+" })],

          // only match the first one
          ["::", new Rules.Symbol({ literal: ":" })],

          // escaped
          ["\\:", new Rules.Symbol({ literal: ":", isEscaped: true })],
          ["\\?", new Rules.Symbol({ literal: "?", isEscaped: true })],
          ["\\(", new Rules.Symbol({ literal: "(", isEscaped: true })],
          ["\\[", new Rules.Symbol({ literal: "[", isEscaped: true })],

          // testLocation
          ["…:", new Rules.Symbol({ literal: ":", testLocation: P.ANYWHERE })],
          ["^:", new Rules.Symbol({ literal: ":", testLocation: P.AT_START })],
          ["…\\:", new Rules.Symbol({ literal: ":", isEscaped: true, testLocation: P.ANYWHERE })],

          // repeat
          [">?", new Rules.Symbol({ literal: ">", optional: true })],
          [">+", new Rules.Repeat(new Rules.Symbol({ literal: ">" }))],
          [">*", new Rules.Repeat({ optional: true, rule: new Rules.Symbol({ literal: ">" }) })],

          ["…>?", new Rules.Symbol({ testLocation: P.ANYWHERE, literal: ">", optional: true })],
          [
            "^>*",
            new Rules.Repeat({ testLocation: P.AT_START, optional: true, rule: new Rules.Symbol({ literal: ">" }) })
          ]
        ]
      }
    ]
  },
  /** One or more literal keywords with an optional repeat signifier at the end. */
  {
    name: "keyword",
    alias: "rule",
    rules: [testLocation, new Rules.Word({ argument: "literal" }), repeatFlag],
    constructor: class keyword extends Rules.Sequence {
      compile(match: P.Match<P.RulexGroups<"literal"> & FlagGroups>) {
        const { literal } = match.groups
        const rule = new P.Rules.Keyword(literal!.value)
        return rulex.applyFlags(rule, match)
      }
    },
    tests: [
      {
        title: "matches single keyword",
        tests: [
          ["", undefined],
          ["11", undefined],
          [":", undefined],

          ["word", new Rules.Keyword({ literal: "word" })],

          ["…word", new Rules.Keyword({ literal: "word", testLocation: P.ANYWHERE })],
          ["^word", new Rules.Keyword({ literal: "word", testLocation: P.AT_START })],

          ["word?", new Rules.Keyword({ literal: "word", optional: true })],
          ["word+", new Rules.Repeat({ rule: new Rules.Keyword({ literal: "word" }) })],
          ["word*", new Rules.Repeat({ optional: true, rule: new Rules.Keyword({ literal: "word" }) })]
        ]
      }
    ]
  },
  /**
   * Match a SPECIFIC number literal.
   * - The returned rule is a `Keyword` rule, so it can be combined with alpha-numeric keywords.
   */
  // TODO: how is this used?
  {
    name: "number",
    alias: "rule",
    rules: [testLocation, new Rules.TokenType({ tokenType: Tokens.Number, argument: "number" }), repeatFlag],
    constructor: class numberRule extends Rules.Sequence {
      compile(match: P.Match<P.RulexGroups<"number"> & FlagGroups>) {
        const { number } = match.groups
        const rule = new P.Rules.Keyword({ literal: number!.value })
        return rulex.applyFlags(rule, match)
      }
    },
    tests: [
      {
        title: "matches single keyword",
        tests: [
          ["1", new Rules.Keyword({ literal: 1 as unknown as string })],

          ["…1", new Rules.Keyword({ literal: 1 as unknown as string, testLocation: P.ANYWHERE })],
          ["^1", new Rules.Keyword({ literal: 1 as unknown as string, testLocation: P.AT_START })],

          ["1?", new Rules.Keyword({ literal: 1 as unknown as string, optional: true })],
          ["1+", new Rules.Repeat({ rule: new Rules.Keyword({ literal: 1 as unknown as string }) })],
          ["1*", new Rules.Repeat({ optional: true, rule: new Rules.Keyword({ literal: 1 as unknown as string }) })]
        ]
      }
    ]
  },
  /** `Subrule`: match a named rule, as part of a larger sequence. */
  {
    name: "subrule",
    alias: "rule",
    rules: [
      testLocation,
      new Rules.Symbol("{"),
      testLocation,
      argument,
      new Rules.Word({ argument: "rule" }),
      new Rules.Symbol("}"),
      repeatFlag
    ],
    constructor: class subrule extends Rules.Sequence {
      compile(match: P.Match<P.RulexGroups<"rule"> & FlagGroups>) {
        const rule = new P.Rules.Subrule(String(match.groups.rule!.compile()))
        return rulex.applyFlags(rule, match)
      }
    },
    tests: [
      {
        title: "matches subrule",
        compileAs: "rule",
        tests: [
          ["", undefined],
          ["{}", new Rules.Symbol("{")],

          ["{sub}", new Rules.Subrule({ rule: "sub" })],

          ["…{sub}", new Rules.Subrule({ rule: "sub", testLocation: P.ANYWHERE })],
          ["{…sub}", new Rules.Subrule({ rule: "sub", testLocation: P.ANYWHERE })],
          ["{arg:sub}", new Rules.Subrule({ rule: "sub", argument: "arg" })],

          ["{sub}?", new Rules.Subrule({ rule: "sub", optional: true })],
          ["{sub}+", new Rules.Repeat({ rule: new Rules.Subrule({ rule: "sub" }) })],
          ["{sub}*", new Rules.Repeat({ optional: true, rule: new Rules.Subrule({ rule: "sub" }) })]
        ]
      }
    ]
  },
  /** `List`: match a list of rules, separated by a delimiter, with an optional repeat flag. */
  {
    name: "list",
    alias: "rule",
    rules: [
      new Rules.Symbol("["),
      argument,
      new Rules.Subrule({ argument: "ruleName", rule: "rule" }),
      new Rules.Subrule({ argument: "delimiter", rule: "rule" }),
      new Rules.Symbol("]"),
      new Rules.Symbol({ argument: "repeatFlag", literal: "?", optional: true })
    ],
    constructor: class list extends Rules.Sequence {
      compile(match: P.Match<P.RulexGroups<"ruleName:delimiter"> & FlagGroups>) {
        const { ruleName, delimiter } = match.groups
        const rule = new P.Rules.Repeat({ rule: compileMatchOrDie(ruleName), delimiter: compileMatchOrDie(delimiter) })
        return rulex.applyFlags(rule, match)
      }
    },
    tests: [
      {
        title: "matches list",
        compileAs: "rule",
        tests: [
          ["", undefined],
          ["[]", new Rules.Symbol("[")], // TODO: error for this?
          ["[{sub}]", new Rules.Symbol("[")], // TODO: error for this?

          ["[{sub},]", new Rules.Repeat({ rule: new Rules.Subrule("sub"), delimiter: new Rules.Symbol(",") })],
          ["[{sub}or]", new Rules.Repeat({ rule: new Rules.Subrule("sub"), delimiter: new Rules.Keyword("or") })],

          [
            "[arg:{sub},]",
            new Rules.Repeat({ rule: new Rules.Subrule("sub"), delimiter: new Rules.Symbol(","), argument: "arg" })
          ],

          [
            "[{sub},]?",
            new Rules.Repeat({ optional: true, rule: new Rules.Subrule("sub"), delimiter: new Rules.Symbol(",") })
          ]
        ]
      }
    ]
  },
  /** `Choices`: match one of a list of rules, separated by `|`, with an optional repeat flag. */
  {
    name: "choices",
    alias: "rule",
    rules: [
      testLocation,
      new Rules.NestedSplit({
        argument: "split",
        start: new Rules.Symbol("("),
        prefix: argument,
        item: new Rules.Subrule({ rule: "sequence", argument: "choices" }),
        delimiter: new Rules.Symbol("|"),
        end: new Rules.Symbol(")")
      }),
      repeatFlag
    ],
    constructor: class choices extends Rules.Sequence {
      compile(match: P.Match<{ split?: P.Match<P.NestedSplitGroups> } & FlagGroups>) {
        const { items, prefix: argument } = match.groups.split!.groups
        let choices: P.Rule[] = items.map((item) => compileMatchOrDie(item))

        // Combine single keyword, keywords, symbol, symbols
        choices = rulex.consolidateLiterals(choices, P.Rules.Keyword, "literal")
        choices = rulex.consolidateLiterals(choices, P.Rules.Symbol, "literal")

        // If we got exactly one choice, use that.
        // Note that the choice's flags will "beat" the rule's flags if they conflict.
        let rule: P.Rule
        if (choices.length === 1) {
          rule = choices[0]!
        } else {
          rule = new P.Rules.Choice({ rules: choices })
        }

        rule = rulex.applyFlags(rule, match)
        if (argument) rule.argument = String(argument.compile())
        return rule
      }
    },
    tests: [
      {
        title: "single rule in a choice block",
        compileAs: "rule",
        skip: true,
        tests: [
          ["", undefined],
          ["()", new Rules.Symbol("(")],

          // If only one rule matched, return that rule
          ["(>)", new Rules.Symbol(">")],
          ["(word)", new Rules.Keyword("word")],
          ["({sub})", new Rules.Subrule("sub")],
          ["([{sub},])", new Rules.Repeat({ rule: new Rules.Subrule("sub"), delimiter: new Rules.Symbol(",") })],

          // Pass flags whether they were set on the choices or the single rule (a bit confusing)
          ["(…{sub})", new Rules.Subrule({ rule: "sub", testLocation: P.ANYWHERE })],
          ["(arg:{sub})", new Rules.Subrule({ rule: "sub", argument: "arg" })],
          ["({arg:sub})", new Rules.Subrule({ rule: "sub", argument: "arg" })],
          ["({sub}?)", new Rules.Subrule({ rule: "sub", optional: true })],
          ["({sub})?", new Rules.Subrule({ rule: "sub", optional: true })],
          ["({sub}+)", new Rules.Repeat({ rule: new Rules.Subrule({ rule: "sub" }) })],
          ["({sub}*)", new Rules.Repeat({ optional: true, rule: new Rules.Subrule({ rule: "sub" }) })],

          // consolidate multiple keywords
          ["(a|b|c)?", new Rules.Keyword({ literal: ["a", "b", "c"], optional: true })],
          [
            "(a|b|c?)",
            new Rules.Choice({
              rules: [
                new Rules.Keyword("a"),
                new Rules.Keyword("b"),
                new Rules.Keyword({ literal: "c", optional: true })
              ]
            })
          ]
        ]
      },
      {
        title: "multiple choices",
        compileAs: "rule",
        tests: [
          ["(>|a)", new Rules.Choice({ rules: [new Rules.Symbol(">"), new Rules.Keyword("a")] })],

          [
            "…(>|a)",
            new Rules.Choice({ testLocation: P.ANYWHERE, rules: [new Rules.Symbol(">"), new Rules.Keyword("a")] })
          ],

          ["(arg:>|a)", new Rules.Choice({ argument: "arg", rules: [new Rules.Symbol(">"), new Rules.Keyword("a")] })],

          ["(>|a)?", new Rules.Choice({ optional: true, rules: [new Rules.Symbol(">"), new Rules.Keyword("a")] })],
          [
            "(>|a)*",
            new Rules.Repeat({
              optional: true,
              rule: new Rules.Choice({ rules: [new Rules.Symbol(">"), new Rules.Keyword("a")] })
            })
          ],
          [
            "(>|a)+",
            new Rules.Repeat({ rule: new Rules.Choice({ rules: [new Rules.Symbol(">"), new Rules.Keyword("a")] }) })
          ]
        ]
      },
      {
        title: "nested choices",
        compileAs: "rule",
        tests: [
          ["(>|(b|c|d))", new Rules.Choice({ rules: [new Rules.Symbol(">"), new Rules.Keyword(["b", "c", "d"])] })],
          [
            "(>|({sub}|ab))",
            new Rules.Choice({
              rules: [
                new Rules.Symbol(">"),
                new Rules.Choice({ rules: [new Rules.Subrule("sub"), new Rules.Keyword("ab")] })
              ]
            })
          ]
        ]
      }
    ]
  },

  /**
   * `sequence`: a sequence of rules -- our top-level rule.
   * - NO test rule, otherwise we can't start a sequence with a special character.
   * - TODO: `consume all tokens`...
   */
  {
    name: "sequence",
    rule: new Rules.Subrule("rule"),
    constructor: class sequence extends Rules.Repeat {
      compile(match: P.Match) {
        let matched: P.Rule[] = match.items.map((item) => compileMatchOrDie(item))

        // Consolidate keywords and symbols
        matched = rulex.consolidateLiterals(matched, P.Rules.Keyword, "literal", P.Rules.Keywords)
        matched = rulex.consolidateLiterals(matched, P.Rules.Symbol, "literal", P.Rules.Symbols)

        const rules: P.Rule[] = []
        for (let start = 0, rule: P.Rule | undefined; (rule = matched[start]); start++) {
          // Consolidate sequences
          if (rule instanceof P.Rules.Sequence && !rule.isAdorned && !rule.optional) {
            rules.push(...rule.rules)
          } else {
            rules.push(rule)
          }
        }

        // If we're down to just one rule, just return that.
        if (rules.length === 1) return rules[0]!

        return new P.Rules.Sequence(rules)
      }
    },
    tests: [
      {
        title: "sequences",
        showAll: true,
        tests: [
          ["aa bb cc", new Rules.Keywords(["aa", "bb", "cc"])],
          ["aa {bb} cc", new Rules.Sequence(new Rules.Keyword("aa"), new Rules.Subrule("bb"), new Rules.Keyword("cc"))],
          [
            "aa? {bb} cc",
            new Rules.Sequence(
              new Rules.Keyword({ literal: "aa", optional: true }),
              new Rules.Subrule({ rule: "bb" }),
              new Rules.Keyword("cc")
            )
          ],
          [
            "aa? (bb|>)",
            new Rules.Sequence(
              new Rules.Keyword({ literal: "aa", optional: true }),
              new Rules.Choice({ rules: [new Rules.Keyword("bb"), new Rules.Symbol(">")] })
            )
          ]
        ]
      },
      {
        title: "consolidate multiple keywords and symbols",
        showAll: true,
        tests: [
          [">=", new Rules.Symbols([">", "="])],
          [">(=)?", new Rules.Symbols([">", { optional: true, literal: "=" }])],
          ["(>|<) (=)?", new Rules.Symbols([[">", "<"], { optional: true, literal: "=" }])],

          ["a b c", new Rules.Keywords(["a", "b", "c"])],
          ["a? b c", new Rules.Keywords([{ optional: true, literal: "a" }, "b", "c"])],
          ["a b? c", new Rules.Keywords(["a", { optional: true, literal: "b" }, "c"])],
          ["a b c?", new Rules.Keywords(["a", "b", { optional: true, literal: "c" }])],

          [
            "a (arg:b) c",
            new Rules.Sequence([
              new Rules.Keyword("a"),
              new Rules.Keyword({ literal: "b", argument: "arg" }),
              new Rules.Keyword("c")
            ])
          ],

          [
            "(a|b) c? d (e|f)?",
            new Rules.Keywords([
              ["a", "b"],
              { optional: true, literal: "c" },
              "d",
              { optional: true, literal: ["e", "f"] }
            ])
          ]
        ]
      }
    ]
  }
)
