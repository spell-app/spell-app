/**
 * Return a function we'll use to `die()` when something goes wrong.
 *
 * In `getDier()`:
 *  - `owner` (required) is the object that owns the process
 *  - `activity` (required) is the name of the activity you're performaing
 *  - `params` (optional) are any relevant parameters.
 *
 * This will give you back a function that takes arguments:
 *  - `message` (required) as specific error message for what went wrong
 *  - `originalError` (optional) originally thrown error, e.g. server error.
 * and has a `params` object (a clone of `params` above, or an empty object if no params).
 * You can update `params` as you go, e.g. if you're figuring out arguments as you go along.
 *
 * e.g.
 *  async function doSomething(param1, param2) {
 *    const die = getDier(this, "doing something", { param1, param2 })
 *
 *    // if you update params, update `dier.params`
 *    if (!param2) param2 = param1 + 1
 *    die.param2 = param2
 *
 *    if (somethingBad) die("Exactly what went wrong")
 *    const aVal = getTheVal() ?? die("Couldn't get the val!")
 *
 *    // wrap server calls and `die()` on the result
 *    try {
 *      await callTheServer()
 *    } catch (e) {
 *      die("Couldn't call the server", e)
 *    }
 *
 *    // die if you can't returning an expected value
 *    return finalResult || die("Last minute failure")
 *  }
 */
export function getDier(owner, activity, params) {
  function die(message, originalError) {
    const output = [`Error ${activity}:: ${message}`]
    Object.entries(die.params).forEach(([key, value]) => {
      output.push(`- '${key}' = '${value}'`)
    })
    if (originalError) console.error(originalError)
    const dieError = new TypeError(output.join("\n"))
    dieError.owner = owner
    dieError.params = die.params
    dieError.originalError = originalError
    throw dieError
  }
  // update `die.params` as you go
  die.params = { ...params }
  return die
}
