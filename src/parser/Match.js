import { isNode } from "browser-or-node";
import omit from "lodash/omit";
import flatten from "lodash/flatten";

import { Tokenizer } from "./all.js";
import { memoize } from "../utils/all.js";

// Result of a successful `rule.parse()`.
// This is a flyweight object which links a rule with the tokens that it successfully matched.
//
// - `match.rule` (Rule, required) is the rule that was matched.
//
// - `match.matched` `([Match or Token]`, required) Array of tokens matched
//     or other `Match`es for sequences, etc.
//
export class Match {
  constructor(props) {
    Object.assign(this, props);
  }

  // "name" for this match.
  get name() {
    return this.argument || this.rule.argument || this.rule.name;
  }

  // Should we promote the match?
  // Generally we look this up in our rule, but sometimes it's set directly (e.g. with choices)
  get promote() {
    return this._promote || this.rule.promote;
  }
  set promote(value) { if (value) this._promote = value }

  // Syntactic sugar to easily get `results` of the match for sequences, etc.
  // Only works for some rule types.
  @memoize
  get results() { return this.rule.gatherResults?.(this.scope, this) }

  // Syntactic sugar to easily get `matches` of the match for sequences, etc.
  // Only works for some rule types.
  @memoize
  get matches() { return this.rule.gatherMatches?.(this.scope, this) }

  // Return the "interesting" tokens which were actually matched matched.
  // NOTE: this is not guaranteed to be everything,
  //       for example, List rules don't put the delimiters in the output stream.
  getTokens() { return flatten(this.rule.getTokens(this)) }

  // Syntatic sugar to compile the output of the match.
  get js() { return this.compile() }
  compile() { return this.rule.compile(this.scope, this) }

  // Have the match call `updateScope()` if it can.
  // This is called for `statement`s BEFORE they're actually compiled,
  // and is a chance for the statement to declare new rules, add variables to the scope, etc.
  // NOTE: we memoize this so calling it subsequent times is a no-op.
  // NOTE: ONLY CALL THIS FROM THE MATCH!!!
  @memoize
  updateScope() {
    // NOTE: we ALWAYS call getNestedScope first because many rules so it's set up
    //       before updateScope is called.
    this.getNestedScope();
    return this.rule.updateScope?.(this.scope, this.results, this);
  }

  // Return nested scope for nested block statements.
  // NOTE: we memoize this so calling it subsequent times is a no-op.
  // NOTE: ONLY CALL THIS FROM THE MATCH!!!
  @memoize
  getNestedScope() {
    return this.rule.getNestedScope?.(this.scope, this.results, this);
  }

  // Visualize a match by outputting its `structure`.
  // This version outputs to the console and is not quite working right.
  get viz() { return "\n"+this.visualize() }
  visualize(structure = this.structure, indent = "") {
    if (Array.isArray(structure)) {
      if (structure.length > 1)
        return structure.map(item => this.visualize(item, "  "));
      structure = structure[0];
    }

    if (typeof structure === "string")
      return `${structure}`;

    let { name, value } = structure;
    if (Array.isArray(value) && value.length === 1)
      value = value[0];

    if (typeof value === "string")
      return `${name}:${value}`;

    let output = this.visualize(value, "  ");
    if (!Array.isArray(output)) output = output.split("\n");
    output = (output.join("\n"+indent))
    return `${name}:\n${indent}${output}`;
  }

  // Return structure used to visualize this map (rule-dependent).
  // Format will be:    `{ name, value }` or simply `value`
  //   where `value` is:
  //    - a recursive `structure`,
  //    - a literal string (for matched keywords/symbols/patterns), or
  //    - an array of `value`s.
  get structure() {
    let value = this.rule.getStructure(this, this.scope);
    if (this.choiceRule && this.choiceRule !== this.name) {
      if (this.rule.name) value = { name: this.rule.name, value };
      value = { name: this.choiceRule, value };
    }
    else {
      if (this.name) value = { name: this.name, value };
    }
    return value;
  }

  // Call this when printing to the console to eliminate the big bits in node.
  toPrint() {
    if (!isNode) return this;
    return {
      rule: this.rule.name,
      ...omit(this, ["rule", "scope"])
    };
  }
}
