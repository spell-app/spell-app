import { spellCore } from "."

const PATH_PATTERN = /(\.|\[[^\]]+\])/

Object.assign(spellCore, {
  /**
   * Given an `object` and a string `path`, walk the path to get the leaf value.
   * Returns `undefined` on invalid path.
   */
  getPath(object, path) {
    if (object == null) return object
    const steps = spellCore.splitPath(path)
    if (!steps) return undefined
    let target = object
    for (let i = 0; i < steps.length; i++) {
      let key = steps[i]
      if (target == null) return undefined
      if (typeof key === "number" && typeof target.getItem === "function") target = target.getItem(key)
      else target = target[key]
    }
    return target
  },

  /**
   * Given an `object`, walk the `path` and set the leaf step to `value`.
   * Will build objects or arrays if path steps are not defined.
   *
   * Returns `value`, or `undefined` if passed an invalid `path`.
   */
  setPath(object, path, value) {
    if (object == null) return object
    const steps = spellCore.splitPath(path)
    if (!steps) return undefined
    let target = object
    // go right up to the penultimate item
    if (steps.length > 1) {
      for (let i = 0; i < steps.length - 1; i++) {
        const key = steps[i]
        if (target[key] == null) {
          if (typeof steps[i + 1] === "number") target[key] = []
          else target[key] = {}
        }
        if (typeof key === "number" && typeof target.getItem === "function") target = target.getItem(key)
        else target = target[key]
      }
    }
    const key = steps[steps.length - 1]
    if (typeof key === "number" && typeof target.setItem === "function") {
      target.setItem(key, value)
    } else if (value === undefined) {
      target[key] = undefined
      delete target[key]
    } else {
      target[key] = value
    }
    return value
  },

  /** Registry of known path items. */
  PATH_REGISTRY: {},

  /**
   * Split a `path` into an array of `steps`.
   * We memoize the `steps` for a given `path` string.
   */
  splitPath(path) {
    if (!path || typeof path !== "string") return undefined
    if (spellCore.PATH_REGISTRY[path]) return spellCore.PATH_REGISTRY[path]
    const steps = path.trim().split(PATH_PATTERN)
    let step
    try {
      for (let i = steps.length - 1; i >= 0; i--) {
        step = steps[i].trim()
        // eliminate `..`
        if (!step || step === ".") {
          steps.splice(i, 1)
          continue
        }
        // convert bracket
        if (step[0] === "[") {
          if (step.substr(-1) !== "]") throw "missing end ]"
          step = step.slice(1, -1).trim()
          if (step[0] === '"' || step[0] === '"') {
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
      steps = undefined
    }
    spellCore.PATH_REGISTRY[path] = steps
    return steps
  }
})
