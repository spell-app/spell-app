// ----------------------------
// Test utilites
// ----------------------------
import { spellCore } from "."

Object.assign(spellCore, {
  _getTestResultIcon(success) {
    if (success === undefined) return "❓"
    return !!success ? "✅" : "❌"
  },
  /** Dynamic test: prints to console for now... */
  test(message, testMethod, collapse) {
    spellCore.startTest(message, collapse)
    try {
      testMethod()
    } catch (e) {}
    spellCore.endTest()
  },
  /** Dynamic test: prints to console for now... */
  quietlyTest(message, testMethod) {
    return spellCore.test(message, testMethod, true)
  },

  startTest(message, collapse = true) {
    if (spellCore.ACTIVE_TEST) spellCore.endTest()
    spellCore.ACTIVE_TEST = {
      message,
      collapse,
      result: undefined,
      output: []
    }
  },
  echo(message) {
    if (spellCore.ACTIVE_TEST) spellCore.ACTIVE_TEST.output.push(message)
    else spellCore.console.info(message)
  },
  echoTestAction(message) {
    const output = `> Executing \`${message}\``
    if (spellCore.ACTIVE_TEST) spellCore.ACTIVE_TEST.output.push(output)
    else spellCore.console.info(output)
  },
  endTest() {
    const test = spellCore.ACTIVE_TEST
    if (!test) return
    delete spellCore.ACTIVE_TEST

    const icon = spellCore._getTestResultIcon(test.result)
    spellCore.console[test.collapse ? "groupCollapsed" : "group"](`${icon} ${test.message}`)
    test.output.forEach((line) => spellCore.console.log(line))
    spellCore.console.groupEnd()
  },

  /**
   * Return message as to whether a runtime assertion is true or false.
   * Message will start with `spellCore.TEST_SUCCESS` or `spellCore.TEST_FAILURE`
   *
   * - With 2 arguments:
   *    - passes if `thing` is truthy
   *    - `thingSource` is spell Expression source for `thing`
   * - With 4 arguments:
   *    - uses `spellCore.equals(thing, otherThing)`
   *    - `thingSource` is spell Expression source for `thing`
   *    - `otherSource` is spell Expression source for `otherThing`
   */
  expect(thing, thingSource, otherThing, otherSource) {
    let result
    if (arguments.length === 2) {
      result = !!thing
      otherSource = `truthy`
    } else {
      result = spellCore.equals(thing, otherThing)
      otherSource = spellCore.backTickQuote(otherSource)
    }
    const icon = spellCore._getTestResultIcon(result)
    let output = `${icon} Expected ${spellCore.backTickQuote(thingSource)} to be ${otherSource}`
    if (!result) output += `, got: ${spellCore.backTickQuote(thing)}`

    const test = spellCore.ACTIVE_TEST
    if (!test) {
      spellCore.console.log(result)
    } else {
      if (test.result === undefined) test.result = result
      else if (!result) test.result = false
      test.output.push(output)
    }
  }
})
