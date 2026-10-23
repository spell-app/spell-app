import { describe, expect, test } from "vite-plus/test"

import type { TestCheck, TestResult } from "spell-lang/core/core.types"
import { testReportsOf } from "spell-app/app/runner/testResults"

/** What a core says, as the runner's test copy does:  the key and its values. */
const core = { message: (key: string, values: Record<string, unknown> = {}) => `${key} ${JSON.stringify(values)}` }

/** A check of `what` that should be `expected`. */
const check = (what: string, expected: string | undefined, passed: boolean): TestCheck => ({
  passed,
  what,
  expected,
  message: `${what} ${passed ? "is" : "isn't"} ${expected}`
})

describe("testReportsOf()", () => {
  test("each test's failed checks, each saying which of its test's checks written the same way it is", () => {
    const result: TestResult = {
      name: "test card setup",
      method: "testCardSetup",
      passed: false,
      checks: [
        check("it is face up", "yes", true),
        check("its rank", "queen", false),
        check("it is face up", "yes", false),
        check("it runs", undefined, false)
      ],
      output: []
    }
    expect(testReportsOf([result], core)).toEqual([
      {
        name: "test card setup",
        method: "testCardSetup",
        passed: false,
        failures: [
          { what: "its rank", expected: "queen", message: "its rank isn't queen", occurrence: 0 },
          { what: "it is face up", expected: "yes", message: "it is face up isn't yes", occurrence: 1 },
          { what: "it runs", message: "it runs isn't undefined", occurrence: 0 }
        ]
      }
    ])
  })

  test("a test that threw says so, in the core's words;  a `start test` has no method", () => {
    const threw: TestResult = { name: "test jokers", passed: false, checks: [], output: [], threw: new Error("oops") }
    expect(testReportsOf([threw], core)).toEqual([
      {
        name: "test jokers",
        passed: false,
        failures: [],
        threw: `test-threw {"test":"\\"test jokers\\""} oops`
      }
    ])
  })
})
