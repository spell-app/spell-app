import { spellCore } from "./core"
import { defineSpellCoreModule } from "./spellCore.types"

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
 * - Message is prefixed with a result icon from `spellCore._getTestResultIcon()` (`✅`/`❌`).
 * - With 2 arguments:
 *    - passes if `thing` is truthy
 *    - `thingSource` is spell Expression source for `thing`
 * - With 4 arguments:
 *    - uses `spellCore.equals(thing, otherThing)`
 *    - `thingSource` is spell Expression source for `thing`
 *    - `otherSource` is spell Expression source for `otherThing`
 * - SIDE EFFECT: appends to `spellCore.ACTIVE_TEST.output` if a test is running, else logs directly
 *   to `spellCore.console`.
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
    success = spellCore.equals(thing, otherThing)
    otherSource = spellCore.backTickQuote(otherSource)
  }

  const output: unknown[] = [spellCore._getTestResultIcon(success)]
  thingSource = spellCore.backTickQuote(thingSource)
  if (success) {
    output.push("As expected", thingSource, "is", otherSource)
  } else {
    output.push("Unexpected:", thingSource, "should be", otherSource, "but is actually", spellCore.backTickQuote(thing))
  }

  const test = spellCore.ACTIVE_TEST
  if (test) {
    if (test.result === undefined) test.result = success
    else if (!success) test.result = false
    test.output.push(output)
  } else {
    spellCore.console.log(...output)
  }
}

/**
 * Assembled `spellCore` test-utility methods -- `test()`/`expect()`/`echo()`/`start test`/`end test`
 * for writing inline assertions and debug narration directly in spell source.
 * TODO: merge this with SpellCore.console so `print XXX` in a test goes to ACTIVE_TEST
 * TODO: print result of "executing" e.g. Executing `display the deck` returned `xxx`
 */
export const testMethods = defineSpellCoreModule({
  /** Currently-running dynamic test, if any. */
  ACTIVE_TEST: undefined as ActiveTest | undefined,

  /** Map `success` (`undefined` ~== not yet determined) to a display icon. */
  _getTestResultIcon(success: boolean | undefined): string {
    if (success === undefined) return "❓"
    return success ? "✅" : "❌"
  },
  /**
   * Dynamic test: prints to console for now...
   * - SIDE EFFECT: sets `spellCore.ACTIVE_TEST` via `startTest()`/`endTest()`, so any `expect()`/
   *   `echo()` during `testMethod()` gets grouped under this test instead of logging directly.
   * - NOTE: errors thrown inside `testMethod` are swallowed silently (see `TODO???` below).
   */
  test(message: unknown, testMethod: () => void, collapse = true): void {
    spellCore.startTest(message, collapse)
    try {
      testMethod()
    } catch (e) {
      // TODO???
    }
    spellCore.endTest()
  },

  /**
   * Begin a named test run, becoming `spellCore.ACTIVE_TEST`.
   * - `collapse` controls whether its console group starts collapsed.
   * - SIDE EFFECT: ends any already-running test first (via `endTest()`).
   * - Compiles from spell `start test {message}` / `start quiet test {message}` (`quiet` maps to
   *   `collapse`; see `start_test` rule in `spell/src/rules/tests/`).
   */
  startTest(message: unknown, collapse = true): void {
    if (spellCore.ACTIVE_TEST) spellCore.endTest()
    spellCore.ACTIVE_TEST = {
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
    if (spellCore.ACTIVE_TEST) spellCore.ACTIVE_TEST.output.push(message)
    else spellCore.console.info(message)
  },
  /**
   * Print `▶️ Executing` plus back-tick-quoted `message`, grouped under current test if one's running.
   * - Narrates each statement's source as it executes -- auto-injected before every statement inside
   *   a method defined `to test ...` (see `P.ASTEchoInvocation` usage in `methods/MethodDefinition.ts`).
   */
  echoTestAction(message: unknown): void {
    const output = ["▶️ Executing  ", spellCore.backTickQuote(message)]
    if (spellCore.ACTIVE_TEST) {
      spellCore.ACTIVE_TEST.output.push(output)
    } else {
      spellCore.console.info(...output)
    }
  },
  /**
   * End currently-running test (if any), logging its icon-prefixed `message` as a console group
   * containing all buffered `output`.
   * - Compiles from spell `end test` (see `spell/src/rules/tests/`).
   */
  endTest(): void {
    const test = spellCore.ACTIVE_TEST
    if (!test) return
    spellCore.ACTIVE_TEST = undefined

    const icon = spellCore._getTestResultIcon(test.result)
    spellCore.console[test.collapse ? "groupCollapsed" : "group"](`${icon} ${test.message}`)
    test.output.forEach((line) => {
      if (Array.isArray(line)) spellCore.console.log(...line)
      else spellCore.console.log(line)
    })
    spellCore.console.groupEnd()
  },

  expect
})
Object.assign(spellCore, testMethods)
