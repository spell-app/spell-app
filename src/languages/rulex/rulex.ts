/**
 * Rule definitions for the `rulex` language itself -- the regex-like syntax used to build other parsers'
 * `rules` (see `syntax:` in `Parser.defineRule()`).
 * - Each `symbol` / `keyword` / `number` / `subrule` / `list` / `choices` rule below compiles a piece of rulex
 *   syntax into the actual `P.Rule` (`P.Symbol`, `P.Keyword`, `P.Subrule`, `P.Repeat`, `P.Choice`, ...) it
 *   describes.  `sequence` (the module's `defaultRule`) ties them together into the full grammar.
 * - NOTE: many rules below are custom `Pattern` subclasses (rather than plain object literals) so they show up
 *   with meaningful names for debugging.
 */

import { P } from "~/parser"
// Import directly to avoid circular import
import { Parser } from "~/parser/Parser"
import { RulexParser } from "./RulexParser"

/**
 * Core `rulex` parser instance.
 * - NOTE: THIS INSTANCE is used by other parsers -- see `Parser.rulexParser` -- to pick up the rules defined
 *   in this file, so there's only ever one `rulex` grammar for the whole app.
 */
export const rulex = new RulexParser({ module: "rulex" })

// Register `rulex` on `Parser` base class -- SIDE EFFECT: this is the whole reason files import this module;
// see `~/languages/rulex/index.ts` and `Parser.rulexParser`.
Parser.rulexParser = rulex

// Define base rules `testLocation`, `argument` and `repeatFlag`, used by the below.
rulex.defineRules(
  /**
   * Optional test-location prefix `…` or `^`, adorning most other rules below.
   * - Compiles to `P.ANYWHERE` for `…`, `P.AT_START` for `^`.
   * - TODO: this mapping looks reversed from `Rule.getRulexFlags()` (`~/parser/rules/Rule.ts`), which
   *   stringifies `AT_START` back to `…` and `ANYWHERE` back to `^` -- see `## Suspected bugs` in doc-pass report.
   */
  {
    name: "testLocation",
    literal: ["…", "^"],
    optional: true,
    constructor: class testLocation extends P.Symbol {
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
  /**
   * Optional `name:` prefix, adorning rules that can carry an `argument` (e.g. `{arg:sub}`, `(arg:a|b)`).
   * - Compiles to just the name string, e.g. `"arg:"` => `"arg"`.
   */
  {
    name: "argument",
    rules: [new P.Word({ argument: "argument" }), new P.Symbol(":")],
    optional: true,
    constructor: class argument extends P.Sequence {
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
  /**
   * Optional trailing repeat flag `?` / `*` / `+`, adorning most other rules below.
   * - Compiles to the matched flag character itself; `applyFlags()` interprets it into `optional` / `P.Repeat`.
   */
  {
    name: "repeatFlag",
    literal: ["?", "*", "+"],
    optional: true,
    constructor: class repeatFlag extends P.Symbol {
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

////////////////
// ## Combo rules
////////////////

rulex.defineRules(
  /**
   * A single symbol, or `\<symbol>` so we can escape special symbols like `?` and `*`.
   * - Compiles to a `P.Symbol`, adorned by `testLocation` / `repeatFlag` via `applyFlags()`.
   */
  {
    name: "symbol",
    alias: "rule",
    rules: [
      testLocation,
      new P.Pattern({ argument: "isEscaped", pattern: /^\\$/, optional: true }),
      new P.TokenType({ tokenType: P.Tokens.Symbol, argument: "literal" }),
      repeatFlag
    ],
    constructor: class symbolRule extends P.Sequence {
      compile(match: P.Match<P.RulexGroups<"literal:isEscaped"> & P.FlagGroups>) {
        const { literal, isEscaped } = match.groups
        const rule = new P.Symbol(literal!.value)
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

          [":", new P.Symbol({ literal: ":" })],

          // matches special chars by themselves if not escaped
          ["(", new P.Symbol({ literal: "(" })],
          ["[", new P.Symbol({ literal: "[" })],
          ["?", new P.Symbol({ literal: "?" })],
          ["*", new P.Symbol({ literal: "*" })],
          ["+", new P.Symbol({ literal: "+" })],

          // only match the first one
          ["::", new P.Symbol({ literal: ":" })],

          // escaped
          ["\\:", new P.Symbol({ literal: ":", isEscaped: true })],
          ["\\?", new P.Symbol({ literal: "?", isEscaped: true })],
          ["\\(", new P.Symbol({ literal: "(", isEscaped: true })],
          ["\\[", new P.Symbol({ literal: "[", isEscaped: true })],

          // testLocation
          ["…:", new P.Symbol({ literal: ":", testLocation: P.ANYWHERE })],
          ["^:", new P.Symbol({ literal: ":", testLocation: P.AT_START })],
          ["…\\:", new P.Symbol({ literal: ":", isEscaped: true, testLocation: P.ANYWHERE })],

          // repeat
          [">?", new P.Symbol({ literal: ">", optional: true })],
          [">+", new P.Repeat(new P.Symbol({ literal: ">" }))],
          [">*", new P.Repeat({ optional: true, rule: new P.Symbol({ literal: ">" }) })],

          ["…>?", new P.Symbol({ testLocation: P.ANYWHERE, literal: ">", optional: true })],
          ["^>*", new P.Repeat({ testLocation: P.AT_START, optional: true, rule: new P.Symbol({ literal: ">" }) })]
        ]
      }
    ]
  },
  /**
   * A single keyword word, with an optional trailing repeat flag.
   * - NOTE: matches only ONE word per occurrence in rulex syntax -- `repeatFlag` controls how many times the
   *   resulting `P.Keyword` rule must match at parse time, not how many literal keywords this rulex token
   *   stands for.
   * - Compiles to a `P.Keyword`, adorned by `testLocation` / `repeatFlag` via `applyFlags()`.
   */
  {
    name: "keyword",
    alias: "rule",
    rules: [testLocation, new P.Word({ argument: "literal" }), repeatFlag],
    constructor: class keyword extends P.Sequence {
      compile(match: P.Match<P.RulexGroups<"literal"> & P.FlagGroups>) {
        const { literal } = match.groups
        const rule = new P.Keyword(literal!.value)
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

          ["word", new P.Keyword({ literal: "word" })],

          ["…word", new P.Keyword({ literal: "word", testLocation: P.ANYWHERE })],
          ["^word", new P.Keyword({ literal: "word", testLocation: P.AT_START })],

          ["word?", new P.Keyword({ literal: "word", optional: true })],
          ["word+", new P.Repeat({ rule: new P.Keyword({ literal: "word" }) })],
          ["word*", new P.Repeat({ optional: true, rule: new P.Keyword({ literal: "word" }) })]
        ]
      }
    ]
  },
  /**
   * Match a SPECIFIC number literal.
   * - The returned rule is a `Keyword` rule, so it can be combined with alpha-numeric keywords.
   * - TODO: how is this used?
   */
  {
    name: "number",
    alias: "rule",
    rules: [testLocation, new P.TokenType({ tokenType: P.Tokens.Number, argument: "number" }), repeatFlag],
    constructor: class numberRule extends P.Sequence {
      compile(match: P.Match<P.RulexGroups<"number"> & P.FlagGroups>) {
        const { number } = match.groups
        const rule = new P.Keyword({ literal: number!.value })
        return rulex.applyFlags(rule, match)
      }
    },
    tests: [
      {
        title: "matches single keyword",
        tests: [
          ["1", new P.Keyword({ literal: 1 as unknown as string })],

          ["…1", new P.Keyword({ literal: 1 as unknown as string, testLocation: P.ANYWHERE })],
          ["^1", new P.Keyword({ literal: 1 as unknown as string, testLocation: P.AT_START })],

          ["1?", new P.Keyword({ literal: 1 as unknown as string, optional: true })],
          ["1+", new P.Repeat({ rule: new P.Keyword({ literal: 1 as unknown as string }) })],
          ["1*", new P.Repeat({ optional: true, rule: new P.Keyword({ literal: 1 as unknown as string }) })]
        ]
      }
    ]
  },
  /**
   * `Subrule`: match a named rule, as part of a larger sequence.
   * - `{name}` references rule `name`; `{arg:name}` also sets `argument` on the resulting `P.Subrule`.
   */
  {
    name: "subrule",
    alias: "rule",
    rules: [
      testLocation,
      new P.Symbol("{"),
      testLocation,
      argument,
      new P.Word({ argument: "rule" }),
      new P.Symbol("}"),
      repeatFlag
    ],
    constructor: class subrule extends P.Sequence {
      compile(match: P.Match<P.RulexGroups<"rule"> & P.FlagGroups>) {
        const rule = new P.Subrule(String(match.groups.rule!.compile()))
        return rulex.applyFlags(rule, match)
      }
    },
    tests: [
      {
        title: "matches subrule",
        compileAs: "rule",
        tests: [
          ["", undefined],
          ["{}", new P.Symbol("{")],

          ["{sub}", new P.Subrule({ rule: "sub" })],

          ["…{sub}", new P.Subrule({ rule: "sub", testLocation: P.ANYWHERE })],
          ["{…sub}", new P.Subrule({ rule: "sub", testLocation: P.ANYWHERE })],
          ["{arg:sub}", new P.Subrule({ rule: "sub", argument: "arg" })],

          ["{sub}?", new P.Subrule({ rule: "sub", optional: true })],
          ["{sub}+", new P.Repeat({ rule: new P.Subrule({ rule: "sub" }) })],
          ["{sub}*", new P.Repeat({ optional: true, rule: new P.Subrule({ rule: "sub" }) })]
        ]
      }
    ]
  },
  /**
   * `[rule delimiter]`: match a list of `rule`, separated by `delimiter`, with an optional repeat flag.
   * - Both `rule` and `delimiter` MUST themselves be `{subrule}` references, not inline rulex.
   * - Compiles to a `P.Repeat` with `rule` / `delimiter` set from the two subrules.
   */
  {
    name: "list",
    alias: "rule",
    rules: [
      new P.Symbol("["),
      argument,
      new P.Subrule({ argument: "ruleName", rule: "rule" }),
      new P.Subrule({ argument: "delimiter", rule: "rule" }),
      new P.Symbol("]"),
      new P.Symbol({ argument: "repeatFlag", literal: "?", optional: true })
    ],
    constructor: class list extends P.Sequence {
      compile(match: P.Match<P.RulexGroups<"ruleName:delimiter"> & P.FlagGroups>) {
        const { ruleName, delimiter } = match.groups
        const rule = new P.Repeat({
          rule: RulexParser.compileMatchOrDie(ruleName),
          delimiter: RulexParser.compileMatchOrDie(delimiter)
        })
        return rulex.applyFlags(rule, match)
      }
    },
    tests: [
      {
        title: "matches list",
        compileAs: "rule",
        tests: [
          ["", undefined],
          ["[]", new P.Symbol("[")], // TODO: error for this?
          ["[{sub}]", new P.Symbol("[")], // TODO: error for this?

          ["[{sub},]", new P.Repeat({ rule: new P.Subrule("sub"), delimiter: new P.Symbol(",") })],
          ["[{sub}or]", new P.Repeat({ rule: new P.Subrule("sub"), delimiter: new P.Keyword("or") })],

          ["[arg:{sub},]", new P.Repeat({ rule: new P.Subrule("sub"), delimiter: new P.Symbol(","), argument: "arg" })],

          ["[{sub},]?", new P.Repeat({ optional: true, rule: new P.Subrule("sub"), delimiter: new P.Symbol(",") })]
        ]
      }
    ]
  },
  /**
   * `(a|b|c)`: match one of a list of `sequence` rules, separated by `|`, with an optional repeat flag.
   * - Uses `P.NestedSplit` to find the balanced `(...)` span and split its contents on `|`, so choices can
   *   themselves contain nested parens, e.g. `(>|(b|c|d))`.
   * - Consolidates runs of plain `Keyword` / `Symbol` choices into a single `Keyword` / `Symbol` with an array
   *   literal, e.g. `(a|b|c)` compiles to one `P.Keyword({ literal: ["a", "b", "c"] })`, not a `P.Choice`.
   * - If exactly one choice remains after consolidation, returns that rule directly instead of wrapping it in
   *   a `P.Choice` -- NOTE: in that case the choice's own flags "beat" the rule's flags if they conflict.
   */
  {
    name: "choices",
    alias: "rule",
    rules: [
      testLocation,
      new P.NestedSplit({
        argument: "split",
        start: new P.Symbol("("),
        prefix: argument,
        item: new P.Subrule({ rule: "sequence", argument: "choices" }),
        delimiter: new P.Symbol("|"),
        end: new P.Symbol(")")
      }),
      repeatFlag
    ],
    constructor: class choices extends P.Sequence {
      compile(match: P.Match<{ split?: P.Match<P.NestedSplitGroups> } & P.FlagGroups>) {
        const { items, prefix: argument } = match.groups.split!.groups
        let choices: P.Rule[] = items.map((item) => RulexParser.compileMatchOrDie(item))

        // Combine single keyword, keywords, symbol, symbols
        choices = rulex.consolidateLiterals(choices, P.Keyword, "literal")
        choices = rulex.consolidateLiterals(choices, P.Symbol, "literal")

        // If we got exactly one choice, use that.
        // Note that the choice's flags will "beat" the rule's flags if they conflict.
        let rule: P.Rule
        if (choices.length === 1) {
          rule = choices[0]!
        } else {
          rule = new P.Choice({ rules: choices })
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
          ["()", new P.Symbol("(")],

          // If only one rule matched, return that rule
          ["(>)", new P.Symbol(">")],
          ["(word)", new P.Keyword("word")],
          ["({sub})", new P.Subrule("sub")],
          ["([{sub},])", new P.Repeat({ rule: new P.Subrule("sub"), delimiter: new P.Symbol(",") })],

          // Pass flags whether they were set on the choices or the single rule (a bit confusing)
          ["(…{sub})", new P.Subrule({ rule: "sub", testLocation: P.ANYWHERE })],
          ["(arg:{sub})", new P.Subrule({ rule: "sub", argument: "arg" })],
          ["({arg:sub})", new P.Subrule({ rule: "sub", argument: "arg" })],
          ["({sub}?)", new P.Subrule({ rule: "sub", optional: true })],
          ["({sub})?", new P.Subrule({ rule: "sub", optional: true })],
          ["({sub}+)", new P.Repeat({ rule: new P.Subrule({ rule: "sub" }) })],
          ["({sub}*)", new P.Repeat({ optional: true, rule: new P.Subrule({ rule: "sub" }) })],

          // consolidate multiple keywords
          ["(a|b|c)?", new P.Keyword({ literal: ["a", "b", "c"], optional: true })],
          [
            "(a|b|c?)",
            new P.Choice({
              rules: [new P.Keyword("a"), new P.Keyword("b"), new P.Keyword({ literal: "c", optional: true })]
            })
          ]
        ]
      },
      {
        title: "multiple choices",
        compileAs: "rule",
        tests: [
          ["(>|a)", new P.Choice({ rules: [new P.Symbol(">"), new P.Keyword("a")] })],

          ["…(>|a)", new P.Choice({ testLocation: P.ANYWHERE, rules: [new P.Symbol(">"), new P.Keyword("a")] })],

          ["(arg:>|a)", new P.Choice({ argument: "arg", rules: [new P.Symbol(">"), new P.Keyword("a")] })],

          ["(>|a)?", new P.Choice({ optional: true, rules: [new P.Symbol(">"), new P.Keyword("a")] })],
          [
            "(>|a)*",
            new P.Repeat({
              optional: true,
              rule: new P.Choice({ rules: [new P.Symbol(">"), new P.Keyword("a")] })
            })
          ],
          ["(>|a)+", new P.Repeat({ rule: new P.Choice({ rules: [new P.Symbol(">"), new P.Keyword("a")] }) })]
        ]
      },
      {
        title: "nested choices",
        compileAs: "rule",
        tests: [
          ["(>|(b|c|d))", new P.Choice({ rules: [new P.Symbol(">"), new P.Keyword(["b", "c", "d"])] })],
          [
            "(>|({sub}|ab))",
            new P.Choice({
              rules: [new P.Symbol(">"), new P.Choice({ rules: [new P.Subrule("sub"), new P.Keyword("ab")] })]
            })
          ]
        ]
      }
    ]
  },

  /**
   * `sequence`: a sequence of rules -- our top-level rule, and `rulex`'s `defaultRule`.
   * - NO test rule, otherwise we can't start a sequence with a special character.
   * - Consolidates consecutive `Keyword` / `Symbol` matches into `P.Keywords` / `P.Symbols`, and flattens plain
   *   (non-adorned, non-optional) nested `P.Sequence`s into this one, so e.g. `"aa bb cc"` compiles to a single
   *   `P.Keywords`, not nested sequences.
   * - If we're left with exactly one rule after consolidation, returns that rule directly rather than
   *   wrapping it in a `P.Sequence`.
   * - TODO: `consume all tokens`...
   */
  {
    name: "sequence",
    rule: new P.Subrule("rule"),
    constructor: class sequence extends P.Repeat {
      compile(match: P.Match) {
        let matched: P.Rule[] = match.items.map((item) => RulexParser.compileMatchOrDie(item))

        // Consolidate keywords and symbols
        matched = rulex.consolidateLiterals(matched, P.Keyword, "literal", P.Keywords)
        matched = rulex.consolidateLiterals(matched, P.Symbol, "literal", P.Symbols)

        const rules: P.Rule[] = []
        for (let start = 0, rule: P.Rule | undefined; (rule = matched[start]); start++) {
          // Consolidate sequences
          if (rule instanceof P.Sequence && !rule.isAdorned && !rule.optional) {
            rules.push(...rule.rules)
          } else {
            rules.push(rule)
          }
        }

        // If we're down to just one rule, just return that.
        if (rules.length === 1) return rules[0]!

        return new P.Sequence(rules)
      }
    },
    tests: [
      {
        title: "sequences",
        showAll: true,
        tests: [
          ["aa bb cc", new P.Keywords(["aa", "bb", "cc"])],
          ["aa {bb} cc", new P.Sequence(new P.Keyword("aa"), new P.Subrule("bb"), new P.Keyword("cc"))],
          [
            "aa? {bb} cc",
            new P.Sequence(
              new P.Keyword({ literal: "aa", optional: true }),
              new P.Subrule({ rule: "bb" }),
              new P.Keyword("cc")
            )
          ],
          [
            "aa? (bb|>)",
            new P.Sequence(
              new P.Keyword({ literal: "aa", optional: true }),
              new P.Choice({ rules: [new P.Keyword("bb"), new P.Symbol(">")] })
            )
          ]
        ]
      },
      {
        title: "consolidate multiple keywords and symbols",
        showAll: true,
        tests: [
          [">=", new P.Symbols([">", "="])],
          [">(=)?", new P.Symbols([">", { optional: true, literal: "=" }])],
          ["(>|<) (=)?", new P.Symbols([[">", "<"], { optional: true, literal: "=" }])],

          ["a b c", new P.Keywords(["a", "b", "c"])],
          ["a? b c", new P.Keywords([{ optional: true, literal: "a" }, "b", "c"])],
          ["a b? c", new P.Keywords(["a", { optional: true, literal: "b" }, "c"])],
          ["a b c?", new P.Keywords(["a", "b", { optional: true, literal: "c" }])],

          [
            "a (arg:b) c",
            new P.Sequence([new P.Keyword("a"), new P.Keyword({ literal: "b", argument: "arg" }), new P.Keyword("c")])
          ],

          [
            "(a|b) c? d (e|f)?",
            new P.Keywords([["a", "b"], { optional: true, literal: "c" }, "d", { optional: true, literal: ["e", "f"] }])
          ]
        ]
      }
    ]
  }
)
