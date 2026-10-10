/**
 * Helper scripts to test rules defined for a parser "module".
 * - A rule's tests are registered with it:  `parser.addRule(RuleClass, { syntax, tests })`.
 *   Each test is `[input, js, ts?]` or `{ input, js, ts }`:  see `P.RuleTest`.
 * - Call `unitTestModuleRules(parser, <moduleName>)` to test all rules in that module.
 * - Each input is parsed once, then written by BOTH writers:  javascript (`P.JSWriter`) and TypeScript (`P.TSWriter`).
 *   A test without `ts` expects the same TypeScript as javascript.
 * - Blessing:  `BLESS_RULE_TESTS=1` writes what the TypeScript writer wrote into each test's `ts`, in the source,
 *   then `vp fmt` tidies it -- e.g. `yarn test:rules:bless` in spell.  Read the diff after.
 * - TODO: add `only` to test block to skip everything else in the file.
 */

import { describe, test, expect } from "vite-plus/test"
import groupBy from "lodash/groupBy"
import isEqual from "lodash/isEqual"

import { showWhitespace } from "$/util"

import { P } from "$/parser"
// Import type only:  loaded only when blessing, as it reads and writes files
import type { BlessedTest } from "./RuleTestSource"

/** Shape of one test entry after `P.normalizeRuleTest()` fills in defaults (`title`, `skip`, etc). */
type NormalizedRuleTest = ReturnType<typeof P.normalizeRuleTest>

/** Set, `BLESS_RULE_TESTS=1`:  write each test's `ts` into the source, rather than checking it. */
const IS_BLESSING = !!process.env.BLESS_RULE_TESTS

/**
 * Unit test all rules for `moduleName` in `parser`.
 * - Pass `initializeContext` to have it run before each rule.
 */
export function unitTestModuleRules(parser: P.Parser, moduleName: string, initializeContext?: () => void) {
  /** While blessing:  what the TypeScript writer wrote for each test. */
  const blessed: BlessedTest[] = []

  describe(`rule unit tests`, () => {
    const rules = getTestableRulesForModule(moduleName)
    if (!rules || rules.length === 0) {
      test("no testable rules found", () => {
        expect(false).toBe(true)
      })
      return
    }

    rules.forEach((rule) => executeRuleTests(rule))
    // Each test compiled as it was collected, above:  `blessed` is complete.
    if (IS_BLESSING) {
      test("BLESS_RULE_TESTS:  every test's ts written into its source", async () => {
        expect(await blessSources(expect.getState().testPath!, blessed)).toEqual([])
      })
    }
  })

  describe(`rule group specs`, () => {
    // Drift test:  `Groups` type arguments are erased, so nothing else notices when someone edits a `syntax`
    // string and the groups its matches produce change.  Snapshot is ALSO what to write as the type argument.
    test("match snapshot -- if this fails, update rule's `Groups` type argument, then the snapshot", () => {
      expect(getGroupSpecsForModule(moduleName)).toMatchSnapshot()
    })
  })

  /**
   * Return `{ ruleName: groupSpec }` for rules in `module` whose syntax produces groups, variants merged.
   * - NOTE: only knows syntax-derived groups -- see `Rule.groupSpec`.
   */
  function getGroupSpecsForModule(module: string): Record<string, string> {
    const variants: Record<string, P.GroupSpecEntry[][]> = {}
    const visit = (rule: P.Rule) => {
      if (rule instanceof P.Group) rule.rules.forEach(visit)
      else if (rule.module === module && rule.name) (variants[rule.name] ??= []).push(rule.getGroupSpecEntries())
    }
    // Rules are registered under aliases too, so de-dupe before visiting.
    new Set(Object.values(parser.rules).flatMap((rule) => (rule instanceof P.Group ? rule.rules : [rule]))).forEach(
      visit
    )
    const specs: Record<string, string> = {}
    for (const name of Object.keys(variants).sort()) {
      const spec = P.stringifyGroupSpec(P.mergeGroupSpecs(...variants[name]!))
      if (spec) specs[name] = spec
    }
    return specs
  }

  /** Return `parser`'s testable rules (its `_testable_` group) belonging to `module`, if any. */
  function getTestableRulesForModule(module: string): P.Rule[] | undefined {
    const testable = parser.rules._testable_
    if (!(testable instanceof P.Group)) return undefined
    return groupBy(testable.rules, "module")[module]
  }

  /**
   * Register a `describe()` block for one `rule`, running each of its (non-`skip`) `tests` entries.
   * - Title includes `syntax`:  a rule registered once per syntax has one block per instance, all one `name`.
   */
  function executeRuleTests({ name, syntax, tests }: P.Rule) {
    describe(syntax ? `rule '${name}': ${syntax}` : `rule '${name}'`, () => {
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
   * Run a single normalized test case:  parse `input` as `ruleName` in a fresh scope, write it with both writers,
   * and register a vitest `test()` comparing them to `js` and `ts`.
   * - ONE test per input when both match;  else a `describe()` with a test for each writer that didn't.
   * - Whitespace (returns/tabs) is made visible via `showWhitespace()` so mismatches are legible in output.
   * - While blessing, `ts` isn't checked:  what was written is kept, for `blessSources()`.
   */
  function executeTest(
    { input, js, ts, title }: NormalizedRuleTest,
    ruleName: string,
    beforeEach?: (scope: P.Scope) => void
  ) {
    // Run `initializeContext` method passed in to the test suite.
    if (initializeContext) initializeContext()

    // Get a test scope to parse with.
    const scope = parser.getScope(`test_${moduleName}`)
    // If a `beforeEach` method was defined, run that before parsing to seed variables/etc.
    if (beforeEach) beforeEach(scope)

    const compiled = compileMatch(scope, ruleName, input, js)
    if (IS_BLESSING) blessed.push({ input, js, ts: compiled.ts })
    const failures = [
      { writer: "javascript", got: compiled.js, expected: js },
      { writer: "TypeScript", got: compiled.ts, expected: ts }
    ].filter(({ writer, got, expected }) => !isEqual(got, expected) && !(IS_BLESSING && writer === "TypeScript"))

    const testTitle = `${(title ? `${title}: '` : "'") + showWhitespace(input)}'`
    if (!failures.length) {
      test(testTitle, () => expect(true).toBe(true))
      return
    }
    describe(testTitle, () => {
      for (const { writer, got, expected } of failures) {
        test(`${writer} matches`, () => {
          // Show returns and tabs in the output display
          if (typeof got === "string" && typeof expected === "string") {
            expect(showWhitespace(got)).toBe(showWhitespace(expected))
          } else expect(got).toEqual(expected)
        })
      }
    })
  }

  /**
   * Parse `input` as `ruleName`, and write it with each writer:  `{ js, ts }`.
   * - As its parser's `normalizeTestOutput()` has it, e.g. without spell's declarations comments.
   * - A rule with no AST (`getAST()`) compiles itself:  the same for both.
   * - The TypeScript writer sees just this match, as the whole project (`P.Writer.forProject()`).
   * - A writer's error is what it wrote -- unless it's a `ParserError` and the test expects nothing (`js`).
   * - Both `undefined` if parsing fails or throws.
   */
  function compileMatch(scope: P.Scope, ruleName: string, input: string, js: unknown): { js: unknown; ts: unknown } {
    let match: P.Match | undefined
    try {
      match = scope.parse(input, ruleName)
      if (!match) return { js: undefined, ts: undefined }
      // Lock it in, as block parsing would -- e.g. a new variable's `let`.
      scope.parser?.commit(match)
    } catch (e) {
      return { js: undefined, ts: undefined }
    }
    const written = (write: () => unknown): unknown => {
      try {
        const output = write()
        return scope.parser ? scope.parser.normalizeTestOutput(output) : output
      } catch (e) {
        if (e instanceof P.ParserError && js === undefined) return undefined
        return e
      }
    }
    const parsed = match
    return {
      js: written(() => parsed.compile()),
      ts: written(() => {
        const ast = parsed.rule.getAST ? parsed.AST : undefined
        if (!ast) return parsed.compile()
        const statements = ast instanceof P.ASTStatementGroup ? (ast.statements ?? []) : [ast]
        return P.TSWriter.instance.forProject([statements], scope).write(ast)
      })
    }
  }
}

/**
 * Write each test's `ts` into the source files the test file at `testPath` tests:  see `P.RuleTestSource`.
 * - A module in a folder of its own, `rules/events/events.test.ts`:  every source file in that folder.
 * - Else the file beside it, `rules/Block.test.ts` => `rules/Block.ts`.
 * - Returns what it couldn't bless:  see `P.RuleTestSource.bless()`.
 */
async function blessSources(testPath: string, blessed: BlessedTest[]): Promise<string[]> {
  const { readdirSync } = await import("node:fs")
  const { basename, dirname, join } = await import("node:path")
  const { RuleTestSource } = await import("./RuleTestSource")
  const folder = dirname(testPath)
  const name = basename(testPath, ".test.ts")
  const paths =
    basename(folder) === name
      ? (readdirSync(folder, { recursive: true }) as string[])
          .filter((path) => path.endsWith(".ts") && !path.endsWith(".test.ts"))
          .map((path) => join(folder, path))
      : [join(folder, `${name}.ts`)]
  const sources = paths.map((path) => RuleTestSource.load(path))
  const found = new Set(
    sources.flatMap((source) => source.tests.map(({ input, js }) => RuleTestSource.keyOf(input, js)))
  )
  const notFound = blessed
    .filter(({ input, js, ts }) => !isEqual(ts, js) && !found.has(RuleTestSource.keyOf(input, js)))
    .map(({ input }) => `'${input}':  not found in ${paths.join(", ")}`)
  return [
    ...notFound,
    ...sources.flatMap((source) => {
      const warnings = source.bless(blessed)
      source.save()
      return warnings
    })
  ]
}
