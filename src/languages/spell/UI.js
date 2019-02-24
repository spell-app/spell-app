//
//  # Rules for creating variables, property access, etc
//

import {
  Rule,
  SpellParser,
  Token,
} from "./all.js";

const parser = new SpellParser({ module: "UI" });
export default parser;

// Alert a message.
parser.defineRule({
  name: "alert",
  alias: ["statement", "mutatesScope", "async"],
  syntax: "alert {message:expression} (?:with {okButton:text})?",
  testRule: "alert",
  // TODO: need some fancy promise juju to make parent funtion async?
  constructor: class alert extends Rule.Sequence {
    compile(match) {
      let { message, okButton = '"OK"' } = match.results;
      return `await spell.alert(${message}, ${okButton})`;
    }
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
  constructor: class warn extends Rule.Sequence {
    compile(match) {
      let { message, okButton = '"OK"' } = match.results;
      return `await spell.warn(${message}, ${okButton})`;
    }
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
  syntax:
    "confirm {message:expression} (?:with {okButton:text} (?: (and|or) {cancelButton:text})? )?",
  testRule: "confirm",
  constructor: class confirm extends Rule.Sequence {
    compile(match) {
      let { message, okButton = '"OK"', cancelButton = '"Cancel"' } = match.results;
      return `await spell.confirm(${message}, ${okButton}, ${cancelButton})`;
    }
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
