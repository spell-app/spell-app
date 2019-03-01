import omit from "lodash/omit";

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
// - `match.tokens` is the array of actual tokens that were matched.
//
export class Match {
  constructor(props) {
    Object.assign(this, props);
  }

  // Syntactic sugar to easily get `results` of the match for sequences, etc.
  // Only works for some rule types.
  // NOTE: memoizing this is a bit dodgy
  //   -- if BlockStatements stop working, it may be that results is getting called too early.
  @memoize
  get results() { return this.rule.getResults?.(this, this.scope) }

  // Syntactic sugar for getting the matches as a map.
  // Only works for some rule types.
// NOTE: not currently used...
//   @memoize
//   get matches() { return this.rule.getMatches?.(this, this.scope) }

  // Syntatic sugar to compile the output of the match.
  compile() { return this.rule.compile(this, this.scope) }

  // Call the updateScope() rule of our rule, if defined.
  // NOTE: THIS MODIFIES THE SCOPE!!
  //  You should only call this when you're sure you got a good match!!
  updateScope() {
    if (this.rule.updateScope) this.rule.updateScope(this, this.scope);
  }

  // "name" for this match
  // TODO: this is too much, figure out what we're actually using here...
  get name() {
    return this.argument || this.rule.argument || this.rule.name;
  }

  // Should we promote the match?
  get promote() {
    return this._promote || this.rule.promote;
  }
  set promote(value) { if (value) this._promote = value }

  // Precedence of the match
  get precedence() {
    return this.rule.getPrecedence(this);
  }

  // Call this when printing to the console to eliminate the big bits.
  toPrint() {
    return {
      rule: this.rule.name,
      ...omit(this, ["rule", "scope"])
    };
  }
}
