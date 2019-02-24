//
//  # Core `rules` -- simple datatypes, etc.
//
// NOTE: many of the below are created as custom Pattern subclasses for debugging.
//
import Parser from "../../parser/Parser";
import Match from "../../parser/Match";
import Rule from "../../parser/Rule";
import Token from "../../parser/Token";
import Tokenizer from "../../parser/Tokenizer";

import { proto } from "../../utils/decorators";

const { ANYWHERE, AT_START } = Rule.TestLocation;

export class RulexParser extends Parser {
  @proto module = "rulex";
  @proto defaultRule = "statement";
  @proto removeWhitespacePolicy = Tokenizer.WhitespacePolicy.INLINE;

  static applyFlags(rule) {
    const { repeatFlag } = rule;
    if (repeatFlag) {
      delete rule.repeatFlag;
      if (repeatFlag === "?") rule.optional = true;
      else if (repeatFlag === "+") return new Rule.Repeat({ rule });
      else if (repeatFlag === "*") return new Rule.Repeat({ rule, optional: true });
    }
    return rule;
  }
}

// Create core `rulex` rulex.
const rulex = new RulexParser();
export default rulex;

// Top level entity
rulex.defineRule(
  class rulex_statement extends Rule.Repeat {
    name = "statement";
    repeat = new Rule.Subrule("rule");
    compile(match) {
      const rules = match.matched.map(match => match.compile());
      return rules;
    }
  }
);


// A test location signifier, which is always optional.
const testLocation = rulex.defineRule({
  name: "testLocation",
  literal: ["…", "^"],
  optional: true,
  constructor: class rulex_testLocation extends Rule.Literal {
    compile(match) {
      return (match.matched[0].value === "…")
        ? ANYWHERE
        : AT_START;
    }
  },
  tests: [
    {
      title: "matches testLocation",
      tests: [
        ["", undefined],
        ["…", ANYWHERE],
        ["^", AT_START],
      ]
    }
  ]
})[0]


// A promote flag, which is always optional
const promote = rulex.defineRule({
  name: "promote",
  literals: ["?", ":"],
  optional: true,
  constructor: class rulex_promote extends Rule.Symbols {
    compile(match) {
      return true;
    }
  },
  tests: [
    {
      title: "matches promote",
      tests: [
        ["", undefined ],
        ["?:", true],
        ["arg:", undefined],
      ]
    }
  ]
})[0]

// A argument signifier, which is always optional.
const argument = rulex.defineRule({
  name: "argument",
  rules: [
    new Rule.Word({ argument: "argument" }),
    new Rule.Literal(":")
  ],
  optional: true,
  constructor: class rulex_argument extends Rule.Sequence {
    compile(match) {
      return match.results.argument;
    }
  },
  tests: [
    {
      title: "matches argument",
      tests: [
        ["", undefined],
        ["arg:", "arg"],
        ["?:", undefined ],
      ]
    }
  ]
})[0]


// A repeat signifier, which is always optional.
const repeatFlag = rulex.defineRule({
  name: "repeatFlag",
  literal: ["?", "*", "+"],
  optional: true,
  constructor: class rulex_repeatFlag extends Rule.Literal {
    compile(match) {
      return match.matched[0].value;
    }
  },
  tests: [
    {
      title: "matches repeatFlag",
      tests: [
        ["", undefined],
        ["?", "?"],
        ["*", "*"],
        ["+", "+"],
      ]
    }
  ]
})[0]





//
//  Combo rules
//

// A single symbol, or `\<symbol>` so we can escape special symbols like "?" and "*".
// Symbols are combined in `Sequence` if possible.
// NOTE: you can't have a repeat flag at the end, if you want this,
//       wrap the symbol in parens, e.g. `(:)?`
rulex.defineRule({
  name: "symbol",
  rules: [
    testLocation,
    new Rule.Pattern({ argument: "escaped", pattern: /^\\$/, optional: true, compile(){ return true } }),
    new Rule.TokenType({ tokenType: Token.Symbol, argument: "literal" })
  ],
  constructor: class rulex_symbol extends Rule.Sequence {
    compile(match) {
      const rule = new Rule.Symbol(match.results);
      return RulexParser.applyFlags(rule);
    }
  },
  alias: "rule",
  tests: [
    {
      title: "matches symbol",
      tests: [
        ["", undefined],
        [":", new Rule.Symbol({ literal:  ":"  })],
        ["::", new Rule.Symbol({ literal:  ":"  })],

        ["…:", new Rule.Symbol({ literal:  ":" , testLocation: ANYWHERE })],
        ["^:", new Rule.Symbol({ literal:  ":" , testLocation: AT_START })],

        ["\\:", new Rule.Symbol({ literal:  ":" , escaped: true })],
        ["\\?", new Rule.Symbol({ literal:  "?" , escaped: true })]

      ]
    }
  ]
})

// Match  keywords with an optional repeat signifier at the end.
rulex.defineRule({
  name: "keyword",
  rules: [
    testLocation,
    new Rule.Word({ argument: "literal" }),
    repeatFlag
  ],
  constructor: class rulex_keyword extends Rule.Sequence {
    compile(match) {
      const rule = new Rule.Keyword(match.results);
      return RulexParser.applyFlags(rule);
    }
  },
  alias: "rule",
  tests: [
    {
      title: "matches single keyword",
      tests: [
        ["", undefined],
        ["11", undefined],
        [":", undefined],

        ["word", new Rule.Keyword({ literal:  "word"  })],

        ["…word", new Rule.Keyword({ literal:  "word" , testLocation: ANYWHERE })],
        ["^word", new Rule.Keyword({ literal:  "word" , testLocation: AT_START })],

        ["word?", new Rule.Keyword({ literal:  "word" , optional: true })],
        ["word+", new Rule.Repeat({ rule: new Rule.Keyword({ literal:  "word"  }) })],
        ["word*", new Rule.Repeat({ optional: true, rule: new Rule.Keyword({ literal:  "word"  }) })],

      ]
    }
  ]
})

// Subrule
rulex.defineRule({
  name: "subrule",
  rules: [
    testLocation,
    new Rule.Nested({
      start: new Rule.Symbol("{"),
      end: new Rule.Symbol("}"),
      rule: new Rule.Sequence({
        argument: "rule",
        rules: [
          promote,
          argument,
          new Rule.Word({ argument: "subrule" }),
        ],
        compile(match) {
          return new Rule.Subrule(match.results);
        }
      })
    }),
    repeatFlag
  ],
  alias: "rule",
  constructor: class rulex_subrule extends Rule.Sequence {
    compile(match) {
      const { rule, ...results } = match.results;
      Object.assign(rule, results);
      return RulexParser.applyFlags(rule);
    }
  },
  tests: [
    {
      title: "matches subrule",
      compileAs: "rule",
      tests: [
        ["", undefined],
        ["{}", new Rule.Symbol("{")],

        ["{sub}", new Rule.Subrule({ subrule: "sub" }) ],
        ["{?:sub}", new Rule.Subrule({ subrule: "sub", promote: true }) ],
        ["{arg:sub}", new Rule.Subrule({ subrule: "sub", argument: "arg" }) ],
        ["{?:arg:sub}", new Rule.Subrule({ subrule: "sub", promote: true, argument: "arg" }) ],

        ["{sub}?", new Rule.Subrule({ subrule: "sub", optional: true }) ],
        ["{sub}+", new Rule.Repeat({ rule: new Rule.Subrule({ subrule: "sub" }) }) ],
        ["{sub}*", new Rule.Repeat({ optional: true, rule: new Rule.Subrule({ subrule: "sub" }) }) ],
      ]
    }
  ]
})


rulex.defineRule({
  name: "list",
  alias: "rule",
  rules: [
    testLocation,
    new Rule.Nested({
      start: new Rule.Symbol("["),
      end: new Rule.Symbol("]"),
      rule: new Rule.Sequence({
        argument: "rule",
        rules: [
          promote,
          argument,
          new Rule.Subrule({ argument: "item", subrule: "rule" }),
          new Rule.Subrule({ argument: "delimiter", subrule: "rule" }),
        ],
        compile(match) {
          return new Rule.List(match.results);
        }
      })
    }),
    repeatFlag
  ],
  constructor: class rulex_list extends Rule.Sequence {
    compile(match) {
      const { rule, ...results } = match.results;
      Object.assign(rule, results);
      return RulexParser.applyFlags(rule);
    }
  },
  tests: [
    {
      title: "matches list",
      compileAs: "rule",
      tests: [
        ["", undefined],
        ["[]", new Rule.Symbol("[")],         // TODO: error for this?
        ["[{sub}]", new Rule.Symbol("[")],    // TODO: error for this?

        ["[{sub},]", new Rule.List({ item: new Rule.Subrule("sub"), delimiter: new Rule.Symbol(",") }) ],
        ["[{sub}or]", new Rule.List({ item: new Rule.Subrule("sub"), delimiter: new Rule.Keyword("or") }) ],

        ["…[{sub},]", new Rule.List({ item: new Rule.Subrule("sub"), delimiter: new Rule.Symbol(","), testLocation: ANYWHERE }) ],
        ["^[{sub},]", new Rule.List({ item: new Rule.Subrule("sub"), delimiter: new Rule.Symbol(","), testLocation: AT_START }) ],

        ["[?:{sub},]", new Rule.List({ item: new Rule.Subrule("sub"), delimiter: new Rule.Symbol(","), promote: true }) ],
        ["[arg:{sub},]", new Rule.List({ item: new Rule.Subrule("sub"), delimiter: new Rule.Symbol(","), argument: "arg" }) ],
        ["[?:arg:{sub},]", new Rule.List({ item: new Rule.Subrule("sub"), delimiter: new Rule.Symbol(","), promote: true, argument: "arg" }) ],

        ["[{sub},]?", new Rule.List({ item: new Rule.Subrule("sub"), delimiter: new Rule.Symbol(","), optional: true }) ],
        ["[{sub},]+", new Rule.Repeat({ rule: new Rule.List({ item: new Rule.Subrule("sub"), delimiter: new Rule.Symbol(",") }) }) ],
        ["[{sub},]*", new Rule.Repeat({ optional: true, rule: new Rule.List({ item: new Rule.Subrule("sub"), delimiter: new Rule.Symbol(",") }) }) ],
      ]
    }
  ]
})



rulex.defineRule({
  name: "choices",
  alias: "rule",
  rules: [
    testLocation,
    new Rule.NestedSplit({
      argument: "rule",
      start: new Rule.Symbol("("),
      end: new Rule.Symbol(")"),
      delimiter: new Rule.Symbol("|"),
      prefix: new Rule.Sequence({ rules: [ promote, argument ], optional: true }),
      rule: new Rule.Subrule({ subrule: "rule", argument: "rules" }),
      compile(match) {
        // If we got exactly one choice, copy the flags onto it and return that.
        // Note that the choice flags will "beat" the rule flags.
        if (match.results.rules.length === 1) {
          const { rules, ...results } = match.results;
          Object.assign(rules[0], results);
          return RulexParser.applyFlags(rules[0]);
        }
        return new Rule.Choice(match.results);
      }
    }),
    repeatFlag
  ],
  constructor: class rulex_choices extends Rule.Sequence {
    compile(match) {
      const { rule, ...results } = match.results;
      Object.assign(rule, results);
      return RulexParser.applyFlags(rule);
    }
  },
  tests: [
    {
      title: "single rule in a choice block",
      compileAs: "rule",
      skip: true,
      tests: [
        ["", undefined],
        ["()", new Rule.Symbol("(")],

        // If only one rule matched, return that rule
        ["(>)", new Rule.Symbol(">")],
        ["(word)", new Rule.Keyword("word")],
        ["({sub})", new Rule.Subrule("sub")],
        ["([{sub},])", new Rule.List({ item: new Rule.Subrule("sub"), delimiter: new Rule.Symbol(",") }) ],

        // Pass flags whether they were set on the choices or the single rule (a bit confusing)
        ["(?:{sub})", new Rule.Subrule({ subrule: "sub", promote: true })],
        ["({?:sub})", new Rule.Subrule({ subrule: "sub", promote: true })],
        ["(arg:{sub})", new Rule.Subrule({ subrule: "sub", argument: "arg" })],
        ["({arg:sub})", new Rule.Subrule({ subrule: "sub", argument: "arg" })],
        ["({sub}?)", new Rule.Subrule({ subrule: "sub", optional: true })],
        ["({sub})?", new Rule.Subrule({ subrule: "sub", optional: true })],
        ["({sub}+)", new Rule.Repeat({ rule: new Rule.Subrule({ subrule: "sub" }) })],
        ["({sub}*)", new Rule.Repeat({ optional: true, rule: new Rule.Subrule({ subrule: "sub" }) })],
      ]
    },
    {
      title: "multiple choices",
      compileAs: "rule",
      tests: [
        ["(>|a)", new Rule.Choice({ rules:[ new Rule.Symbol(">"), new Rule.Keyword("a") ] })],
        ["(?:>|a)", new Rule.Choice({ promote: true, rules:[ new Rule.Symbol(">"), new Rule.Keyword("a") ] })],

        ["…(>|a)", new Rule.Choice({ testLocation: ANYWHERE, rules:[ new Rule.Symbol(">"), new Rule.Keyword("a") ] })],
        ["^(?:>|a)", new Rule.Choice({ testLocation: AT_START, promote: true, rules:[ new Rule.Symbol(">"), new Rule.Keyword("a") ] })],

        ["(arg:>|a)", new Rule.Choice({ argument: "arg", rules:[ new Rule.Symbol(">"), new Rule.Keyword("a") ] })],
        ["(?:arg:>|a)", new Rule.Choice({ promote: true, argument: "arg", rules:[ new Rule.Symbol(">"), new Rule.Keyword("a") ] })],

        ["(arg:>|a)?", new Rule.Choice({ optional: true, argument: "arg", rules:[ new Rule.Symbol(">"), new Rule.Keyword("a") ] })],
        ["(arg:>|a)*", new Rule.Repeat({ optional: true, rule: new Rule.Choice({ argument: "arg", rules:[ new Rule.Symbol(">"), new Rule.Keyword("a") ] }) })],
        ["(arg:>|a)+", new Rule.Repeat({ rule: new Rule.Choice({ argument: "arg", rules:[ new Rule.Symbol(">"), new Rule.Keyword("a") ] }) })],
      ]
    }
  ]
})




rulex.defineRule({
  name: "sequence",
  alias: "rule",
  testRule: new Rule.Pattern(/^[^…\^\(\{\[]$/),
  minCount: 2,
  repeat: new Rule.Subrule({ subrule: "rule", excludes: "sequence" }),
  constructor: class rulex_sequence extends Rule.Repeat {
    compile(match) {
      const matched = match.matched.map(match => match.compile());
      let rules = [];
      for (let start = 0, rule; rule = matched[start]; start++) {
        // ignore anything that's not a Literal or literals that are "adorned"
        if (rule instanceof Rule.Literal && !rule.isAdorned) {
          let end = start;
          // figure out how long the run of the same type is
          for (let next; next = matched[end + 1]; end++) {
            if (!(next instanceof rule.constructor) || next.isAdorned) break;
          }
          if (end > start) {
            const literals = matched.slice(start, end + 1).map(rule => rule.literal);
            rule = rule instanceof Rule.Keyword
              ? new Rule.Keywords({ literals })
              : new Rule.Symbols({ literals });
            start = end;
          }
        }
        rules.push(rule);
      }

      // If we're down to just one rule, just return that.
      if (rules.length === 1) return rules[0];

      return new Rule.Sequence({ rules });
    }
  },
  tests: [
    {
      title: "consolidate multiple keywords and symbols",
      compileAs: "rule",
      showAll: true,
      tests: [
        ["a? {?:sub} bb",
          new Rule.Sequence({ rules: [
            new Rule.Keyword({ literal: "a", optional: true }),
            new Rule.Subrule({ subrule: "sub", promote: true }),
            new Rule.Keyword("bb"),
          ]})
        ],
        ["a? (a|>)",
          new Rule.Sequence({ rules: [
            new Rule.Keyword({ literal: "a", optional: true }),
            new Rule.Choice({ rules:[ new Rule.Keyword("a"), new Rule.Symbol(">") ]})
          ]})
        ],
      ]
    },
    {
      title: "consolidate multiple keywords and symbols",
      compileAs: "rule",
      showAll: true,
      tests: [
        [">=", new Rule.Symbols([">", "="])],
        ["a b c", new Rule.Keywords(["a", "b", "c"])],
        ["a? b c",
          new Rule.Sequence({ rules: [
            new Rule.Keyword({ literal: "a", optional: true }),
            new Rule.Keywords(["b", "c"])
          ]})
        ],
        ["a b? c",
          new Rule.Sequence({ rules: [
            new Rule.Keyword("a"),
            new Rule.Keyword({ literal: "b", optional: true }),
            new Rule.Keyword("c")
          ]})
        ],
        ["a b c?",
          new Rule.Sequence({ rules: [
            new Rule.Keywords(["a", "b"]),
            new Rule.Keyword({ literal: "c", optional: true }),
          ]})
        ],
      ]
    }
  ]
});
