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


parser.defineRule({
  name: "assignment",
  alias: "statement",
  syntax: [
    "{thing:expression} = {value:expression}",
    "let {thing:expression} = {value:expression}",
    "set {thing:expression} to {value:expression}",
    "get {value:expression}"
  ],
  testRule:"…(=|let|set|get)",
  constructor: SpellParser.Rule.Statement,
  gatherResults(scope, match) {
    const results = gatherResults(scope, match);
    if (!results.thing)
      results.thing = new Scope.Variable({ name: "it" });
    return results;
  },
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
  },
  tests: [
    {
      compileAs: "statement",
      tests: [
        ["thing = yes", "thing = true"],
        ["let the foo of the bar = yes", "bar?.foo = true"],
        ["set thing to yes", "thing = true"],
        ["get thing", "it = thing"],
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
  updateScope(scope, results) {
    const { expression = "undefined" } = results;
    scope.addStatement(`return ${expression}`, results);
  },
  tests: [
    {
      compileAs: "statement",
      tests: [
        ["return", "return undefined"],
        ["return thing", "return thing"],
        ["exit", "return undefined"],
        ["exit with foo", "return foo"],
      ]
    }
  ]
});
