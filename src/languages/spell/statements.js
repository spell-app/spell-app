//
//  # Rules for creating variables, property access, etc
//

import Parser from "../../Parser";
import Rule from "../../Rule";

// Create "statements" parser.
const parser = Parser.forModule("statements");
export default parser;

//
//  ## Returns
//

// Return a value
parser.defineRule({
  name: "return_statement",
  alias: "statement",
  syntax: "return {expression}",
  testRule: "return",
  constructor: class return_statement extends Rule.Sequence {
    compile(match) {
      let { expression } = match.results;
      return `return ${expression}`;
    }
  },
  tests: [
    {
      compileAs: "statement",
      tests: [["return thing", "return thing"]]
    }
  ]
});

// Exit from current context, returning `undefined`.
parser.defineRule({
  name: "exit",
  alias: "statement",
  syntax: "exit",
  constructor: class return_statement extends Rule.Keywords {
    compile(match) {
      return "return undefined";
    }
  },
  tests: [
    {
      compileAs: "statement",
      tests: [["exit", "return undefined"]]
    }
  ]
});


//
//  ## Assignment
//TODO: distinguish between `new_identifier` and `scoped_identifier`?
//

parser.defineRule({
  name: "assignment",
  alias: ["statement", "mutatesScope"],
  syntax: "{thing:expression} = {value:expression}",
  testRule: "…=",
  constructor: class assignment extends Rule.Sequence {
    compile(match) {
      let { thing, value } = match.results;
      // TODO: declare identifier if not in scope, etc
      return `${thing} = ${value}`;
    }
  },
  tests: [
    {
      compileAs: "statement",
      tests: [
        ["thing = yes", "thing = true"],
      ]
    }
  ]
});

parser.defineRule({
  name: "assignment",
  alias: ["statement", "mutatesScope"],
  syntax: [
    "let {thing:expression} = {value:expression}",
    "set {thing:expression} to {value:expression}",
    "put {value:expression} into {thing:expression}"
  ],
  testRule: "(let|set|put)",
  constructor: class assignment extends Rule.Sequence {
    compile(match) {
      let { thing, value } = match.results;
      // TODO: declare identifier if not in scope, etc
      return `${thing} = ${value}`;
    }
  },
  tests: [
    {
      compileAs: "statement",
      tests: [
        ["let the foo of the bar = yes", "bar.foo = true"],
        ["set thing to yes", "thing = true"],
        ["put yes into thing", "thing = true"]
      ]
    }
  ]
});

parser.defineRule({
  name: "get_value",
  alias: ["statement", "mutatesScope"],
  syntax: "get {value:expression}",
  testRule: "get",
  constructor: class get_value extends Rule.Sequence {
    compile(match) {
      let { value } = match.results;
      return `var it = ${value}`;
    }
  },
  tests: [
    {
      title: "correctly matches ",
      compileAs: "statement",
      tests: [["get thing", "var it = thing"]]
    }
  ]
});
