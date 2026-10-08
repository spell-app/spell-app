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
import { RulexParser, type RulexInterval } from "./RulexParser"

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

////////////////
// ## `interval` rule
//    e.g. "{1,6}"
////////////////

/**
 * Optional trailing count, as regex's interval:  `{n}` exactly, `{n,m}` n to m, `{n,}` n or more.
 * - Adorns the same rules `repeatFlag` does;  `applyFlags()` turns it into a `P.Repeat`'s `minCount` / `maxCount`.
 * - Unambiguous with a `{subrule}`:  a rule name starts with a letter, a count with a digit.
 * - Compiles to `{ min, max }` (`max` undefined for `{n,}`);  throws for `max < min` or `{0}`.
 */
class intervalRule extends P.Sequence<"min|comma?|max?"> {
  compile(match: P.MatchFor<this>): RulexInterval {
    const { min, comma, max } = match.groups
    const interval = { min: Number(min.value), max: comma ? (max ? Number(max.value) : undefined) : Number(min.value) }
    if (interval.max === 0 || (interval.max !== undefined && interval.max < interval.min)) {
      throw new P.ParserError({
        message: `rulex count \`${P.Tokenizer.join(match.tokens)}\` matches nothing`,
        context: rulex,
        activity: "compile",
        params: { interval }
      })
    }
    return interval
  }
}
rulex.addRule(intervalRule, {
  name: "interval",
  rules: [
    new P.Symbol("{"),
    new P.TokenType({ tokenType: P.NumberToken, matchGroup: "min" }),
    new P.Symbol({ literal: ",", matchGroup: "comma", optional: true }),
    new P.TokenType({ tokenType: P.NumberToken, matchGroup: "max", optional: true }),
    new P.Symbol("}")
  ],
  optional: true,
  tests: [
    {
      title: "matches interval",
      tests: [
        ["", undefined],
        ["{7}", { min: 7, max: 7 }],
        ["{1,6}", { min: 1, max: 6 }],
        ["{3,}", { min: 3, max: undefined }],
        ["{sub}", undefined]
      ]
    }
  ]
})

////////////////
// ## `caseFlag` rule
//    e.g. "/i"
////////////////

/**
 * Optional `/i` straight after a keyword or a choice, as regex's flag:  match any case.
 * - Touching:  `/` touches the part before, `i` touches `/` -- so `a / i` is still three plain parts.
 * - Compiles to `true`;  `applyCaseFlag()` sets `caseInsensitive` on the literal it adorns.
 */
class caseFlagRule extends P.Sequence {
  compile() {
    return true
  }
}
rulex.addRule(caseFlagRule, {
  name: "caseFlag",
  rules: [new P.Symbol("/"), new P.Keyword({ literal: "i", spacing: "none" })],
  spacing: "none",
  optional: true
})

// `matchGroup` / `repeatFlag` / `interval` / `caseFlag` are registered ABOVE first, so we can pull their registered
// INSTANCES out here -- the rules below put these instances directly inside their own `rules` arrays.
const { matchGroup, repeatFlag, interval, caseFlag } = rulex.rules as Record<
  "matchGroup" | "repeatFlag" | "interval" | "caseFlag",
  P.Rule
>

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
class symbolRule extends P.Sequence<"isEscaped?|literal|repeatFlag?|interval?"> {
  compile(match: P.MatchFor<this>) {
    const { literal, isEscaped } = match.groups
    const rule = new P.Symbol(literal.value)
    if (isEscaped) rule.isEscaped = true
    const flagged = rulex.applyFlags(rule, match)
    // a repeated symbol written touching its flag is a RUN, like `**`:  its copies touch too (`\*+` vs `\* +`)
    if (flagged instanceof P.Repeat && !literal.tokens.at(-1)?.whitespace) flagged.itemSpacing = "none"
    return flagged
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
    repeatFlag,
    interval
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
        // a symbol touching its flag is a run:  its copies touch
        [">+", new P.Repeat({ rule: new P.Symbol({ literal: ">" }), itemSpacing: "none" })],
        [">*", new P.Repeat({ optional: true, rule: new P.Symbol({ literal: ">" }), itemSpacing: "none" })],
        ["> +", new P.Repeat(new P.Symbol({ literal: ">" }))]
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
class keyword extends P.Sequence<"literal|caseFlag?|repeatFlag?|interval?"> {
  compile(match: P.MatchFor<this>) {
    const { literal } = match.groups
    const rule = new P.Keyword(literal.value)
    return rulex.applyFlags(rule, match)
  }
}
rulex.addRule(keyword, {
  alias: "rule",
  rules: [new P.Word({ matchGroup: "literal" }), caseFlag, repeatFlag, interval],
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
class numberRule extends P.Sequence<"number|repeatFlag?|interval?"> {
  compile(match: P.MatchFor<this>) {
    const { number } = match.groups
    const rule = new P.Keyword({ literal: number.value })
    return rulex.applyFlags(rule, match)
  }
}
rulex.addRule(numberRule, {
  name: "number",
  alias: "rule",
  rules: [new P.TokenType({ tokenType: P.NumberToken, matchGroup: "number" }), repeatFlag, interval],
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
class subrule extends P.Sequence<"matchGroup?|rule|caseFlag?|repeatFlag?|interval?"> {
  compile(match: P.MatchFor<this>) {
    const rule = new P.Subrule(String(match.groups.rule.compile()))
    return rulex.applyFlags(rule, match)
  }
}
rulex.addRule(subrule, {
  alias: "rule",
  rules: [
    new P.Symbol("{"),
    matchGroup,
    new P.Word({ matchGroup: "rule" }),
    new P.Symbol("}"),
    caseFlag,
    repeatFlag,
    interval
  ],
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
    const delimiterRule = RulexParser.compileMatchOrDie(delimiter)
    // spacing as written:  `[{item},]` wants the comma touching the item, `[{item} ,]` lets it space
    if (RulexParser.touching(ruleName)) delimiterRule.spacing = "none"
    const rule = new P.Repeat({
      rule: RulexParser.compileMatchOrDie(ruleName),
      delimiter: delimiterRule
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

        // a delimiter written touching the item must touch it
        [
          "[{sub},]",
          new P.Repeat({ rule: new P.Subrule("sub"), delimiter: new P.Symbol({ literal: ",", spacing: "none" }) })
        ],
        ["[{sub} ,]", new P.Repeat({ rule: new P.Subrule("sub"), delimiter: new P.Symbol(",") })],
        [
          "[{sub}or]",
          new P.Repeat({ rule: new P.Subrule("sub"), delimiter: new P.Keyword({ literal: "or", spacing: "none" }) })
        ],

        [
          "[arg:{sub},]",
          new P.Repeat({
            rule: new P.Subrule("sub"),
            delimiter: new P.Symbol({ literal: ",", spacing: "none" }),
            matchGroup: "arg"
          })
        ],

        [
          "[{sub},]?",
          new P.Repeat({
            optional: true,
            rule: new P.Subrule("sub"),
            delimiter: new P.Symbol({ literal: ",", spacing: "none" })
          })
        ]
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
class choices extends P.Sequence<"matchGroup?|choices|caseFlag?|repeatFlag?|interval?"> {
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
    caseFlag,
    repeatFlag,
    interval
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
 * - Spacing as written:  a part with no space before it in the syntax gets `spacing: "none"`, and `{space}` /
 *   `{spaces}` set the next part's -- see `RulexParser.compileSpacedParts()`.
 * - `RulexParser.compile()` throws if any of the syntax is left unread.
 */
class sequence extends P.Repeat {
  compile(match: P.MatchFor<this>) {
    let matched = rulex.compileSpacedParts(match.items)

    // Consolidate keywords and symbols
    matched = rulex.consolidateLiterals(matched, P.Keyword, "literal", P.Keywords)
    matched = rulex.consolidateLiterals(matched, P.Symbol, "literal", P.Symbols)

    const rules: P.Rule[] = []
    for (let start = 0, rule: P.Rule | undefined; (rule = matched[start]); start++) {
      // Consolidate sequences -- the nested one's spacing moves to its first part, which had none
      if (rule instanceof P.Sequence && !rule.isAdorned && !rule.optional) {
        if (rule.spacing && rule.rules[0]) rule.rules[0].spacing = rule.spacing
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
        // written touching => must touch;  written spaced => may space
        [">=", new P.Symbols([">", { literal: "=", spacing: "none" }])],
        ["> =", new P.Symbols([">", "="])],
        [">(=)?", new P.Symbols([">", { optional: true, literal: "=", spacing: "none" }])],
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
        [
          "a -- b",
          new P.Sequence(
            new P.Keyword("a"),
            new P.Symbols(["-", { literal: "-", spacing: "none" }]),
            new P.Keyword("b")
          )
        ],
        ["---", new P.Symbols(["-", { literal: "-", spacing: "none" }, { literal: "-", spacing: "none" }])],
        [
          "a // b",
          new P.Sequence(
            new P.Keyword("a"),
            new P.Symbols(["/", { literal: "/", spacing: "none" }]),
            new P.Keyword("b")
          )
        ],
        [
          "'{x}'",
          new P.Sequence(
            new P.Symbol("'"),
            new P.Subrule({ rule: "x", spacing: "none" }),
            new P.Symbol({ literal: "'", spacing: "none" })
          )
        ],
        [
          "<b> {x}",
          new P.Sequence(
            new P.Symbol("<"),
            new P.Keyword({ literal: "b", spacing: "none" }),
            new P.Symbol({ literal: ">", spacing: "none" }),
            new P.Subrule("x")
          )
        ],
        [
          "1.1",
          new P.Sequence(
            new P.Keyword({ literal: 1 as unknown as string }),
            new P.Symbol({ literal: ".", spacing: "none" }),
            new P.Keyword({ literal: 1 as unknown as string, spacing: "none" })
          )
        ],
        ["-1", new P.Sequence(new P.Symbol("-"), new P.Keyword({ literal: 1 as unknown as string, spacing: "none" }))],
        ["¬", new P.Symbol("¬")]
      ]
    },
    {
      // `/i`, touching:  any case;  never merged into a keyword run, so the flag stays on its own keyword
      title: "case",
      showAll: true,
      tests: [
        ["note/i", new P.Keyword({ literal: "note", caseInsensitive: true })],
        ["(note|tip)/i", new P.Keyword({ literal: ["note", "tip"], caseInsensitive: true })],
        ["(note|tip)/i?", new P.Keyword({ literal: ["note", "tip"], caseInsensitive: true, optional: true })],
        ["a note/i", new P.Sequence(new P.Keyword("a"), new P.Keyword({ literal: "note", caseInsensitive: true }))],
        // spaced:  just a `/` and an `i`
        ["a / i", new P.Sequence(new P.Keyword("a"), new P.Symbol("/"), new P.Keyword("i"))]
      ]
    },
    {
      // counts, as regex's intervals:  a symbol touching its count is a run, as with `+`
      title: "counts",
      showAll: true,
      tests: [
        ["x{7}", new P.Repeat({ rule: new P.Keyword("x"), minCount: 7, maxCount: 7 })],
        ["#{1,6}", new P.Repeat({ rule: new P.Symbol("#"), minCount: 1, maxCount: 6, itemSpacing: "none" })],
        ["- {3,}", new P.Repeat({ rule: new P.Symbol("-"), minCount: 3 })],
        ["{a}{0,2}", new P.Repeat({ rule: new P.Subrule("a"), minCount: 0, maxCount: 2, optional: true })],
        ["(a|b){2,3}", new P.Repeat({ rule: new P.Keyword(["a", "b"]), minCount: 2, maxCount: 3 })]
      ]
    },
    {
      // spacing as written:  touching parts must touch, spaced ones may space;  `{space}` / `{spaces}` say how much
      title: "spacing",
      showAll: true,
      tests: [
        ["{a} {b}", new P.Sequence(new P.Subrule("a"), new P.Subrule("b"))],
        ["{a}{b}", new P.Sequence(new P.Subrule("a"), new P.Subrule({ rule: "b", spacing: "none" }))],
        ["{a}{space}{b}", new P.Sequence(new P.Subrule("a"), new P.Subrule({ rule: "b", spacing: "one" }))],
        // `{spaces}` owns its boundary, however the syntax spaces around it
        ["{a} {spaces} {b}", new P.Sequence(new P.Subrule("a"), new P.Subrule({ rule: "b", spacing: "some" }))],
        ["-{spaces}{text}", new P.Sequence(new P.Symbol("-"), new P.Subrule({ rule: "text", spacing: "some" }))],
        [
          "!\\[{alt}\\]",
          new P.Sequence(
            new P.Symbols(["!", { literal: "[", spacing: "none" }]),
            new P.Subrule({ rule: "alt", spacing: "none" }),
            new P.Symbol({ literal: "]", spacing: "none", isEscaped: true })
          )
        ]
      ]
    }
  ]
})
