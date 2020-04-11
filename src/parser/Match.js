import { isNode } from "browser-or-node"
import omit from "lodash/omit"

import { Rule, Token } from "."
import { Assertable, OPTIONAL, memoize, clearMemoized } from "../utils"

// Result of a successful `rule.parse()`.
// This is a flyweight object which links a rule with the tokens that it successfully matched.
//
// - `match.rule`     - Rule (required)                 Immutable Rule instance that was matched.
// - `match.input`    - [Token] (required)              Array of tokens that were matched
// - `match.matched`  - [Match or Token] (required)     Array of Matches or Tokens matched.
//
export default class Match extends Assertable {
  static DEBUG_MATCH_INITIALIZATION = true
  constructor(props) {
    super()
    Object.assign(this, props)

    // Only run tests if flag is set
    if (Match.DEBUG_MATCH_INITIALIZATION) {
      this.assertType("rule", Rule)
      this.assertArrayType("input", Token)
      this.assertType("length", "number")
      this.assert(this.length === this.input.length, "length does not match input length")
      // this.assertType("scope", Scope)
    }
  }

  // "name" for this match.  Explicit `argument` set on creation or rule name.
  get name() {
    return this.argument || this.rule.argument || this.rule.name
  }

  // Syntactic sugar to easily get `groups` of the match for sequences, etc.
  // Only works for some rule types.
  @memoize
  get groups() {
    return this.rule.gatherGroups?.(this)
  }

  // Add an additional `match` to this match.
  // e.g. You could use this to add a comment or error to an existing match.
  // Makes sure length and tokens are updated, groups are recalculated, etc.
  // `argument` is optional group name for the match.
  @clearMemoized("groups")
  addMatch(match, argument) {
    if (argument) match.argument = argument
    this.matched.push(match)
    this.input.push(...match.input)
    this.length += match.length
  }

  // Return AST nested scope for nested block statements.
  // NOTE: ONLY CALL THIS FROM THE MATCH!!!
  // TODOC
  @memoize
  get nestedScope() {
    return this.rule.getNestedScope?.(this)
  }

  // Have the match call `mutateScope()` if it can.
  // TODOC
  // NOTE: ONLY CALL THIS FROM THE MATCH!!!
  mutateScope() {
    return this.rule.mutateScope?.(this)
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

  // DEBUG: Call this when printing to the console to eliminate the big bits in node.
  toPrint() {
    if (!isNode) return this
    return {
      rule: this.rule.name,
      ...omit(this, ["rule", "scope"])
    }
  }
}
