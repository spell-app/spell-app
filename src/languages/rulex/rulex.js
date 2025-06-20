//
//  # Core `rules` -- simple datatypes, etc.
//
// NOTE: many of the below are created as custom Pattern subclasses for debugging.
//
import { Parser, Rules, TestLocation, Tokens, Tokenizer, WhitespacePolicy } from "~/parser"

const { ANYWHERE, AT_START } = TestLocation

export class RulexParser extends Parser {}
RulexParser.prototype.module = "rulex"
RulexParser.prototype.defaultRule = "statement"

// Create core `rulex` parser.
// NOTE: THIS INSTANCE is used by other parsers, to pick up the rules defined below.
export const rulex = new RulexParser()

// Apply flags from `match` to the `rule` passed in, possibly returning a new rule!
rulex.applyFlags = function (rule, match) {
  const repeatFlag = match.groups.repeatFlag?.compile()
  const argument = match.groups.argument?.compile()
  const testLocation = match.groups.testLocation?.compile()

  // handle repeat, which may nest the rule in a repeat
  if (repeatFlag === "?") rule.optional = true
  else if (repeatFlag === "+") rule = new Rules.Repeat({ rule })
  else if (repeatFlag === "*") rule = new Rules.Repeat({ rule, optional: true })

  if (argument) rule.argument = argument
  if (testLocation) rule.testLocation = testLocation

  return rule
}

// Consolidate runs of literals in `rules` of type `constructor` together.
rulex.consolidateLiterals = function (rules, constructor, literalKey, GroupConstructor = constructor) {
  if (rules.length === 1) return rules

  const output = []
  for (let start = 0, rule; (rule = rules[start]); start++) {
    if (rule instanceof constructor && !rule.isAdorned) {
      // find the end of the run
      let end = start
      for (let next; (next = rules[end + 1]); end++) {
        if (!(next instanceof constructor && !next.isAdorned)) break
      }
      if (end > start) {
        // combine literals into a single map
        const literals = rules.slice(start, end + 1).map((nextRule) => {
          const literal = nextRule[literalKey]
          if (!nextRule.optional) return literal

          // make sure optionals are arrays and add the optional flag to the array
          return rulex.makeOptionalArray(literal)
        })
        rule = new GroupConstructor(literals)
        start = end
      }
    }
    output.push(rule)
  }
  return output
}

// Given a value as an array or a single value, turn it into an `optional` array.
rulex.makeOptionalArray = function (value) {
  const array = Array.isArray(value) ? value.concat() : [value]
  array.optional = true
  return array
}

//
//  Rules for flags in rulex syntax
//

// A test location signifier, which is always optional:
//  `…` = test anywhere in the stream (option-semicolon on mac)
//  `^` = test at start only.
rulex.defineRule({
  constructor: Rules.Literal,
  name: "testLocation",
  literal: ["…", "^"],
  optional: true,
  compile(match) {
    return match.matched[0].value === "…" ? ANYWHERE : AT_START
  },
  tests: [
    {
      title: "matches testLocation",
      tests: [
        ["", undefined],
        ["…", ANYWHERE],
        ["^", AT_START]
      ]
    }
  ]
})
const { testLocation } = rulex.rules

// A argument signifier, which is always optional.
rulex.defineRule({
  constructor: Rules.Sequence,
  name: "argument",
  rules: [new Rules.Word({ argument: "argument" }), new Rules.Literal(":")],
  optional: true,
  compile(match) {
    return match.groups.argument.value
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
})
const { argument } = rulex.rules

// A repeat signifier, which is always optional.
rulex.defineRule({
  constructor: Rules.Literal,
  name: "repeatFlag",
  literal: ["?", "*", "+"],
  optional: true,
  compile(match) {
    return match.matched[0].value
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
})
const { repeatFlag } = rulex.rules

//
//  Combo rules
//

// A single symbol, or `\<symbol>` so we can escape special symbols like "?" and "*".
rulex.defineRule({
  constructor: Rules.Sequence,
  name: "symbol",
  alias: "rule",
  rules: [
    testLocation,
    new Rules.Pattern({ argument: "isEscaped", pattern: /^\\$/, optional: true }),
    new Rules.TokenType({ tokenType: Tokens.Symbol, argument: "literal" }),
    repeatFlag
  ],

  compile(match) {
    const { literal, isEscaped } = match.groups
    const rule = new Rules.Symbol(literal.value)
    if (isEscaped) rule.isEscaped = true
    return rulex.applyFlags(rule, match)
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
        ["…:", new Rules.Symbol({ literal: ":", testLocation: ANYWHERE })],
        ["^:", new Rules.Symbol({ literal: ":", testLocation: AT_START })],
        ["…\\:", new Rules.Symbol({ literal: ":", isEscaped: true, testLocation: ANYWHERE })],

        // repeat
        [">?", new Rules.Symbol({ literal: ">", optional: true })],
        [">+", new Rules.Repeat(new Rules.Symbol({ literal: ">" }))],
        [">*", new Rules.Repeat({ optional: true, rule: new Rules.Symbol({ literal: ">" }) })],

        ["…>?", new Rules.Symbol({ testLocation: ANYWHERE, literal: ">", optional: true })],
        ["^>*", new Rules.Repeat({ testLocation: AT_START, optional: true, rule: new Rules.Symbol({ literal: ">" }) })]
      ]
    }
  ]
})

// Match  keywords with an optional repeat signifier at the end.
rulex.defineRule({
  constructor: Rules.Sequence,
  name: "keyword",
  alias: "rule",
  rules: [testLocation, new Rules.Word({ argument: "literal" }), repeatFlag],
  compile(match) {
    const { literal } = match.groups
    const rule = new Rules.Keyword(literal.value)
    return rulex.applyFlags(rule, match)
  },
  tests: [
    {
      title: "matches single keyword",
      tests: [
        ["", undefined],
        ["11", undefined],
        [":", undefined],

        ["word", new Rules.Keyword({ literal: "word" })],

        ["…word", new Rules.Keyword({ literal: "word", testLocation: ANYWHERE })],
        ["^word", new Rules.Keyword({ literal: "word", testLocation: AT_START })],

        ["word?", new Rules.Keyword({ literal: "word", optional: true })],
        ["word+", new Rules.Repeat({ rule: new Rules.Keyword({ literal: "word" }) })],
        ["word*", new Rules.Repeat({ optional: true, rule: new Rules.Keyword({ literal: "word" }) })]
      ]
    }
  ]
})

// Match a SPECIFIC number.
// Note that we create a `Keyword` rule for this, so it can be combined with alpha-numeric keywords.
rulex.defineRule({
  constructor: Rules.Sequence,
  name: "number",
  alias: "rule",
  rules: [testLocation, new Rules.TokenType({ tokenType: Tokens.Number, argument: "number" }), repeatFlag],
  compile(match) {
    const { number } = match.groups
    const rule = new Rules.Keyword({ literal: number.value })
    return rulex.applyFlags(rule, match)
  },
  tests: [
    {
      title: "matches single keyword",
      tests: [
        ["1", new Rules.Keyword({ literal: 1 })],

        ["…1", new Rules.Keyword({ literal: 1, testLocation: ANYWHERE })],
        ["^1", new Rules.Keyword({ literal: 1, testLocation: AT_START })],

        ["1?", new Rules.Keyword({ literal: 1, optional: true })],
        ["1+", new Rules.Repeat({ rule: new Rules.Keyword({ literal: 1 }) })],
        ["1*", new Rules.Repeat({ optional: true, rule: new Rules.Keyword({ literal: 1 }) })]
      ]
    }
  ]
})

// Subrule
rulex.defineRule({
  constructor: Rules.Sequence,
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
  compile(match) {
    const rule = new Rules.Subrule(match.groups.rule.compile())
    return rulex.applyFlags(rule, match)
  },
  tests: [
    {
      title: "matches subrule",
      compileAs: "rule",
      tests: [
        ["", undefined],
        ["{}", new Rules.Symbol("{")],

        ["{sub}", new Rules.Subrule({ rule: "sub" })],

        ["…{sub}", new Rules.Subrule({ rule: "sub", testLocation: ANYWHERE })],
        ["{…sub}", new Rules.Subrule({ rule: "sub", testLocation: ANYWHERE })],
        ["{arg:sub}", new Rules.Subrule({ rule: "sub", argument: "arg" })],

        ["{sub}?", new Rules.Subrule({ rule: "sub", optional: true })],
        ["{sub}+", new Rules.Repeat({ rule: new Rules.Subrule({ rule: "sub" }) })],
        ["{sub}*", new Rules.Repeat({ optional: true, rule: new Rules.Subrule({ rule: "sub" }) })]
      ]
    }
  ]
})

rulex.defineRule({
  constructor: Rules.Sequence,
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
  compile(match) {
    const { ruleName, delimiter } = match.groups
    const rule = new Rules.Repeat({ rule: ruleName.compile(), delimiter: delimiter.compile() })
    return rulex.applyFlags(rule, match)
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
})

rulex.defineRule({
  constructor: Rules.Sequence,
  name: "choices",
  alias: "rule",
  rules: [
    testLocation,
    new Rules.NestedSplit({
      argument: "split",
      start: new Rules.Symbol("("),
      end: new Rules.Symbol(")"),
      delimiter: new Rules.Symbol("|"),
      prefix: new Rules.Sequence({ rules: [argument], optional: true }),
      rule: new Rules.Subrule({ rule: "statement", argument: "choices" })
    }),
    repeatFlag
  ],
  compile(match) {
    const split = match.groups.split.compile()
    let { choices } = split

    // Combine single keyword, keywords, symbol, symbols
    choices = rulex.consolidateLiterals(choices, Rules.Keyword, "literal")
    choices = rulex.consolidateLiterals(choices, Rules.Symbol, "literal")

    // If we got exactly one choice, use that.
    // Note that the choice's flags will "beat" the rule's flags if they conflict.
    let rule
    if (choices.length === 1) {
      // eslint-disable-next-line prefer-destructuring
      rule = choices[0]
    } else {
      rule = new Rules.Choice({ rules: choices })
    }

    rule = rulex.applyFlags(rule, match)
    if (split.argument) rule.argument = split.argument
    return rule
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
        ["(…{sub})", new Rules.Subrule({ rule: "sub", testLocation: ANYWHERE })],
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
          new Rules.Choice(
            new Rules.Keyword("a"),
            new Rules.Keyword("b"),
            new Rules.Keyword({ literal: "c", optional: true })
          )
        ]
      ]
    },
    {
      title: "multiple choices",
      compileAs: "rule",
      tests: [
        ["(>|a)", new Rules.Choice(new Rules.Symbol(">"), new Rules.Keyword("a"))],

        [
          "…(>|a)",
          new Rules.Choice({ testLocation: ANYWHERE, rules: [new Rules.Symbol(">"), new Rules.Keyword("a")] })
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
        ["(>|(b|c|d))", new Rules.Choice(new Rules.Symbol(">"), new Rules.Keyword(["b", "c", "d"]))],
        [
          "(>|({sub}|ab))",
          new Rules.Choice(new Rules.Symbol(">"), new Rules.Choice(new Rules.Subrule("sub"), new Rules.Keyword("ab")))
        ]
      ]
    }
  ]
})

// Sequence as a statement -- our top-level rule.
// NO test rule, otherwise we can't start a statement with a special character.
// Match a long list of rules.
// TODO: `consume all tokens`...
rulex.defineRule({
  constructor: Rules.Repeat,
  name: "statement",
  rule: new Rules.Subrule("rule"),
  compile(match) {
    let matched = match.matched.map((nextMatch) => nextMatch.compile())

    // Consolidate keywords and symbols
    matched = rulex.consolidateLiterals(matched, Rules.Keyword, "literal", Rules.Keywords)
    matched = rulex.consolidateLiterals(matched, Rules.Symbol, "literal", Rules.Symbols)

    const rules = []
    for (let start = 0, rule; (rule = matched[start]); start++) {
      // Consolidate sequences
      if (rule instanceof Rules.Sequence && !rule.isAdorned && !rule.optional) {
        rules.push(...rule.rules)
      } else {
        rules.push(rule)
      }
    }

    // If we're down to just one rule, just return that.
    if (rules.length === 1) return rules[0]

    return new Rules.Sequence(rules)
  },
  tests: [
    {
      title: "sequences",
      showAll: true,
      tests: [
        ["aa bb cc", new Rules.Keywords("aa", "bb", "cc")],
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
        [">(=)?", new Rules.Symbols([">", rulex.makeOptionalArray("=")])],
        ["(>|<) (=)?", new Rules.Symbols([[">", "<"], rulex.makeOptionalArray("=")])],

        ["a b c", new Rules.Keywords(["a", "b", "c"])],
        ["a? b c", new Rules.Keywords([rulex.makeOptionalArray("a"), "b", "c"])],
        ["a b? c", new Rules.Keywords(["a", rulex.makeOptionalArray("b"), "c"])],
        ["a b c?", new Rules.Keywords(["a", "b", rulex.makeOptionalArray("c")])],

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
          new Rules.Keywords([["a", "b"], rulex.makeOptionalArray("c"), "d", rulex.makeOptionalArray(["e", "f"])])
        ]
      ]
    }
  ]
})
