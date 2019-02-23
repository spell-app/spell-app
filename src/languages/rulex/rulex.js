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


export class RulexParser extends Parser {
  static REGISTRY = {};
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
const testFlag = rulex.defineRule(
  class testFlag extends Rule.Literal {
    name = "testFlag";
    literal = ["…", "^"];
    optional = true;
    compile(match, rule) {
      rule.testLocation = match.matched[0].value === "…"
        ? TestLocation.ANYWHERE    // TODO: flags
        : TestLocation.AT_START;
      return rule;
    }
  }
);


// A promote flag, which is always optional
const promoteFlag = rulex.defineRule(
  class promoteFlag extends Rule.Symbols {
    name = "promoteFlag";
    literals = ["?", ":"];
    optional = true;
    compile(match, rule) {
      rule.promote = true;    // TODO: flags
      return rule;
    }
  }
);

// A argument signifier, which is always optional.
const argument = rulex.defineRule(
  class argument extends Rule.Sequence {
    name = "argument";
    rules = [
      new Rule.Word({ promote: true }),
      new Rule.Literal(":")
    ];
    optional = true;
    compile(match, rule) {
      rule.argument = match.matched[0].value;    // TODO: flags
      return rule;
    }
  }
)


// A repeat signifier, which is always optional.
const repeatFlag = rulex.defineRule(
  class repeatFlag extends Rule.Literal {
    name = "repeatFlag";
    literal = ["?", "*", "+"];
    optional = true;
    compile(match, rule) {
      const literal = match.matched[0].value;
      if (literal === "?")
        rule.optional = true; // TODO: flags
      else if (literal === "*")
        rule = new Rule.Repeat({ rule, optional: true });
      else
        rule = new Rule.Repeat({ rule });

      return rule;
    }
  }
)



//
//  Combo rules
//

// Multiple symbols with an optional repeat signifier at the end.
rulex.defineRule(
  class symbols extends Rule.Sequence {
    name = "symbols";
    alias = "rule";
    rules = [
      testFlag,
      new Rule.Repeat({ repeat: new Rule.Symbol() }),
      repeatFlag
    ];
    compile(match) {

    }
  }
)

// Multiple keywords with an optional repeat signifier at the end.
rulex.defineRule(
  class keywords extends Rule.Sequence {
    name = "keywords";
    alias = "rule";
    rules = [
      testFlag,
      new Rule.Repeat({ repeat: new Rule.Word() }),
      repeatFlag
    ];
  }
)

// Subrule
rulex.defineRule(
  class subrule extends Rule.Sequence {
    name = "subrule";
    alias = "rule";
    rules = [
      testFlag,
      new Rule.Literal("{"),
      promoteFlag,
      argument,
      new Rule.Word({ argument: "subrule" }),
      new Rule.Literal("}"),
      repeatFlag
    ];
  }
);


rulex.defineRule(
  class Choice extends Rule.Sequence {
    name = "choice";
    alias = "rule";
    rules = [
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
    ];
  }
);


rulex.defineRule(
  class List extends Rule.Sequence {
    name = "list";
    alias = "rule";
    rules = [
      testFlag,
      new Rule.Literal("["),
      promoteFlag,
      argument,
      new Rule.Subrule({ argument: "item", subrule: "rule" }),
      new Rule.Subrule({ argument: "delimiter", subrule: "rule" }),
      new Rule.Literal("]"),
      repeatFlag
    ];
  }
);
