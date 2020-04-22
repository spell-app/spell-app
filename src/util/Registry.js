/**
 * Create a factory to return instance singletons for a particular class by string key.
 * This allows you to get a consistent object back across time.
 *
 * Usage:
 *    class MyClass {
 *      static get = new Registry(key => new MyClass(key))
 *    }
 *    // later:
 *    const instance = MyClass.get("someKey")
 *    // You'll always get the same instance back.
 */
export class Registry {
  constructor(makeInstanceForKey) {
    if (typeof makeInstanceForKey !== "function") {
      throw new TypeError(`new Registry(): you must provide a 'makeInstanceForKey' function`)
    }
    const REGISTRY = new Map()
    function getFromRegistry(key) {
      if (!REGISTRY.has(key)) REGISTRY.set(key, makeInstanceForKey(key))
      return REGISTRY.get(key)
    }
    getFromRegistry.REGISTRY = REGISTRY
    return getFromRegistry
  }
}
