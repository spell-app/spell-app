import groupBy from "lodash/groupBy";

import { ParseError } from "../../Parser.js";

import parser from "./index.js";

describe("defineRule tests", () => {

  // Get all of the `_testable_` rules
  const rules = !!parser.rules._testable_
    && (parser.rules._testable_ instanceof Rule.Alternatives)
    && Array.isArray(parser.rules._testable_.rules)
    && parser.rules._testable_.rules;

  test("testable rules found", () => {
    expect(!!rules && !!rules.length).toBe(true);
  })
  // bail if no rules
  if (!rules) return;

  // divide rules into chunks by their `module`
  const modules = groupBy(rules, "module");

  // Run each module separately
  Object.keys(modules).forEach(key => {
    describe(`\n    module '${key}'`, () => {
      modules[key].forEach(executeRuleTests);
    });
  });
});

function executeRuleTests({ name, tests }) {
  describe(`- rule '${name}'`, () => {
    tests.forEach(test => executeTestBlock(name, test));
  });
}

function executeTestBlock(name, { title, compileAs: ruleName = name, tests }) {
  const description = `${title} (as ${ruleName})`;
  // Execute all of the tests, gathering results as booleans
  const results = tests.map(([input, output]) => executeTest(description, ruleName, input, output));
  // If they all passed, output description text sublty with check
  if (results.every(Boolean)) {
    test(description, () => expect(true).toBe(true));
  }
}

function executeTest(description, ruleName, input, output) {
  const result = executeCompileTest(ruleName, input, output);
  // don't output anything if the test worked as expected
  if (result === output) return true;

  // write title first, then failed test output
  // note that multiple tests with same description will be merged in the output
  describe(description, () => {
    test(input, () => expect(result).toBe(output));
  });
  return false;
}

function executeCompileTest(ruleName, input, output) {
  try {
    return parser.compile(ruleName, input);
  } catch (e) {
    if (e instanceof ParseError && output === undefined) return undefined;
    return e;
  }
}
