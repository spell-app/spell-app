import { core } from "./core"
import { defineCoreModule } from "./core.types"

/** State for the currently-running dynamic `test()`. */
export type ActiveTest = {
  /** `message` passed to `startTest()` (or `test()`), used as its console-group heading. */
  message: unknown
  /** Whether test's console group should start collapsed. */
  collapse: boolean
  /**
   * Overall pass/fail across all `expect()` calls so far.
   * `undefined` until first `expect()`, then sticky -- one failure flips it to `false` for good.
   */
  result: boolean | undefined
  /** Lines to print inside test's console group once it ends; each is either arg-array or single value. */
  output: unknown[]
}

/**
 * Return message as to whether a runtime assertion is true or false.
 * - Message is prefixed with a result icon from `core._getTestResultIcon()` (`✅`/`❌`).
 * - With 2 arguments:
 *    - passes if `thing` is truthy
 *    - `thingSource` is spell Expression source for `thing`
 * - With 4 arguments:
 *    - uses `core.equals(thing, otherThing)`
 *    - `thingSource` is spell Expression source for `thing`
 *    - `otherSource` is spell Expression source for `otherThing`
 * - SIDE EFFECT: appends to `core.ACTIVE_TEST.output` if a test is running, else logs directly
 *   to `core.console`.
 * - Compiles from spell `expect {expression} (to be {value})?` (see `expect_test` rule in
 *   `spell/src/rules/tests/`).
 */
export function expect(thing: unknown, thingSource: string): void
export function expect(thing: unknown, thingSource: string, otherThing: unknown, otherSource: string): void
export function expect(thing: unknown, thingSource: string, otherThing?: unknown, otherSource?: string): void {
  let success: boolean
  if (arguments.length === 2) {
    success = !!thing
    otherSource = `truthy`
  } else {
    success = core.equals(thing, otherThing)
    otherSource = core.backTickQuote(otherSource)
  }

  const output: unknown[] = [core._getTestResultIcon(success)]
  thingSource = core.backTickQuote(thingSource)
  if (success) {
    output.push("As expected", thingSource, "is", otherSource)
  } else {
    output.push("Unexpected:", thingSource, "should be", otherSource, "but is actually", core.backTickQuote(thing))
  }

  const test = core.ACTIVE_TEST
  if (test) {
    if (test.result === undefined) test.result = success
    else if (!success) test.result = false
    test.output.push(output)
  } else {
    core.console.log(...output)
  }
}

/**
 * Assembled `core` test-utility methods -- `test()`/`expect()`/`echo()`/`start test`/`end test`
 * for writing inline assertions and debug narration directly in spell source.
 * TODO: merge this with Core.console so `print XXX` in a test goes to ACTIVE_TEST
 * TODO: print result of "executing" e.g. Executing `display the deck` returned `xxx`
 */
export const testMethods = defineCoreModule({
  /** Currently-running dynamic test, if any. */
  ACTIVE_TEST: undefined as ActiveTest | undefined,

  /** Map `success` (`undefined` ~== not yet determined) to a display icon. */
  _getTestResultIcon(success: boolean | undefined): string {
    if (success === undefined) return "❓"
    return success ? "✅" : "❌"
  },
  /**
   * Dynamic test: prints to console for now...
   * - SIDE EFFECT: sets `core.ACTIVE_TEST` via `startTest()`/`endTest()`, so any `expect()`/
   *   `echo()` during `testMethod()` gets grouped under this test instead of logging directly.
   * - NOTE: errors thrown inside `testMethod` are swallowed silently (see `TODO???` below).
   */
  test(message: unknown, testMethod: () => void, collapse = true): void {
    core.startTest(message, collapse)
    try {
      testMethod()
    } catch (e) {
      // TODO???
    }
    core.endTest()
  },

  /**
   * Begin a named test run, becoming `core.ACTIVE_TEST`.
   * - `collapse` controls whether its console group starts collapsed.
   * - SIDE EFFECT: ends any already-running test first (via `endTest()`).
   * - Compiles from spell `start test {message}` / `start quiet test {message}` (`quiet` maps to
   *   `collapse`; see `start_test` rule in `spell/src/rules/tests/`).
   */
  startTest(message: unknown, collapse = true): void {
    if (core.ACTIVE_TEST) core.endTest()
    core.ACTIVE_TEST = {
      message,
      collapse,
      result: undefined,
      output: []
    }
  },
  /**
   * Print `message`, grouped under current test if one's running.
   * - Compiles from spell `echo {expression}` (see `spell/src/rules/tests/`).
   */
  echo(message: unknown): void {
    if (core.ACTIVE_TEST) core.ACTIVE_TEST.output.push(message)
    else core.console.info(message)
  },
  /**
   * Print `▶️ Executing` plus back-tick-quoted `message`, grouped under current test if one's running.
   * - Narrates each statement's source as it executes -- auto-injected before every statement inside
   *   a method defined `to test ...` (see `P.ASTEchoInvocation` usage in `methods/MethodDefinition.ts`).
   */
  echoTestAction(message: unknown): void {
    const output = ["▶️ Executing  ", core.backTickQuote(message)]
    if (core.ACTIVE_TEST) {
      core.ACTIVE_TEST.output.push(output)
    } else {
      core.console.info(...output)
    }
  },
  /**
   * End currently-running test (if any), logging its icon-prefixed `message` as a console group
   * containing all buffered `output`.
   * - Compiles from spell `end test` (see `spell/src/rules/tests/`).
   */
  endTest(): void {
    const test = core.ACTIVE_TEST
    if (!test) return
    core.ACTIVE_TEST = undefined

    const icon = core._getTestResultIcon(test.result)
    core.console[test.collapse ? "groupCollapsed" : "group"](`${icon} ${test.message}`)
    test.output.forEach((line) => {
      if (Array.isArray(line)) core.console.log(...line)
      else core.console.log(line)
    })
    core.console.groupEnd()
  },

  expect
})
Object.assign(core, testMethods)
