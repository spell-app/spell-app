import { isNode } from "browser-or-node"
import omit from "lodash/omit"
import flatten from "lodash/flatten"

import { Tokenizer } from "./all"
import { memoize } from "../utils/all"

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
    Object.assign(this, props)
  }

  // "name" for this match.
  get name() {
    return this.argument || this.rule.argument || this.rule.name
  }

  // Syntactic sugar to easily get `results` of the match for sequences, etc.
  // Only works for some rule types.
  @memoize
  get results() {
    return this.rule.gatherResults?.(this.scope, this)
  }

  // Syntactic sugar to easily get `groups` of the match for sequences, etc.
  // Only works for some rule types.
  @memoize
  get groups() {
    return this.rule.gatherGroups?.(this.scope, this)
  }

  // Return the "interesting" tokens which were actually matched matched.
  // NOTE: this is not guaranteed to be everything,
  //       for example, List rules don't put the delimiters in the output stream.
  get tokens() {
    return flatten(this.rule.getTokens(this))
  }

  // Syntatic sugar to compile the output of the match.
  compile() {
    return this.rule.compile(this.scope, this)
  }
  get js() {
    return this.compile()
  }

  // Have the match call `updateScope()` if it can.
  // This is called for `statement`s BEFORE they're actually compiled,
  // and is a chance for the statement to declare new rules, add variables to the scope, etc.
  // NOTE: we memoize this so calling it subsequent times is a no-op.
  // NOTE: ONLY CALL THIS FROM THE MATCH!!!
  @memoize
  updateScope() {
    // NOTE: we ALWAYS call getNestedScope first so it's set up before updateScope is called.
    this.getNestedScope()
    return this.rule.updateScope?.(this.scope, this)
  }

  // Return nested scope for nested block statements.
  // NOTE: we memoize this so calling it subsequent times is a no-op.
  // NOTE: ONLY CALL THIS FROM THE MATCH!!!
  @memoize
  getNestedScope() {
    return this.rule.getNestedScope?.(this.scope, this)
  }

  // DEBUG: Call this when printing to the console to eliminate the big bits in node.
  toPrint() {
    if (!isNode) return this
    return {
      rule: this.rule.name,
      ...omit(this, ["rule", "scope"])
    }
  }
}
