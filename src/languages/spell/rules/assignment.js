//
//  # Rules for assignment and returning values.
//

import {
  gatherResults,
  Rule,
  Scope,
  SpellParser,
} from "../all.js";

const parser = new SpellParser({ module: "assignment" });
export default parser;


//
//  ## Assignment
//TODO: distinguish between `new_identifier` and `scoped_identifier`?
//

// Generic Rule to cover assignment of various flavors.
SpellParser.Rule.Assignment = class assignment extends SpellParser.Rule.Statement {
  updateScope(scope, results) {
    let { thing, value } = results;
    // If we got a variable
    if (thing instanceof Scope.Variable) {
      // Make sure scope has such a variable declared.
// TODO: this is not checking nested scopes... will likely be a problem
      if (!scope.hasLocalVar(thing.name))
        scope.addVar(thing);
      // Use the variable name in the expression.
      thing = thing.name;
    }
    scope.addStatement(`${thing} = ${value}`, results);
  }
}


parser.defineRule({
  name: "assignment",
  alias: "statement",
  syntax: "{thing:expression} = {value:expression}",
  testRule: "…=",
  constructor: SpellParser.Rule.Assignment,
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
  alias: "statement",
  syntax: "let {thing:expression} = {value:expression}",
  testRule: "let",
  constructor: SpellParser.Rule.Assignment,
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
  alias: "statement",
  syntax: "set {thing:expression} to {value:expression}",
  testRule: "set",
  constructor: SpellParser.Rule.Assignment,
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
  name: "get_value",
  alias: "statement",
  syntax: "get {value:expression}",
  testRule: "get",
  constructor: SpellParser.Rule.Assignment,
  gatherResults(scope, match) {
    const results = gatherResults(scope, match);
    results.thing = new Scope.Variable({ name: "it" });   // TODO: `typeof value`
    return results;
  },
  tests: [
    {
      compileAs: "statement",
      tests: [
        ["get thing", "it = thing"]
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
  syntax: "return {expression}",
  testRule: "return",
  constructor: SpellParser.Rule.Statement,
  updateScope(scope, results) {
    let { expression } = results;
    scope.addStatement(`return ${expression}`, results);
  },
  tests: [
    {
      compileAs: "statement",
      tests: [
        ["return thing", "return thing"]
      ]
    }
  ]
});

// Exit from current context, returning `undefined`.
parser.defineRule({
  name: "exit",
  alias: "statement",
  syntax: "exit",
  constructor: SpellParser.Rule.Statement,
  updateScope(scope, results) {
    scope.addStatement(`return undefined`, results);
  },
  tests: [
    {
      compileAs: "statement",
      tests: [
        ["exit", "return undefined"]
      ]
    }
  ]
});

