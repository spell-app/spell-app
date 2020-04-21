export class Registry {
  constructor(makeInstanceForPath) {
    if (typeof makeInstanceForPath !== "function") {
      throw new TypeError(`new Registry(): you must provide a 'makeInstanceForPath' function`)
    }
    const REGISTRY = {}
    function getFromRegistry(path) {
      if (!REGISTRY[path]) REGISTRY[path] = makeInstanceForPath(path)
      return REGISTRY[path]
    }
    getFromRegistry.REGISTY = REGISTRY
    return getFromRegistry
  }
}
