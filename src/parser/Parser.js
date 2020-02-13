// Spell "parser" class.
//
import { isNode } from "browser-or-node"
import isEqual from "lodash/isEqual"
import flatten from "lodash/flatten"
import groupBy from "lodash/groupBy"
import sum from "lodash/sum"

import {
  ParseError,
  Rule,
  rulex,
  Tokenizer,
  WhitespacePolicy,
  clearMemoized,
  cloneClass,
  memoize,
  nonEnumerable,
  proto,
  showWhitespace
} from "./all"

// In the web browser, by default, we'll use `cloneClass()` to make debugging easier
// by creating named subclasses which you can see in the browser console
// when inspecting rules, matches, etc.
//
// This is a bit slower (4-5% for the object allocation, not sure about inheritance chain),
// see:   https://jsperf.com/create-named-class-with-function

const CLONE_CLASSES = !isNode

export default class Parser {
  // Name of our default rule to parse if calling `parser.parse(text)`.
  @proto defaultRule = "block"

  // Constructor.
  constructor(properties) {
    Object.assign(this, properties)
  }

  // Return a clone of this parser with additional properties passed in.
  clone(properties) {
    const allProps = { ...this, ...properties }
    // clear imports...
    delete allProps.imports
    const clone = new this.constructor(allProps)
    // ...so we can import this parser (and all of ITS imports)
    clone.import(this)
    return clone
  }

  //
  // ### Tokenizing (a.k.a. "lexical analysis")
  //

  // Default tokenizer.  You may want to create one in your parser subclasses,
  //  e.g. to change the whitespacePolicy.
  @proto tokenizer = new Tokenizer({
    whitespacePolicy: WhitespacePolicy.LEADING_ONLY
  })

  // Tokenize input `text`.
  // `ruleName` is there in case you want to tokenize differently for different top-level rules.
  tokenize(text, ruleName) {
    return this.tokenizer.tokenize(text)
  }

  //
  // ### Parsing
  //

  // Return a `scope` for top-level `parse()` or `compile()` if one was not provided.
  //
  // The default is just to return this parser, but some languages (e.g. spell) manage
  // much more complete scopes which proxy methods from the parser.
  //
  // The only hard requirement for a scope is that you must define:
  //  - `scope.getRuleOrDie(ruleName)` to return a named rile.
  //
  getScope() {
    return this
  }

  // Parse `ruleName` rule at head of `text`.
  // `text` can be a string to tokenize or an Array of tokens.
  // Returns result of parse.
  parse(text, ruleName = this.defaultRule, scope = this.getScope()) {
    // Bail if we didn't get any tokens back.
    const tokens = Array.isArray(text) ? text : this.tokenize(text, ruleName)
    if (!tokens || tokens.length === 0) return undefined

    // Parse the rule or throw an exception if rule not found.
    const rule = scope.getRuleOrDie(ruleName)
    const result = rule.parse(scope, tokens)

    // If we didn't get anything, note that the parse was incomplete.
    // TESTME
    if (result && result.length !== tokens.length) {
      result.incomplete = {
        parsed: Tokenizer.join(tokens, 0, result.length),
        missed: Tokenizer.join(tokens, result.length)
      }
    }

    return result
  }

  // Parse `text` and return the resulting source code.
  //  - if one string argument, compiles as "block"
  // Throws if not parseable.
  compile(text, ruleName = this.defaultRule, scope = this.getScope()) {
    const match = this.parse(text, ruleName, scope)
    if (!match) {
      throw new ParseError(`parser.compile('${text}'): can't parse text`)
    }
    return match.compile()
  }

  //
  //  Rules
  //

  // Private map of all of our rules, NOT including rules from imports.
  // NOTE: optimally this would be `#rules` to mark it private,
  //  but private fields and decorators don't work together in babel 7.
  //
  // Use `parser.rules` to get ALL rules, including those from imports.
  @nonEnumerable
  _rules = {}

  @memoize
  get rules() {
    if (!this.imports) return { ...this._rules }
    return this.mergeRuleSets(this._rules, ...this.imports.map(parser => parser.rules))
  }

  // Setting rules through assignment calls `defineRules()`, adding to our existing rules.
  // You'll typically set default rules when initializing a parser:
  //  `const myParser = new Parser({  module: "xxx", rules: [...] });`
  // TESTME!!!
  set rules(rules) {
    this.defineRules(...rules)
  }

  // Return a named rule from our parser.
  // Throws if not found.
  getRuleOrDie(ruleName) {
    const rule = this.rules[ruleName]
    if (!rule) throw new ParseError(`getRuleOrDie('${ruleName}'): rule not found`)
    return rule
  }

  // Add a `rule` to our list of rules!
  // Converts to `Rule.Group` on re-defining the same rule.
  @clearMemoized("rules")
  addRule(rule, ruleName) {
    // If rule is a Rule subclass, instantiate it
    // eslint-disable-next-line new-cap
    if (rule.prototype instanceof Rule) rule = new rule()

    // If we didn't get a ruleName, try `rule.name`
    if (!ruleName) {
      if (!rule.name) throw new ParseError("addRule(): you must set 'rule.name' or pass an explicit ruleName")
      ruleName = rule.name
    }

    if (!(rule instanceof Rule)) {
      this.error("addRule() called with a non-rule.  Did you mean to call defineRule()?\n", rule)
      return undefined
    }

    // If we got an array of `ruleName`s, recursively add under each name with the same `rule`.
    if (Array.isArray(ruleName)) {
      ruleName.forEach(name => this.addRule(rule, name))
    }
    // Add to our list of rules
    else {
      this.mergeRule(this._rules, ruleName, rule)
    }

    return rule
  }

  // Add rules from other parsers to this parser.
  @clearMemoized("rules")
  import(...imports) {
    this.imports = [].concat(this.imports || [], imports)
  }

  // Merge all rule `sources` together into a new rules map.
  mergeRuleSets(...sources) {
    const rules = { ...sources[0] }
    for (let i = 1, last = sources.length; i < last; i++) {
      const source = sources[i]
      Object.keys(source).forEach(ruleName => this.mergeRule(rules, ruleName, source[ruleName]))
    }
    return rules
  }

  // Merge a single `rule` into map of `rules` by `ruleName`.
  // If `rules` already has a rule with that name:
  //  - if `rules[ruleName]` is a Rule.Group, we'll just add the new rule to the group,
  //  - or we'll convert `rules[ruleName]` to a group with the original + new rules.
  mergeRule(map, ruleName, rule) {
    const existing = map[ruleName]
    if (!existing) {
      // Always clone groups when adding.
      if (rule instanceof Rule.Group) rule = rule.clone()
      map[ruleName] = rule
      return
    }

    // Merge existing rule and rule passed in as a new Group
    if (existing instanceof Rule.Group) map[ruleName] = existing.clone()
    else map[ruleName] = new Rule.Group({ rules: [existing], argument: ruleName })

    // If rule is ALSO a group with the same argument, merge the groups.
    if (rule instanceof Rule.Group && rule.argument === existing?.argument) map[ruleName].addRule(...rule.rules)
    else map[ruleName].addRule(rule)
  }

  //
  //  Defining rules using the "rulex" syntax
  //

  // Define multiple rules at once.
  // NOTE: it's better to do this using individual `defineRule()` calls
  //       as error stack traces will get you to the right line if there's a problem.
  defineRules(...ruleProps) {
    ruleProps = flatten(ruleProps)
    const rules = ruleProps.map(props => this.defineRule(props))
    return flatten(rules).filter(Boolean)
  }

  // Define a rule using (rule)`syntax` or `patterns` to create the rule instances.
  //  `skip` (boolean, optional) Set to true to skip this rule if it's not working.
  //  `name` (identifier, required)  Base name of the rule.
  //  `alias` (string or [string], optinal) Other names to define rule under.
  //  `constructor` (class, required) Class which will be used to instantiate the rule.
  //  `syntax` (string, required) RuleSyntax string for this rule.
  //  `pattern` (RegExp, optional) Regular expression for `Pattern` rules
  //  `precedence` (number, optional) Precedence number for the rule (currently doesn't do anything)
  //  `blacklist` ([string], optional) Array of strings as blacklist for pattern rules.
  //  `testRule` (Rule or string, optional) Rule or keywords string to use as a test rule.
  //    Specifying this can let us jump out quickly if there is no possible match.
  defineRule(ruleProps) {
    try {
      // If passed in a Rule instance or rule instance, just call addRule
      if (ruleProps instanceof Rule || ruleProps.prototype instanceof Rule) return this.addRule(ruleProps)

      // eslint-disable-next-line prefer-const
      let { skip, constructor, ...props } = ruleProps
      if (skip) return undefined

      // If we received multiple syntax strings,
      // recursively add under each string.
      if (Array.isArray(props.syntax)) {
        return props.syntax.map((syntax, index) => {
          // only add tests to the first one so we don't run the same tests repeatedly.
          if (index > 0) delete props.tests
          // handle syntax as a string
          if (typeof syntax === "string") return this.defineRule({ ...props, syntax, constructor })
          // or as an object (e.g. so you can specify separate testRules)
          return this.defineRule({ ...props, ...syntax, constructor })
        })
      }

      // if `constructor` was not specified, it will be Object,
      // we're expecting it to be a Rule, so clear it.
      if (constructor === Object) constructor = null

      // throw if name was not provided
      const name = props.name || (constructor && constructor.prototype.name)
      if (!name) throw new ParseError("You must pass the rule 'name'")

      // Try to infer the constructor if we didn't get one
      if (!constructor) {
        if (props.tokenType) constructor = Rule.TokenType
        else if (props.pattern) constructor = Rule.Pattern
        else if (props.literal) constructor = Rule.Keyword
        else if (props.literals) constructor = Rule.Keywords
        else if (!ruleProps.syntax) throw new ParseError("You must pass 'constructor' or 'syntax'")
      }

      // Note the module that the rule was defined in
      if (this.module) props.module = this.module

      // Convert `testRule` to proper thing if necessary
      const { testRule } = props
      if (testRule) {
        // Convert string using rule syntax
        if (typeof testRule === "string") {
          props.testRule = rulex.compile(testRule)
          props.testRule.syntax = testRule
        }
      }

      // Instantiate or parse to create rules to work with
      let rule
      if (props.syntax) {
        // Use the `rulex` compiler to generate a rule
        rule = rulex.compile(props.syntax)
        if (!rule) throw new ParseError(`Didn't get a rule from rulex.compile('${props.syntax}')`)

        // If we're constructing a sequence, make sure we've got `rules`...
        if (constructor && constructor.prototype instanceof Rule.Sequence && !(rule instanceof Rule.Sequence)) {
          props.rules = [rule]
        }
        // We want to use a named constructor below, so copy properties from the rule
        else {
          props = { ...rule, ...props }
        }
        // eslint-disable-next-line prefer-destructuring
        if (CLONE_CLASSES && !constructor) constructor = rule.constructor
      }

      // use `cloneClass()` to make a new constructor with the rule `name` for ease in debugging
      if (constructor && CLONE_CLASSES && constructor.name !== name) constructor = cloneClass(constructor, name)

      if (constructor) rule = new constructor(props)
      else if (rule) Object.assign(rule, props)
      else throw new ParseError("no rule... ???")

      // Combine aliases with the main name and add rule under all the names
      const names = [props.name].concat(props.alias || [])
      if (props.tests) names.push("_testable_")
      this.addRule(rule, names)
      return rule
    } catch (error) {
      if (!isNode) console.warn("Error in defineRule():", error, "\nprops:", ruleProps)
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
  speedTest(moduleName = "") {
    console.group(`Speed test for ${moduleName ? `module ${moduleName}` : "all modules"}`)
    // Run the test once first to warm up the rules.
    const results = this.testRules(moduleName, false)
    console.debug(`Initial run`)
    console.debug(`     time: ${results.time} msec`)
    console.debug(`   passed: ${results.pass} test(s)`)
    console.debug(`   failed: ${results.fail} test(s)`)

    // Run 10 separate times to average time after warmup.
    console.debug(`Subsequent runs:`)
    const runCount = 20
    const times = []
    for (let index = 1; index <= runCount; index++) {
      const runTime = this.testRules(moduleName, false).time
      console.debug(`   run #${index}: ${runTime} msec`)
      times.push(runTime)
    }

    results.average = sum(times) / runCount
    results.min = Math.min(...times)
    results.max = Math.max(...times)
    results.initialTime = results.time
    delete results.time

    console.debug(`      min: ${results.min} msec`)
    console.debug(`      max: ${results.max} msec`)
    console.debug(`  average: ${results.average} msec`)
    console.groupEnd()

    return results
  }

  // Test `testable` rules for this parser.
  // Pass `moduleName` to restrict to just those defined by a module.
  // By default we output debug info about the run.
  // Pass false to `debug` to skip debug output.
  testRules(moduleName, debug = true) {
    // Clear outputSource flag so we don't get source output comments in the test results.
    this.outputSource = false

    const t0 = Date.now()
    const results = {
      pass: 0, // number of tests that passed
      fail: 0, // number of tests that failed
      failed: [] // input tests that failed as `{ ruleName, input }`
    }
    if (moduleName)
      if (debug) console.group("Testing rules for module", moduleName)
      else if (debug) console.group("Testing all parser rules")

    // Get all of the testable rules in this parser.
    let rules = this.rules._testable_?.rules
    if (moduleName && rules) rules = groupBy(rules, "module")[moduleName]
    if (!rules) {
      if (debug) console.debug("no testable rules found")
    } else {
      rules.forEach(({ name: ruleName, tests: testBlocks }) => {
        if (debug) console.group("testing rule", ruleName)

        testBlocks.forEach(({ compileAs = ruleName, tests, beforeEach }) => {
          if (debug && compileAs !== ruleName) console.group(`testing as ${compileAs}`)

          tests.forEach(test => {
            if (Array.isArray(test)) test = { input: test[0], output: test[1] }
            if (test.skip || test.input === "") return

            // Create a new scope for the run, so we don't muck with the main parser.
            // Run `beforeEach` code if provided to seed variables, etc.
            const scope = this.getScope("test")
            if (beforeEach) beforeEach(scope)

            const { input, output } = test
            let result
            try {
              const match = scope.parse(input, compileAs, scope)
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
                  showWhitespace(result)
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
