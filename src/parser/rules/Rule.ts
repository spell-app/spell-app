//  # Parser Rules
//

import { Derivative } from "~/util/Derivative"
import { proto } from "~/util/decorators"
import { P } from "~/parser"

/**
 * # Rule base class
 * Rules can be as simple as a string `Keyword` or a complex sequence of recursive rules.
 *
 *  Parse a rule with `rule.parse(scope, tokens)`.
 *  - If **successful**, it will return a new `Match()` object.
 *  - If **unsuccessful**, it will return `undefined`
 *
 * The `match` object links the tokens actually matched with the matched rule, and has properties:
 *    - `match.rule`        : pointer back to the matched rule.
 *    - `match.scope`       : the scope in which the rule was matched.
 *    - `match.matched`     : array of *significant* tokens that were actually matched.
 *    - `match.tokens`      : array of all tokens that were consumed.
 *    - `match.value`       : the "value" of the match, which is rule-specific.
 *    - `match.groups`      : named sub-matches, typed by rule's `Groups` type argument.
 *    - `match.data`        : whatever rule stashed while parsing, typed by rule's `MatchData` type argument.
 *
 *  To output the result of a match, use `match.compile()` which calls `rule.compile()`
 *  to actually generate the output.
 *
 * ## Ways to make a rule
 *
 * ### 1. Named rule for a language ~== a class, registered with a parser  (the normal way)
 * ```ts
 * export class define_property_has extends SpellStatement<
 *   "type|property|specifier?",                  // `Groups`:  see `P.GroupsFor`, copy from module's `__snapshots__`
 *   { ruleComment?: P.ASTParserAnnotation }      // `MatchData`:  what we stash in `match.data`
 * > {
 *   @proto static alias = "statement"
 *   @proto static precedence = 10
 *   @proto static syntax = ["(a|an) {type} has {property} {specifier}?", "{type} have {property} {specifier}?"]
 *   @proto static testRule = "…(has|have)"
 *   static tests = [...]
 *   getAST(match: P.MatchFor<this>) {...}
 * }
 * parser.addRule(define_property_has)             // or `new Parser({ rules: [define_property_has, ...] })`
 * ```
 * - Class name IS the rule name;  `static ruleName = "if"` for reserved words (`class _if`).
 * - `@proto static` puts value on the PROTOTYPE:  inherited by subclasses and visible in our constructor,
 *   which plain instance fields are not.  Forgetting `@proto` throws at registration.
 * - `ruleName`, `tests`, `skip` are plain statics, NOT inherited.
 * - `parser.addRule()` calls `instantiate()`:  one frozen instance per `syntax` variant.
 *
 * ### 2. Leaf rules take their structure the same way
 * ```ts
 * class color extends P.Keyword { @proto static literal = ["red", "green"] }
 * class number_word extends P.Pattern { @proto static pattern = /^\d+$/ }
 * class word extends P.TokenType { @proto static tokenType = P.WordToken }
 * class yes_no extends P.Literal { @proto static syntax = "(yes|no)" }
 * ```
 *
 * ### 3. Rule added WHILE PARSING ~== a closure class, added to scope
 * ```ts
 * match.scope.rules?.add(
 *   class card_suits extends P.Keywords {
 *     static ruleName = `${typeName}_${groupName}`   // computed name
 *     @proto static alias = "expression"
 *     @proto static literals = literals                // closes over current match
 *     getAST(match: P.MatchFor<this>) {...}
 *   }
 * )
 * ```
 *
 * ### 4. Anonymous building blocks ~== plain `new`
 * ```ts
 * new P.Keyword("give")
 * new P.Subrule({ rule: "expression", matchGroup: "thing", optional: true })
 * new P.Sequence(new P.Keyword("give"), new P.Subrule("thing"))
 * ```
 * - No `name`, so they stay out of `match.groups` unless given a `matchGroup`.  Not frozen unless they end up
 *   inside a registered rule.  This is what rulex makes from a `syntax` string, and how rulex defines itself.
 *
 * ### 5. From rulex syntax directly
 * ```ts
 * P.Rule.compileSyntax("give {thing:expression} (to {recipient})?")   // anonymous, as in 4
 * new give_statement()                                                   // class with single `syntax`, unregistered
 * ```
 */
export abstract class Rule<
  Props extends RuleProps = RuleProps,
  Groups extends string | P.AnyGroups = P.AnyGroups,
  MatchData extends P.AnyMatchData = P.AnyMatchData
> extends Derivative {
  ////////////////
  // ## Construction
  ////////////////

  /**
   * Assign `props` directly onto `this` -- subclasses may normalize `props` before calling `super()`.
   * - Class-level definition (`@proto static ...`) is already visible here, through our prototype.
   * - String `testRule` is compiled with rulex.
   * - SIDE EFFECT: given `syntax` but no structure, decomposes it right here -- see `initFromSyntax()`.
   * - HOT: rules are constructed while parsing too (group clones, dynamic rules) -- keep this cheap.
   */
  constructor(props?: Props) {
    super()
    if (props) Object.assign(this, props)
    const { testRule, syntax } = this as { testRule?: Rule | string; syntax?: unknown }
    if (typeof testRule === "string") this.testRule = Rule.compileSyntax(testRule, this)
    if (typeof syntax === "string" && !this.hasStructure) this.initFromSyntax(syntax)
  }

  /**
   * Create rule instance(s) from class-level definition:  one per `syntax` variant, else exactly one.
   * - Why this exists rather than plain `new`:
   *   - a constructor can only return ONE instance, `syntax` variants need several
   *   - rule name comes from the CLASS here, `new` leaves rules anonymous on purpose (see `name`)
   *   - `freeze()` has to wait until subclass constructors are done, base constructor is too early
   * - `extraProps` are per-registration things only the caller knows, e.g. `module`.
   * - Only first variant carries `tests` so we don't run same tests repeatedly.
   * - Throws if definition is unusable, e.g. anonymous class with no `ruleName`, or forgotten `@proto`.
   */
  static instantiate(extraProps?: RuleProps): Rule[] {
    if (Object.hasOwn(this, "skip") && this.skip) return []
    const name = (Object.hasOwn(this, "ruleName") && this.ruleName) || this.name
    if (!name) {
      throw new P.ParserError({
        message: "Rule class must have a name or `static ruleName`.",
        context: this,
        activity: "instantiate"
      })
    }
    // Any own static data field which never reached our prototype is a forgotten `@proto`.
    // NOTE: `ALL_CAPS` statics are taken to be constants / lookup tables, e.g. `SpellType.SIMPLE_TYPES`.
    const forgotten = Object.keys(this).filter(
      (key) => !PLAIN_STATICS.includes(key) && !/^[A-Z][A-Z0-9_]*$/.test(key) && !(key in this.prototype)
    )
    if (forgotten.length) {
      throw new P.ParserError({
        message: `Rule '${name}': use '@proto static ${forgotten[0]}' -- plain 'static' never reaches rule instances.`,
        context: this,
        activity: "instantiate",
        params: { forgotten }
      })
    }
    const { syntax } = this.prototype as { syntax?: string | Array<string | P.RuleSyntaxVariant> }
    const variants: P.RuleSyntaxVariant[] =
      syntax === undefined
        ? [{}]
        : (Array.isArray(syntax) ? syntax : [syntax]).map((it) => (typeof it === "string" ? { syntax: it } : it))
    const tests = Object.hasOwn(this, "tests") ? this.tests : undefined
    const constructor = this as unknown as new (props: RuleProps) => Rule
    return variants.map((variant, index) => {
      const props: RuleProps = { ...extraProps, name, ...variant }
      if (index === 0 && tests) props.tests = tests
      return new constructor(props).freeze()
    })
  }

  /**
   * Decompose rulex `syntax` into our structural props, e.g. `rules` for a `Sequence`.
   * - `Sequence` subclass whose syntax compiles to a single non-sequence rule wraps it as `rules: [rule]`.
   * - Otherwise compiled rule must share a concrete base class with us, e.g. `"(a|b)"` compiles to `Keyword`
   *   which is fine for any `Literal` -- throws if not, as its props would be meaningless to us.
   * - Flags from syntax (`matchGroup`, `optional`, `testLocation`) come along, explicit props win.
   */
  protected initFromSyntax(syntax: string) {
    const compiled = Rule.compileSyntax(syntax, this)
    if (this instanceof P.Sequence && !(compiled instanceof P.Sequence)) {
      Object.assign(this, { rules: [compiled] })
      return
    }
    let base = compiled.constructor
    while (base !== Rule && !(this instanceof base)) base = Object.getPrototypeOf(base)
    if (base === Rule) {
      throw new P.ParserError({
        message: `Syntax '${syntax}' compiles to a ${compiled.constructor.name}, which ${this.constructor.name} does not extend.`,
        context: this,
        activity: "initFromSyntax",
        params: { syntax, compiled }
      })
    }
    // oxlint-disable-next-line typescript/no-misused-spread
    const structure: Record<string, unknown> = { ...compiled }
    for (const key of Object.keys(structure)) {
      if ((this as Record<string, unknown>)[key] !== undefined) delete structure[key]
    }
    Object.assign(this, structure)
  }

  /** Have we got structural props already, from `props` or our prototype?  If so `syntax` is just a label. */
  protected get hasStructure(): boolean {
    return STRUCTURE_PROPS.some((key) => (this as Record<string, unknown>)[key] !== undefined)
  }

  /**
   * Compile rulex `syntax` to a rule, remembering `syntax` on the result.
   * - Throws if rulex parser is not installed -- it's opt-in, see `Parser.rulexParser`.
   */
  static compileSyntax(syntax: string, context?: unknown): Rule {
    const { rulexParser } = P.Parser
    if (!rulexParser) {
      throw new TypeError(
        'Rulex parser is not installed.  Use `import "~/languages/rulex"` to import it and try again.'
      )
    }
    const compiled = rulexParser.compile(syntax)
    if (!compiled) {
      throw new P.ParserError({
        message: `Didn't get a rule from rulex.compile('${syntax}')`,
        context,
        activity: "compileSyntax",
        params: { syntax }
      })
    }
    // Rulex builds fresh rules on every compile, so this is ours to label.
    // NOTE: no `isFrozen` guard on purpose -- if rulex ever hands back a shared frozen rule, throw rather than skip.
    compiled.syntax = syntax
    return compiled
  }

  /**
   * Make this rule (and rules nested inside it) immutable, returning `this`.
   * - Rules are shared by every parse, so per-parse state MUST go in `match.data`, NEVER on the rule.
   * - NOTE: `Group`s are the exception -- parser-owned containers, cloned before `addChoice()`.
   */
  freeze(): this {
    if (Object.isFrozen(this)) return this
    for (const value of Object.values(this)) {
      if (value instanceof Rule) value.freeze()
      else if (Array.isArray(value) && value.length && value.every((it) => it instanceof Rule)) {
        value.forEach((it: Rule) => it.freeze())
        Object.freeze(value)
      }
    }
    return Object.freeze(this)
  }

  ////////////////
  // ## Class-level definition -- declare in subclasses as `@proto static`, except as noted
  ////////////////

  /**
   * Name to register rule under, if class name won't do.  Plain `static`, NOT inherited.
   * - Defaults to class name, e.g. `class define_property_has` => `"define_property_has"`.
   * - Set explicitly for reserved words (`class _if` => `"if"`) or dynamically-named rules.
   */
  static ruleName?: string
  /** Tests for this rule.  Plain `static`, NOT inherited, or we'd re-run them for each subclass. */
  static tests?: P.RuleTests
  /** Set `true` to skip registering this rule, e.g. if it's not working.  Plain `static`, NOT inherited. */
  static skip?: boolean

  /** Name aliases -- inherited, so e.g. a `Statement` base class can set `"statement"` once. */
  static alias?: string | string[]
  /** Precedence.  Default lives on prototype, so only rules with non-default precedence carry their own. */
  @proto static precedence?: number = 0
  /** Datatype. */
  static datatype?: string
  /** Description. */
  static description?: string
  /**
   * Rulex syntax string(s), decomposed into `rules` etc. at construction.
   * - Array => one rule instance per variant, all registered under same name -- see `instantiate()`.
   * - Variant may be `{ syntax, testRule }` to give it its own quick test.
   */
  static syntax?: string | Array<string | P.RuleSyntaxVariant>
  /** Quick test rule, as `Rule` or rulex syntax string. */
  static testRule?: Rule | string

  ////////////////
  // ## Identity -- what this rule is called and where it came from
  ////////////////

  /**
   * Rule name, must be unique if defined.
   * - NOTE: no fallback to class name -- anonymous rules (e.g. `new P.Keyword("a")`) MUST stay nameless
   *   or they'd show up in `match.groups`.  `instantiate()` passes class name explicitly.
   */
  declare name: string | undefined
  /** Name aliases -- indicates this rules works a part of collections such as `expression` or `statement`. */
  declare alias: string | string[] | undefined
  /** Name of parser module this rule was defined in. */
  declare module: string | undefined
  /** Description of this rule. */
  declare description: string | undefined
  /** Datatype which rule result represents, e.g. `string`, `number`, custom type. */
  declare datatype: string | undefined

  /** Return array of `names` for this rule:  its `.name` + any `.alias`es. */
  get names() {
    let { alias = [] } = this
    if (typeof alias === "string") alias = [alias]
    return [this.name, ...alias].filter((it) => it !== undefined)
  }

  ////////////////
  // ## Definition -- what this rule was made from
  ////////////////

  /** Rulex syntax string used to define this rule (this instance's variant, if class has several). */
  declare syntax: string | string[] | undefined
  /** Tests for this rule. */
  declare tests: P.RuleTests | undefined

  ////////////////
  // ## Matching behavior
  ////////////////

  /** Precedence of this rule, used to distinguish between ambiguous matches.  Default = 0, from prototype. */
  declare precedence: number
  /** Test rule to use to quickly determine if this rule can be matched. */
  declare testRule: Rule | undefined
  /** Test location to use to determine if this rule can be matched. */
  declare testLocation: P.TestLocation | undefined
  /** Name our match goes under in containing rule's `match.groups`, e.g. `thing` for `{thing:expression}`. */
  declare matchGroup: string | undefined
  /** Whether this rule is optional. */
  declare optional: boolean | undefined
  /** Whether this rule is left-recursive (e.g. `{expression} + {expression}`). */
  declare isLeftRecursive: boolean | undefined

  ////////////////
  // ## Type arguments -- type-only, nothing here exists at runtime
  ////////////////

  /**
   * TYPE-ONLY: our `Groups` type argument, resolved to the object shape of `match.groups` -- see `P.GroupsFor`.
   * - `declare` emits no code:  this property does NOT exist at runtime, NEVER read it.
   * - Why:  TypeScript can't ask a class what type arguments it was given, only what members it has.
   *   Re-publishing them as members is what lets `P.MatchFor<this>` and `match.is(rule)` recover them.
   */
  declare readonly Groups: P.ResolveGroups<Groups>
  /** TYPE-ONLY: our `MatchData` type argument, shape of `match.data`.  Does NOT exist at runtime -- see `Groups`. */
  declare readonly MatchData: MatchData

  ////////////////
  // ## Parsing methods -- implement these in your subclasses!
  ////////////////

  /**
   * Attempt to match this rule at the start of `tokens`.
   * - If successful, returns a `Match` object which you can use to `compile()` the results.
   * - If unsuccessful, returns `undefined`.
   */
  abstract parse(scope: P.Scope, tokens: P.Token[]): P.Match | undefined

  /**
   * Output for this rule passed a successful `match` generated by it.
   * You may want to look at `match.matched` or `match.results`, etc.
   * - Language parsers generally return javascript source as a string.
   * - Other parsers (e.g. `rulex`) return arbitrary values, e.g. `Rule` instances.
   */
  abstract compile(match: P.MatchFor<this>): unknown

  /**
   * Some parsers compile by generating an "Abstract Syntax Tree" (AST) first,
   * then calling `ast.compile()`.
   *
   * If you implement this, return an `ASTNode` object (or `undefined` if the match yields no output).
   */
  getAST?(match: P.MatchFor<this>): P.ASTNode | undefined

  ////////////////
  // ## Quick testing methods
  ////////////////

  /**
   * Test to see if this rule is matched in `tokens`.
   *
   * You shouldn't override this, override `testAtStart()` instead,
   * or just provide a `testRule`.
   *
   * - By default, we respect our `testLocation` parameter to test
   *   either at the beginning of the tokens or anywhere in the run.
   * - Pass in specific `testLocation` to override the `testLocation` at runtime.
   */
  test(scope: P.Scope, tokens: P.Token[], testLocation = this.testLocation): boolean | undefined {
    if (!tokens.length) return false
    if (this.testRule) return this.testRule.test(scope, tokens, testLocation)

    if (testLocation === P.TestLocation.ANYWHERE) return this.testAnywhere(scope, tokens)
    return this.testAtStart(scope, tokens, 0)
  }

  /**
   * Test to see if there is ANY WAY that we can be found
   * starting at `start` position of `tokens`.
   *
   * This is used to exit quickly if there is no chance of success,
   * and is especially useful for rules which call themselves recursively.
   *
   * Returns:
   *  - `true` if the rule MIGHT be matched.
   *  - `false` if there is NO WAY the rule can be matched.
   *  - `undefined` if not determinstic (eg: no way to tell quickly).
   */
  testAtStart(scope: P.Scope, tokens: P.Token[], start = 0): boolean | undefined {
    if (start >= tokens.length) return false
    if (this.testRule) return this.testRule.testAtStart(scope, tokens, start)
    return undefined
  }

  /**
   * Test if this rule is matched anywhere in the tokens
   * by exhaustively testing at each start position.
   *
   * - This might be less efficient than just trying to match the rule itself!
   */
  testAnywhere(scope: P.Scope, tokens: P.Token[]): boolean | undefined {
    let undefinedFound = false
    for (let start = 0, last = tokens.length; start < last; start++) {
      const result = this.testAtStart(scope, tokens, start)
      if (result) return true
      if (result === undefined) undefinedFound = true
    }
    if (undefinedFound) return undefined
    return false
  }

  ////////////////
  // ## Match groups & scopes
  ////////////////

  /**
   * Return match `groups` for this match.
   * - Some rules derive additional groups based on analysis of "normal" groups.
   * - NOTE: always use `match.groups` to access so we re-use the same `groups` object.
   */
  getGroupsForMatch(match: P.MatchFor<this>): Record<string, unknown> {
    return match.addMatchedToGroups<P.MatchGroups>({}, [match])
  }

  /**
   * `P.GroupsFor` spec for groups our `syntax` will produce, e.g. `"type|property|specifier?"`.
   * - Use to write / check `Groups` type argument -- type args are erased, this is computed from real structure.
   * - Only knows what default `getGroupsForMatch()` does -- groups derived in an override are NOT included.
   * - One instance ~== one `syntax` variant:  use `P.mergeGroupSpecs()` to combine variants.
   */
  get groupSpec(): string {
    return P.stringifyGroupSpec(this.getGroupSpecEntries())
  }

  /**
   * Entries for `groupSpec`.  Default (leaf rule) is none -- override in rules which contain other rules.
   * - NOTE: technically a leaf's groups are `{ [name]: match }`, but nobody reads those.
   */
  getGroupSpecEntries(): P.GroupSpecEntry[] {
    return []
  }

  /**
   * Entries we add to the `groupSpec` of a rule which CONTAINS us, mirroring `match.addMatchedToGroups()`.
   * - Named (by `matchGroup`, else `name`) => one entry, otherwise nothing.
   * - Override where an anonymous match is promoted / replaced, e.g. `Sequence`, `Choice`, `Subrule`.
   */
  getGroupSpecContribution(): P.GroupSpecEntry[] {
    const name = this.matchGroup || this.name
    return name ? [{ name, optional: !!this.optional, array: false }] : []
  }

  /**
   * Return `scope` to use to parse "nested" contents of the match,
   * - By default, we just return the `match.scope`, but some rules may derive a new scope.
   * - For example, matching a method signature will define a nested MethodScope to compile the method body
   *   which includes the method arguments.
   * - NOTE: always use `match.nestedScope` to access so we re-use the scope object.
   */
  getNestedScopeForMatch(match: P.MatchFor<this>): P.Scope {
    return match.scope
  }

  /**
   * Mutate `match.scope` based on the semantics for this rule..
   * - By default, we don't change anything, but some rules
   *   may add new variables, methods, rules, etc. to the scope.
   */
  mutateScope(match: P.MatchFor<this>) {}

  ////////////////
  // ## Rulex syntax
  ////////////////

  /**
   * We attempt to merge literals or sequences together when creating rules.
   * We can only do that for rules that are not "adorned" with matchGroup, etc.
   * - Note that `optional` doesn't matter in this case, because we can merge
   *   optional and non-optional rules.
   * - DEPRECATED
   */
  get isAdorned() {
    return !!(this.matchGroup || this.testLocation)
  }

  /** Return rulex string for this rule. */
  toRulexSyntax(): string {
    return ""
  }

  /** Return rulex syntax strings for rule flags. */
  getRulexFlags(): P.SyntaxFlags {
    const { testLocation, matchGroup, optional } = this
    return {
      testLocation:
        testLocation === P.TestLocation.ANYWHERE ? "…" : testLocation === P.TestLocation.AT_START ? "^" : "",
      matchGroup: matchGroup ? ":" : "",
      optional: optional ? "?" : ""
    }
  }
}

/** Props bag accepted by `Rule`'s constructor -- mirrors `Rule`'s own properties, see there for details. */
export type RuleProps = {
  /** Name of source file this rule was defined in. */
  module?: string
  /** Rule name, must be unique if defined. */
  name?: string
  /** Description of this rule. */
  description?: string
  /** Name aliases -- indicates this rules works a part of collections such as `expression` or `statement`. */
  alias?: string | string[]
  /** Datatype which rule result represents, e.g. `string`, `number`, custom type. */
  datatype?: string
  /** Rulex syntax string(s) used to define this rule. */
  syntax?: string | string[]
  /** Precedence of this rule, used to distinguish between ambiguous matches.  Default = 0. */
  precedence?: number
  /** Test rule to use to quickly determine if this rule can be matched, as rule or rulex syntax. */
  testRule?: Rule | string
  /** Test location to use to determine if this rule can be matched. */
  testLocation?: P.TestLocation
  /** Tests for this rule. */
  tests?: P.RuleTests
  /** Name our match goes under in containing rule's `match.groups`. */
  matchGroup?: string
  /** Whether this rule is optional. */
  optional?: boolean
  /** Whether literal must be escaped when converting to rulex syntax -- see `Literal.isEscaped`. */
  isEscaped?: boolean
  /** Whether this rule is left-recursive (e.g. `{expression} + {expression}`). */
  isLeftRecursive?: boolean
}

/**
 * Props which rulex `syntax` decomposes into.
 * - If any are present in constructor `props`, rule was already decomposed, so we leave `syntax` alone.
 */
const STRUCTURE_PROPS = ["rules", "rule", "literal", "literals"]

/**
 * Statics which are MEANT to be plain -- every other static data field on a rule class must be `@proto static`.
 * - `instantiate()` throws otherwise, because a forgotten decorator means a rule which
 *   silently ignores its own definition.
 */
const PLAIN_STATICS = ["ruleName", "tests", "skip"]
