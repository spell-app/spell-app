/* eslint-disable no-use-before-define */
//  Helper scripts to test rules defined for a parser "module"
//
//  To make a rule testable, add a `tests` block to parser rules with `defineRules()`.
//  Call `unitTestModuleRules(<moduleName>)` to test all rules in that module.
//
//  TODO: add `only` to test block to skip everything else in the file
//  TODO: rules w/specific titles to `{ title, input, output }`
//  TODO: output as a function?

import groupBy from "lodash/groupBy"
import isEqual from "lodash/isEqual"

import { ParseError, Rule } from "~/parser"
import { showWhitespace } from "~/util"

export function unitTestModuleRules(parser, moduleName) {
  describe(`rule unit tests`, () => {
    const rules = getTestableRulesForFilePath(moduleName)
    if (!rules || rules.lenth === 0) {
      test("no testable rules found", () => {
        expect(false).toBe(true)
      })
      return
    }

    rules.forEach(rule => executeRuleTests(rule))
  })

  function getTestableRulesForFilePath(module) {
    const testableRules = parser.rules._testable_ instanceof Rule.Group && parser.rules._testable_.rules
    if (!testableRules) return undefined
    const modules = groupBy(testableRules, "module")
    return modules[module]
  }

  function executeRuleTests({ name, tests }) {
    // Handle simple block of e
    describe(`rule '${name}'`, () => {
      tests.forEach(testBlock => {
        if (testBlock.skip) return
        if (testBlock.title) describe(testBlock.title, () => executeTestBlock(name, testBlock))
        else executeTestBlock(name, testBlock)
      })
    })
  }

  function executeTestBlock(name, { compileAs = name, tests, beforeEach }) {
    if (!compileAs) {
      test("compileAs property of test is defined", () => {
        expect(compileAs).toBeTruthy()
      })
      return
    }

    // Normalize tests as `[input, output]` to `{ input, output }`
    tests = tests
      .map(test => {
        if (Array.isArray(test)) {
          const [input, output] = test
          test = { input, output }
        }
        if (Array.isArray(test.input)) test.input = test.input.join("\n")
        if (Array.isArray(test.output)) test.output = test.output.join("\n")
        // skip blank tests or where `skip` is true
        if (test.skip || test.input === "") return undefined
        return test
      })
      .filter(Boolean)

    // bail early if no actual tests
    if (tests.length === 0) return

    // Excute each test
    tests.map(test => executeTest(test, compileAs, beforeEach))
  }

  function executeTest({ input, output, title }, ruleName, beforeEach) {
    // Get a test scope to parse with.
    const scope = parser.getScope(`test_${moduleName}`)
    // If a `beforeEach` method was defined, run that before parsing to seed variables/etc.
    if (beforeEach) beforeEach(scope)

    const [match, result] = executeCompileTest(scope, ruleName, input, output)

    const success = isEqual(result, output)
    // If it didn't work, log the match for debugging purposes
    if (!success) {
      if (match instanceof Error) {
        console.warn(`ERROR PARSING: "${input}": ${match.message}`)
      } else {
        console.warn(`ERROR PARSING: "${input}": match: \n`, match?.toPrint())
      }
    }

    const testTitle = `${(title ? `${title}: '` : "'") + showWhitespace(input)}'`
    if (typeof result === "string" && typeof output === "string") {
      // Show returns and tabs in the output display
      test(testTitle, () => expect(showWhitespace(result)).toBe(showWhitespace(output)))
    } else {
      test(testTitle, () => expect(result).toEqual(output))
    }

    // if we were successful, see if match.inputText is the same as the output
    //     if (match) {
    //       const matchInput = match.inputText;
    //       if (input !== matchInput) {
    //         test(`input text for: '${title}'`, () => expect(showWhitespace(matchInput)).toBe(showWhitespace(input)));
    //       }
    //     }
    return success
  }

  function executeCompileTest(scope, ruleName, input, output) {
    let match
    let result
    try {
      match = scope.parse(input, ruleName)
      if (match) {
        try {
          result = match.compile()
        } catch (e) {
          if (e instanceof ParseError && output === undefined) return [undefined, undefined]
          result = e
        }
      }
    } catch (e) {
      if (e instanceof ParseError && output === undefined) return [undefined, undefined]
      match = e
    }
    return [match, result]
  }
}
