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
  class statement extends Rule.Repeat {
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
  constructor: class testLocation extends Rule.Literal {
    @proto name = "testLocation";
    @proto literal = ["…", "^"];
    @proto optional = true;
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
  constructor: class promote extends Rule.Symbols {
    @proto name = "promote";
    @proto literals = ["?", ":"];
    @proto optional = true;
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
  constructor: class argument extends Rule.Sequence {
    @proto name = "argument";
    @proto rules = [
      new Rule.Word({ argument: "argument" }),
      new Rule.Literal(":")
    ];
    @proto optional = true;
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
  constructor: class repeatFlag extends Rule.Literal {
    @proto name = "repeatFlag";
    @proto literal = ["?", "*", "+"];
    @proto optional = true;
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
  constructor: class symbol extends Rule.Sequence {
    @proto name = "symbol";
    @proto rules = [
      testLocation,
      new Rule.Pattern({ argument: "escaped", pattern: /^\\$/, optional: true, compile(){ return true } }),
      new Rule.TokenType({ tokenType: Token.Symbol, argument: "literal" })
    ];
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
  constructor: class keyword extends Rule.Sequence {
    @proto name = "keyword";
    @proto rules = [
      testLocation,
      new Rule.Word({ argument: "literal" }),
      repeatFlag
    ];
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
  constructor: class subrule extends Rule.Sequence {
    @proto name = "subrule";
    @proto rules = [
      testLocation,
      new Rule.Nested({
        start: "{",
        end: "}",
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
    ];
    compile(match) {
      const { rule, ...results } = match.results;
      Object.assign(rule, results);
      return RulexParser.applyFlags(rule);
    }
  },
  alias: "rule",
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
  constructor: class list extends Rule.Sequence {
    @proto name = "list";
    @proto rules = [
      testLocation,
      new Rule.Nested({
        start: "[",
        end: "]",
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
    ];
    compile(match) {
      const { rule, ...results } = match.results;
      Object.assign(rule, results);
      return RulexParser.applyFlags(rule);
    }
  },
  alias: "rule",
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



// Compile the inner part of a choices list `(...this bit...)` to a Rule.Choice.
// We'll handle the nesting outside of this.
class choiceList extends Rule.Sequence {
  name = "choiceList";
  argument = "rule";
  rules = [
    promote,
    argument,
    new Rule.List({
      argument: "rules",
      item: new Rule.Subrule({ subrule: "rule", precedence: 1}),
      delimiter: new Rule.Literal("|")
    }),
  ]
  compile(match) {
    // If we got exactly one choice, copy the flags onto it and return that.
    // Note that the choice flags will "beat" the rule flags.
    if (match.results.rules.length === 1) {
      const { rules, ...results } = match.results;
      Object.assign(rules[0], results);
      return RulexParser.applyFlags(rules[0]);
    }

    const rule = new Rule.Choice(match.results);
    return RulexParser.applyFlags(rule);
  }
}


rulex.defineRule({
  constructor: class choices extends Rule.Sequence {
    @proto name = "choices";
    @proto rules = [
      testLocation,
      new Rule.Nested({
        argument: "rule",
        start: "(",
        end: ")",
        rule: new choiceList()
      }),
      repeatFlag
    ];
    compile(match) {
      const { rule, ...results } = match.results;
      Object.assign(rule, results);
      return RulexParser.applyFlags(rule);
    }
  },
  alias: "rule",
  tests: [
    {
      title: "single rule in a choice block",
      compileAs: "rule",
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
//         ["(?:>|a)", new Rule.Choice({ promote: true, rules:[ new Rule.Symbol(">"), new Rule.Keyword("a") ] })],
//
//         ["…(>|a)", new Rule.Choice({ testLocation: ANYWHERE, rules:[ new Rule.Symbol(">"), new Rule.Keyword("a") ] })],
//         ["^(?:>|a)", new Rule.Choice({ testLocation: AT_START, promote: true, rules:[ new Rule.Symbol(">"), new Rule.Keyword("a") ] })],
//
//         ["(arg:>|a)", new Rule.Choice({ argument: "arg", rules:[ new Rule.Symbol(">"), new Rule.Keyword("a") ] })],
//         ["(?:arg:>|a)", new Rule.Choice({ promote: true, argument: "arg", rules:[ new Rule.Symbol(">"), new Rule.Keyword("a") ] })],
//
//         ["(arg:>|a)?", new Rule.Choice({ optional: true, argument: "arg", rules:[ new Rule.Symbol(">"), new Rule.Keyword("a") ] })],
//         ["(arg:>|a)*", new Rule.Repeat({ optional: true, rule: new Rule.Choice({ argument: "arg", rules:[ new Rule.Symbol(">"), new Rule.Keyword("a") ] }) })],
//         ["(arg:>|a)+", new Rule.Repeat({ rule: new Rule.Choice({ argument: "arg", rules:[ new Rule.Symbol(">"), new Rule.Keyword("a") ] }) })],
      ]
    }
  ]
})



rulex.defineRule({
  constructor: class sequence extends Rule.Repeat {
    @proto name = "sequence";
    @proto testRule = new Rule.Pattern(/^[^…\^\(\{\[]$/);
    @proto minCount = 2;
//    @proto precedence = -1;   // defer to more specific rules
    @proto repeat = new Rule.Subrule({ subrule: "rule", excludes: "sequence" });
    compile(match) {
return "NO";
    }
  },
  alias: "rule",
  tests: [
    {
      title: "single rule in a choice block",
      compileAs: "rule",
      showAll: true,
      tests: [

      ]
    }
  ]
});

