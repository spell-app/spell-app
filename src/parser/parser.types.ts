import { CustomError } from "~/util"
import type { P } from "~/parser"

export type { RulexParser } from "~/languages/rulex/RulexParser"

// ## Parser test rules

/** Test at the start of the token stream. */
export const AT_START = "AT_START"
/** Test anywhere within the token stream. */
export const ANYWHERE = "ANYWHERE"

/**
 * Start testing:
 * - `AT_START` of the token stream, or
 * - `ANYWHERE` within the stream?
 */
export const TestLocation = { AT_START, ANYWHERE } as const
export type TestLocation = keyof typeof TestLocation

// ## Patterns

/** Alpha-numeric word, including dashes or underscores. */
export const ALPHANUMERIC_WORD_WITH_DASHES = /^[a-zA-Z][\w-]*$/

// ## Rulex language

/**
 * Given a list of group names separated by `:`, return an object type for `match.groups`.
 * - e.g. `Match<RulexGroups<"lhs:rhs">>` gives `groups: { lhs?: Match; rhs?: Match }`
 * - Pass `ValueType` to override, e.g. `RulexGroups<"items", Match[]>` for repeated groups.
 */
export type RulexGroups<GroupString extends string, ValueType = P.Match> = Prettify<
  Partial<{
    [Group in SplitString<GroupString>]: ValueType
  }>
>

/** Groups for the optional `testLocation`, `argument` and `repeatFlag` rules which adorn most rulex rules. */
export type FlagGroups = RulexGroups<"repeatFlag:argument:testLocation">

// ## Errors

/** Error we'll throw when setting up / executing parser. */
export class ParserError extends CustomError {}

// ## Testing

/**
 * One failed rule test, as collected in `TestResults.failed`.
 * - `ruleName` -- rule under test, `undefined` for an anonymous rule.
 * - `input` -- input text that was tested.
 * - `expected` -- expected output.
 * - `result` -- actual result (or thrown error) we got instead.
 */
export type FailedRuleTest = { ruleName: string | undefined; input: string; expected: unknown; result: unknown }

/** Results of running `testRules()` (or one leg of `speedTest()`) across a set of rules. */
export type TestResults = {
  /** Number of tests that passed. */
  pass: number
  /** Number of tests that failed. */
  fail: number
  /** Failed tests, with expected vs. actual result. */
  failed: FailedRuleTest[]
  /** Total time taken, in msec. */
  time: number
}

/** Results of `Parser.speedTest()` -- `TestResults` minus `time`, plus timing stats across repeated runs. */
export type SpeedTestResults = Omit<TestResults, "time"> & {
  /** Time of first (cold, warm-up) run, in msec. */
  initialTime: number
  /** Average time across warmed-up runs, in msec. */
  average: number
  /** Fastest warmed-up run, in msec. */
  min: number
  /** Slowest warmed-up run, in msec. */
  max: number
}

/** A single rule test: `[input, expectedOutput]` tuple or an object with the same. */
export type RuleTest =
  | [input: string | string[], output: unknown]
  | { title?: string; input: string | string[]; output: unknown; skip?: boolean }

/** Block of rule tests, optionally compiled as a different rule (`compileAs`). */
export type RuleTestBlock = {
  /** Optional label for this block of tests, e.g. shown in debug output. */
  title?: string
  /** Rule name to compile as, if different from rule under test.  Defaults to that rule's name. */
  compileAs?: string
  /** Set `true` to skip this whole block. */
  skip?: boolean
  /** TODO: not read anywhere in `Parser.testRules()` -- looks unused. */
  showAll?: boolean
  /** Run before each test, e.g. to seed scope `variables`/`constants`. */
  beforeEach?: (scope: P.Scope) => void
  /** Tests to run for this block. */
  tests: RuleTest[]
}

/** Array of `RuleTestBlock`s, e.g. `rule.tests`. */
export type RuleTests = RuleTestBlock[]

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
