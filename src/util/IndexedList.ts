import _get from "lodash/get"

/**
 * Ordered list of `ListType` items, keyed by a `keyProp` on each item for `get()`/`replace()` lookup.
 * - Optionally chains to a "parent" list (via `target`/`parentProp`) so an unresolved `get()` here
 *   falls through to the parent -- e.g. a `BlockScope`'s `variables` list falls through to
 *   `parentScope.variables`, so nested scopes see outer-scope declarations.
 * - `InputType` lets `add()`/`replace()` accept raw input (e.g. plain props) that gets normalized
 *   to `ListType` via `transformer`.
 */
export class IndexedList<ListType = any, InputType = ListType> {
  /** Backing array of items, in insertion order. */
  #items: ListType[] = []

  /** Props this instance was constructed with -- see `IndexedListProps`. */
  props: IndexedListProps

  /** Throws if `keyProp` is missing, or if `parentProp` is passed without `target`. */
  constructor(props: IndexedListProps) {
    if (!props || !props.keyProp) throw new TypeError("new IndexedList() must be passed at least `{ keyProp }`.")
    if (props.parentProp && !props.target)
      throw new TypeError("new IndexedList() must pass `target` if you're passing parentProp.")

    this.props = props
  }

  /** Return our `parent`. */
  get parent() {
    const { target, parentProp } = this.props
    return target && parentProp ? _get(target, parentProp) : undefined
  }

  /** Given an `item`, return its normalized key in our list. */
  getKeyFor(item: ListType): string | undefined {
    if (!item) return undefined
    return this.normalizeKey((item as Record<string, any>)[this.props.keyProp])
  }

  /**
   * Get first item by (normalized) `key`.
   * - By default, of not found locally, recursively checks `parent`'s list (if any).
   * - Pass `LOCAL_ONLY` to only search this list's own items, skipping the parent chain.
   */
  get(): ListType[]
  get(key: string, localOnly?: "LOCAL_ONLY"): ListType
  get(key?: string, localOnly?: "LOCAL_ONLY") {
    // TODO: this doesn't seem like a good idea...
    if (key === undefined) return this.#items
    key = this.normalizeKey(key)
    const item = this.#items.find((it) => key === this.getKeyFor(it))
    if (!item && !localOnly) return this.parent?.get(key)
    return item
  }

  /** Add one or more `items` to end of our list, running each through `transformer` first. */
  add(...items: Array<ListType | InputType>) {
    const transformed = items.map(this.transform)
    this.#items.push(...transformed)
    return transformed
  }
  /**
   * Replace an item with the same `key` if found, otherwise add it.
   * - NOTE: we place the new item at the end.
   * - TODO: add in the same place?
   */
  replace(...items: Array<ListType | InputType>) {
    const transformed = items.map(this.transform)
    transformed.map((item) => {
      const key = this.getKeyFor(item)
      this.#items = this.#items.filter((it) => this.getKeyFor(it) !== key)
      this.#items.push(item)
      return item
    })
    return transformed
  }

  /** Normalize `key` via `props.normalizeKey` if provided, e.g. `_.snakeCase`, else pass through unchanged. */
  private normalizeKey(key: string) {
    if (this.props.normalizeKey) return this.props.normalizeKey(key)
    return key
  }
  /** Convert raw `InputType` input to `ListType` via `props.transformer` if provided, else pass through. */
  private transform = (item: ListType | InputType) => {
    if (this.props.transformer) return this.props.transformer(item) as ListType
    return item as ListType
  }
}

/** Constructor props for `IndexedList`. */
export type IndexedListProps<ListType = any, InputType = ListType> = {
  /** Name of key to use for index. */
  keyProp: string

  /** Target object we're set up for.  Required if `parentProp`. */
  target?: any

  /**
   * Optional name of key which yields instance "parent".
   * - If lookup is not found on this list instance, we'll recursively look up values in parents.
   */
  parentProp?: string

  /** Optional method to use to normalize key. e.g. `_.snakeCase`. */
  normalizeKey?: (key: string) => string

  /** Optional method to transform raw input during `add()`. */
  transformer?: (thing: ListType | InputType) => ListType
}
