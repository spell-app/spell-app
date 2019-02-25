//
//  # Core `rules` -- simple datatypes, etc.
//
// NOTE: many of the below are created as custom Pattern subclasses for debugging.
//
import {
  Parser,
  proto,
  Rule,
  RulexParser,
  TestLocation,
  Token,
} from "./all.js";

const { ANYWHERE, AT_START } = TestLocation;

// Create core `rulex` rulex.
export const rulex = new RulexParser();

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
    new Rule.Pattern({ argument: "isEscaped", pattern: /^\\$/, optional: true, compile(){ return true } }),
    new Rule.TokenType({ tokenType: Token.Symbol, argument: "literal" })
  ],
  constructor: class rulex_symbol extends Rule.Sequence {
    compile(match) {
      const rule = new Rule.Symbol(match.results);
      return applyFlags(rule);
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

        ["\\:", new Rule.Symbol({ literal:  ":" , isEscaped: true })],
        ["\\?", new Rule.Symbol({ literal:  "?" , isEscaped: true })]

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
      return applyFlags(rule);
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
        ["word+", new Rule.Repeat({ repeat: new Rule.Keyword({ literal:  "word"  }) })],
        ["word*", new Rule.Repeat({ optional: true, repeat: new Rule.Keyword({ literal:  "word"  }) })],

      ]
    }
  ]
})

// Subrule
rulex.defineRule({
  name: "subrule",
  rules: [
    new Rule.Nested({
      start: new Rule.Symbol("{"),
      end: new Rule.Symbol("}"),
      rule: new Rule.Sequence({
        argument: "rule",
        rules: [
          testLocation,
          promote,
          argument,
          new Rule.Word({ argument: "subrule" }),
          new Rule.Symbol({ literal: "!", optional: true }),
          new Rule.Word({ argument: "excludes", optional: true })
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
      return applyFlags(rule);
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
        ["{…sub}", new Rule.Subrule({ subrule: "sub", testLocation: ANYWHERE }) ],
        ["{?:sub}", new Rule.Subrule({ subrule: "sub", promote: true }) ],
        ["{arg:sub}", new Rule.Subrule({ subrule: "sub", argument: "arg" }) ],
        ["{^?:arg:sub}", new Rule.Subrule({ subrule: "sub", promote: true, argument: "arg", testLocation: AT_START }) ],

        ["{sub}?", new Rule.Subrule({ subrule: "sub", optional: true }) ],
        ["{sub}+", new Rule.Repeat({ repeat: new Rule.Subrule({ subrule: "sub" }) }) ],
        ["{sub}*", new Rule.Repeat({ optional: true, repeat: new Rule.Subrule({ subrule: "sub" }) }) ],
      ]
    }
  ]
})


rulex.defineRule({
  name: "list",
  alias: "rule",
  rules: [
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
      return applyFlags(rule);
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

        ["[?:{sub},]", new Rule.List({ item: new Rule.Subrule("sub"), delimiter: new Rule.Symbol(","), promote: true }) ],
        ["[arg:{sub},]", new Rule.List({ item: new Rule.Subrule("sub"), delimiter: new Rule.Symbol(","), argument: "arg" }) ],
        ["[?:arg:{sub},]", new Rule.List({ item: new Rule.Subrule("sub"), delimiter: new Rule.Symbol(","), promote: true, argument: "arg" }) ],

        ["[{sub},]?", new Rule.List({ item: new Rule.Subrule("sub"), delimiter: new Rule.Symbol(","), optional: true }) ],
        ["[{sub},]+", new Rule.Repeat({ repeat: new Rule.List({ item: new Rule.Subrule("sub"), delimiter: new Rule.Symbol(",") }) }) ],
        ["[{sub},]*", new Rule.Repeat({ optional: true, repeat: new Rule.List({ item: new Rule.Subrule("sub"), delimiter: new Rule.Symbol(",") }) }) ],
      ]
    }
  ]
})



rulex.defineRule({
  name: "choices",
  alias: "rule",
  rules: [
    new Rule.NestedSplit({
      argument: "rule",
      start: new Rule.Symbol("("),
      end: new Rule.Symbol(")"),
      delimiter: new Rule.Symbol("|"),
      prefix: new Rule.Sequence({ rules: [ testLocation, promote, argument ], optional: true }),
      rule: new Rule.Subrule({ subrule: "statement", argument: "rules" }),
      compile(match) {
        let { rules } = match.results;
        // If all rules are single keywords, combine
        if (rules.length > 1 && rules.every(rule => rule instanceof Rule.Keyword && !rule.isAdorned)) {
          const literals = rules.map(rule => rule.literal);
          rules = [ new Rule.Keyword(literals) ];
        }

        // If we got exactly one choice, copy the flags onto it and return that.
        // Note that the choice's flags will "beat" the rule's flags.
        if (rules.length === 1 && !(rules[0] instanceof rulex.statement)) {
          delete match.results.rules;
          Object.assign(rules[0], match.results);
          return applyFlags(rules[0]);
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
      return applyFlags(rule);
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
        ["(…{sub})", new Rule.Subrule({ subrule: "sub", testLocation: ANYWHERE })],
        ["(?:{sub})", new Rule.Subrule({ subrule: "sub", promote: true })],
        ["({?:sub})", new Rule.Subrule({ subrule: "sub", promote: true })],
        ["(arg:{sub})", new Rule.Subrule({ subrule: "sub", argument: "arg" })],
        ["({arg:sub})", new Rule.Subrule({ subrule: "sub", argument: "arg" })],
        ["({sub}?)", new Rule.Subrule({ subrule: "sub", optional: true })],
        ["({sub})?", new Rule.Subrule({ subrule: "sub", optional: true })],
        ["({sub}+)", new Rule.Repeat({ repeat: new Rule.Subrule({ subrule: "sub" }) })],
        ["({sub}*)", new Rule.Repeat({ optional: true, repeat: new Rule.Subrule({ subrule: "sub" }) })],

        // consolidate multiple keywords
        ["(a|b|c)?", new Rule.Keyword({ literal:["a","b","c"], optional: true })],
        ["(a|b|c?)",
          new Rule.Choice(
            new Rule.Keyword("a"),
            new Rule.Keyword("b"),
            new Rule.Keyword({ literal: "c", optional: true })
          )],
      ]
    },
    {
      title: "multiple choices",
      compileAs: "rule",
      tests: [
        ["(>|a)", new Rule.Choice(new Rule.Symbol(">"), new Rule.Keyword("a"))],
        ["(?:>|a)", new Rule.Choice({ promote: true, rules:[ new Rule.Symbol(">"), new Rule.Keyword("a") ] })],

        ["(…>|a)", new Rule.Choice({ testLocation: ANYWHERE, rules:[ new Rule.Symbol(">"), new Rule.Keyword("a") ] })],
        ["(^?:>|a)", new Rule.Choice({ testLocation: AT_START, promote: true, rules:[ new Rule.Symbol(">"), new Rule.Keyword("a") ] })],

        ["(arg:>|a)", new Rule.Choice({ argument: "arg", rules:[ new Rule.Symbol(">"), new Rule.Keyword("a") ] })],
        ["(?:arg:>|a)", new Rule.Choice({ promote: true, argument: "arg", rules:[ new Rule.Symbol(">"), new Rule.Keyword("a") ] })],

        ["(arg:>|a)?", new Rule.Choice({ optional: true, argument: "arg", rules:[ new Rule.Symbol(">"), new Rule.Keyword("a") ] })],
        ["(arg:>|a)*", new Rule.Repeat({ optional: true, repeat: new Rule.Choice({ argument: "arg", rules:[ new Rule.Symbol(">"), new Rule.Keyword("a") ] }) })],
        ["(arg:>|a)+", new Rule.Repeat({ repeat: new Rule.Choice({ argument: "arg", rules:[ new Rule.Symbol(">"), new Rule.Keyword("a") ] }) })],
      ]
    },
    {
      title: "nested choices",
      compileAs: "rule",
      tests: [
        ["(>|(b|c|d))", new Rule.Choice(new Rule.Symbol(">"), new Rule.Keyword(["b","c","d"])) ],
        ["(>|({sub}|ab))",
          new Rule.Choice(
            new Rule.Symbol(">"),
            new Rule.Choice(new Rule.Subrule("sub"), new Rule.Keyword("ab"))
          )],
      ]
    }
  ]
})


// Statement constructor -- separate because it's referenced in `choices.compile()`
rulex.statement = class rulex_statement extends Rule.Repeat {
  compile(match) {
//console.group(this);
    const matched = match.matched.map(match => match.compile());
    let rules = [];
    for (let start = 0, rule; rule = matched[start]; start++) {
//console.info(start, match.matched[start], rule);
      // Consolidate sequences
      if (rule instanceof Rule.Sequence && !rule.isAdorned) {
//console.warn("consolidating", rule);
        rules.push(...rule.rules);
        continue;
      }
      // Consolidate runs of literals:
      // Ignore anything that's not a Literal or literals that are "adorned"
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

//console.groupEnd();
    // If we're down to just one rule, just return that.
    if (rules.length === 1) return rules[0];

    return new Rule.Sequence(rules);
  }
}

// Sequence as a statement -- our top-level rule.
// NO test rule, otherwise we can't start a statement with a special character.
// Match a long list of rules.
// TODO: `consume all tokens`...
rulex.defineRule({
  name: "statement",
  repeat: new Rule.Subrule("rule"),
  constructor: rulex.statement,
  tests: [
    {
      title: "sequences",
      showAll: true,
      tests: [
        ["aa bb cc", new Rule.Keywords("aa", "bb", "cc") ],
        ["aa {bb} cc",
          new Rule.Sequence(
            new Rule.Keyword("aa"),
            new Rule.Subrule("bb"),
            new Rule.Keyword("cc"),
          )
        ],
        ["aa? {?:bb} cc",
          new Rule.Sequence(
            new Rule.Keyword({ literal: "aa", optional: true }),
            new Rule.Subrule({ subrule: "bb", promote: true }),
            new Rule.Keyword("cc"),
          )
        ],
        ["aa? (bb|>)",
          new Rule.Sequence(
            new Rule.Keyword({ literal: "aa", optional: true }),
            new Rule.Choice({ rules:[ new Rule.Keyword("bb"), new Rule.Symbol(">") ]})
          )
        ],
      ]
    },
    {
      title: "consolidate multiple keywords and symbols",
      showAll: true,
      tests: [
        [">=", new Rule.Symbols([">", "="])],
        [">(=)?",
          new Rule.Sequence(
            new Rule.Symbol({ literal: ">" }),
            new Rule.Symbol({ literal: "=", optional: true})
          )
        ],

        ["a b c", new Rule.Keywords(["a", "b", "c"])],
        ["a? b c",
          new Rule.Sequence(
            new Rule.Keyword({ literal: "a", optional: true }),
            new Rule.Keywords(["b", "c"])
          )
        ],
        ["a b? c",
          new Rule.Sequence(
            new Rule.Keyword("a"),
            new Rule.Keyword({ literal: "b", optional: true }),
            new Rule.Keyword("c")
          )
        ],
        ["a b c?",
          new Rule.Sequence(
            new Rule.Keywords(["a", "b"]),
            new Rule.Keyword({ literal: "c", optional: true }),
          )
        ],
      ]
    }
  ]
});


//
//  Utility
//
function applyFlags(rule) {
  const { repeatFlag } = rule;
  if (repeatFlag) {
    delete rule.repeatFlag;
    if (repeatFlag === "?") rule.optional = true;
    else if (repeatFlag === "+") return new Rule.Repeat({ repeat: rule });
    else if (repeatFlag === "*") return new Rule.Repeat({ repeat: rule, optional: true });
  }
  return rule;
}
