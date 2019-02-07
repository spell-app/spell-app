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

  if (rules) {
    // For each testable rule
    for (const rule of rules) {
      const { name, tests } = rule;
      describe(`--- rule '${name}'`, () => {

        // For each test block
        for (const { title, compileAs: ruleName = name, tests } of tests) {
            const description = `${title} (as ${ruleName})`;
            // For each input/output pair
            let errorFound;
            for (const [input, output] of tests) {
              // run the test
              const result = executeCompileTest(ruleName, input, output);
              // if no match
              if (result !== output) {
//console.warn(result, "\n", input, "\n", output);
                // write title first, then failed tests
                // note that multiple tests with same description will be merged in the output
                describe(description, () => {
                  test(input, () => expect(result).toBe(output));
                });
                errorFound = true;
              }
            } // end input/output pair

            // If no error found, print the test title lightly and checked
            if (!errorFound) {
              test(description, () => expect(true).toBe(true));
            }
        } // end test block
      });
    } // end testable rule
  }
});

function executeCompileTest(ruleName, input, output) {
  try {
    return parser.compile(ruleName, input);
  } catch (e) {
    if (e instanceof ParseError && output === undefined) return undefined;
    return e;
  }
}
