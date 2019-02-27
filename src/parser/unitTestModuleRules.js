//  Helper scripts to test rules defined for a parser "module"
//
//  To make a rule testable, add a `tests` block to parser rules with `defineRules()`.
//  Call `unitTestModuleRules(<moduleName>)` to test all rules in that module.
//
//  TODO: `showAll` as global flag?
//  TODO: add `only` to test block to skip everything else in the file
//  TODO: rules w/specific titles to `{ title, input, output }`
//  TODO: output as a function?

import groupBy from "lodash/groupBy";
import isEqual from "lodash/isEqual";
import omit from "lodash/omit";

import {
  ParseError,
  Rule,
} from "../parser/all.js";

import {
  showWhitespace
} from "../utils/all.js";

export function unitTestModuleRules(parser, moduleName, showAll) {
  describe(`rule unit tests`, () => {
    const rules = getTestableRulesForModule(moduleName);
    if (!rules || rules.lenth === 0) {
      test("no testable rules found", () => {
        expect(false).toBe(true);
      });
      return;
    }

    rules.forEach(rule => executeRuleTests(rule, showAll));
  });

  function getTestableRulesForModule(moduleName) {
    const testableRules =
      parser.rules._testable_ instanceof Rule.Group &&
      parser.rules._testable_.rules;

    if (!testableRules) return undefined;

    const modules = groupBy(testableRules, "module");
    return modules[moduleName];
  }

  function executeRuleTests({ name, tests }, showAll) {
    // Handle simple block of e
    describe(`rule '${name}'`, () => {
      tests.forEach(test => {
        if (test.skip) return;
        if (showAll) test.showAll = true;
        if (test.title) {
          describe(test.title, () => executeTestBlock(name, test));
        } else executeTestBlock(name, test);
      });
    });
  }

  function executeTestBlock(name, { compileAs = name, showAll, tests }) {
    if (!compileAs) {
      test("compileAs property of test is defined", () => {
        expect(compileAs).toBeTruthy();
      });
      return;
    }

    // Normalize tests as `[input, output]` to `{ title: input, input, output }`
    tests = tests
      .map(test => {
        if (Array.isArray(test)) {
          const [input, output] = test;
          test = { title: showWhitespace(input), input, output };
        }
        // skip blank tests or where `skip` is true
        if (test.skip || test.input === "") return undefined;
        return test;
      })
      .filter(Boolean);

    // bail early if no actual tests
    if (tests.length === 0) return;

    // Excute each test
    const results = tests.map(test => executeTest(test, compileAs, showAll));

    // If they all passed, output number of elided tests
    if (!showAll && results.every(Boolean)) {
      test(`(${results.length} successful test${results.length !== 1 ? "s" : ""})`, () =>
        expect(true).toBe(true));
    }
  }

  function executeTest({ input, output, title }, ruleName, showAll) {
    const [match, result] = executeCompileTest(ruleName, input, output);

    const success = isEqual(result, output);
    // If it didn't work, log the match for debugging purposes
    if (!success) {
      if (match instanceof Error) {
        console.warn(`ERROR PARSING: "${input}": ${match.message}`);
      }
      else {
        console.warn(`ERROR PARSING: "${input}"\n   match: `, omit(match, ["tokens", "rule"]));
      }
    }
    if (typeof result === "string" && typeof output === "string") {
      // Show returns and tabs in the output display
      test(title, () => expect(showWhitespace(result)).toBe(showWhitespace(output)));
    } else {
      test(title, () => expect(result).toEqual(output));
    }

    // if we were successful, see if match.inputText is the same as the output
//     if (match) {
//       const matchInput = match.inputText;
//       if (input !== matchInput) {
//         test(`input text for: '${title}'`, () => expect(showWhitespace(matchInput)).toBe(showWhitespace(input)));
//       }
//     }
    return success;
  }

  function executeCompileTest(ruleName, input, output) {
    let match, result;
    try {
      match = parser.parse(ruleName, input);
      if (match) {
        try {
          result = match.compile();
        }
        catch (e) {
          if (e instanceof ParseError && output === undefined) return [undefined, undefined];
          result = e;
        }
      }
    } catch (e) {
      if (e instanceof ParseError && output === undefined) return [undefined, undefined];
      match = e;
    }
    return [match, result];
  }
}
