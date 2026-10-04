/**
 * Rule definitions for the `rulex` language itself -- the regex-like syntax used to build other parsers'
 * `rules` (see `static syntax` in `Rule`).
 * - Each `symbol` / `keyword` / `number` / `subrule` / `list` / `choices` rule below compiles a piece of rulex
 *   syntax into the actual `P.Rule` (`P.Symbol`, `P.Keyword`, `P.Subrule`, `P.Repeat`, `P.Choice`, ...) it
 *   describes.  `sequence` (the module's `defaultRule`) ties them together into the full grammar.
 * - NOTE: many rules below are custom `Pattern` subclasses (rather than plain object literals) so they show up
 *   with meaningful names for debugging.
 */

import { P } from "$/parser"
// Import directly to avoid circular import
import { Parser } from "$/parser/Parser"
import { RulexParser } from "./RulexParser"

/**
 * Core `rulex` parser instance.
 * - NOTE: THIS INSTANCE is used by other parsers -- see `Parser.rulexParser` -- to pick up the rules defined
 *   in this file, so there's only ever one `rulex` grammar for the whole app.
 */
export const rulex = new RulexParser({ module: "rulex" })

// Register `rulex` on `Parser` base class -- SIDE EFFECT: this is the whole reason files import this module;
// see `$/parser/rulex/index.ts` and `Parser.rulexParser`.
Parser.rulexParser = rulex

////////////////
// ## `matchGroup` rule
//    e.g. "arg:"
////////////////

/**
 * Optional `name:` prefix, adorning rules that can carry an `matchGroup` (e.g. `{arg:sub}`, `(arg:a|b)`).
 * - Compiles to just the name string, e.g. `"arg:"` => `"arg"`.
 */
class matchGroupRule extends P.Sequence<"matchGroup"> {
  compile(match: P.MatchFor<this>) {
    return match.groups.matchGroup.value
  }
}
rulex.addRule(matchGroupRule, {
  name: "matchGroup",
  rules: [new P.Word({ matchGroup: "matchGroup" }), new P.Symbol(":")],
  optional: true,
  tests: [
    {
      title: "matches matchGroup",
      tests: [
        ["", undefined],
        ["arg:", "arg"]
      ]
    }
  ]
})

////////////////
// ## `repeatFlag` rule
//    e.g. "?"
////////////////

/**
 * Optional trailing repeat flag `?` / `*` / `+`, adorning most other rules below.
 * - Compiles to the matched flag character itself; `applyFlags()` interprets it into `optional` / `P.Repeat`.
 */
class repeatFlagRule extends P.Symbol {
  compile(match: P.MatchFor<this>) {
    return match.matched[0]!.value
  }
}
rulex.addRule(repeatFlagRule, {
  name: "repeatFlag",
  literal: ["?", "*", "+"],
  optional: true,
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

// `matchGroup` / `repeatFlag` are registered ABOVE first, so we can pull their registered
// INSTANCES out here -- the rules below put these instances directly inside their own `rules` arrays.
const { matchGroup, repeatFlag } = rulex.rules as Record<"matchGroup" | "repeatFlag", P.Rule>

////////////////
// ## `symbol` rule
//    e.g. ":"
////////////////

/**
 * A single symbol, or `\<symbol>` so we can escape special symbols like `?` and `*`.
 * - NEVER matches an unescaped `|` or `)` -- those end a `choices` item, so `choices`
 *   can be a plain `Sequence`.  Write `\|` / `\)` for the literal symbol.
 * - NEVER matches an unescaped `[`, `{` or `(` either:  they only open a list / subrule / choice, so one that
 *   doesn't parse as that is an error, not a quiet literal (`[{sub}]` used to compile to literal brackets).
 *   Write `\[` / `\{` / `\(`.
 * - Compiles to a `P.Symbol`, adorned by `repeatFlag` via `applyFlags()`.
 */
class symbolRule extends P.Sequence<"isEscaped?|literal|repeatFlag?"> {
  compile(match: P.MatchFor<this>) {
    const { literal, isEscaped } = match.groups
    const rule = new P.Symbol(literal.value)
    if (isEscaped) rule.isEscaped = true
    return rulex.applyFlags(rule, match)
  }
}
rulex.addRule(symbolRule, {
  name: "symbol",
  alias: "rule",
  rules: [
    new P.Choice({
      rules: [
        // escaped:  any symbol at all, e.g. `\|`
        new P.Sequence([
          new P.Symbol({ literal: "\\", matchGroup: "isEscaped" }),
          new P.TokenType({ tokenType: P.SymbolToken, matchGroup: "literal" })
        ]),
        // unescaped:  anything but the `|` / `)` which `choices` needs to see, and the openers `[` `{` `(`
        new P.TokenType({ tokenType: P.SymbolToken, matchGroup: "literal", blacklist: ["|", ")", "[", "{", "("] })
      ]
    }),
    repeatFlag
  ],
  tests: [
    {
      title: "matches symbol",
      tests: [
        ["", undefined],
        // `…` and `^` used to be test-location flags, now they're just symbols
        ["…", new P.Symbol({ literal: "…" })],
        ["^", new P.Symbol({ literal: "^" })],

        [":", new P.Symbol({ literal: ":" })],

        // matches flag chars by themselves if not escaped
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

        // `|` and `)` only when escaped -- `choices` needs to see them bare
        ["|", undefined],
        [")", undefined],
        ["\\|", new P.Symbol({ literal: "|", isEscaped: true })],
        ["\\)", new P.Symbol({ literal: ")", isEscaped: true })],

        // the openers `(` `[` `{` only when escaped -- bare, they open a choice / list / subrule
        ["(", undefined],
        ["[", undefined],
        ["{", undefined],
        ["\\{", new P.Symbol({ literal: "{", isEscaped: true })],

        // repeat
        [">?", new P.Symbol({ literal: ">", optional: true })],
        [">+", new P.Repeat(new P.Symbol({ literal: ">" }))],
        [">*", new P.Repeat({ optional: true, rule: new P.Symbol({ literal: ">" }) })]
      ]
    }
  ]
})

////////////////
// ## `keyword` rule
//    e.g. "word"
////////////////

/**
 * A single keyword word, with an optional trailing repeat flag.
 * - NOTE: matches only ONE word per occurrence in rulex syntax -- `repeatFlag` controls how many times the
 *   resulting `P.Keyword` rule must match at parse time, not how many literal keywords this rulex token
 *   stands for.
 * - Compiles to a `P.Keyword`, adorned by `repeatFlag` via `applyFlags()`.
 */
class keyword extends P.Sequence<"literal|repeatFlag?"> {
  compile(match: P.MatchFor<this>) {
    const { literal } = match.groups
    const rule = new P.Keyword(literal.value)
    return rulex.applyFlags(rule, match)
  }
}
rulex.addRule(keyword, {
  alias: "rule",
  rules: [new P.Word({ matchGroup: "literal" }), repeatFlag],
  tests: [
    {
      title: "matches single keyword",
      tests: [
        ["", undefined],
        ["11", undefined],
        [":", undefined],

        ["word", new P.Keyword({ literal: "word" })],

        ["word?", new P.Keyword({ literal: "word", optional: true })],
        ["word+", new P.Repeat({ rule: new P.Keyword({ literal: "word" }) })],
        ["word*", new P.Repeat({ optional: true, rule: new P.Keyword({ literal: "word" }) })]
      ]
    }
  ]
})

////////////////
// ## `number` rule
//    e.g. "1"
////////////////

/**
 * Match a SPECIFIC number literal.
 * - The returned rule is a `Keyword` rule, so it can be combined with alpha-numeric keywords.
 * - TODO: how is this used?
 */
class numberRule extends P.Sequence<"number|repeatFlag?"> {
  compile(match: P.MatchFor<this>) {
    const { number } = match.groups
    const rule = new P.Keyword({ literal: number.value })
    return rulex.applyFlags(rule, match)
  }
}
rulex.addRule(numberRule, {
  name: "number",
  alias: "rule",
  rules: [new P.TokenType({ tokenType: P.NumberToken, matchGroup: "number" }), repeatFlag],
  tests: [
    {
      title: "matches single keyword",
      tests: [
        ["1", new P.Keyword({ literal: 1 as unknown as string })],

        ["1?", new P.Keyword({ literal: 1 as unknown as string, optional: true })],
        ["1+", new P.Repeat({ rule: new P.Keyword({ literal: 1 as unknown as string }) })],
        ["1*", new P.Repeat({ optional: true, rule: new P.Keyword({ literal: 1 as unknown as string }) })]
      ]
    }
  ]
})

////////////////
// ## `subrule` rule
//    e.g. "{sub}"
////////////////

/**
 * `Subrule`: match a named rule, as part of a larger sequence.
 * - `{name}` references rule `name`; `{arg:name}` also sets `matchGroup` on the resulting `P.Subrule`.
 */
class subrule extends P.Sequence<"matchGroup?|rule|repeatFlag?"> {
  compile(match: P.MatchFor<this>) {
    const rule = new P.Subrule(String(match.groups.rule.compile()))
    return rulex.applyFlags(rule, match)
  }
}
rulex.addRule(subrule, {
  alias: "rule",
  rules: [new P.Symbol("{"), matchGroup, new P.Word({ matchGroup: "rule" }), new P.Symbol("}"), repeatFlag],
  tests: [
    {
      title: "matches subrule",
      compileAs: "rule",
      tests: [
        ["", undefined],
        ["{}", undefined],

        ["{sub}", new P.Subrule({ rule: "sub" })],

        ["{arg:sub}", new P.Subrule({ rule: "sub", matchGroup: "arg" })],

        ["{sub}?", new P.Subrule({ rule: "sub", optional: true })],
        ["{sub}+", new P.Repeat({ rule: new P.Subrule({ rule: "sub" }) })],
        ["{sub}*", new P.Repeat({ optional: true, rule: new P.Subrule({ rule: "sub" }) })]
      ]
    }
  ]
})

////////////////
// ## `list` rule
//    e.g. "[{sub},]"
////////////////

/**
 * `[rule delimiter]`: match a list of `rule`, separated by `delimiter`, with an optional repeat flag.
 * - Both `rule` and `delimiter` MUST themselves be `{subrule}` references, not inline rulex.
 * - Compiles to a `P.Repeat` with `rule` / `delimiter` set from the two subrules.
 */
class list extends P.Sequence<"matchGroup?|ruleName|delimiter|repeatFlag?"> {
  compile(match: P.MatchFor<this>) {
    const { ruleName, delimiter } = match.groups
    const rule = new P.Repeat({
      rule: RulexParser.compileMatchOrDie(ruleName),
      delimiter: RulexParser.compileMatchOrDie(delimiter)
    })
    return rulex.applyFlags(rule, match)
  }
}
rulex.addRule(list, {
  alias: "rule",
  rules: [
    new P.Symbol("["),
    matchGroup,
    new P.Subrule({ matchGroup: "ruleName", rule: "rule" }),
    new P.Subrule({ matchGroup: "delimiter", rule: "rule" }),
    new P.Symbol("]"),
    new P.Symbol({ matchGroup: "repeatFlag", literal: "?", optional: true })
  ],
  tests: [
    {
      title: "matches list",
      compileAs: "rule",
      tests: [
        ["", undefined],
        // a bare `[` is never a literal:  no match, so a whole syntax throws
        ["[]", undefined],
        ["[{sub}]", undefined],

        ["[{sub},]", new P.Repeat({ rule: new P.Subrule("sub"), delimiter: new P.Symbol(",") })],
        ["[{sub}or]", new P.Repeat({ rule: new P.Subrule("sub"), delimiter: new P.Keyword("or") })],

        ["[arg:{sub},]", new P.Repeat({ rule: new P.Subrule("sub"), delimiter: new P.Symbol(","), matchGroup: "arg" })],

        ["[{sub},]?", new P.Repeat({ optional: true, rule: new P.Subrule("sub"), delimiter: new P.Symbol(",") })]
      ]
    }
  ]
})

////////////////
// ## `choices` rule
//    e.g. "(>|a)"
////////////////

/**
 * `(a|b|c)`: match one of a list of `sequence` rules, separated by `|`, with an optional repeat flag.
 * - Plain `Sequence`:  `(`, optional `name:`, `[{sequence}|]`, `)`.  Each `sequence` stops at `|` or `)`
 *   because `symbol` never matches them unescaped.  Nested parens, e.g. `(>|(b|c|d))`, are just
 *   `choices` matching again inside a `sequence`.
 * - Consolidates runs of plain `Keyword` / `Symbol` choices into a single `Keyword` / `Symbol` with an array
 *   literal, e.g. `(a|b|c)` compiles to one `P.Keyword({ literal: ["a", "b", "c"] })`, not a `P.Choice`.
 * - If exactly one choice remains after consolidation, returns that rule directly instead of wrapping it in
 *   a `P.Choice` -- NOTE: in that case the choice's own flags "beat" the rule's flags if they conflict.
 */
class choices extends P.Sequence<"matchGroup?|choices|repeatFlag?"> {
  compile(match: P.MatchFor<this>) {
    let choices: P.Rule[] = match.groups.choices.items.map((item) => RulexParser.compileMatchOrDie(item))

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

    return rulex.applyFlags(rule, match)
  }
}
rulex.addRule(choices, {
  alias: "rule",
  rules: [
    new P.Symbol("("),
    matchGroup,
    new P.Repeat({ matchGroup: "choices", rule: new P.Subrule("sequence"), delimiter: new P.Symbol("|") }),
    new P.Symbol(")"),
    repeatFlag
  ],
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
        ["(arg:{sub})", new P.Subrule({ rule: "sub", matchGroup: "arg" })],
        ["({arg:sub})", new P.Subrule({ rule: "sub", matchGroup: "arg" })],
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
        ["(\\||a)", new P.Choice({ rules: [new P.Symbol({ literal: "|", isEscaped: true }), new P.Keyword("a")] })],

        ["(arg:>|a)", new P.Choice({ matchGroup: "arg", rules: [new P.Symbol(">"), new P.Keyword("a")] })],

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
})

////////////////
// ## `sequence` rule
//    e.g. "aa bb cc"
////////////////

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
class sequence extends P.Repeat {
  compile(match: P.MatchFor<this>) {
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
}
rulex.addRule(sequence, {
  rule: new P.Subrule("rule"),
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
          new P.Sequence([new P.Keyword("a"), new P.Keyword({ literal: "b", matchGroup: "arg" }), new P.Keyword("c")])
        ],

        [
          "(a|b) c? d (e|f)?",
          new P.Keywords([["a", "b"], { optional: true, literal: "c" }, "d", { optional: true, literal: ["e", "f"] }])
        ]
      ]
    },
    {
      // `RulexTokenizer`:  no comments, quotes or JSX;  numbers are digits only
      title: "plain tokens",
      showAll: true,
      tests: [
        ["# {text}", new P.Sequence(new P.Symbol("#"), new P.Subrule("text"))],
        ["a -- b", new P.Sequence(new P.Keyword("a"), new P.Symbols(["-", "-"]), new P.Keyword("b"))],
        ["---", new P.Symbols(["-", "-", "-"])],
        ["a // b", new P.Sequence(new P.Keyword("a"), new P.Symbols(["/", "/"]), new P.Keyword("b"))],
        ["'{x}'", new P.Sequence(new P.Symbol("'"), new P.Subrule("x"), new P.Symbol("'"))],
        [
          "<b> {x}",
          new P.Sequence(new P.Symbol("<"), new P.Keyword("b"), new P.Symbol(">"), new P.Subrule("x"))
        ],
        ["1.1", new P.Sequence(new P.Keyword({ literal: 1 as unknown as string }), new P.Symbol("."), new P.Keyword({ literal: 1 as unknown as string }))],
        ["-1", new P.Sequence(new P.Symbol("-"), new P.Keyword({ literal: 1 as unknown as string }))],
        ["¬", new P.Symbol("¬")]
      ]
    }
  ]
})
