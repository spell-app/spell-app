import {
  Parser
} from "../../parser/all.js";

export class RulexParser extends Parser {
  @proto
  language = "rulex";

  @proto
  ignoreWhitespace = true;

  // A `statement` is a series of rules and is the main thing we parse.
  @rule(Rule.Repeat)
  statement = {
    repeat: new Rule.Subrule("rule")
  }

  // A test location signifier, which is always optional.
  @rule(Rule.Literal)
  testFlag = {
    literal: ["…", "^"],
    optional: true
  }


  // A promote flag, which is always optional
  @rule(Rule.Symbols)
  promoteFlag = {
    literals: ["?", ":"],
    optional: true
  }

  // A argument signifier, which is always optional.
  @rule(Rule.Sequence)
  argument = {
    rules: [
      new Rule.Word({ promote: true }),
      new Rule.Literal(":")
    ],
    optional: true
  }


  // A repeat signifier, which is always optional.
  @rule(Rule.Literal)
  repeatFlag = {
    literal: ["?", "*", "+"],
    optional: true
  }


  //
  //  Combo rules
  //

  // Multiple symbols with an optional repeat signifier at the end.
  @rule(Rule.Sequence)
  symbols = {
    alias: "rule",
    rules: [
      "@testFlag",
      new Rule.Repeat({ repeat: new Rule.Symbol() }),
      "@repeatFlag"
    ]
  }

  // Multiple keywords with an optional repeat signifier at the end.
  @rule(Rule.Sequence)
  keywords = {
    alias: "rule",
    rules: [
      "@testFlag",
      new Rule.Repeat({ repeat: new Rule.Word() }),
      "@repeatFlag"
    ]
  }

  // Subrule
  @rule(Rule.Sequence)
  subrule = {
    alias: "rule",
    rules: [
      "@testFlag",
      new Rule.Literal("{"),
      "@promoteFlag",
      "@argument",
      new Rule.Word({ argument: "subrule" }),
      new Rule.Literal("{"),
      "@repeatFlag"
    ]
  }


  @rule(Rule.Sequence)
  choice = {
    alias: "rule",
    rules: [
      "@testFlag",
      new Rule.Literal("("),
      "@promoteFlag",
      "@argument",
      new Rule.List({
        argument: "choices",
        item: new Rule.Subrule("rule"),
        delimiter: new Rule.Literal("|")
      }),
      new Rule.Literal(")"),
      "@repeatFlag"
    ]
  }


  @rule(Rule.Sequence)
  list = {
    alias: "rule",
    rules: [
      "@testFlag",
      new Rule.Literal("["),
      "@promoteFlag",
      "@argument",
      new Rule.Subrule({ argument: "item", subrule: "rule" }),
      new Rule.Subrule({ argument: "delimiter", subrule: "rule" }),
      new Rule.Literal("]"),
      "@repeatFlag"
    ]
  }

}
