import { isNode } from "browser-or-node"
import omit from "lodash/omit"

import { Rule, Token } from "~/parser"
import { Assertable, memoize } from "~/util"

// Result of a successful `rule.parse()`.
// This is a flyweight object which links a rule with the tokens that it successfully matched.
//
// - `match.rule`     - Rule (required)                 Immutable Rule instance that was matched.
// - `match.input`    - [Token] (required)              Array of tokens that were matched
// - `match.matched`  - [Match or Token] (required)     Array of Matches or Tokens matched.
//
export class Match extends Assertable {
  static DEBUG_MATCH_INITIALIZATION = false
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

  // Raw input text, including whitespace.
  get inputText() {
    return this.input?.join("") || ""
  }

  // Start line number in the source stream.
  get line() {
    return this.input[0]?.line
  }

  // Start char number within our `line` in the source stream.
  get char() {
    return this.input[0]?.ch
  }

  // Character offset of start position in the source stream.
  get start() {
    return this.input[0]?.offset
  }

  // Character offset of end position in the source stream.
  get end() {
    const { start, inputText } = this
    return start === undefined ? undefined : start + inputText.length
  }

  // Return the `name` for our rule, using `rule.constructor.name` for anonymous rules.
  get ruleName() {
    return this.rule.name || this.rule.constructor.name
  }

  // Return our `matched` which encompasses `offset`.
  // Returns `undefined` if nothing works.
  matchForOffset(offset) {
    return this.matched.find((match) => match.start <= offset && match.end > offset)
  }

  // Return stack of our `matched` which encompasses `offset` with us first.
  // Returns empty array if `offset` is not within us.
  matchStackForOffset(offset) {
    const stack = []
    let match = this
    while (match instanceof Match) {
      match = match.matchForOffset(offset)
      if (!match) break
      stack.push(match)
    }
    if (stack.length) stack.unshift(this)
    return stack
  }

  // Syntactic sugar to easily get `groups` of the match for sequences, etc.
  // Only works for some rule types.
  // NOTE: ALWAYS GET THIS FROM THE MATCH!!!
  @memoize
  get groups() {
    return this.rule.gatherGroups?.(this)
  }

  /**
   * Add an additional `match` to this match and our `groups`.
   * `argument` is optional group name for the match.
   *
   * Use this to, e.g., add a comment or error to an existing `match`.
   * Makes sure length and tokens are updated, groups are updated, etc.
   */
  addMatch(match, argument) {
    // get groups BEFORE adding the match (we'll add at the end)
    const { groups } = this

    if (argument) match.argument = argument
    this.matched.push(match)
    this.input.push(...match.input)
    this.length += match.length

    // if OUR rule has `_addGroups` defined, add the match to existing groups
    if (groups && this.rule._addGroups) this.rule._addGroups(groups, [match])
  }

  // Return nested scope for nested block statements.
  // NOTE: ALWAYS GET THIS FROM THE MATCH!!!
  @memoize
  get nestedScope() {
    return this.rule.getNestedScope?.(this)
  }

  /**
   * Return array of `scope` and their parent scopes, with this scope first.
   */
  get scopes() {
    const scopes = []
    let scope = this.scope
    while (scope) {
      scopes.push(scope)
      scope = scope.scope
    }
    return scopes
  }

  /**
   * Return first item in `scopes` which matches `scopeConstructor`.
   * Returns `undefined` if not found.
   */
  getScopeOfType(scopeConstructor) {
    return this.scopes.find((scope) => scope instanceof scopeConstructor)
  }

  // Have the match call `mutateScope()` if it can.
  // TODOC
  // NOTE: ONLY CALL THIS FROM THE MATCH!!!
  mutateScope() {
    return this.rule.mutateScope?.(this)
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

  // Compile the output of the match.
  compile() {
    // Some languages (e.g. Spell) convert to an AST first, then compile().
    if (this.rule.getAST) {
      return this.AST.compile()
    }
    // NOTE: this should NOT be used for spell, but will be used for other languages
    return this.rule.compile(this)
  }

  // Syntactic sugar to compile the match w/o calling a function.
  get js() {
    return this.compile()
  }

  // DEBUG: Call this when printing to the console to eliminate the big bits in node.
  toPrint() {
    if (!isNode) return this
    return {
      rule: this.rule.name,
      ...omit(this, ["rule", "scope"])
    }
  }

  // DEBUG: convert to JSON
  toJSON(key) {
    const { name, rule, scope, raw, value, matched, items } = this
    return {
      name,
      rule: `${rule.module || "(core)"}:${rule.name || rule.constructor.name}`,
      scope: `${scope.constructor.name}:${scope.name}(${this.start}-${this.end})`,
      raw,
      value,
      matched,
      items
    }
  }
}
