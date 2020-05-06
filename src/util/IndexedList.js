import identity from "lodash/identity"
import get from "lodash/get"

export class IndexedList {
  #items = []

  //  - input params
  //      - `keyProp`      (required) Name of key to use for index.
  //      - `target`       (required if `parentProp`) Target object we're set up for.
  //      - `parentProp`   (optional) If provided name of key which yields instance "parent".
  //                                  If parent is found, lookup by key will check parent's indexedList if not on instance.
  //      - `normalizeKey` (optional) If provided, method to use to normalize key. e.g. `_.snakeCase`.
  //      - `transformer`  (optional) If provided, `add(item)` will run through this function, to transform raw input as necessary.
  constructor(props) {
    if (!props || !props.keyProp) throw new TypeError("new IndexedList() must be passed at least `{ keyProp }`.")
    if (props.parentProp && !props.target)
      throw new TypeError("new IndexedList() must pass `target` if you're passing parentProp.")
    Object.assign(this, props)
    if (!this.normalizeKey) this.normalizeKey = identity
  }

  /** Return our `parent`. */
  get parent() {
    return this.target && this.parentProp ? get(this.target, this.parentProp) : undefined
  }

  /** Given an `item`, return its normalized key in our list. */
  getKeyFor(item) {
    if (!item) return undefined
    return this.normalizeKey(item[this.keyProp])
  }

  /**
   * Get an item by (normalized) `key`.
   * If `localOnly` is truthy and our `parentProp` is set, we'll delegate to our parent.
   */
  get(key, localOnly) {
    if (key === undefined) return this.#items
    key = this.normalizeKey(key)
    const item = this.#items.find(it => key === this.getKeyFor(it))
    if (!item && !localOnly) return this.parent?.get(key)
    return item
  }

  /** Add one or more items to our list. */
  add(...items) {
    return items.map(item => {
      if (this.transformer) item = this.transformer(item)
      this.#items.push(item)
      return item
    })
  }
}
