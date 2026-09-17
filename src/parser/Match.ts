import { isNode } from "browser-or-node"
import omit from "lodash/omit"

import { Rule, Token, Rules } from "~/parser"
import { Assertable } from "~/util"
import { Scope, ScopeConstructor } from "./scope/Scope"
import type { ASTNode } from "./ast/AST"

/**
 * Default shape of `match.groups`: named sub-matches, as a single `Match` or an array if the name repeats.
 * - Rules narrow this per-rule, e.g. `Match<RulexGroups<"lhs:rhs">>` (see `~/parser/rulex.types`).
 * - Rules may also derive extra, non-Match group values (see `Rule.getGroupsForMatch()`).
 */
export type MatchGroups = Record<string, Match | Match[] | undefined>

/** A `Match` with any `groups` shape -- use for parameters which don't care about groups. */
export type AnyMatch = Match<Record<string, unknown>>

export type MatchProps = {
  scope: Scope
  rule: Rule
  tokens: Token[]
  matched: (Match | Token)[]
  items?: Match[]
  argument?: string
  raw?: string
  value?: any
  message?: string
  choiceRule?: string
}
/**
 * Result of a successful `rule.parse()`.
 * This is a flyweight object which links a rule with the tokens that it successfully matched.
 * - `match.rule`     - (required) Immutable `Rule` instance that was matched.
 * - `match.tokens`   - (required) Array of `Tokens` that were matched
 * - `match.matched`  - (required) Array of `Matches` or `Tokens` matched.
 */
export class Match<Groups extends Record<string, unknown> = MatchGroups> extends Assertable {
  static DEBUG_MATCH_INITIALIZATION = true

  /** Main rule that matched. */
  declare rule: Rule
  /** Raw input tokens that were matched. */
  declare tokens: Token[]
  /** Things what were matched, which may be `Matches` or `Tokens`. */
  // TODO: can we get `tokens` out of here?
  declare matched: (Match | Token)[]
  /** Significant sub-matches, e.g. the repeated items of a `Repeat` (not including delimiters). */
  declare items: Match[]
  /** Scope in which the match was made. */
  declare scope: Scope
  /** Argument for this match. */
  declare argument: string | undefined
  /** Raw input text that was matched, not including trailing whitespace. */
  declare raw: string | undefined
  /** Value of the match. For a Pattern, this will be `match.raw` run through VALUE_MAP. */
  declare value: any
  /** Message for this match. */
  // REFACTOR: errorMessage?
  declare message: string | undefined
  /** Name of the `Choice` rule which selected this match, if any. */
  declare choiceRule: string | undefined

  constructor(props: MatchProps) {
    super()
    Object.assign(this, props)

    // Only run tests if flag is set
    if (Match.DEBUG_MATCH_INITIALIZATION) {
      this.assertType("scope", Scope)
      this.assertType("rule", Rule)
      this.assertArrayType("tokens", Token)
    }
  }

  /** "name" for this match.  Explicit `argument` set on creation or rule name. */
  get name(): string | undefined {
    return this.argument || this.rule.argument || this.rule.name
  }

  // Return the `name` for our rule, using `rule.constructor.name` for anonymous rules.
  get ruleName(): string | undefined {
    return this.rule.name || this.rule.constructor.name
  }

  /** Number of tokens matched. */
  get length() {
    return this.tokens.length
  }

  /** Raw input text, including whitespace. */
  get inputText(): string {
    return this.tokens?.join("") || ""
  }

  /** Start line number in the source stream. Start line number in the source stream.*/
  get line(): number | undefined {
    return this.tokens[0]?.line
  }

  /** Start char number within our `line` in the source stream. */
  get char(): number | undefined {
    return this.tokens[0]?.ch
  }

  /** Character offset of start position in the source stream. */
  get start(): number | undefined {
    return this.tokens[0]?.offset
  }

  /** Character offset of end position in the source stream. */
  get end(): number | undefined {
    const { start, inputText } = this
    return start === undefined ? undefined : start + inputText.length
  }

  // Return our `matched` which encompasses `offset`.
  // Returns `undefined` if nothing works.
  matchForOffset(offset: number) {
    return this.matched.find((match) => {
      if (!(match instanceof Match)) return false
      const { start, end } = match
      return start !== undefined && start <= offset && end !== undefined && end > offset
    }) as Match | undefined
  }

  // Return stack of our `matched` which encompasses `offset` with us first.
  // Returns empty array if `offset` is not within us.
  matchStackForOffset(offset: number) {
    const stack = []
    let match = this as Match | undefined
    while (match instanceof Match) {
      match = match.matchForOffset(offset)
      if (!match) break
      stack.push(match)
    }
    if (stack.length) stack.unshift(this)
    return stack
  }

  ////////////////////
  // ## Match groups
  ////////////////////

  /**
   * Return match `groups` for this match.
   * - Some rules derive additional groups based on analysis of "normal" groups.
   * - NOTE: always use `match.groups` to access so we re-use the same `groups` object.
   */
  get groups(): Groups {
    return this.derived("groups", () => this.rule.getGroupsForMatch(this) as Groups)
  }

  /**
   * Add an additional `match` to this match and our `groups`.
   * `argument` is optional group name for the match.
   *
   * Use this to, e.g., add a comment or error to an existing `match`.
   * Makes sure length and tokens are updated, groups are updated, etc.
   */
  addMatch(match: Match, argument: string | undefined) {
    if (match === undefined) {
      console.warn("addMatch() called with undefined match", { match, argument })
      return
    }
    // get groups BEFORE adding the match (we'll add at the end)
    const { groups } = this

    if (argument) match.argument = argument
    this.matched.push(match)
    this.tokens.push(...match.tokens)

    // Add the match to existing groups
    if (groups) this.addMatchedToGroups(groups, [match])
  }

  addMatchedToGroups<G extends Record<string, unknown>>(
    groups: G,
    matched: Array<AnyMatch | Token>,
    callback?: (match: AnyMatch) => Match
  ): G {
    for (let i = 0, match; (match = matched[i]); i++) {
      if (!(match instanceof Match)) continue
      // if the match has a name:
      const { name } = match
      if (name) {
        const value = callback ? callback(match) : match
        // If arg already exists, convert to an array
        const existing = groups[name]
        if (existing === undefined) (groups as Record<string, unknown>)[name] = value
        else if (Array.isArray(existing)) existing.push(value)
        else (groups as Record<string, unknown>)[name] = [existing, value]
      }
      // if it's an anonymous sequence, promote it to the main map
      else if (match.rule instanceof Rules.Sequence) {
        this.addMatchedToGroups(groups, match.matched, callback)
      }
    }
    return groups
  }

  ////////////////////
  // ## Scopes
  ////////////////////

  /**
   * Return `scope` to use to parse "nested" contents of the match,
   * - By default, we just return the `match.scope`, but some rules may derive a new scope.
   * - For example, matching a method signature will define a nested MethodScope to compile the method body
   *   which includes the method arguments.
   * - NOTE: always use `match.nestedScope` to access so we re-use the scope object.
   */
  get nestedScope() {
    return this.derived("nestedScope", () => this.rule.getNestedScopeForMatch(this))
  }

  /**
   * Return array of `scopes` by looking up parentScope chains, with our scope first.
   */
  get scopes() {
    const scopes = []
    let scope: Scope | undefined = this.scope
    while (scope) {
      scopes.push(scope)
      scope = scope.parentScope
    }
    return scopes
  }

  /**
   * Return first item in `scopes` which matches `scopeConstructor`.
   * Returns `undefined` if not found.
   */
  getScopeOfType(scopeConstructor: ScopeConstructor) {
    return this.scopes.find((scope) => scope instanceof scopeConstructor)
  }

  ////////////////////
  // ## Compilation
  ////////////////////

  /**
   * Return the Abstract Syntax Tree (AST) node for this match.
   * - Some languages (e.g. Spell) convert to an AST first, then compile().
   * - NOTE: always use `match.AST` to access so we re-use the AST object.
   */
  get AST(): ASTNode | undefined {
    return this.derived("AST", () => {
      if (!this.rule.getAST) {
        console.warn("No getAST() method defined for rule: ", this.rule)
        return undefined
      }
      return this.rule.getAST(this)
    })
  }

  /** Compile the output of the match (a string for language parsers, arbitrary values for e.g. `rulex`). */
  compile(): unknown {
    // Some languages (e.g. Spell) convert to an AST first, then compile().
    if (this.rule.getAST) {
      return this.AST?.compile()
    }
    return this.rule.compile(this)
  }

  /** Syntactic sugar to compile the match w/o calling a function. */
  get js(): unknown {
    return this.compile()
  }

  ////////////////////
  // ## Debug
  ////////////////////

  // DEBUG: Call this when printing to the console to eliminate the big bits in node.
  toPrint() {
    if (!isNode) return this
    return {
      rule: this.rule.name,
      ...omit(this, ["rule", "scope"])
    }
  }

  // DEBUG: convert to JSON
  toJSON() {
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
