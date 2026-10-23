/**
 * What a runner does with how a project's tests went (`TestResult`s, from `testApp()`):
 * shows them on its console, and reports them to the editor, which shows each failed check on its line.
 * - The VS Code runner's Run Tests uses them (epic `spanish`, Card Checks and Test Results).
 * - Reads only `spell-lang/core`'s types:  the results come from a runtime copy, `spell-runtime.js`.
 */
import type { LSP } from "spell-app/lsp"
import type { Core, TestResult } from "spell-lang/core/core.types"
import type { SpellConsole } from "spell-lang/core/console"
import { appTexts } from "spell-app/app/ui/AppTexts"

/**
 * Show `results` on `console`, e.g. the runner's Program Output, as `spell test` prints them:
 * a group saying how many passed, then `✓` and each test that passed, `✗` and each that failed.
 * - Under a failed one:  each check that failed, and what it said if it threw, as `core` said them:
 *   in the program's language.
 * - The group's open when a test failed, else closed.
 * - None:  one line, saying how to write one.
 * - `problem`:  the error message, if loading the program threw -- after the results it got to.
 * - `core`:  the copy the tests ran on, for what a throw says, in the program's language (`test-threw`).
 */
export function showTestResults(
  console: SpellConsole,
  { results, problem }: { results: TestResult[]; problem?: string },
  core: Pick<Core, "message">
): void {
  if (!results.length && !problem) {
    console.info(appTexts.text("noTests"))
    return
  }
  const failed = results.filter(({ passed }) => !passed).length
  const summary = appTexts.text("testResults", { passed: results.length - failed, failed })
  if (failed || problem) console.group(summary)
  else console.groupCollapsed(summary)
  for (const result of results) {
    if (result.passed) {
      console.info(`${PASSED} ${result.name}`)
      continue
    }
    console.group(`${FAILED} ${result.name}`)
    for (const check of result.checks) if (!check.passed) console.log(check.message)
    if (result.threw !== undefined) console.error(threwMessage(result, core))
    console.groupEnd()
  }
  if (problem) console.error(problem)
  console.groupEnd()
}

/**
 * `results` as the language server reads them (`spell/testDiagnostics`):  each test's failed checks, and if it threw.
 * - Plain data, so it posts to the extension:  no things, no errors.
 * - Each failure says which of its test's checks written the same way it is (`occurrence`):
 *   `it is face up` before and after a flip.
 * - `core`:  the copy the tests ran on, for what a throw says, in the program's language (`test-threw`).
 */
export function testReportsOf(results: TestResult[], core: Pick<Core, "message">): LSP.TestReport[] {
  return results.map((result) => {
    const { name, method, passed, checks } = result
    const failures: LSP.TestFailure[] = []
    checks.forEach((check, index) => {
      if (check.passed) return
      const { what, expected, message } = check
      const occurrence = checks
        .slice(0, index)
        .filter((before) => before.what === what && before.expected === expected).length
      failures.push(expected === undefined ? { what, message, occurrence } : { what, expected, message, occurrence })
    })
    const report: LSP.TestReport = { name, passed, failures }
    if (method) report.method = method
    if (result.threw !== undefined) report.threw = threwMessage(result, core)
    return report
  })
}

/** What a test that threw says:  `Error in test "test jokers": oops` -- the core's words, then the error's message. */
function threwMessage({ name, threw }: TestResult, core: Pick<Core, "message">): string {
  const error = threw instanceof Error ? threw.message : String(threw)
  return `${core.message("test-threw", { test: JSON.stringify(name) })} ${error}`
}

/** What a test that passed starts with, as `spell test` prints it. */
const PASSED = "✓"

/** What a test that failed starts with. */
const FAILED = "✗"
