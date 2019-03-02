//
//  # Rules for assignment and returning values.
//

import {
  Rule,
  SpellParser,
} from "./all.js";

const parser = new SpellParser({ module: "assignment" });
export default parser;


//
//  ## Assignment
//TODO: distinguish between `new_identifier` and `scoped_identifier`?
//

parser.defineRule({
  name: "assignment",
  alias: ["statement", "updatesScope"],
  syntax: "{thing:expression} = {value:expression}",
  testRule: "…=",
  compile(match, scope) {
    let { thing, value } = match.results;
    // TODO: declare identifier if not in scope, etc
    return `${thing} = ${value}`;
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
  alias: ["statement", "updatesScope"],
  syntax: "let {thing:expression} = {value:expression}",
  testRule: "let",
  compile(match, scope) {
    let { thing, value } = match.results;
    return `${thing} = ${value}`;
  },
  tests: [
    {
      compileAs: "statement",
      tests: [
        ["let the foo of the bar = yes", "bar?.foo = true"],
      ]
    }
  ]
});

parser.defineRule({
  name: "assignment",
  alias: ["statement", "updatesScope"],
  syntax: "set {thing:expression} to {value:expression}",
  testRule: "set",
  compile(match, scope) {
    let { thing, value } = match.results;
    return `${thing} = ${value}`;
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
  alias: ["statement", "updatesScope"],
  syntax: "put {value:expression} into {thing:expression}",
  testRule: "put",
  compile(match, scope) {
    let { thing, value } = match.results;
    // TODO: declare identifier if not in scope, etc
    return `${thing} = ${value}`;
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
  alias: ["statement", "updatesScope"],
  syntax: "get {value:expression}",
  testRule: "get",
  compile(match, scope) {
    let { value } = match.results;
    return `var it = ${value}`;
  },
  tests: [
    {
      title: "correctly matches ",
      compileAs: "statement",
      tests: [["get thing", "var it = thing"]]
    }
  ]
});


//
//  ## Returns
//

// Return a value
parser.defineRule({
  name: "return_statement",
  alias: "statement",
  syntax: "return {expression}",
  testRule: "return",
  compile(match, scope) {
    let { expression } = match.results;
    return `return ${expression}`;
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
  compile(match, scope) {
    return "return undefined";
  },
  tests: [
    {
      compileAs: "statement",
      tests: [["exit", "return undefined"]]
    }
  ]
});

