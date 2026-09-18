//
//  # Core `rules` -- simple datatypes, etc.
//
// NOTE: many of the below are created as custom Pattern subclasses for debugging.
//
import global from "global"

import { P, R } from "~/parser"
// Import the following directly to avoid circular import problems
import { Parser } from "~/parser/Parser"
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
function compileMatchOrDie(match: P.Match | undefined): R.Rule {
  const rule = match?.compile()
  if (!(rule instanceof R.Rule)) {
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
  compile(input: string | P.Token | P.Token[], ruleName?: string, scope?: P.Scope): R.Rule {
    const rule = super.compile(input, ruleName, scope)
    if (!(rule instanceof R.Rule)) {
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
  applyFlags(rule: R.Rule, match: P.Match<FlagGroups>): R.Rule {
    const repeatFlag = match.groups.repeatFlag?.compile()
    const argument = match.groups.argument?.compile()
    const testLocation = match.groups.testLocation?.compile()

    // handle repeat, which may nest the rule in a repeat
    if (repeatFlag === "?") rule.optional = true
    else if (repeatFlag === "+") rule = new R.Repeat({ rule })
    else if (repeatFlag === "*") rule = new R.Repeat({ rule, optional: true })

    if (typeof argument === "string" && argument) rule.argument = argument
    if (testLocation === P.ANYWHERE || testLocation === P.AT_START) rule.testLocation = testLocation

    return rule
  }

  // Consolidate runs of literals in `rules` of type `constructor` together.
  consolidateLiterals(
    rules: R.Rule[],
    constructor: Class<R.Literal>,
    literalKey: "literal",
    GroupConstructor: Class<R.Rule> = constructor
  ): R.Rule[] {
    if (rules.length === 1) return rules

    const output: R.Rule[] = []
    for (let start = 0, rule: R.Rule | undefined; (rule = rules[start]); start++) {
      // TODO: inline `isAdorned`
      if (rule instanceof constructor && !rule.isAdorned) {
        // find the end of the run
        let end = start
        for (let next: R.Rule | undefined; (next = rules[end + 1]); end++) {
          if (!(next instanceof constructor && !next.isAdorned)) break
        }
        if (end > start) {
          // combine literals into a single map
          const literals: Array<string | string[] | P.LiteralMatcher> = rules.slice(start, end + 1).map((nextRule) => {
            const literal = (nextRule as R.Literal)[literalKey]
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
    constructor: class testLocation extends R.Symbol {
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
    rules: [new R.Word({ argument: "argument" }), new R.Symbol(":")],
    optional: true,
    constructor: class argument extends R.Sequence {
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
    constructor: class repeatFlag extends R.Symbol {
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
const { testLocation, argument, repeatFlag } = rulex.rules as Record<"testLocation" | "argument" | "repeatFlag", R.Rule>

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
      new R.Pattern({ argument: "isEscaped", pattern: /^\\$/, optional: true }),
      new R.TokenType({ tokenType: Tokens.Symbol, argument: "literal" }),
      repeatFlag
    ],
    constructor: class symbolRule extends R.Sequence {
      compile(match: P.Match<P.RulexGroups<"literal:isEscaped"> & FlagGroups>) {
        const { literal, isEscaped } = match.groups
        const rule = new R.Symbol(literal!.value)
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

          [":", new R.Symbol({ literal: ":" })],

          // matches special chars by themselves if not escaped
          ["(", new R.Symbol({ literal: "(" })],
          ["[", new R.Symbol({ literal: "[" })],
          ["?", new R.Symbol({ literal: "?" })],
          ["*", new R.Symbol({ literal: "*" })],
          ["+", new R.Symbol({ literal: "+" })],

          // only match the first one
          ["::", new R.Symbol({ literal: ":" })],

          // escaped
          ["\\:", new R.Symbol({ literal: ":", isEscaped: true })],
          ["\\?", new R.Symbol({ literal: "?", isEscaped: true })],
          ["\\(", new R.Symbol({ literal: "(", isEscaped: true })],
          ["\\[", new R.Symbol({ literal: "[", isEscaped: true })],

          // testLocation
          ["…:", new R.Symbol({ literal: ":", testLocation: P.ANYWHERE })],
          ["^:", new R.Symbol({ literal: ":", testLocation: P.AT_START })],
          ["…\\:", new R.Symbol({ literal: ":", isEscaped: true, testLocation: P.ANYWHERE })],

          // repeat
          [">?", new R.Symbol({ literal: ">", optional: true })],
          [">+", new R.Repeat(new R.Symbol({ literal: ">" }))],
          [">*", new R.Repeat({ optional: true, rule: new R.Symbol({ literal: ">" }) })],

          ["…>?", new R.Symbol({ testLocation: P.ANYWHERE, literal: ">", optional: true })],
          ["^>*", new R.Repeat({ testLocation: P.AT_START, optional: true, rule: new R.Symbol({ literal: ">" }) })]
        ]
      }
    ]
  },
  /** One or more literal keywords with an optional repeat signifier at the end. */
  {
    name: "keyword",
    alias: "rule",
    rules: [testLocation, new R.Word({ argument: "literal" }), repeatFlag],
    constructor: class keyword extends R.Sequence {
      compile(match: P.Match<P.RulexGroups<"literal"> & FlagGroups>) {
        const { literal } = match.groups
        const rule = new R.Keyword(literal!.value)
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

          ["word", new R.Keyword({ literal: "word" })],

          ["…word", new R.Keyword({ literal: "word", testLocation: P.ANYWHERE })],
          ["^word", new R.Keyword({ literal: "word", testLocation: P.AT_START })],

          ["word?", new R.Keyword({ literal: "word", optional: true })],
          ["word+", new R.Repeat({ rule: new R.Keyword({ literal: "word" }) })],
          ["word*", new R.Repeat({ optional: true, rule: new R.Keyword({ literal: "word" }) })]
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
    rules: [testLocation, new R.TokenType({ tokenType: Tokens.Number, argument: "number" }), repeatFlag],
    constructor: class numberRule extends R.Sequence {
      compile(match: P.Match<P.RulexGroups<"number"> & FlagGroups>) {
        const { number } = match.groups
        const rule = new R.Keyword({ literal: number!.value })
        return rulex.applyFlags(rule, match)
      }
    },
    tests: [
      {
        title: "matches single keyword",
        tests: [
          ["1", new R.Keyword({ literal: 1 as unknown as string })],

          ["…1", new R.Keyword({ literal: 1 as unknown as string, testLocation: P.ANYWHERE })],
          ["^1", new R.Keyword({ literal: 1 as unknown as string, testLocation: P.AT_START })],

          ["1?", new R.Keyword({ literal: 1 as unknown as string, optional: true })],
          ["1+", new R.Repeat({ rule: new R.Keyword({ literal: 1 as unknown as string }) })],
          ["1*", new R.Repeat({ optional: true, rule: new R.Keyword({ literal: 1 as unknown as string }) })]
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
      new R.Symbol("{"),
      testLocation,
      argument,
      new R.Word({ argument: "rule" }),
      new R.Symbol("}"),
      repeatFlag
    ],
    constructor: class subrule extends R.Sequence {
      compile(match: P.Match<P.RulexGroups<"rule"> & FlagGroups>) {
        const rule = new R.Subrule(String(match.groups.rule!.compile()))
        return rulex.applyFlags(rule, match)
      }
    },
    tests: [
      {
        title: "matches subrule",
        compileAs: "rule",
        tests: [
          ["", undefined],
          ["{}", new R.Symbol("{")],

          ["{sub}", new R.Subrule({ rule: "sub" })],

          ["…{sub}", new R.Subrule({ rule: "sub", testLocation: P.ANYWHERE })],
          ["{…sub}", new R.Subrule({ rule: "sub", testLocation: P.ANYWHERE })],
          ["{arg:sub}", new R.Subrule({ rule: "sub", argument: "arg" })],

          ["{sub}?", new R.Subrule({ rule: "sub", optional: true })],
          ["{sub}+", new R.Repeat({ rule: new R.Subrule({ rule: "sub" }) })],
          ["{sub}*", new R.Repeat({ optional: true, rule: new R.Subrule({ rule: "sub" }) })]
        ]
      }
    ]
  },
  /** `List`: match a list of rules, separated by a delimiter, with an optional repeat flag. */
  {
    name: "list",
    alias: "rule",
    rules: [
      new R.Symbol("["),
      argument,
      new R.Subrule({ argument: "ruleName", rule: "rule" }),
      new R.Subrule({ argument: "delimiter", rule: "rule" }),
      new R.Symbol("]"),
      new R.Symbol({ argument: "repeatFlag", literal: "?", optional: true })
    ],
    constructor: class list extends R.Sequence {
      compile(match: P.Match<P.RulexGroups<"ruleName:delimiter"> & FlagGroups>) {
        const { ruleName, delimiter } = match.groups
        const rule = new R.Repeat({ rule: compileMatchOrDie(ruleName), delimiter: compileMatchOrDie(delimiter) })
        return rulex.applyFlags(rule, match)
      }
    },
    tests: [
      {
        title: "matches list",
        compileAs: "rule",
        tests: [
          ["", undefined],
          ["[]", new R.Symbol("[")], // TODO: error for this?
          ["[{sub}]", new R.Symbol("[")], // TODO: error for this?

          ["[{sub},]", new R.Repeat({ rule: new R.Subrule("sub"), delimiter: new R.Symbol(",") })],
          ["[{sub}or]", new R.Repeat({ rule: new R.Subrule("sub"), delimiter: new R.Keyword("or") })],

          ["[arg:{sub},]", new R.Repeat({ rule: new R.Subrule("sub"), delimiter: new R.Symbol(","), argument: "arg" })],

          ["[{sub},]?", new R.Repeat({ optional: true, rule: new R.Subrule("sub"), delimiter: new R.Symbol(",") })]
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
      new R.NestedSplit({
        argument: "split",
        start: new R.Symbol("("),
        prefix: argument,
        item: new R.Subrule({ rule: "sequence", argument: "choices" }),
        delimiter: new R.Symbol("|"),
        end: new R.Symbol(")")
      }),
      repeatFlag
    ],
    constructor: class choices extends R.Sequence {
      compile(match: P.Match<{ split?: P.Match<P.NestedSplitGroups> } & FlagGroups>) {
        const { items, prefix: argument } = match.groups.split!.groups
        let choices: R.Rule[] = items.map((item) => compileMatchOrDie(item))

        // Combine single keyword, keywords, symbol, symbols
        choices = rulex.consolidateLiterals(choices, R.Keyword, "literal")
        choices = rulex.consolidateLiterals(choices, R.Symbol, "literal")

        // If we got exactly one choice, use that.
        // Note that the choice's flags will "beat" the rule's flags if they conflict.
        let rule: R.Rule
        if (choices.length === 1) {
          rule = choices[0]!
        } else {
          rule = new R.Choice({ rules: choices })
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
          ["()", new R.Symbol("(")],

          // If only one rule matched, return that rule
          ["(>)", new R.Symbol(">")],
          ["(word)", new R.Keyword("word")],
          ["({sub})", new R.Subrule("sub")],
          ["([{sub},])", new R.Repeat({ rule: new R.Subrule("sub"), delimiter: new R.Symbol(",") })],

          // Pass flags whether they were set on the choices or the single rule (a bit confusing)
          ["(…{sub})", new R.Subrule({ rule: "sub", testLocation: P.ANYWHERE })],
          ["(arg:{sub})", new R.Subrule({ rule: "sub", argument: "arg" })],
          ["({arg:sub})", new R.Subrule({ rule: "sub", argument: "arg" })],
          ["({sub}?)", new R.Subrule({ rule: "sub", optional: true })],
          ["({sub})?", new R.Subrule({ rule: "sub", optional: true })],
          ["({sub}+)", new R.Repeat({ rule: new R.Subrule({ rule: "sub" }) })],
          ["({sub}*)", new R.Repeat({ optional: true, rule: new R.Subrule({ rule: "sub" }) })],

          // consolidate multiple keywords
          ["(a|b|c)?", new R.Keyword({ literal: ["a", "b", "c"], optional: true })],
          [
            "(a|b|c?)",
            new R.Choice({
              rules: [new R.Keyword("a"), new R.Keyword("b"), new R.Keyword({ literal: "c", optional: true })]
            })
          ]
        ]
      },
      {
        title: "multiple choices",
        compileAs: "rule",
        tests: [
          ["(>|a)", new R.Choice({ rules: [new R.Symbol(">"), new R.Keyword("a")] })],

          ["…(>|a)", new R.Choice({ testLocation: P.ANYWHERE, rules: [new R.Symbol(">"), new R.Keyword("a")] })],

          ["(arg:>|a)", new R.Choice({ argument: "arg", rules: [new R.Symbol(">"), new R.Keyword("a")] })],

          ["(>|a)?", new R.Choice({ optional: true, rules: [new R.Symbol(">"), new R.Keyword("a")] })],
          [
            "(>|a)*",
            new R.Repeat({
              optional: true,
              rule: new R.Choice({ rules: [new R.Symbol(">"), new R.Keyword("a")] })
            })
          ],
          ["(>|a)+", new R.Repeat({ rule: new R.Choice({ rules: [new R.Symbol(">"), new R.Keyword("a")] }) })]
        ]
      },
      {
        title: "nested choices",
        compileAs: "rule",
        tests: [
          ["(>|(b|c|d))", new R.Choice({ rules: [new R.Symbol(">"), new R.Keyword(["b", "c", "d"])] })],
          [
            "(>|({sub}|ab))",
            new R.Choice({
              rules: [new R.Symbol(">"), new R.Choice({ rules: [new R.Subrule("sub"), new R.Keyword("ab")] })]
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
    rule: new R.Subrule("rule"),
    constructor: class sequence extends R.Repeat {
      compile(match: P.Match) {
        let matched: R.Rule[] = match.items.map((item) => compileMatchOrDie(item))

        // Consolidate keywords and symbols
        matched = rulex.consolidateLiterals(matched, R.Keyword, "literal", R.Keywords)
        matched = rulex.consolidateLiterals(matched, R.Symbol, "literal", R.Symbols)

        const rules: R.Rule[] = []
        for (let start = 0, rule: R.Rule | undefined; (rule = matched[start]); start++) {
          // Consolidate sequences
          if (rule instanceof R.Sequence && !rule.isAdorned && !rule.optional) {
            rules.push(...rule.rules)
          } else {
            rules.push(rule)
          }
        }

        // If we're down to just one rule, just return that.
        if (rules.length === 1) return rules[0]!

        return new R.Sequence(rules)
      }
    },
    tests: [
      {
        title: "sequences",
        showAll: true,
        tests: [
          ["aa bb cc", new R.Keywords(["aa", "bb", "cc"])],
          ["aa {bb} cc", new R.Sequence(new R.Keyword("aa"), new R.Subrule("bb"), new R.Keyword("cc"))],
          [
            "aa? {bb} cc",
            new R.Sequence(
              new R.Keyword({ literal: "aa", optional: true }),
              new R.Subrule({ rule: "bb" }),
              new R.Keyword("cc")
            )
          ],
          [
            "aa? (bb|>)",
            new R.Sequence(
              new R.Keyword({ literal: "aa", optional: true }),
              new R.Choice({ rules: [new R.Keyword("bb"), new R.Symbol(">")] })
            )
          ]
        ]
      },
      {
        title: "consolidate multiple keywords and symbols",
        showAll: true,
        tests: [
          [">=", new R.Symbols([">", "="])],
          [">(=)?", new R.Symbols([">", { optional: true, literal: "=" }])],
          ["(>|<) (=)?", new R.Symbols([[">", "<"], { optional: true, literal: "=" }])],

          ["a b c", new R.Keywords(["a", "b", "c"])],
          ["a? b c", new R.Keywords([{ optional: true, literal: "a" }, "b", "c"])],
          ["a b? c", new R.Keywords(["a", { optional: true, literal: "b" }, "c"])],
          ["a b c?", new R.Keywords(["a", "b", { optional: true, literal: "c" }])],

          [
            "a (arg:b) c",
            new R.Sequence([new R.Keyword("a"), new R.Keyword({ literal: "b", argument: "arg" }), new R.Keyword("c")])
          ],

          [
            "(a|b) c? d (e|f)?",
            new R.Keywords([["a", "b"], { optional: true, literal: "c" }, "d", { optional: true, literal: ["e", "f"] }])
          ]
        ]
      }
    ]
  }
)
