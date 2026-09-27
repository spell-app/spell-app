import _get from "lodash/get"

import type { P } from "~/parser"

/**
 * Ordered list of `ListType` items in a scope, e.g. its `variables`, keyed by a `keyProp` on each item for
 * `get()` / `replace()` lookup.
 * - Optionally chains to a "parent" list (via `target` / `parentProp`) so an unresolved `get()` here
 *   falls through to the parent -- e.g. a `BlockScope`'s `variables` list falls through to
 *   `parentScope.variables`, so nested scopes see outer-scope declarations.
 * - `InputType` lets `add()` / `replace()` accept raw input (e.g. plain props) that gets normalized
 *   to `ListType` via `transformer`.
 * - SIDE EFFECT: `add()` / `replace()` record themselves in `target.parser.journal`, if there is one, so
 *   incremental parsing can take them back -- see `P.ParseJournal`.  That's why they swap in a NEW items array
 *   rather than changing the old one:  undo / redo just swap the arrays back.
 */
export class ScopeList<ListType = any, InputType = ListType> {
  /** Backing array of items, in insertion order.  NEVER changed in place -- see above. */
  #items: ListType[] = []

  /** Props this instance was constructed with -- see `ScopeListProps`. */
  props: ScopeListProps

  /** Throws if `keyProp` is missing, or if `parentProp` is passed without `target`. */
  constructor(props: ScopeListProps) {
    if (!props || !props.keyProp) throw new TypeError("new ScopeList() must be passed at least `{ keyProp }`.")
    if (props.parentProp && !props.target)
      throw new TypeError("new ScopeList() must pass `target` if you're passing parentProp.")

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
   * - By default, if not found locally, recursively checks `parent`'s list (if any).
   * - Pass `LOCAL_ONLY` to only search this list's own items, skipping the parent chain.
   * - With no `key`, returns ALL our own items.  NEVER change that array -- see class docs.
   */
  get(): readonly ListType[]
  get(key: string, localOnly?: "LOCAL_ONLY"): ListType
  get(key?: string, localOnly?: "LOCAL_ONLY") {
    if (key === undefined) return this.#items
    key = this.normalizeKey(key)
    const item = this.#items.find((it) => key === this.getKeyFor(it))
    if (!item && !localOnly) return this.parent?.get(key)
    return item
  }

  /** Add one or more `items` to end of our list, running each through `transformer` first. */
  add(...items: Array<ListType | InputType>) {
    const transformed = items.map(this.transform)
    this.setItems([...this.#items, ...transformed])
    return transformed
  }

  /**
   * Replace an item with the same `key` if found, otherwise add it.
   * - NOTE: we place the new item at the end.
   * - TODO: add in the same place?
   */
  replace(...items: Array<ListType | InputType>) {
    const transformed = items.map(this.transform)
    let next = this.#items
    for (const item of transformed) {
      const key = this.getKeyFor(item)
      next = [...next.filter((it) => this.getKeyFor(it) !== key), item]
    }
    this.setItems(next)
    return transformed
  }

  /** Swap in `next` items, recording the swap in our scope's journal (if any) so it can be undone. */
  private setItems(next: ListType[]) {
    const previous = this.#items
    this.#items = next
    const journal = (this.props.target as P.Scope | undefined)?.parser?.journal
    journal?.record({
      undo: () => (this.#items = previous),
      redo: () => (this.#items = next)
    })
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

/** Constructor props for `ScopeList`. */
export type ScopeListProps<ListType = any, InputType = ListType> = {
  /** Name of key to use for index. */
  keyProp: string

  /** Scope we're a list of, e.g. whose `variables` we are.  Required if `parentProp`, and to be journaled. */
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
