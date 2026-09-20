/**
 * Helper scripts to test rules defined for a parser "module".
 * - To make a rule testable, add a `tests` block to parser rules with `defineRules()`.
 * - Call `unitTestModuleRules(<moduleName>)` to test all rules in that module.
 * - TODO: add `only` to test block to skip everything else in the file.
 * - TODO: rules w/specific titles to `{ title, input, output }`.
 * - TODO: output as a function?
 */

import { describe, test, expect } from "vitest"
import groupBy from "lodash/groupBy"
import isEqual from "lodash/isEqual"

import { showWhitespace } from "~/util"

import { P } from "~/parser"

/** Shape of one test entry after `P.normalizeRuleTest()` fills in defaults (`title`, `skip`, etc). */
type NormalizedRuleTest = ReturnType<typeof P.normalizeRuleTest>

/**
 * Unit test all rules for `moduleName` in `parser`.
 * - Pass `initializeContext` to have it run before each rule.
 */
export function unitTestModuleRules(parser: P.Parser, moduleName: string, initializeContext?: () => void) {
  describe(`rule unit tests`, () => {
    const rules = getTestableRulesForModule(moduleName)
    if (!rules || rules.length === 0) {
      test("no testable rules found", () => {
        expect(false).toBe(true)
      })
      return
    }

    rules.forEach((rule) => executeRuleTests(rule))
  })

  /** Return `parser`'s testable rules (its `_testable_` group) belonging to `module`, if any. */
  function getTestableRulesForModule(module: string): P.Rule[] | undefined {
    const testable = parser.rules._testable_
    if (!(testable instanceof P.Group)) return undefined
    return groupBy(testable.rules, "module")[module]
  }

  /** Register a `describe()` block for one `rule`, running each of its (non-`skip`) `tests` entries. */
  function executeRuleTests({ name, tests }: P.Rule) {
    describe(`rule '${name}'`, () => {
      tests?.forEach((testBlock) => {
        if (testBlock.skip) return
        if (testBlock.title) describe(testBlock.title, () => executeTestBlock(name, testBlock))
        else executeTestBlock(name, testBlock)
      })
    })
  }

  /**
   * Run one `tests` block -- `compileAs` (defaults to rule `name`) is the rule to parse each `input` as.
   * - Fails loudly if `compileAs` couldn't be determined at all, rather than silently skipping.
   */
  function executeTestBlock(name: string | undefined, { compileAs = name, tests, beforeEach }: P.RuleTestBlock) {
    if (!compileAs) {
      test("compileAs property of test is defined", () => {
        expect(compileAs).toBeTruthy()
      })
      return
    }
    const ruleName = compileAs

    tests
      .map(P.normalizeRuleTest)
      // skip blank tests or where `skip` is true
      .filter(({ skip, input }) => !skip && input !== "")
      .forEach((test) => executeTest(test, ruleName, beforeEach))
  }

  /**
   * Run a single normalized test case: parse+compile `input` as `ruleName` in a fresh scope, register
   * a vitest `test()`/`describe()` comparing result to `output`.
   * - Whitespace (returns/tabs) is made visible via `showWhitespace()` so mismatches are legible in output.
   */
  function executeTest(
    { input, output, title }: NormalizedRuleTest,
    ruleName: string,
    beforeEach?: (scope: P.Scope) => void
  ) {
    // Run `initializeContext` method passed in to the test suite.
    if (initializeContext) initializeContext()

    // Get a test scope to parse with.
    const scope = parser.getScope(`test_${moduleName}`)
    // If a `beforeEach` method was defined, run that before parsing to seed variables/etc.
    if (beforeEach) beforeEach(scope)

    const compiled = compileMatch(scope, ruleName, input, output)
    const success = isEqual(compiled, output)

    const testTitle = `${(title ? `${title}: '` : "'") + showWhitespace(input)}'`
    if (success) {
      test(testTitle, () => expect(true).toBe(true))
      return
    }

    if (typeof compiled === "string" && typeof output === "string") {
      describe(testTitle, () => {
        // Show returns and tabs in the output display
        test(`compiled matches output`, () => expect(showWhitespace(compiled)).toBe(showWhitespace(output)))
      })
    } else {
      test(testTitle, () => expect(compiled).toEqual(output))
    }
  }

  /**
   * Parse and compile `input` as `ruleName`, returning the compiled output.
   * - Returns the error if `compile()` throws (unless it's a `ParserError` and no `output` is expected).
   * - Returns `undefined` if parsing fails or throws.
   */
  function compileMatch(scope: P.Scope, ruleName: string, input: string, output: unknown): unknown {
    try {
      const match = scope.parse(input, ruleName)
      if (!match) return undefined
      try {
        return match.compile()
      } catch (e) {
        if (e instanceof P.ParserError && output === undefined) return undefined
        return e
      }
    } catch (e) {
      return undefined
    }
  }
}
