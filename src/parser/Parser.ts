// Spell "parser" class.
//
import { isNode } from "browser-or-node"
import isEqual from "lodash/isEqual"
import groupBy from "lodash/groupBy"
import sum from "lodash/sum"

import { CustomError, Derivative, showWhitespace } from "~/util"
import { R, Rule, rulex, Token, Tokenizer, WhitespacePolicy, Scope, Match } from "~/parser"
import type { RuleProps, RuleConstructor, RuleTest, RuleTestBlock } from "~/parser/rule/Rule"
import type { TokenConstructor } from "~/parser/rule/TokenType"
import type { LiteralMatcher } from "~/parser/rule/Literals"
import type { IdentifierBlacklist } from "~/parser/types"

/** Error we'll throw when setting up / executing parser. */
export class ParserError extends CustomError {}

/**
 * Props bag accepted by `parser.defineRule()`.
 * - `constructor` is the `Rule` subclass to instantiate (inferred from `syntax`/`pattern`/etc if not provided).
 * - `syntax` is rulex syntax string(s), or objects with `syntax` + overrides for that variant.
 * - Rule-subclass-specific props (e.g. `wantsInlineStatement`) are allowed and passed through to the constructor.
 */
export type RuleDefinition = Prettify<
  Omit<RuleProps, "syntax" | "tests" | "testRule"> & {
    // `Function` is included because every object literal already has `Object` as its `constructor`.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    constructor?: RuleConstructor | Function
    skip?: boolean
    syntax?: string | Array<string | RuleDefinition>
    /** Test rule, or rulex syntax string which will be compiled into one. */
    testRule?: Rule | string
    pattern?: RegExp
    VALUE_MAP?: Record<string, unknown>
    blacklist?: IdentifierBlacklist | string[]
    literal?: string | string[]
    literals?: Array<string | string[] | LiteralMatcher>
    tokenType?: TokenConstructor
    rule?: Rule | string
    rules?: Rule[]
    tests?: RuleTestBlock[]
    [subclassProp: string]: unknown
  }
>

/** Anything `parser.defineRule()` accepts. */
export type RuleInput = Rule | RuleConstructor | RuleDefinition

export type ParserProps = {
  module?: string
  defaultRule?: string
  rules?: RuleDefinition[]
  imports?: Parser[]
}

/** Map of `{ ruleName: rule }`. */
export type RuleMap = Record<string, Rule>

export type FailedRuleTest = { ruleName: string | undefined; input: string; expected: unknown; result: unknown }

export type TestResults = {
  pass: number
  fail: number
  failed: FailedRuleTest[]
  time: number
}

export type SpeedTestResults = Omit<TestResults, "time"> & {
  initialTime: number
  average: number
  min: number
  max: number
}

/** Normalize a `RuleTest` tuple or object to a consistent object, joining array `input`/`output` with newlines. */
export function normalizeRuleTest(test: RuleTest) {
  const {
    input,
    output,
    skip = false,
    title
  } = Array.isArray(test) ? { input: test[0], output: test[1], skip: false, title: undefined } : test
  return {
    input: Array.isArray(input) ? input.join("\n") : input,
    output: Array.isArray(output) ? output.join("\n") : output,
    skip,
    title
  }
}

export class Parser extends Derivative {
  /** Name of the module this parser (and rules defined in it) belong to. */
  declare module: string | undefined
  /** Rule to parse/compile with if none is specified. */
  declare defaultRule: string
  /** Other parsers whose rules we import. */
  declare imports: Parser[] | undefined

  static {
    Object.defineProperty(this.prototype, "module", { value: undefined, writable: true })
    Object.defineProperty(this.prototype, "defaultRule", { value: "block", writable: true })
  }

  constructor(properties?: ParserProps) {
    super()
    if (properties) Object.assign(this, properties)
  }

  // Return a clone of this parser with additional properties passed in.
  clone(properties?: ParserProps): this {
    const allProps = { ...this, ...properties } as Record<string, unknown>
    // clear imports...
    delete allProps.imports
    const constructor = this.constructor as new (properties?: ParserProps) => this
    const clone = new constructor(allProps as ParserProps)
    // ...so we can import this parser (and all of ITS imports)
    clone.import(this)
    return clone
  }

  //
  // ### Tokenizing (a.k.a. "lexical analysis")
  //

  /**
   * Tokenizer for parsing input string.
   * Override in your subclass if parsing with different policies.
   */
  get tokenizer(): Tokenizer {
    return this.derived("tokenizer", () => new Tokenizer({ whitespacePolicy: WhitespacePolicy.LEADING_ONLY }))
  }

  // Tokenize `input` as:
  //  - string text
  //  - a single Token
  //  - an array (presumably an array of Tokens)
  // `ruleName` is there in case you want to tokenize differently for different top-level rules.
  tokenize(input: string | Token | Token[], ruleName?: string): Token[] | undefined {
    if (typeof input === "string") return this.tokenizer.tokenize(input)
    if (input instanceof Token) return [input]
    if (Array.isArray(input)) return input
    console.warn("Don't know how to tokenize: ", input)
    return undefined
  }

  //
  // ### Parsing
  //

  /**
   * Parsing is done by attempting to match tokens with a set of immutable `rules`.
   *
   * When doing a top-level `parser.parse()`, we'll create a `scope` object
   * to keep track of the internal state of the parser as it descends.
   *
   * The only hard requriement is `scope.parser` must point to
   * a valid `Parser` instance for your language.
   *
   * Some languages, e.g. `spell`, use a more elaborate `Scope` concept
   * which can keep track of allocated variables and methods, type definitions, etc.
   *
   */
  getScope(_name?: string): Scope {
    return new Scope({ parser: this })
  }

  /**
   *  Parse `ruleName` rule at head of `input`.
   * `input` can be a string to tokenize, a single token or an Array of tokens.
   * Returns `match` generated by `rule.parse()` or `undefined`.
   */
  parse(input: string | Token | Token[], ruleName = this.defaultRule, scope = this.getScope()): Match | undefined {
    // Bail if we didn't get any tokens back.
    const tokens = this.tokenize(input, ruleName)
    if (!tokens || tokens.length === 0) return undefined

    // Parse the rule or throw an exception if rule not found.
    const rule = scope.getRuleOrDie(ruleName)
    return rule.parse(scope, tokens)
  }

  // Parse `input` and return the resulting output (source code for language parsers).
  //  - if one string argument, compiles as "block"
  // Throws if not parseable.
  compile(input: string | Token | Token[], ruleName = this.defaultRule, scope = this.getScope()): unknown {
    const match = this.parse(input, ruleName, scope)
    if (!match) {
      throw new ParserError({
        message: "Can't parse input",
        context: this,
        activity: "compile",
        params: { input, ruleName, scope }
      })
    }
    return match.compile()
  }

  //
  //  Rules
  //

  // Private map of all of our rules, NOT including rules from imports.
  // - Use `parser.rules` to get ALL rules, including those from imports.
  #ownRules: RuleMap = {}

  // REFACTOR: derived() instead?
  get rules(): RuleMap {
    return this.derived("rules", () => {
      if (!this.imports) return { ...this.#ownRules }
      return this.mergeRuleSets(this.#ownRules, ...this.imports.map((parser) => parser.rules))
    })
  }

  // Setting rules through assignment calls `defineRules()`, adding to our existing rules.
  // You'll typically set default rules when initializing a parser:
  //  `const myParser = new Parser({  module: "xxx", rules: [...] });`
  // TESTME!!!
  set rules(rules: RuleDefinition[]) {
    this.clearDerived("rules")
    this.defineRules(...rules)
  }

  // Return a named rule from our parser.
  // Throws if not found.
  getRuleOrDie(ruleName: string): Rule {
    const rule = this.rules[ruleName]
    if (!rule)
      throw new ParserError({
        message: `Rule '${ruleName}' not found.`,
        context: this,
        activity: "getRuleOrDie",
        params: { ruleName }
      })
    return rule
  }

  // Add a `rule` to our list of rules!
  // Converts to `R.Group` on re-defining the same rule.
  addRule(rule: Rule | RuleConstructor, ruleName?: string | string[]): Rule | undefined {
    // Clear memoized "rules" so we'll recalculate them
    this.clearDerived("rules")

    // If rule is a Rule subclass, instantiate it
    if (typeof rule === "function") rule = new rule()

    // If we didn't get a ruleName, try `rule.name`
    if (!ruleName) {
      if (rule.name) ruleName = rule.name
      else
        throw new ParserError({
          message: `You must set 'rule.name' or pass an explicit ruleName.`,
          context: this,
          activity: "addRule",
          params: { rule, ruleName }
        })
    }

    if (!(rule instanceof Rule)) {
      console.warn("addRule() called with a non-rule.  Did you mean to call defineRule()?\n", rule)
      return undefined
    }

    // If we got an array of `ruleName`s, recursively add under each name with the same `rule`.
    if (Array.isArray(ruleName)) {
      ruleName.forEach((name) => this.addRule(rule, name))
    }
    // Add to our list of rules
    else {
      this.mergeRule(this.#ownRules, ruleName, rule)
    }

    return rule
  }

  // Add rules from other parsers to this parser.
  import(...imports: Parser[]) {
    // Clear memoized "rules" so we'll recalculate them
    this.clearDerived("rules")
    this.imports = [...(this.imports || []), ...imports]
  }

  // Merge all rule `sources` together into a new rules map.
  mergeRuleSets(...sources: RuleMap[]): RuleMap {
    const rules = { ...sources[0] }
    for (let i = 1, last = sources.length; i < last; i++) {
      const source = sources[i]!
      Object.keys(source).forEach((ruleName) => this.mergeRule(rules, ruleName, source[ruleName]!))
    }
    return rules
  }

  // Merge a single `rule` into map of `rules` by `ruleName`.
  // If `rules` already has a rule with that name:
  //  - if `rules[ruleName]` is a R.Group, we'll just add the new rule to the group,
  //  - or we'll convert `rules[ruleName]` to a group with the original + new rules.
  mergeRule(map: RuleMap, ruleName: string, rule: Rule) {
    const existing = map[ruleName]
    if (!existing) {
      // Always clone groups when adding.
      if (rule instanceof R.Group) rule = rule.clone()
      map[ruleName] = rule
      return
    }

    // Merge existing rule and rule passed in as a new Group
    const group =
      existing instanceof R.Group ? existing.clone() : new R.Group({ rules: [existing], argument: ruleName })
    map[ruleName] = group

    // If rule is ALSO a group with the same argument, merge the groups.
    if (rule instanceof R.Group && rule.argument === existing.argument) group.addChoice(this, ...rule.rules)
    else group.addChoice(this, rule)
  }

  //
  //  Defining rules using the "rulex" syntax
  //

  // Define multiple rules at once.
  // NOTE: it's better to do this using individual `defineRule()` calls
  //       as error stack traces will get you to the right line if there's a problem.
  defineRules(...ruleProps: Array<RuleInput | RuleInput[]>): Rule[] {
    return ruleProps.flat().flatMap((props) => this.defineRule(props) ?? [])
  }

  /**
   * Simplified way to define and install a rule using one of:
   * - `syntax` Rulex string to define rules using regex-like syntax
   * - `pattern` for regular expressions
   * - `literal` for a single literal string
   * - `literals` for an array of literal strings
   * - `tokenType` for a token type
   *
   * Other things you might specify:
   * - `name` (required)  Base name of the rule.
   * - `constructor` (Rule subclass) Class which will be used to instantiate the rule.
   * - `alias` (string or [string], optinal) Other names to define rule under.
   * - `syntax` (string, required) RuleSyntax string for this rule.
   * - `pattern` (RegExp, optional) Regular expression for `Pattern` rules
   * - `precedence` (number, optional) Precedence number for the rule (currently doesn't do anything)
   * - `blacklist` ([string], optional) Array of strings as blacklist for pattern rules.
   * - `testRule` (Rule or string, optional) Rule or keywords string to use as a test rule.
   *    Specifying this can let us jump out quickly if there is no possible match.
   * - `skip` (boolean, optional) Set to true to skip this rule, e.g. if it's not working.
   *
   * TODO: separate out into `initRule()` and `addRule()`
   */
  defineRule(ruleProps: RuleInput): Rule | Rule[] | undefined {
    // Clear memoized "rules" so we'll recalculate them
    this.clearDerived("rules")
    try {
      // If passed in a Rule instance or rule constructor, addRule
      if (ruleProps instanceof Rule || typeof ruleProps === "function") return this.addRule(ruleProps)

      let { skip, constructor: ctor, ...props } = ruleProps
      // If `constructor` was not specified, it will be `Object`: we're expecting a Rule subclass, so clear it.
      let constructor = ctor === Object ? undefined : (ctor as RuleConstructor | undefined)
      if (skip) return undefined

      // If we received multiple syntax strings, recursively add under each string.
      if (Array.isArray(props.syntax)) {
        return props.syntax.flatMap((syntax, index) => {
          // only add tests to the first one so we don't run the same tests repeatedly.
          if (index > 0) delete props.tests
          // handle syntax as a string
          if (typeof syntax === "string") return this.defineRule({ ...props, syntax, constructor }) ?? []
          // or as an object (e.g. so you can specify separate testRules)
          return this.defineRule({ ...props, ...syntax, constructor }) ?? []
        })
      }

      // Note the module that the rule was defined in
      if (this.module) props.module = this.module

      // Convert `testRule` to proper thing if necessary
      const { testRule } = props
      if (typeof testRule === "string") {
        // Convert string using rule syntax
        const compiled = rulex.compile(testRule)
        compiled.syntax = testRule
        props.testRule = compiled
      }

      // Parse rulex `syntax` to create rules to work with
      let rule: Rule
      if (props.syntax) {
        // Use the `rulex` compiler to generate a rule
        rule = rulex.compile(props.syntax)
        if (!rule)
          throw new ParserError({
            message: `Didn't get a rule from rulex.compile('${props.syntax}')`,
            context: this,
            activity: "defineRule",
            params: { ruleProps, syntax: props.syntax }
          })

        // If we're constructing a sequence, make sure we've got `rules`...
        if (constructor && constructor.prototype instanceof R.Sequence && !(rule instanceof R.Sequence)) {
          props.rules = [rule]
        } else {
          props = { ...rule, ...props }
        }
        if (!constructor) constructor = rule.constructor as RuleConstructor
      }

      if (!constructor) {
        if (props.tokenType) constructor = R.TokenType
        else if (props.pattern) constructor = R.Pattern
        else if (props.literal) constructor = R.Keyword
        else if (props.literals) constructor = R.Keywords
        else {
          throw new ParserError({
            message: `You must pass 'constructor', 'syntax', 'pattern', 'literal', or 'literals'.`,
            context: this,
            activity: "defineRule",
            params: { ruleProps }
          })
        }
      }

      // Create the rule instance
      rule = new constructor(props)

      // throw if name was not provided
      const name = props.name
      if (!name) {
        throw new ParserError({
          message: `You must pass 'rule.name'.`,
          context: this,
          activity: "defineRule",
          params: { props }
        })
      }
      // Combine aliases with the main name and add rule under all the names
      const names = [name].concat(props.alias || [])
      // Add to the list of testable rules if we have tests.
      if (props.tests) names.push("_testable_")

      // add under all of the names provided
      return this.addRule(rule, names)
    } catch (error) {
      // If not on the server, change to a warning instead
      if (!isNode) {
        console.warn("Error in defineRule():", error, "\nprops:", ruleProps)
      }
    }
    return undefined
  }

  //
  // Testing
  //

  // Do a timing test for all of the `testable` rules of this partner.
  // Pass `moduleName` to restrict to just those defined by a module.
  // Runs the full test once to warm up the rules
  //  then runs 10 more times to get an average time once we're warmed up.
  speedTest(moduleName = ""): SpeedTestResults {
    console.group(`Speed test for ${moduleName ? `module ${moduleName}` : "all modules"}`)
    // Run the test once first to warm up the rules.
    const { time: initialTime, ...results } = this.testRules(moduleName, false)
    console.debug(`Initial run`)
    console.debug(`     time: ${initialTime} msec`)
    console.debug(`   passed: ${results.pass} test(s)`)
    console.debug(`   failed: ${results.fail} test(s)`)

    // Run 10 separate times to average time after warmup.
    console.debug(`Subsequent runs:`)
    const runCount = 20
    const times: number[] = []
    for (let index = 1; index <= runCount; index++) {
      const runTime = this.testRules(moduleName, false).time
      console.debug(`   run #${index}: ${runTime} msec`)
      times.push(runTime)
    }

    const average = sum(times) / runCount
    const min = Math.min(...times)
    const max = Math.max(...times)

    console.debug(`      min: ${min} msec`)
    console.debug(`      max: ${max} msec`)
    console.debug(`  average: ${average} msec`)
    console.groupEnd()

    return { ...results, initialTime, average, min, max }
  }

  // Test `testable` rules for this parser.
  // Pass `moduleName` to restrict to just those defined by a module.
  // By default we output debug info about the run.
  // Pass false to `debug` to skip debug output.
  testRules(moduleName?: string, debug = true): TestResults {
    const t0 = Date.now()
    const results: TestResults = {
      pass: 0, // number of tests that passed
      fail: 0, // number of tests that failed
      failed: [], // input tests that failed as `{ ruleName, input }`
      time: 0
    }
    if (debug) {
      if (moduleName) console.group("Testing rules for module", moduleName)
      else console.group("Testing all parser rules")
    }

    // Get all of the testable rules in this parser.
    const testable = this.rules._testable_
    let rules: Rule[] | undefined = testable instanceof R.Group ? testable.rules : testable ? [testable] : undefined
    if (moduleName && rules) rules = groupBy(rules, "module")[moduleName]
    if (!rules) {
      if (debug) console.debug("no testable rules found")
    } else {
      rules.forEach(({ name: ruleName, tests: testBlocks }) => {
        if (!testBlocks) return
        if (debug) console.group("testing rule", ruleName)

        testBlocks.forEach(({ compileAs = ruleName, tests, beforeEach }) => {
          if (debug && compileAs !== ruleName) console.group(`testing as ${compileAs}`)

          tests.forEach((test) => {
            const { input, output, skip } = normalizeRuleTest(test)
            if (skip || input === "") return

            // Create a new scope for the run, so we don't muck with the main parser.
            // Run `beforeEach` code if provided to seed variables, etc.
            const scope = this.getScope("test")
            if (beforeEach) beforeEach(scope)

            let result: unknown
            try {
              const match = scope.parse(input, compileAs!)
              if (match) result = match.compile()
            } catch (e) {
              result = e
            }
            if (isEqual(result, output) || (result instanceof Error && output === undefined)) {
              if (debug) console.debug("PASS:  ", showWhitespace(input))
              results.pass++
            } else {
              if (debug) {
                console.debug(
                  "FAIL:  ",
                  showWhitespace(input),
                  "\n  EXPECTED: ",
                  showWhitespace(input),
                  "\n       GOT: ",
                  typeof result === "string" ? showWhitespace(result) : result
                )
              }
              results.fail++
              results.failed.push({ ruleName, input, expected: output, result })
            }
          })
          if (debug && compileAs !== ruleName) console.groupEnd()
        })
        if (debug) console.groupEnd()
      })
    }
    if (debug) console.groupEnd()

    results.time = Date.now() - t0
    return results
  }
}
