import { spellCore } from "./core"
import { defineSpellCoreModule } from "./SpellCore"

const PATH_PATTERN = /(\.|\[[^\]]+\])/

/** A single step of a split path: a string key or (for array access) a number. */
export type PathStep = string | number

export const pathMethods = defineSpellCoreModule({
  /**
   * Given an `object` and a string `path`, walk the path to get the leaf value.
   * Returns `undefined` on invalid path.
   */
  getPath(object: unknown, path: string): unknown {
    if (object == null) return object
    const steps = spellCore.splitPath(path)
    if (!steps) return undefined
    let target: unknown = object
    for (let i = 0; i < steps.length; i++) {
      const key = steps[i]
      if (target == null) return undefined
      if (typeof key === "number" && typeof (target as { getItem?: (key: number) => unknown }).getItem === "function") {
        target = (target as { getItem: (key: number) => unknown }).getItem(key)
      } else {
        target = (target as Record<PathStep, unknown>)[key]
      }
    }
    return target
  },

  /**
   * Given an `object`, walk the `path` and set the leaf step to `value`.
   * Will build objects or arrays if path steps are not defined.
   *
   * Returns `value`, or `undefined` if passed an invalid `path`.
   */
  setPath(object: unknown, path: string, value: unknown): unknown {
    if (object == null) return object
    const steps = spellCore.splitPath(path)
    if (!steps) return undefined
    let target = object as Record<PathStep, unknown>
    // go right up to the penultimate item
    if (steps.length > 1) {
      for (let i = 0; i < steps.length - 1; i++) {
        const key = steps[i]
        if (target[key] == null) {
          if (typeof steps[i + 1] === "number") target[key] = []
          else target[key] = {}
        }
        if (
          typeof key === "number" &&
          typeof (target as { getItem?: (key: number) => unknown }).getItem === "function"
        ) {
          target = (target as { getItem: (key: number) => Record<PathStep, unknown> }).getItem(key)
        } else {
          target = target[key] as Record<PathStep, unknown>
        }
      }
    }
    const key = steps[steps.length - 1]
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
  },

  /** Registry of known path items. */
  PATH_REGISTRY: {} as Record<string, PathStep[] | undefined>,

  /**
   * Split a `path` into an array of `steps`.
   * We memoize the `steps` for a given `path` string.
   */
  splitPath(path: unknown): PathStep[] | undefined {
    if (!path || typeof path !== "string") return undefined
    if (spellCore.PATH_REGISTRY[path]) return spellCore.PATH_REGISTRY[path]
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
      spellCore.PATH_REGISTRY[path] = undefined
      return undefined
    }
    spellCore.PATH_REGISTRY[path] = steps
    return steps
  }
})
Object.assign(spellCore, pathMethods)
