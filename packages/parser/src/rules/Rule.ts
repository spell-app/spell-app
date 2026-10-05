//  # Parser Rules
//

import { proto } from "$/util"
import { Derivative } from "$/util/spell/Derivative"
import { P } from "$/parser"

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
 * ### 1. Named rule for a language ~== a class, registered with a parser along with `syntax` + `tests`  (the normal way)
 * ```ts
 * export class define_property_has extends SpellStatement<
 *   "type|property|specifier?",                  // `Groups`:  see `P.GroupsFor`, copy from module's `__snapshots__`
 *   { bits?: PropertyBits }                        // `MatchData`:  what we stash in `match.data`
 * > {
 *   @proto static priority = 10                  // the class says what the rule IS...
 *   @proto static declares = {...}
 *   getAST(match: P.MatchFor<this>) {...}        // ...and how it behaves
 * }
 * classes.addRule(define_property_has, {         // ...registering says how it's WRITTEN in this language
 *   syntax: "(a|an) {type} has {property} {specifier}?",
 *   tests: [...]                                 // tests for THIS syntax
 * })
 * classes.addRule(define_property_has, {         // another way to write it:  register again
 *   syntax: "{type} have {property} {specifier}?",
 *   tests: [...]
 * })
 * ```
 * - Why only `syntax` + `tests` at registration:  the class can then be reused by another language's parser.
 * - `@proto static` values are inherited by subclasses;  `@proto` rejects a prop the rule doesn't declare.
 * - Class name IS the rule name;  plain `static ruleName = "if"` for reserved words (`class _if`).
 * - `priority` picks between rules matching the SAME words -- see `Choice.getBestMatch()`:
 *   a `Choice` takes the highest priority, then the longest match, then the earliest rule.
 *   - NOT how tightly an operator binds:  that's spell's operator `precedence`, read only by its expression loop.
 * - Several syntaxes => register the class once per syntax, each with its own `tests`.  Instances merge into
 *   a `P.Group` under the rule's name.
 * - A `Sequence` tests its own words / symbols before parsing any subrule, e.g. `remove {thing} from {list}`
 *   needs `remove`, then `from` somewhere later -- see `Sequence.test()`.  Override `test()` to do better.
 * - `syntax`, `tests` and `ruleName` are NOT inherited -- share syntax with a `const` (see `variables.ts`).
 * - What EVERY rule of a base class has in common can go in that base's CONSTRUCTOR, as defaults:
 *   `constructor(props?: Partial<P.PatternProps>) { super({ pattern, blacklist, ...props }) }`.
 * - A definition MAY still carry any prop, winning over the class -- `P.Parser.addRule()` accepts them all.
 *   `scope.addRule()` and `SpellParser.addRule()` narrow it to `P.SyntaxAndTests`, so spell's rule modules
 *   and rules built while parsing can't.
 *
 * ### 2. Leaf rules take their structure the same way
 * ```ts
 * class color extends P.Keyword {}
 * parser.addRule(color, { literal: ["red", "green"] })
 * parser.addRule(class number_word extends P.Pattern {}, { pattern: /^\d+$/ })
 * parser.addRule(class word extends P.TokenType {}, { tokenType: P.WordToken })
 * ```
 *
 * ### 3. Rule added WHILE PARSING ~== a named class `specialize()`d with plain data, registered on the scope
 * ```ts
 * export class QuotedPropertyRule extends InfixOperatorSuffix {  // behaviour reads ONLY statics...
 *   compileASTExpression(match, ...) { ... this.methodName ... }
 * }
 * match.scope.addRule(
 *   QuotedPropertyRule.specialize({ output: "is_a_$suit", values }),
 *   { syntax },                                      // ...so another project can rebuild it from data
 *   match
 * )
 * ```
 * - See `specialize()`, and `SP.SpellDeclarations` for how a project writes these out.
 * - `scope.addRule()` registers on the scope's `parser` AND records the class + definition on the scope
 *   (`scope.rules`, a `P.ScopeRule` list), so the scope can later hand on what it created -- that pair is
 *   what re-registering somewhere else needs.  A built rule is frozen and already bound to its name.
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
   * - SIDE EFFECT: given `syntax` but no structure, decomposes it right here -- see `initFromSyntax()`.
   * - HOT: rules are constructed while parsing too (group clones, dynamic rules) -- keep this cheap.
   */
  constructor(props?: Props) {
    super()
    if (props) Object.assign(this, props)
    const { syntax } = this as { syntax?: unknown }
    if (typeof syntax === "string" && !this.hasStructure) this.initFromSyntax(syntax)
  }

  /**
   * Create a frozen, named rule instance from class-level definition, or `undefined` if `skip`ped.
   * - Why this exists rather than plain `new`:
   *   - rule name comes from the CLASS here, `new` leaves rules anonymous on purpose (see `name`)
   *   - `freeze()` has to wait until subclass constructors are done, base constructor is too early
   * - `definition` is what `parser.addRule(RuleClass, definition)` was given -- normally just `syntax` + `tests`,
   *   anything else computed (see "Ways to make a rule" 3.) -- plus per-registration things only the caller
   *   knows, e.g. `module`.  Wins over class-level statics.
   * - Throws if definition is unusable, e.g.
   *   - anonymous class with no `ruleName`
   *   - plain `static` default that should be `@proto static`
   */
  static instantiate(definition: P.RuleDefinitionProps = {}): Rule | undefined {
    const {
      syntax = (this.prototype as { syntax?: P.RuleDefinitionProps["syntax"] }).syntax,
      skip,
      tests = Object.hasOwn(this, "tests") ? this.tests : undefined,
      ...extraProps
    } = definition
    if (skip || (Object.hasOwn(this, "skip") && this.skip)) return undefined
    const name = extraProps.name || (Object.hasOwn(this, "ruleName") && this.ruleName) || this.name
    if (!name) {
      throw new P.ParserError({
        message: "Rule class must have a name or `static ruleName`.",
        context: this,
        activity: "instantiate"
      })
    }
    // Any own static data field which never reached our prototype is a plain `static` default
    // that should be `@proto static` -- rule instances would never see it.
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
    const props = { ...extraProps, name } as RuleProps
    if (syntax !== undefined) props.syntax = syntax
    if (tests) props.tests = tests
    const constructor = this as unknown as new (props: RuleProps) => Rule
    return new constructor(props).freeze()
  }

  /**
   * Called by `@proto` as each `@proto static` is defined on us or a subclass -- see `packages/util/src/decorators.ts`.
   * - SIDE EFFECT: `@proto static importableAs = "<id>"` registers the class being defined under `<id>`.
   * - Throws if a DIFFERENT class already has that id.  The same class again, e.g. hot reload, replaces it.
   */
  static protoDefined(name: string | symbol, value: unknown) {
    if (name !== "importableAs" || typeof value !== "string") return
    const existing = Rule.IMPORTABLE_RULES.get(value)
    if (existing && existing.name !== this.name) {
      throw new P.ParserError({
        message: `Rules '${existing.name}' and '${this.name}' are both importable as '${value}'.`,
        context: this,
        activity: "protoDefined",
        params: { importableAs: value }
      })
    }
    Rule.IMPORTABLE_RULES.set(value, this as unknown as P.RuleClass)
  }

  /** Rule class importable as `name`, e.g. `"quoted_property"` => `QuotedPropertyRule` -- see `importableAs`. */
  static importableRule(name: string): P.RuleClass | undefined {
    return Rule.IMPORTABLE_RULES.get(name)
  }

  /**
   * Subclass of us carrying `statics` -- how a rule built WHILE PARSING says what it IS, as plain data.
   * - `ruleName` goes on the subclass as a plain static;  everything else on its prototype,
   *   exactly where `@proto static` would put it.
   * - Remembers where it came from (`specializedFrom`) and with what (`specializedWith`), so a project's
   *   declarations can write it out and rebuild it in another project -- see `SP.SpellDeclarations`.
   * - `statics` MUST be plain data (JSON-able) for that round trip:  behaviour lives in our methods.
   * - e.g. `Negatable.specialize({ ruleName: "is" })`
   * - An importable rule class may override this to take a MINIMAL set, working out the rest, e.g.
   *   `DynamicMethodRule.specialize({ output: "play_fizzbuzz" })`.  It calls `super.specialize(statics, declared)`
   *   with all of them -- `declared`, what IT was given, is what `specializedWith` remembers.
   */
  static specialize<T extends AbstractClass<Rule>>(
    this: T,
    statics: P.SpecializeWith<T>,
    declared: object = statics
  ): T {
    const { ruleName, ...protoStatics } = statics as P.RuleStatics
    const base = this as unknown as typeof Rule
    // `base` is always a concrete rule class -- typed as a plain constructor, since `Rule` itself is abstract
    const Base = base as unknown as new (props?: RuleProps) => object
    const specialized = class extends Base {} as unknown as typeof Rule
    // Named for what it is, e.g. in stack traces
    Object.defineProperty(specialized, "name", { value: ruleName ?? base.name })
    if (ruleName) specialized.ruleName = ruleName
    for (const [key, value] of Object.entries(protoStatics)) {
      Object.defineProperty(specialized.prototype, key, { value, writable: true, configurable: true })
    }
    specialized.specializedFrom = this as unknown as P.RuleClass
    specialized.specializedWith = declared as P.RuleStatics
    return specialized as unknown as T
  }

  /**
   * Props a rule `specialize()`d from us writes into the declaration of the statement which made it,
   * e.g. its `SPELL: DECLARES` comment -- see `SP.SpellDeclarations`.
   * - `declared`:  what `specialize()` was called with (`specializedWith`)
   * - `syntax`:  what it was registered with, if anything
   * - Default:  both, as is.  An importable class overrides this to tune what it writes, e.g. leave out a default.
   * - MUST round-trip:  loading hands `specialize()` back these props -- beside those of the other things
   *   the statement declared, e.g. its property's `of`.
   */
  static declarationProps(declared: Record<string, unknown>, syntax: string | undefined): Record<string, unknown> {
    return { ...declared, syntax }
  }

  /**
   * Decompose rulex `syntax` into our structural props, e.g. `rules` for a `Sequence`.
   * - `Sequence` subclass whose syntax compiles to a single non-sequence rule wraps it as `rules: [rule]`.
   * - Otherwise compiled rule must share a concrete base class with us, e.g. `"(a|b)"` compiles to `Keyword`
   *   which is fine for any `Literal` -- throws if not, as its props would be meaningless to us.
   * - Flags from syntax (`matchGroup`, `optional`) come along, explicit props win.
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
      throw new TypeError('Rulex parser is not installed.  Use `import "$/parser/rulex"` to import it and try again.')
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
  /** Rule classes by their `importableAs` name -- filled by `protoDefined()`, read by `importableRule()`. */
  static IMPORTABLE_RULES = new Map<string, P.RuleClass>()

  /** Class `specialize()` made us from, e.g. `QuotedPropertyRule`.  Plain `static`, NOT inherited. */
  static specializedFrom?: P.RuleClass
  /**
   * What `specialize()` was CALLED with -- plain data, so a project's declarations can rebuild us.  NOT inherited.
   * - For a class which overrides `specialize()` to take a minimal set, just that set.
   */
  static specializedWith?: P.RuleStatics
  /**
   * Name another project can rebuild our `specialize()`d rules by, e.g. `"quoted_property"` -- see `importableRule()`.
   * - Set on a base class rules are specialized FROM, e.g. `QuotedPropertyRule`.  NEVER key on a class name
   *   instead:  names are for people, and change freely.
   * - SIDE EFFECT: `@proto static importableAs = "..."` registers the class, via `protoDefined()`.
   */
  static importableAs?: string

  /** Name aliases -- inherited, so e.g. a `Statement` base class can set `"statement"` once. */
  static alias?: string | string[]
  /**
   * Priority:  which of several rules matching the SAME words wins a `Choice` -- see `Choice.getBestMatch()`.
   * - Default lives on prototype, so only rules with non-default priority carry their own.
   * - NOT how tightly an operator binds:  that's a language's own business, e.g. spell's operator `precedence`.
   */
  @proto static priority?: number = 0
  /**
   * What committing our match changes in scope -- see `getScopeChanges()`.
   * - Leave `undefined` to work it out from whether we override `mutateScope()`.
   */
  @proto static changesScope?: P.ScopeChanges = undefined
  /** What our matches declare, for editors' symbol lists -- see `getDeclaration()`. */
  @proto static declares?: P.DeclaresSpec = undefined
  /** How editors colour our matches' own tokens -- see `P.HighlightKind`. */
  @proto static highlightAs?: P.HighlightKind = undefined
  /** What our matches ARE, in spell's words, e.g. `text` -- see `getDatatype()`. */
  static datatype?: P.Datatype
  /** Description. */
  static description?: string
  /**
   * Rulex syntax string, decomposed into `rules` etc. at construction.
   * - Several syntaxes => register the class once per syntax -- see "Ways to make a rule" above.
   */
  static syntax?: string

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
  /** What our matches ARE, in spell's words, e.g. `text` -- default for `getDatatype()`. */
  declare datatype: P.Datatype | undefined

  /** Return array of `names` for this rule:  its `.name` + any `.alias`es. */
  get names() {
    let { alias = [] } = this
    if (typeof alias === "string") alias = [alias]
    return [this.name, ...alias].filter((it) => it !== undefined)
  }

  ////////////////
  // ## Definition -- what this rule was made from
  ////////////////

  /** Rulex syntax string used to define this rule -- ONE of them, if class was registered with several. */
  declare syntax: string | undefined
  /** Tests for this rule. */
  declare tests: P.RuleTests | undefined

  ////////////////
  // ## Matching behavior
  ////////////////

  /** Which of several matches of the same words wins a `Choice`, highest first.  Default = 0, from prototype. */
  declare priority: number
  /** Name our match goes under in containing rule's `match.groups`, e.g. `thing` for `{thing:expression}`. */
  declare matchGroup: string | undefined
  /** Whether this rule is optional. */
  declare optional: boolean | undefined
  /**
   * What may sit between the previous token and our first -- see `P.Spacing`.  Unset:  anything.
   * - Checked by the rule that holds us (`Sequence`, `Repeat`), which can see the previous token;  rulex sets it
   *   from how the syntax is spaced.
   */
  declare spacing: P.Spacing | undefined
  /** What committing our match changes in scope, if set explicitly -- see `getScopeChanges()`. */
  declare changesScope: P.ScopeChanges | undefined
  /** What our matches declare, for editors' symbol lists -- see `getDeclaration()`. */
  declare declares: P.DeclaresSpec | undefined
  /** How editors colour our matches' own tokens -- see `P.HighlightKind`. */
  declare highlightAs: P.HighlightKind | undefined
  /** Name another project can rebuild our `specialize()`d rules by -- see `static importableAs`. */
  declare importableAs: string | undefined

  ////////////////
  // ## Type arguments -- type-only, nothing here exists at runtime
  ////////////////

  /** TYPE-ONLY: our `Props` type argument, so `parser.addRule(RuleClass, props)` can type-check `props`. */
  declare readonly Props: Props
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

  /**
   * What `match` IS, in spell's words, e.g. `text`, `list of cards`, `Card` -- `undefined` if we can't tell.
   * - Read it as `match.datatype`, which memoizes this.
   * - Default:  our `datatype`, e.g. `@proto static datatype = "number"`.
   * - Override for a datatype which depends on the match, e.g. a variable's, from its scope record.
   * - Reads ONLY `match` and its `data`, like `getAST()`:  NEVER look up scope here.
   * - A lookup it needs happens WHILE PARSING, into `match.data`,
   *   e.g. the item type of the list a `the first card of ...` reads.
   * - Unknown (`undefined`) is compatible with everything:  nothing stops parsing for want of a type.
   */
  getDatatype(match: P.MatchFor<this>): P.Datatype | undefined {
    return this.datatype
  }

  ////////////////
  // ## Quick testing methods
  ////////////////

  /**
   * Is there ANY WAY this rule could match at `start` of `tokens`?  Used to bail before an expensive `parse()`.
   * - `true` => MIGHT match
   * - `false` => can NOT match
   * - `undefined` => can't tell cheaply
   * - Override in subclasses -- including a registered rule, when it knows better, e.g. `property_expression`.
   */
  test(scope: P.Scope, tokens: P.Token[], start = 0): boolean | undefined {
    if (start >= tokens.length) return false
    return undefined
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
   * - One instance ~== one `syntax`:  use `P.mergeGroupSpecs()` to combine a rule's instances.
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

  /**
   * What committing one of our matches changes in scope -- lets incremental parsing tell whether re-parsing
   * a match could affect anything outside it.
   * - `changesScope` if set, e.g. `changesScope: "internal"` in a definition.
   * - Else `undefined` if we don't override `mutateScope()`, or `"global"` if we do -- assume the worst.
   * - `match`, if given, is the committed match:  override to say per match,
   *   e.g. spell's `set the X of Y to ...` is `"global"` only when it declared `X`,
   *   else `"internal"`, so a plain `set x to 1` stays cheap to re-parse.
   * - Read ONLY `match.data`, as `getAST()` does.
   */
  getScopeChanges(_match?: P.MatchFor<this>): P.ScopeChanges | undefined {
    if (this.changesScope) return this.changesScope
    return this.mutateScope === Rule.prototype.mutateScope ? undefined : "global"
  }

  ////////////////
  // ## Declarations
  ////////////////

  /**
   * What `match` declares, for editors' symbol lists (outline, go to symbol), or `undefined` if nothing.
   * - Default reads our `declares` spec, e.g. `declares: { kind: "property", name: "property", of: "type" }`.
   * - Override for what a spec can't say, e.g. when only SOME matches declare something.
   * - Pure, like `getAST()`:  reads `match` and its `data`, NEVER scope.
   */
  getDeclaration(match: P.MatchFor<this>): P.Declaration | undefined {
    const { declares } = this
    // Generic `Groups` keeps `MatchFor<this>` from narrowing to a plain `P.Match` -- cast once.
    const plainMatch = match as P.Match
    const nameMatch = declares && this.groupAt(plainMatch, declares.name)
    if (!declares || !nameMatch) return undefined
    return {
      kind: declares.kind,
      name: nameMatch.inputText.trimEnd(),
      nameMatch,
      of: declares.of && this.textOf(this.groupAt(plainMatch, declares.of)),
      detail: declares.detail && this.textOf(this.groupAt(plainMatch, declares.detail))
    }
  }

  /** Group at dotted `path` in `match`, e.g. `type_property.property`, if it's a single match. */
  private groupAt(match: P.Match, path: string): P.Match | undefined {
    let found: unknown = match
    for (const name of path.split(".")) found = found instanceof P.Match ? found.groups[name] : undefined
    return found instanceof P.Match ? found : undefined
  }

  /** `match`'s source text without trailing whitespace, or `undefined` if there's no match. */
  private textOf(match: P.Match | undefined): string | undefined {
    return match?.inputText.trimEnd()
  }

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
    return !!this.matchGroup
  }

  /** Return rulex string for this rule. */
  toRulexSyntax(): string {
    return ""
  }

  /** Return rulex syntax strings for rule flags. */
  getRulexFlags(): P.SyntaxFlags {
    const { matchGroup, optional } = this
    return {
      matchGroup: matchGroup ? `${matchGroup}:` : "",
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
  /** What our matches ARE, in spell's words, e.g. `text` -- see `Rule.getDatatype()`. */
  datatype?: P.Datatype
  /** Rulex syntax string used to define this rule. */
  syntax?: string
  /** Which of several matches of the same words wins a `Choice`, highest first.  Default = 0. */
  priority?: number
  /** Tests for this rule. */
  tests?: P.RuleTests
  /** Name our match goes under in containing rule's `match.groups`. */
  matchGroup?: string
  /** Whether this rule is optional. */
  optional?: boolean
  /** What may sit between the previous token and our first -- see `Rule.spacing`. */
  spacing?: P.Spacing
  /** Whether literal must be escaped when converting to rulex syntax -- see `Literal.isEscaped`. */
  isEscaped?: boolean
  /** What committing our match changes in scope -- see `getScopeChanges()`. */
  changesScope?: P.ScopeChanges
  /** What our matches declare, for editors' symbol lists -- see `getDeclaration()`. */
  declares?: P.DeclaresSpec
  /** How editors colour our matches' own tokens -- see `P.HighlightKind`. */
  highlightAs?: P.HighlightKind
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
const PLAIN_STATICS = ["ruleName", "tests", "skip", "specializedFrom", "specializedWith"]
