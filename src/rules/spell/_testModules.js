import groupBy from "lodash/groupBy";

import { ParseError } from "../../Parser.js";
import { showWhitespace } from "../../utils/string.js";

import parser from "./index.js";

export function getTestableRulesForModule(moduleName) {
  const testableRules = !!parser.rules._testable_
      && (parser.rules._testable_ instanceof Rule.Alternatives)
      && Array.isArray(parser.rules._testable_.rules)
      && parser.rules._testable_.rules;

  if (!testableRules) return undefined;

  const modules = groupBy(testableRules, "module");
  return modules[moduleName];
}

export default function testRulesForModule(moduleName) {
  describe(`rule unit tests`, () => {
    const rules = getTestableRulesForModule(moduleName);
    if (!rules || rules.lenth === 0) {
      test("no testable rules found", () => {
        expect(false).toBe(true);
      })
      return;
    }

    rules.forEach(executeRuleTests);
  });
}

function executeRuleTests({ name, tests }) {
  describe(`rule '${name}'`, () => {
    tests.forEach(test => {
      if (test.title) {
        describe(test.title, () => executeTestBlock(name, test));
      }
      else executeTestBlock(name, test)
    });
  });
}

function executeTestBlock(name, { title, compileAs = name, showAll, tests }) {
  if (!compileAs) {
    test("compileAs property of test is defined", () => {
      expect(compileAs).toBeTruthy();
    });
    return;
  }
  // normalize tests, including figuring out the test title
  // If an array, it's a simple list of `[input, output]`
  if (Array.isArray(tests)) {
    tests = tests
      .map(([input, output]) => {
        // skip blank tests
        if (input === "" && output == "") return undefined;
        return { input, output, title: showWhitespace(input) };
      })
      .filter(Boolean);

    // bail early if no actual tests
    if (tests.length === 0) return;
  }
  // If `tests` is an object, that's a map of `{ title: [input, output] }`
  else if (tests && tests.constructor === Object) {
    tests = Object.keys(tests).map(title => {
      return { input: tests[title][0], output: tests[title][1], title };
    });
  }
  else {
    throw new TypeError(`Test block ${title}: tests must be object or array`);
  }
  const results = tests.map(test => executeTest(test, compileAs, showAll));

  // If they all passed, output number of elided tests
  if (!showAll && results.every(Boolean)) {
    test(`(${results.length} successful test${results.length !== 1 ? "s" : ""})`, () => expect(true).toBe(true));
  }
}

function executeTest({ input, output, title }, ruleName, showAll) {
  const result = executeCompileTest(ruleName, input, output);
  // only output the test if the test worked as expected or `showAll` is true
  if (result !== output || showAll) {
    // Show returns and tabs in the output display
    test(title, () =>
      expect(showWhitespace(result)).toBe(showWhitespace(output))
    );
  }
  return result === output;
}

function executeCompileTest(ruleName, input, output) {
  try {
    return parser.compile(ruleName, input);
  } catch (e) {
    if (e instanceof ParseError && output === undefined) return undefined;
    return e;
  }
}
