import { CustomError } from "~/util"
import type { P } from "~/parser"

export type { RulexParser } from "~/languages/rulex/RulexParser"

////////////////
// ## Parser test rules
////////////////

/** Test at the start of the token stream. */
export const AT_START = "AT_START"
/** Test anwyhere within the token stream. */
export const ANYWHERE = "ANYWHERE"

/**
 * Start testing:
 * - `AT_START` of the token stream, or
 * - `ANYWHERE` within the stream?
 */
export const TestLocation = { AT_START, ANYWHERE } as const
export type TestLocation = keyof typeof TestLocation

////////////////
// ## Patterns
////////////////

/** Alpha-numeric word, including dashes or underscores. */
export const ALPHANUMERIC_WORD_WITH_DASHES = /^[a-zA-Z][\w-]*$/

////////////////
// ## Rulex language
////////////////

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

////////////////
// ## Errors
////////////////

/** Error we'll throw when setting up / executing parser. */
export class ParserError extends CustomError {}

////////////////
// ## Testing
////////////////

export type FailedRuleTest = { ruleName: string | undefined; input: string; expected: unknown; result: unknown }

export type TestResults = {
  pass: number
  fail: number
  failed: FailedRuleTest[]
  time: number
}

export type SpeedTestResults = Omit<TestResults, "time"> & {
  initialTime: number
  average: number
  min: number
  max: number
}

/** A single rule test: `[input, expectedOutput]` tuple or an object with the same. */
export type RuleTest =
  | [input: string | string[], output: unknown]
  | { title?: string; input: string | string[]; output: unknown; skip?: boolean }

/** Block of rule tests, optionally compiled as a different rule (`compileAs`). */
export type RuleTestBlock = {
  title?: string
  compileAs?: string
  skip?: boolean
  showAll?: boolean
  beforeEach?: (scope: P.Scope) => void
  tests: RuleTest[]
}

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
