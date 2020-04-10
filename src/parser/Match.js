import { isNode } from "browser-or-node"
import omit from "lodash/omit"
import flatten from "lodash/flatten"

import { memoize, clearMemoized } from "../utils/all"

// Result of a successful `rule.parse()`.
// This is a flyweight object which links a rule with the tokens that it successfully matched.
//
// - `match.rule` (Rule, required) is the rule that was matched.
//
// - `match.matched` `([Match or Token]`, required) Array of tokens matched
//     or other `Match`es for sequences, etc.
//
export default class Match {
  constructor(props) {
    Object.assign(this, props)
  }

  // "name" for this match.  Explicit `argument` set on creation or rule name.
  get name() {
    return this.argument || this.rule.argument || this.rule.name
  }

  // Syntactic sugar to easily get `groups` of the match for sequences, etc.
  // Only works for some rule types.
  // @memoize
  get groups() {
    return this.rule.gatherGroups?.(this)
  }

  // Return the "interesting" tokens which were actually matched matched.
  // NOTE: this is not guaranteed to be everything,
  //       for example, List rules don't put the delimiters in the output stream.
  // TODO: this should really be everything (including) whitespace
  //       so joining token output === input.
  get tokens() {
    return flatten(this.rule.getTokens(this))
  }

  // Add an additional `match` to this match.
  // e.g. You could use this to add a comment or error to an existing match.
  // Makes sure length and tokens are updated, groups are recalculated, etc.
  // `argument` is optional group name for the match.
  // @clearMemoized("groups")
  addMatch(match, argument) {
    if (argument) match.argument = argument
    this.matched.push(match)
    this.length += match.length
    // TODO: update this.tokens to include match.tokens
  }

  // Compile the output of the match.
  compile() {
    // Some languages (e.g. Spell) convert to an AST first, then compile().
    if (this.rule.getAST) {
      return this.AST.toJS()
    }
    // NOTE: this should NOT be used for spell, but will be used for other languages
    return this.rule.compile(this)
  }

  // Syntactic sugar to compile the match w/o calling a function.
  get js() {
    return this.compile()
  }

  // Return the Abstract Syntax Tree for this match.
  @memoize
  get AST() {
    if (!this.rule.getAST) {
      console.warn("No getAST() method defined for rule: ", this.rule)
      return undefined
    }
    return this.rule.getAST(this)
  }

  // Return AST nested scope for nested block statements.
  getNestedScope() {
    return this.rule.getNestedScope?.(this)
  }

  // Have the match call `mutateScope()` if it can.
  // NOTE: ONLY CALL THIS FROM THE MATCH!!!
  mutateScope() {
    return this.rule.mutateScope?.(this)
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
