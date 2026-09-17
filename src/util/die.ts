import { UIError } from "./CustomError"

/**
 * Die with some error `message` and optional `params`.
 * Simple error-throwing utility for quick failures.
 */
export function die(message: string, params?: any) {
  console.warn(`DIE!  ${message}`, params || "(no params)")
  return new Error(message)
}

/**
 * Return a function we'll use to `die()` when something goes wrong.
 *
 * In `getDier()`:
 *  - `context` (required) is the object that owns the process, e.g. an instance or singleton.
 *  - `activity` (required) is the name of the activity you're performaing.
 *  - `params` (optional) are any relevant parameters.
 *
 * This will give you back a `die` function that takes arguments:
 *  - `message` (required) text description for exactly what went wrong.
 *  - `error` (optional) Originally thrown error, e.g. `fetch` error, etc.
 * The `die` function has a `params` object (a clone of `params` above, or an empty object if no params).
 * You can update `params` as you go, e.g. if you're figuring out unspecified params as you go along.
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
 *    // die if you can't return an expected value
 *    return finalResult ?? die("Last minute failure")
 *  }
 */
export function getDier(context: any, activity: string, params: any) {
  function die(message: string, error?: any): never {
    throw new UIError(
      {
        message,
        context,
        activity,
        params,
        error
      },
      die
    )
  }
  // update `die.params` as you go
  die.params = { ...params }
  return die
}
