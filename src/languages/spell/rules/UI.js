//
//  # Rules for creating variables, property access, etc
//

import {
  Rule,
  SpellParser,
  Token,
} from "../all.js";

const parser = new SpellParser({ module: "UI" });
export default parser;

// Alert a message.
parser.defineRule({
  name: "alert",
  alias: ["statement", "async"],
  syntax: "alert {message:expression} (?:with {okButton:text})?",
  testRule: "alert",
  constructor: SpellParser.Rule.Statement,
  updateScope(scope, { results }) {
    const { message, okButton = '"OK"' } = results;
    scope.async = true;
    const statement = scope.addStatement(`await spell.alert(${message}, ${okButton})`);
    results.statements.push(statement);
  },
  tests: [
    {
      compileAs: "statement",
      tests: [
        [`alert 'Yo!'`, `await spell.alert('Yo!', "OK")`],
        [`alert "Yo!"`, `await spell.alert("Yo!", "OK")`],
        [`alert 'Yo!' with 'yep'`, `await spell.alert('Yo!', 'yep')`],
        [`alert "Yo!" with "yep"`, `await spell.alert("Yo!", "yep")`]
      ]
    }
  ]
});

// Warning message -- like alert but fancier.
// TODO: need some fancy promise juju here?
parser.defineRule({
  name: "warn",
  alias: "statement",
  syntax: "warn {message:expression} (?:with {okButton:text})?",
  testRule: "warn",
  constructor: SpellParser.Rule.Statement,
  updateScope(scope, { results }) {
    const { message, okButton = '"OK"' } = results;
    scope.async = true;
    const statement = scope.addStatement(`await spell.warn(${message}, ${okButton})`);
    results.statements.push(statement);
  },
  tests: [
    {
      compileAs: "statement",
      tests: [
        [`warn 'Yo!'`, `await spell.warn('Yo!', "OK")`],
        [`warn 'Yo!' with 'yep'`, `await spell.warn('Yo!', 'yep')`],
        [`warn "Yo!"`, `await spell.warn("Yo!", "OK")`],
        [`warn "Yo!" with "yep"`, `await spell.warn("Yo!", "yep")`]
      ]
    }
  ]
});

// Confirm message -- present a question with two answers.
// TODO: need some fancy promise juju here?
parser.defineRule({
  name: "confirm",
  alias: "statement",
  syntax: "confirm {message:expression} (?:with {okButton:text} (?:(and|or) {cancelButton:text})?)?",
  testRule: "confirm",
  constructor: SpellParser.Rule.Statement,
  updateScope(scope, { results }) {
    const { message, okButton = '"OK"', cancelButton = '"Cancel"' } = results;
    scope.async = true;
    const statement = scope.addStatement(`await spell.confirm(${message}, ${okButton}, ${cancelButton})`);
    results.statements.push(statement);
  },
  tests: [
    {
      compileAs: "statement",
      tests: [
        [`confirm 'Yo!'`, `await spell.confirm('Yo!', "OK", "Cancel")`],
        [`confirm 'Yo!' with 'yep'`, `await spell.confirm('Yo!', 'yep', "Cancel")`],
        [`confirm 'Yo!' with 'yep' and 'nope'`, `await spell.confirm('Yo!', 'yep', 'nope')`],
        [`confirm 'Yo!' with 'yep' or 'nope'`, `await spell.confirm('Yo!', 'yep', 'nope')`],
        [`confirm "Yo!" with "yep" or "nope"`, `await spell.confirm("Yo!", "yep", "nope")`]
      ]
    }
  ]
});
