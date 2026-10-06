import { isNode } from "browser-or-node"
import omit from "lodash/omit"

import { Assertable } from "$/util"
import { P } from "$/parser"

/**
 * Default shape of `match.groups`: named sub-matches, as a single `Match` or an array if the name repeats.
 * - Rules narrow this with their `Groups` type argument, e.g. `P.Sequence<"lhs|rhs?">` -- see `P.GroupsFor`.
 * - ONLY what the syntax matched.  Anything a rule works out for itself belongs in `match.data`.
 */
export type MatchGroups = Record<string, Match | Match[] | undefined>

/**
 * A `Match` from ANY rule, whatever its `groups` / `data` -- use for parameters which don't care about either,
 * e.g. AST node constructors.
 * - Needed because bare `P.Match` means "default groups":  a typed match is assignable to it, but inside a
 *   GENERIC rule class TypeScript can't prove that for the still-unresolved `P.MatchFor<this>`.
 */
export type AnyMatch = Match<P.AnyGroups>

/**
 * Result of a successful `rule.parse()`.
 * This is a flyweight object which links a rule with the tokens that it successfully matched.
 * - `match.rule`     - (required) Immutable `Rule` instance that was matched.
 * - `match.tokens`   - (required) Array of `Tokens` that were matched.
 * - `match.matched`  - (required) Array of `Matches` or `Tokens` matched.
 */
export class Match<
  // NOTE: constraint deliberately looser than the default -- see `P.AnyGroups`.
  Groups extends P.AnyGroups = MatchGroups,
  MatchData extends P.AnyMatchData = P.AnyMatchData
> extends Assertable {
  /** Set `false` to skip constructor `assertType`/`assertArrayType` checks, e.g. for production perf. */
  static DEBUG_MATCH_INITIALIZATION = true

  /** Main rule that matched. */
  declare rule: P.Rule
  /** Raw input tokens that were matched. */
  declare tokens: P.Token[]
  /** Things what were matched, which may be `Matches` or `Tokens`. */
  // TODO: can we get `tokens` out of here?
  declare matched: (Match | P.Token)[]
  /** Significant sub-matches, e.g. the repeated items of a `Repeat` (not including delimiters). */
  declare items: Match[]
  /** Scope in which the match was made. */
  declare scope: P.Scope
  /** Argument for this match. */
  declare matchGroup: string | undefined
  /** Raw input text that was matched, not including trailing whitespace. */
  declare raw: string | undefined
  /** Value of the match. For a `Pattern`, this will be `match.raw` run through `VALUE_MAP`. */
  declare value: any
  /** Message for this match. */
  // REFACTOR: errorMessage?
  declare message: string | undefined
  /** Name of the `Choice` rule which selected this match, if any. */
  declare choiceRule: string | undefined
  /**
   * Priority this match competes with in a `Choice`, when not its rule's -- see `Choice.getBestMatch()`.
   * - e.g. a statement its rule refused (spell's `SpellStatement.refuse()`):  the refusing rule's priority, so its
   *   error beats a plainer rule which merely fits the same words.
   */
  declare priority: number | undefined

  /**
   * Create from `props` (plumbing fields set directly onto `this`).
   * - Asserts `scope`/`rule`/`tokens` types unless `DEBUG_MATCH_INITIALIZATION` is off.
   */
  constructor(props: MatchProps) {
    super()
    Object.assign(this, props)

    // Only run tests if flag is set
    if (Match.DEBUG_MATCH_INITIALIZATION) {
      this.assertType("scope", P.Scope)
      this.assertType("rule", P.Rule)
      this.assertArrayType("tokens", P.Token)
    }
  }

  /** `name` for this match ~== explicit `matchGroup` set on creation, else `rule.matchGroup`, else `rule.name`. */
  get name(): string | undefined {
    return this.matchGroup || this.rule.matchGroup || this.rule.name
  }

  /** `name` for our rule, using `rule.constructor.name` for anonymous rules. */
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

  /** Start line number in the source stream. */
  get line(): number | undefined {
    return this.tokens[0]?.line
  }

  /** Start char number within our `line` in the source stream. */
  get char(): number | undefined {
    return this.tokens[0]?.ch
  }

  /** Character offset of start position in the source stream. */
  get start(): number | undefined {
    return this.tokens[0]?.start
  }

  /**
   * Character offset just past the last character of matched TEXT, NOT including trailing whitespace.
   * - Use `end` for anything a user sees as a range, e.g. an editor underline.
   * - Use `next` for "where does the next token start", e.g. `matchForOffset()`.
   * - Works from the last of every token in `tokens`, nested ones included,
   *   so a `LineToken` / `BlockToken` gives its last real token's end, not its newline.
   */
  get end(): number | undefined {
    let end: number | undefined
    P.Tokenizer.forEachToken(this.tokens, (token) => {
      if (token instanceof P.LineToken || token instanceof P.BlockToken || token instanceof P.WhitespaceToken) return
      if (end === undefined || token.end > end) end = token.end
    })
    return end
  }

  /** Character offset where whatever follows us starts:  `end` plus trailing whitespace. */
  get next(): number | undefined {
    const { start, inputText } = this
    return start === undefined ? undefined : start + inputText.length
  }

  /**
   * Return our `matched` which encompasses `offset`.
   * Returns `undefined` if nothing works.
   */
  matchForOffset(offset: number) {
    return this.matched.find((match) => {
      if (!(match instanceof Match)) return false
      const { start, next } = match
      return start !== undefined && start <= offset && next !== undefined && next > offset
    }) as Match | undefined
  }

  /**
   * Return stack of our `matched` which encompasses `offset`, with us first.
   * Returns empty array if `offset` is not within us.
   */
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
  // ## Rule-specific data
  ////////////////////

  /**
   * Facts our `rule` stashed on this match while parsing / mutating scope, e.g. `match.data.constant`.
   * - Rules are immutable, so per-parse state MUST live here rather than on the rule.
   * - Shape is declared by rule's `MatchData` type argument -- use `match.is(rule)` to narrow someone else's match.
   * - Created lazily so matches which stash nothing stay small.
   */
  get data(): MatchData {
    // HOT: identifier / constant / type rules stash on EVERY candidate match, so plain field rather than
    // `derived()`, which costs a `defineProperty()` and two extra objects per match (~3% of parse time).
    return (this._data ??= {} as MatchData)
  }
  /** Backing field for `data`.  `declare`d so matches which stash nothing don't even carry the slot. */
  declare private _data: MatchData | undefined

  /**
   * New match with our plumbing fields plus a shallow copy of `data`, changed by `overrides`.
   * - Memoized `groups` / `nestedScope` / `AST` are NOT copied:  the clone works them out afresh,
   *   e.g. a fresh nested scope for re-parsing a statement's body -- see `BlockLine.reparseBody()`.
   */
  clone(overrides: Partial<MatchProps> = {}): Match<Groups, MatchData> {
    const { scope, rule, tokens, matched, items, matchGroup, raw, value, message, choiceRule, priority } = this
    const clone = new Match<Groups, MatchData>({
      ...{ scope, rule, tokens, matched, items, matchGroup, raw, value, message, choiceRule, priority },
      ...overrides
    })
    if (this._data) clone._data = { ...this._data }
    return clone
  }

  /**
   * Was this match produced by (a subclass of) `ruleConstructor`?
   * - Type guard:  narrows `groups` and `data` to the shapes declared by that rule, and `rule` to that class,
   *   so you can call its methods:  `if (match.is(some_rule)) match.rule.someMethod(match)`.
   */
  is<RuleType extends P.RuleTypeArgs>(
    ruleConstructor: AbstractClass<RuleType>
  ): this is P.MatchFor<RuleType> & { rule: RuleType } {
    return this.rule instanceof ruleConstructor
  }

  ////////////////////
  // ## Datatype
  ////////////////////

  /**
   * What we ARE, in spell's words, e.g. `text`, `list of cards`, `Card` -- `undefined` if unknown.
   * - Memoized `rule.getDatatype()`, worked out the first time someone asks:  most matches are never asked.
   * - Rules which need a scope lookup for it do that WHILE PARSING, into `data` -- see `P.Rule.getDatatype()`.
   */
  get datatype(): P.Datatype | undefined {
    // NOTE: memoize "unknown" as `null`:  `?? undefined` here would ask `getDatatype()` again on every read
    if (this._datatype === undefined) this._datatype = this.rule.getDatatype(this) ?? null
    return this._datatype ?? undefined
  }
  /**
   * Memo for `datatype`:
   * - `undefined`:  not worked out yet
   * - `null`:  worked out, and unknown
   */
  declare private _datatype: P.Datatype | null | undefined

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
   * Add additional `match` to this match and our `groups`.
   * - `matchGroup` is optional group name for the match.
   * - Use this to, e.g., add a comment or error to an existing `match`.
   * - Makes sure length and tokens are updated, groups are updated, etc.
   */
  addMatch(match: Match, matchGroup: string | undefined) {
    if (match === undefined) {
      console.warn("addMatch() called with undefined match", { match, matchGroup })
      return
    }
    // get groups BEFORE adding the match (we'll add at the end)
    const { groups } = this

    if (matchGroup) match.matchGroup = matchGroup
    this.matched.push(match)
    this.tokens.push(...match.tokens)

    // Add the match to existing groups
    if (groups) this.addMatchedToGroups(groups, [match])
  }

  /**
   * Merge `matched` items into `groups`, keyed by each match's `name`.
   * - Repeated name becomes an array of matches.
   * - Anonymous `P.Sequence` matches are promoted: their own `matched` items are merged in directly
   *   instead of the sequence itself.
   * - `callback`, if given, transforms each match before it's stored (e.g. to derive a plain value).
   */
  addMatchedToGroups<G extends Record<string, unknown>>(
    groups: G,
    matched: Array<AnyMatch | P.Token>,
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
      else if (match.rule instanceof P.Sequence) {
        this.addMatchedToGroups(groups, match.matched, callback)
      }
    }
    return groups
  }

  ////////////////////
  // ## Scopes
  ////////////////////

  /**
   * Return `scope` to use to parse "nested" contents of the match.
   * - By default, we just return the `match.scope`, but some rules may derive a new scope.
   * - For example, matching a method signature will define a nested `MethodScope` to compile the method
   *   body, which includes the method arguments.
   * - NOTE: always use `match.nestedScope` to access so we re-use the scope object.
   */
  get nestedScope() {
    return this.derived("nestedScope", () => this.rule.getNestedScopeForMatch(this))
  }

  /** Array of `scopes`, walking `parentScope` chain, with our scope first. */
  get scopes() {
    const scopes = []
    let scope: P.Scope | undefined = this.scope
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
  getScopeOfType(scopeConstructor: P.ScopeConstructor) {
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
  get AST(): P.ASTNode | undefined {
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

  /** DEBUG: Call this when printing to the console to eliminate the big bits in node. */
  toPrint() {
    if (!isNode) return this
    return {
      rule: this.rule.name,
      ...omit(this, ["rule", "scope"])
    }
  }

  /** DEBUG: convert to JSON. */
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

/** Constructor props for `Match`. */
export type MatchProps = {
  /** Scope in which the match was made. */
  scope: P.Scope
  /** Main rule that matched. */
  rule: P.Rule
  /** Raw input tokens that were matched. */
  tokens: P.Token[]
  /** Things what were matched, which may be `Matches` or `Tokens`. */
  matched: (Match | P.Token)[]
  /** Significant sub-matches, e.g. the repeated items of a `Repeat` (not including delimiters). */
  items?: Match[]
  /** Argument for this match. */
  matchGroup?: string
  /** Raw input text that was matched, not including trailing whitespace. */
  raw?: string
  /** Value of the match. For a `Pattern`, this will be `match.raw` run through `VALUE_MAP`. */
  value?: any
  /** Message for this match. */
  message?: string
  /** Name of the `Choice` rule which selected this match, if any. */
  choiceRule?: string
  /** Priority this match competes with in a `Choice`, when not its rule's -- see `Match.priority`. */
  priority?: number
}
