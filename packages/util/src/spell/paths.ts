/**
 * Getting and setting values by path, e.g. `"a.b[0].c"` -- pure, for spell's runtime (`spellCore.getPath()` ...)
 * and the app's forms (`FormStore`) alike.
 * - Here, NOT in `$/core`, so the app's own forms don't import `spellCore` -- each runner runs its OWN copy of
 *   that.  See `spellRuntime.ts`.
 */

/** Splits a path into its steps:  a `.`, or a whole `[...]`. */
const PATH_PATTERN = /(\.|\[[^\]]+\])/

/** A single step of a split path: a string key or (for array access) a number. */
export type PathStep = string | number

/**
 * Given an `object` and a string `path`, walk it to get the leaf value.
 * - Returns `undefined` on invalid `path`.
 * - NOTE: if a numeric step targets an object with a `getItem(key)` method (e.g. spell's `List`),
 *   calls that instead of plain index access, so `path` can reach into custom collections too.
 * - Used e.g. by `FormStore` to bind form fields to dotted `value` paths.
 */
export function getPath(object: unknown, path: string): unknown {
  if (object == null) return object
  const steps = splitPath(path)
  if (!steps) return undefined
  let target: unknown = object
  for (let i = 0; i < steps.length; i++) {
    const key = steps[i]
    if (target == null) return undefined
    if (typeof key === "number" && typeof (target as { getItem?: (key: number) => unknown }).getItem === "function") {
      target = (target as { getItem: (key: number) => unknown }).getItem(key)
    } else {
      target = (target as Record<PathStep, unknown>)[key!]
    }
  }
  return target
}

/**
 * Given an `object`, walk `path` and set leaf step to `value`.
 * - Builds objects or arrays along the way if path steps aren't defined yet.
 * - NOTE: if a numeric step targets an object with a `setItem(key, value)` method (e.g. spell's
 *   `List`), calls that instead of plain index assignment.
 * - SIDE EFFECT: `value === undefined` deletes property instead of setting it to `undefined`.
 * - Returns `value`, or `undefined` if passed an invalid `path`.
 */
export function setPath(object: unknown, path: string, value: unknown): unknown {
  if (object == null) return object
  const steps = splitPath(path)
  if (!steps) return undefined
  let target = object as Record<PathStep, unknown>
  // go right up to the penultimate item
  if (steps.length > 1) {
    for (let i = 0; i < steps.length - 1; i++) {
      const key = steps[i]!
      if (target[key] == null) {
        if (typeof steps[i + 1] === "number") target[key] = []
        else target[key] = {}
      }
      if (typeof key === "number" && typeof (target as { getItem?: (key: number) => unknown }).getItem === "function") {
        target = (target as { getItem: (key: number) => Record<PathStep, unknown> }).getItem(key)
      } else {
        target = target[key] as Record<PathStep, unknown>
      }
    }
  }
  const key = steps[steps.length - 1]!
  if (
    typeof key === "number" &&
    typeof (target as { setItem?: (key: number, value: unknown) => unknown }).setItem === "function"
  ) {
    ;(target as { setItem: (key: number, value: unknown) => unknown }).setItem(key, value)
  } else if (value === undefined) {
    target[key] = undefined
    delete target[key]
  } else {
    target[key] = value
  }
  return value
}

/**
 * Split `path` into an array of `steps`.
 * - We memoize `steps` for a given `path` string in `PATH_CACHE`.
 * - Supports dotted (`a.b.c`) and bracketed (`a[0]`, `a["b c"]`) steps; a step that's exactly an
 *   integer becomes a `number`, everything else stays a `string`.
 * - NOTE: on a malformed `path` (unbalanced `[`/`]` or quote), logs an error and caches (and
 *   returns) `undefined` -- but since `undefined` is falsy, the memo check above never
 *   short-circuits on it, so a repeated invalid `path` re-parses (and re-logs) every time.
 */
export function splitPath(path: unknown): PathStep[] | undefined {
  if (!path || typeof path !== "string") return undefined
  if (PATH_CACHE[path]) return PATH_CACHE[path]
  const steps: Array<string | number> = path.trim().split(PATH_PATTERN)
  let step = ""
  try {
    for (let i = steps.length - 1; i >= 0; i--) {
      step = steps[i] as string
      step = step.trim()
      // eliminate `..`
      if (!step || step === ".") {
        steps.splice(i, 1)
        continue
      }
      // convert bracket
      if (step[0] === "[") {
        if (step.substr(-1) !== "]") throw "missing end ]"
        step = step.slice(1, -1).trim()
        if (step[0] === `"` || step[0] === `'`) {
          if (step.substr(-1) !== step[0]) throw `missing end ${step[0]}`
          step = step.slice(1, -1).trim()
        }
      }
      // if we got exactly a number, return a number instead
      const stepAsInt = parseInt(step, 10)
      if (`${stepAsInt}` === step) {
        steps[i] = stepAsInt
      } else {
        steps[i] = step
      }
    }
  } catch (msg) {
    console.error("splitPath('" + path + "'): invalid step '" + step + "': " + msg)
    PATH_CACHE[path] = undefined
    return undefined
  }
  PATH_CACHE[path] = steps
  return steps
}

/** Steps of each `path` split so far -- see `splitPath()`. */
const PATH_CACHE: Record<string, PathStep[] | undefined> = {}
