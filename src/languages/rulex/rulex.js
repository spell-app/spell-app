//
//  # Core `rules` -- simple datatypes, etc.
//
// NOTE: many of the below are created as custom Pattern subclasses for debugging.
//
import {
  Parser,
  proto,
  Rule,
  TestLocation,
  Token,
  Tokenizer,
  WhitespacePolicy
} from "./all.js";

const { ANYWHERE, AT_START } = TestLocation;

export class RulexParser extends Parser {
  @proto module = "rulex";
  @proto defaultRule = "statement";
  // Remove "normal" whitespace (leaving newlines and indents) when parsing
  @proto tokenizer = new Tokenizer({
    whitespacePolicy: WhitespacePolicy.LEADING_ONLY
  });
}

// Create core `rulex` rulex.
export const rulex = new RulexParser();

// Construct a rule from results of running a Combo rule below.
//  - `ruleProps` is just the props for `new constructor()`
//  - `results` is all of the results
rulex.applyFlags = function applyFlags(rule, flags) {
  // handle repeat, which may nest the rule in a repeat
  if (flags.repeatFlag === "?")
    rule.optional = true;
  else if (flags.repeatFlag === "+")
    rule = new Rule.Repeat({ rule });
  else if (flags.repeatFlag === "*")
    rule = new Rule.Repeat({ rule, optional: true });

  if (flags.argument) rule.argument = flags.argument;
  if (flags.testLocation) rule.testLocation = flags.testLocation;

  return rule;
}

// Consolidate runs of literals in `rules` of type `constructor` together.
rulex.consolidateLiterals = function(rules, constructor, literalKey, groupConstructor = constructor) {
  if (rules.length === 1) return rules;

  const results = [];
  for (let start = 0, rule; rule = rules[start]; start++) {
    if (rule instanceof constructor && !rule.isAdorned) {
      // find the end of the run
      let end = start;
      for (let next; next = rules[end+1]; end++) {
        if (!(next instanceof constructor && !next.isAdorned)) break;
      }
      if (end > start) {
        // combine literals into a single map
        const literals = rules.slice(start, end + 1)
          .map(rule => {
            const literal = rule[literalKey];
            if (!rule.optional) return literal;

            // make sure optionals are arrays and add the optional flag to the array
            return rulex.makeOptionalArray(literal);
          });
        rule = new groupConstructor(literals);
        start = end;
      }
    }
    results.push(rule);
  }
  return results;
}

// Given a value as an array or a single value, turn it into an `optional` array.
rulex.makeOptionalArray = function(value) {
  const array = Array.isArray(value) ? value.concat() : [value];
  array.optional = true;
  return array;
}



//
//  Rules for flags in rulex syntax
//

// A test location signifier, which is always optional:
//  `…` = test anywhere in the stream (option-semicolon on mac)
//  `^` = test at start only.
rulex.defineRule({
  constructor: Rule.Literal,
  name: "testLocation",
  literal: ["…", "^"],
  optional: true,
  compile(scope, match) {
    return (match.matched[0].value === "…")
      ? ANYWHERE
      : AT_START;
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
})
const testLocation = rulex.rules.testLocation;



// A argument signifier, which is always optional.
rulex.defineRule({
  constructor: Rule.Sequence,
  name: "argument",
  rules: [
    new Rule.Word({ argument: "argument" }),
    new Rule.Literal(":")
  ],
  optional: true,
  compile(scope, match) {
    return match.results.argument;
  },
  tests: [
    {
      title: "matches argument",
      tests: [
        ["", undefined],
        ["arg:", "arg"],
      ]
    }
  ]
})
const argument = rulex.rules.argument;


// A repeat signifier, which is always optional.
rulex.defineRule({
  constructor: Rule.Literal,
  name: "repeatFlag",
  literal: ["?", "*", "+"],
  optional: true,
  compile(scope, match) {
    return match.matched[0].value;
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
})
const repeatFlag = rulex.rules.repeatFlag;





//
//  Combo rules
//



// A single symbol, or `\<symbol>` so we can escape special symbols like "?" and "*".
rulex.defineRule({
  constructor: Rule.Sequence,
  name: "symbol",
  alias: "rule",
  rules: [
    testLocation,
    new Rule.Pattern({ argument: "isEscaped", pattern: /^\\$/, optional: true }),
    new Rule.TokenType({ tokenType: Token.Symbol, argument: "literal" }),
    repeatFlag
  ],

  compile(scope, { results }) {
    const rule = new Rule.Symbol(results.literal);
    if (results.isEscaped) rule.isEscaped = true;
    return rulex.applyFlags(rule, results);
  },
  tests: [
    {
      title: "matches symbol",
      tests: [
        ["", undefined],
        // can't match flags by themselves
        ["…", undefined],
        ["^", undefined],

        [":", new Rule.Symbol({ literal:  ":"  })],

        // matches special chars by themselves if not escaped
        ["(", new Rule.Symbol({ literal:  "("  })],
        ["[", new Rule.Symbol({ literal:  "["  })],
        ["?", new Rule.Symbol({ literal:  "?"  })],
        ["*", new Rule.Symbol({ literal:  "*"  })],
        ["+", new Rule.Symbol({ literal:  "+"  })],

        // only match the first one
        ["::", new Rule.Symbol({ literal:  ":"  })],

        // escaped
        ["\\:", new Rule.Symbol({ literal:  ":" , isEscaped: true })],
        ["\\?", new Rule.Symbol({ literal:  "?" , isEscaped: true })],
        ["\\(", new Rule.Symbol({ literal:  "(" , isEscaped: true })],
        ["\\[", new Rule.Symbol({ literal:  "[" , isEscaped: true })],

        // testLocation
        ["…:", new Rule.Symbol({ literal:  ":" , testLocation: ANYWHERE })],
        ["^:", new Rule.Symbol({ literal:  ":" , testLocation: AT_START })],
        ["…\\:", new Rule.Symbol({ literal:  ":" , isEscaped: true, testLocation: ANYWHERE })],

        // repeat
        [">?", new Rule.Symbol({ literal:  ">" , optional: true })],
        [">+", new Rule.Repeat(new Rule.Symbol({ literal:  ">" }))],
        [">*", new Rule.Repeat({ optional: true, rule: new Rule.Symbol({ literal:  ">" })})],

        ["…>?", new Rule.Symbol({ testLocation: ANYWHERE, literal:  ">" , optional: true })],
        ["^>*", new Rule.Repeat({ testLocation: AT_START, optional: true, rule: new Rule.Symbol({ literal:  ">" })})],
      ]
    }
  ]
})

// Match  keywords with an optional repeat signifier at the end.
rulex.defineRule({
  constructor: Rule.Sequence,
  name: "keyword",
  alias: "rule",
  rules: [
    testLocation,
    new Rule.Word({ argument: "literal" }),
    repeatFlag
  ],
  compile(scope, { results }) {
    const rule = new Rule.Keyword(results.literal);
    return rulex.applyFlags(rule, results);
  },
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

// Match a SPECIFIC number.
// Note that we create a `Keyword` rule for this, so it can be combined with alpha-numeric keywords.
rulex.defineRule({
  constructor: Rule.Sequence,
  name: "number",
  alias: "rule",
  rules: [
    testLocation,
    new Rule.TokenType({ tokenType: Token.Number, argument: "number" }),
    repeatFlag
  ],
  compile(scope, { results }) {
    const rule = new Rule.Keyword({ literal: results.number });
    return rulex.applyFlags(rule, results);
  },
  tests: [
    {
      title: "matches single keyword",
      tests: [
        ["1", new Rule.Keyword({ literal:  1  })],

        ["…1", new Rule.Keyword({ literal:  1 , testLocation: ANYWHERE })],
        ["^1", new Rule.Keyword({ literal:  1 , testLocation: AT_START })],

        ["1?", new Rule.Keyword({ literal:  1 , optional: true })],
        ["1+", new Rule.Repeat({ rule: new Rule.Keyword({ literal:  1  }) })],
        ["1*", new Rule.Repeat({ optional: true, rule: new Rule.Keyword({ literal:  1  }) })],

      ]
    }
  ]
})

// Subrule
rulex.defineRule({
  constructor: Rule.Sequence,
  name: "subrule",
  alias: "rule",
  rules: [
    testLocation,
    new Rule.Symbol("{"),
    testLocation,
    argument,
    new Rule.Word({ argument: "rule" }),
    new Rule.Symbol("}"),
    repeatFlag
  ],
  compile(scope, { results }) {
    const rule = new Rule.Subrule(results.rule);
    return rulex.applyFlags(rule, results);
  },
  tests: [
    {
      title: "matches subrule",
      compileAs: "rule",
      tests: [
        ["", undefined],
        ["{}", new Rule.Symbol("{")],

        ["{sub}", new Rule.Subrule({ rule: "sub" }) ],

        ["…{sub}", new Rule.Subrule({ rule: "sub", testLocation: ANYWHERE }) ],
        ["{…sub}", new Rule.Subrule({ rule: "sub", testLocation: ANYWHERE }) ],
        ["{arg:sub}", new Rule.Subrule({ rule: "sub", argument: "arg" }) ],

        ["{sub}?", new Rule.Subrule({ rule: "sub", optional: true }) ],
        ["{sub}+", new Rule.Repeat({ rule: new Rule.Subrule({ rule: "sub" }) }) ],
        ["{sub}*", new Rule.Repeat({ optional: true, rule: new Rule.Subrule({ rule: "sub" }) }) ],
      ]
    }
  ]
})


rulex.defineRule({
  constructor: Rule.Sequence,
  name: "list",
  alias: "rule",
  rules: [
    new Rule.Symbol("["),
    argument,
    new Rule.Subrule({ argument: "rule", rule: "rule" }),
    new Rule.Subrule({ argument: "delimiter", rule: "rule" }),
    new Rule.Symbol("]"),
    new Rule.Symbol({ argument: "repeatFlag", literal: "?", optional: true })
  ],
  compile(scope, { results }) {
    const rule = new Rule.Repeat({ rule: results.rule, delimiter: results.delimiter });
    return rulex.applyFlags(rule, results);
  },
  tests: [
    {
      title: "matches list",
      compileAs: "rule",
      tests: [
        ["", undefined],
        ["[]", new Rule.Symbol("[")],         // TODO: error for this?
        ["[{sub}]", new Rule.Symbol("[")],    // TODO: error for this?

        ["[{sub},]", new Rule.Repeat({ rule: new Rule.Subrule("sub"), delimiter: new Rule.Symbol(",") }) ],
        ["[{sub}or]", new Rule.Repeat({ rule: new Rule.Subrule("sub"), delimiter: new Rule.Keyword("or") }) ],

        ["[arg:{sub},]", new Rule.Repeat({ rule: new Rule.Subrule("sub"), delimiter: new Rule.Symbol(","), argument: "arg" }) ],

        ["[{sub},]?", new Rule.Repeat({ optional: true, rule: new Rule.Subrule("sub"), delimiter: new Rule.Symbol(",") }) ],
      ]
    }
  ]
})


rulex.defineRule({
  constructor: Rule.Sequence,
  name: "choices",
  alias: "rule",
  rules: [
    testLocation,
    new Rule.NestedSplit({
      argument: "split",
      start: new Rule.Symbol("("),
      end: new Rule.Symbol(")"),
      delimiter: new Rule.Symbol("|"),
      prefix: new Rule.Sequence({ rules: [ argument ], optional: true }),
      rule: new Rule.Subrule({ rule: "statement", argument: "choices" }),
    }),
    repeatFlag
  ],
  compile(scope, match) {
    // combine main results from nested split
    const results = { ...match.results, ...match.results.split };
    let { choices } = results;
    let rule;

    // Combine single keyword, keywords, symbol, symbols
    choices = rulex.consolidateLiterals(choices, Rule.Keyword, "literal");
    choices = rulex.consolidateLiterals(choices, Rule.Symbol, "literal");

    // If we got exactly one choice, use that.
    // Note that the choice's flags will "beat" the rule's flags if they conflict.
    if (choices.length === 1) {
      rule = choices[0];
    }
    else {
      rule = new Rule.Choice({ rules: choices });
    }
    return rulex.applyFlags(rule, results);
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
        ["([{sub},])", new Rule.Repeat({ rule: new Rule.Subrule("sub"), delimiter: new Rule.Symbol(",") }) ],

        // Pass flags whether they were set on the choices or the single rule (a bit confusing)
        ["(…{sub})", new Rule.Subrule({ rule: "sub", testLocation: ANYWHERE })],
        ["(arg:{sub})", new Rule.Subrule({ rule: "sub", argument: "arg" })],
        ["({arg:sub})", new Rule.Subrule({ rule: "sub", argument: "arg" })],
        ["({sub}?)", new Rule.Subrule({ rule: "sub", optional: true })],
        ["({sub})?", new Rule.Subrule({ rule: "sub", optional: true })],
        ["({sub}+)", new Rule.Repeat({ rule: new Rule.Subrule({ rule: "sub" }) })],
        ["({sub}*)", new Rule.Repeat({ optional: true, rule: new Rule.Subrule({ rule: "sub" }) })],

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

        ["…(>|a)", new Rule.Choice({ testLocation: ANYWHERE, rules:[ new Rule.Symbol(">"), new Rule.Keyword("a") ] })],

        ["(arg:>|a)", new Rule.Choice({ argument: "arg", rules:[ new Rule.Symbol(">"), new Rule.Keyword("a") ] })],

        ["(>|a)?", new Rule.Choice({ optional: true, rules:[ new Rule.Symbol(">"), new Rule.Keyword("a") ] })],
        ["(>|a)*", new Rule.Repeat({ optional: true, rule: new Rule.Choice({ rules:[ new Rule.Symbol(">"), new Rule.Keyword("a") ] }) })],
        ["(>|a)+", new Rule.Repeat({ rule: new Rule.Choice({ rules:[ new Rule.Symbol(">"), new Rule.Keyword("a") ] }) })],
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


// Sequence as a statement -- our top-level rule.
// NO test rule, otherwise we can't start a statement with a special character.
// Match a long list of rules.
// TODO: `consume all tokens`...
rulex.defineRule({
  constructor: Rule.Repeat,
  name: "statement",
  rule: new Rule.Subrule("rule"),
  compile(scope, match) {
    let matched = match.matched.map(match => match.compile());

    // Consolidate keywords and symbols
    matched = rulex.consolidateLiterals(matched, Rule.Keyword, "literal", Rule.Keywords);
    matched = rulex.consolidateLiterals(matched, Rule.Symbol, "literal", Rule.Symbols);

    let rules = [];
    for (let start = 0, rule; rule = matched[start]; start++) {
      // Consolidate sequences
      if (rule instanceof Rule.Sequence && (!rule.isAdorned && !rule.optional)) {
        rules.push(...rule.rules);
        continue;
      }
      rules.push(rule);
    }

    // If we're down to just one rule, just return that.
    if (rules.length === 1) return rules[0];

    return new Rule.Sequence(rules);
  },
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
        ["aa? {bb} cc",
          new Rule.Sequence(
            new Rule.Keyword({ literal: "aa", optional: true }),
            new Rule.Subrule({ rule: "bb" }),
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
        [">(=)?", new Rule.Symbols([">", rulex.makeOptionalArray("=")])],
        ["(>|<) (=)?", new Rule.Symbols([[">","<"], rulex.makeOptionalArray("=")])],

        ["a b c", new Rule.Keywords(["a", "b", "c"])],
        ["a? b c", new Rule.Keywords([ rulex.makeOptionalArray("a"), "b", "c" ])],
        ["a b? c", new Rule.Keywords([ "a", rulex.makeOptionalArray("b"), "c" ])],
        ["a b c?", new Rule.Keywords([ "a", "b", rulex.makeOptionalArray("c") ])],

        ["a (arg:b) c", new Rule.Sequence([
                        new Rule.Keyword("a"),
                        new Rule.Keyword({ literal: "b", argument:"arg" }),
                        new Rule.Keyword("c")
                      ]),
        ],

        ["(a|b) c? d (e|f)?", new Rule.Keywords([ ["a","b"], rulex.makeOptionalArray("c"), "d", rulex.makeOptionalArray(["e", "f"]) ])],
      ]
    }
  ]
});
