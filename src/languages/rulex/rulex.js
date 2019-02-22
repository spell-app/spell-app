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

// Create core `rulex` rulex.
const rulex = Parser.forModule("rulex");
export default rulex;


rulex.defineRule({
  name: "statement",
  repeat: new Rule.Subrule("rule"),
  constructor: class statement extends Rule.Repeat {}
});


// A test location signifier, which is always optional.
const testFlag = rulex.defineRule({
  name: "testFlag",
  literal: ["…", "^"],
  optional: true,
  constructor: class testFlag extends Rule.Literal {}
})[0]


// A promote flag, which is always optional
const promoteFlag = rulex.defineRule({
  name: "promoteFlag",
  literals: ["?", ":"],
  optional: true,
  constructor: class promoteFlag extends Rule.Symbols {}
})[0];

// A argument signifier, which is always optional.
const argument = rulex.defineRule({
  name: "argument",
  rules: [
    new Rule.Word({ promote: true }),
    new Rule.Literal(":")
  ],
  optional: true,
  constructor: class argument extends Rule.Sequence {}
})[0]


// A repeat signifier, which is always optional.
const repeatFlag = rulex.defineRule({
  name: "repeatFlag",
  literal: ["?", "*", "+"],
  optional: true,
  constructor: class repeatFlag extends Rule.Literal {}
})[0]



//
//  Combo rules
//

// Multiple symbols with an optional repeat signifier at the end.
rulex.defineRule({
  name: "symbols",
  alias: "rule",
  rules: [
    testFlag,
    new Rule.Repeat({ repeat: new Rule.Symbol() }),
    repeatFlag
  ],
  constructor: class symbols extends Rule.Sequence {}
})

// Multiple keywords with an optional repeat signifier at the end.
rulex.defineRule({
  name: "keywords",
  alias: "rule",
  rules: [
    testFlag,
    new Rule.Repeat({ repeat: new Rule.Word() }),
    repeatFlag
  ],
  constructor: class keywords extends Rule.Sequence {}
})

// Subrule

rulex.defineRule({
  name: "subrule",
  alias: "rule",
  rules: [
    testFlag,
    new Rule.Literal("{"),
    promoteFlag,
    argument,
    new Rule.Word({ argument: "subrule" }),
    new Rule.Literal("{"),
    repeatFlag
  ],
  constructor: class subrule extends Rule.Sequence {}
});


rulex.defineRule({
  name: "choice",
  alias: "rule",
  rules: [
    testFlag,
    new Rule.Literal("("),
    promoteFlag,
    argument,
    new Rule.List({
      argument: "choices",
      item: new Rule.Subrule("rule"),
      delimiter: new Rule.Literal("|")
    }),
    new Rule.Literal(")"),
    repeatFlag
  ],
  constructor: class Choice extends Rule.Sequence {}
});


rulex.defineRule({
  name: "list",
  alias: "rule",
  rules: [
    testFlag,
    new Rule.Literal("["),
    promoteFlag,
    argument,
    new Rule.Subrule({ argument: "item", subrule: "rule" }),
    new Rule.Subrule({ argument: "delimiter", subrule: "rule" }),
    new Rule.Literal("]"),
    repeatFlag
  ],
  constructor: class List extends Rule.Sequence {}
});
