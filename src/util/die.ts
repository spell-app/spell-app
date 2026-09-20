import { UIError } from "./CustomError"

/**
 * Return (does not throw) an `Error` with some `message`, warning to console with `params` first.
 * - Simple error-building utility for quick failures -- caller decides whether to `throw` it.
 * - For a richer version with `context`/`activity` tracking, see `getDier()` below.
 */
export function die(message: string, params?: any) {
  console.warn(`DIE!  ${message}`, params || "(no params)")
  return new Error(message)
}

/**
 * Return a `die()` function scoped to some `context`/`activity`, for throwing a `UIError` when things go wrong.
 * - `context` (required) is object that owns process, e.g. an instance or singleton.
 * - `activity` (required) is name of activity you're performing.
 * - `params` (optional) are any relevant parameters.
 * - Returned `die` function takes `message` (required) and `error` (optional, e.g. a caught `fetch` error)
 *   and throws -- return type `never` lets you write `getTheVal() ?? die("Couldn't get the val!")`.
 * - Returned `die` function also carries a `.params` property (clone of `params` above, or `{}`), which you
 *   can mutate as you discover more parameters along the way.
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
  /** Scoped `die()` returned by `getDier()` -- see there for details. */
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
  // Seed `die.params` with a clone of `params` -- callers mutate it as they go.
  die.params = { ...params }
  return die
}
