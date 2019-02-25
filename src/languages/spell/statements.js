//
//  # Rules for creating variables, property access, etc
//

import {
  Rule,
  SpellParser,
} from "./all.js";

const parser = new SpellParser({ module: "statements" });
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
  literal: "exit",
  constructor: class return_statement extends Rule.Literal {
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
  syntax: "let {thing:expression} = {value:expression}",
  testRule: "let",
  constructor: class assignment extends Rule.Sequence {
    compile(match) {
      let { thing, value } = match.results;
      return `${thing} = ${value}`;
    }
  },
  tests: [
    {
      compileAs: "statement",
      tests: [
        ["let the foo of the bar = yes", "bar.foo = true"],
      ]
    }
  ]
});

parser.defineRule({
  name: "assignment",
  alias: ["statement", "mutatesScope"],
  syntax: "set {thing:expression} to {value:expression}",
  testRule: "set",
  constructor: class assignment extends Rule.Sequence {
    compile(match) {
      let { thing, value } = match.results;
      return `${thing} = ${value}`;
    }
  },
  tests: [
    {
      compileAs: "statement",
      tests: [
        ["set thing to yes", "thing = true"],
      ]
    }
  ]
});

parser.defineRule({
  name: "assignment",
  alias: ["statement", "mutatesScope"],
  syntax: "put {value:expression} into {thing:expression}",
  testRule: "put",
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
