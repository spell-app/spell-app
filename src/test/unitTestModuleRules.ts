//  Helper scripts to test rules defined for a parser "module"
//
//  To make a rule testable, add a `tests` block to parser rules with `defineRules()`.
//  Call `unitTestModuleRules(<moduleName>)` to test all rules in that module.
//
//  TODO: add `only` to test block to skip everything else in the file
//  TODO: rules w/specific titles to `{ title, input, output }`
//  TODO: output as a function?

import { describe, test, expect } from "vitest"
import groupBy from "lodash/groupBy"
import isEqual from "lodash/isEqual"

import { showWhitespace } from "~/util"

import { P } from "~/parser"

type NormalizedRuleTest = ReturnType<typeof P.normalizeRuleTest>

/**
 * Unit test all rules for `moduleName` in `parser`.
 * If you pass `initializeContext` it will be executed before each rule.
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

  function getTestableRulesForModule(module: string): P.Rule[] | undefined {
    const testable = parser.rules._testable_
    if (!(testable instanceof P.Group)) return undefined
    return groupBy(testable.rules, "module")[module]
  }

  function executeRuleTests({ name, tests }: P.Rule) {
    describe(`rule '${name}'`, () => {
      tests?.forEach((testBlock) => {
        if (testBlock.skip) return
        if (testBlock.title) describe(testBlock.title, () => executeTestBlock(name, testBlock))
        else executeTestBlock(name, testBlock)
      })
    })
  }

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
