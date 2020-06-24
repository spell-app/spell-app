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
  test(message, testMethod, collapse = true) {
    spellCore.startTest(message, collapse)
    try {
      testMethod()
    } catch (e) {}
    spellCore.endTest()
  },

  startTest(message, collapse = true) {
    if (spellCore.ACTIVE_TEST)
      throw new TypeError(`spellCore.startTest(${message}): only one test can be active at a time!`)

    spellCore.ACTIVE_TEST = {
      message,
      collapse,
      result: undefined,
      output: []
    }
  },
  echo(message) {
    if (spellCore.ACTIVE_TEST) spellCore.ACTIVE_TEST.output.push(message)
    else console.info(message)
  },
  echoTestAction(message) {
    const output = `> Executing \`${message}\``
    if (spellCore.ACTIVE_TEST) spellCore.ACTIVE_TEST.output.push(output)
    else console.info(output)
  },
  endTest() {
    const test = spellCore.ACTIVE_TEST
    if (!test) return
    delete spellCore.ACTIVE_TEST

    const icon = spellCore._getTestResultIcon(test.result)
    console[test.collapse ? "groupCollapsed" : "group"](`${icon} ${test.message}`)
    test.output.forEach((line) => console.log(line))
    console.groupEnd()
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
      console.log(result)
    } else {
      if (test.result === undefined) test.result = result
      else if (!result) test.result = false
      test.output.push(output)
    }
  }
})
