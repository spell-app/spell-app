//
//  # Rules for assignment and returning values.
//

import {
  Rule,
  Scope,
  SpellParser,
} from "../all.js";

const parser = new SpellParser({ module: "assignment" });
export default parser;


parser.defineRule({
  name: "assignment",
  alias: "statement",
  syntax: [
    { syntax: "(thing:{expression}|{variable}) = {value:expression}", testRule: "…=" },
    { syntax: "let (thing:{expression}|{variable}) = {value:expression}", testRule: "let" },
    { syntax: "set (thing:{expression}|{variable}) to {value:expression}", testRule: "set" },
  ],
  constructor: SpellParser.Rule.Statement,
  updateScope(scope, { results, matches }) {
    const { thing, value } = results;
    const thingMatch = matches.thing;
    // Add `thing` as a variable if not already in scope.
    const isNewVar = (thingMatch.rule instanceof SpellParser.Rule.Variable && !thingMatch.variable);
    if (isNewVar) scope.variables.add(thing);
    scope.addStatement(`${isNewVar ? 'let ':''}${thing} = ${value}`, results);
  },
  tests: [
    {
      compileAs: "statement",
      beforeEach(scope) {
        scope.variables.add("thing");
      },
      tests: [
        { title: "existing var equals", input: "thing = yes", output: "thing = true" },
        { title: "existing var set", input: "set thing to yes", output: "thing = true" },
        { title: "existing var property set", input: "let the name of the thing = 'bob'", output: "thing?.name = 'bob'" },

        { title: "non-existing var equals", input: "nothing = yes", output: "let nothing = true" },
        { title: "non-existing var set", input: "set nothing to yes", output: "let nothing = true" },
        { title: "non-existing var property set (won't work)", input: "let the name of nothing = 'bob'", output: undefined },
      ]
    }
  ]
});

parser.defineRule({
  name: "assignment",
  alias: "statement",
  syntax: "get {value:expression}",
  testRule: "get",
  constructor: SpellParser.Rule.Statement,
  updateScope(scope, { results }) {
    let { value } = results;
    // make sure 'it' is declared LOCALLY
    const isNewVar = !scope.variables("it", "LOCAL");
    if (isNewVar) scope.variables.add("it");
    scope.addStatement(`${isNewVar ? 'let ':''}it = ${value}`, results);
  },
  tests: [
    {
      compileAs: "statement",
      beforeEach(scope) {
        scope.variables.add("thing");
      },
      tests: [
        ["get thing", "let it = thing"],
        ["get the foo of the thing", "let it = thing?.foo"],
      ]
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
  syntax: "(return|exit with?) {expression}?",
  testRule: "(return|exit)",
  constructor: SpellParser.Rule.Statement,
  updateScope(scope, { results }) {
    const { expression = "undefined" } = results;
    scope.addStatement(`return ${expression}`, results);
  },
  tests: [
    {
      compileAs: "statement",
      beforeEach(scope) {
        scope.variables.add("thing");
      },
      tests: [
        ["return", "return undefined"],
        ["return thing", "return thing"],
        ["exit", "return undefined"],
        ["exit with false", "return false"],
      ]
    }
  ]
});
